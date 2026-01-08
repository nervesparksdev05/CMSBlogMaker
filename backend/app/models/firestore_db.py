"""
Firestore database operations for CMS.

This module provides helper functions for interacting with Firestore collections:
- blogs: Blog posts and content management
- images: Generated and uploaded images

All database operations use Firestore, which is shared with the main dashboard
for user management (users collection).
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List

from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from core.firestore_db import get_db

logger = logging.getLogger(__name__)


def get_blogs_collection():
    """Get Firestore blogs collection"""
    db = get_db()
    return db.collection('blogs')


def get_images_collection():
    """Get Firestore images collection"""
    db = get_db()
    return db.collection('images')


# Helper functions for blogs
def create_blog(doc: Dict[str, Any]) -> str:
    """
    Create a blog document in Firestore and return document ID.
    
    Args:
        doc: Dictionary containing blog data
        
    Returns:
        str: The Firestore document ID of the created blog
    """
    try:
        blogs_col = get_blogs_collection()
        doc['created_at'] = doc.get('created_at', datetime.utcnow())
        doc['updated_at'] = doc.get('updated_at', datetime.utcnow())
        _, doc_ref = blogs_col.add(doc)
        logger.info(f"Created blog with ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        logger.error(f"Error creating blog: {e}")
        raise


def get_blog_by_id(blog_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a blog by document ID.
    
    Args:
        blog_id: Firestore document ID
        
    Returns:
        Optional[Dict]: Blog data if found, None otherwise
    """
    try:
        blogs_col = get_blogs_collection()
        doc_ref = blogs_col.document(blog_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    except Exception as e:
        logger.error(f"Error getting blog {blog_id}: {e}")
        raise


def update_blog(blog_id: str, updates: Dict[str, Any]) -> bool:
    """
    Update a blog document in Firestore.
    
    Args:
        blog_id: Firestore document ID
        updates: Dictionary of fields to update (supports nested fields with dot notation)
        
    Returns:
        bool: True if update was successful
    """
    try:
        blogs_col = get_blogs_collection()
        doc_ref = blogs_col.document(blog_id)
        updates['updated_at'] = datetime.utcnow()
        
        # Convert nested dict updates to dot notation for Firestore
        firestore_updates = {}
        for key, value in updates.items():
            if '.' in key:
                # Already in dot notation (e.g., "admin_review.reviewed_at")
                firestore_updates[key] = value
            elif isinstance(value, dict):
                # Convert nested dict to dot notation
                for nested_key, nested_value in value.items():
                    firestore_updates[f"{key}.{nested_key}"] = nested_value
            else:
                firestore_updates[key] = value
        
        doc_ref.update(firestore_updates)
        logger.info(f"Updated blog {blog_id}")
        return True
    except Exception as e:
        logger.error(f"Error updating blog {blog_id}: {e}")
        raise


def delete_blog(blog_id: str) -> bool:
    """
    Delete a blog document from Firestore.
    
    Args:
        blog_id: Firestore document ID
        
    Returns:
        bool: True if deletion was successful
    """
    try:
        blogs_col = get_blogs_collection()
        doc_ref = blogs_col.document(blog_id)
        doc_ref.delete()
        logger.info(f"Deleted blog {blog_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting blog {blog_id}: {e}")
        raise


def query_blogs(
    query_filters: Dict[str, Any], 
    order_by: str = "created_at", 
    order_direction: str = "DESCENDING", 
    skip: int = 0, 
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Query blogs with filters, ordering, and pagination.
    
    Args:
        query_filters: Dictionary of field filters
        order_by: Field name to order by
        order_direction: "ASCENDING" or "DESCENDING"
        skip: Number of documents to skip
        limit: Maximum number of documents to return
        
    Returns:
        List[Dict]: List of blog documents
    """
    blogs_col = get_blogs_collection()
    query = blogs_col
    
    # Apply filters
    for field, value in query_filters.items():
        if field == "$or":
            # Handle $or queries (for complex conditions)
            # Firestore doesn't support $or directly, so we'll need to handle this differently
            # For now, we'll skip $or and handle it in the calling code
            continue
        else:
            query = query.where(filter=FieldFilter(field, '==', value))
    
    # Apply ordering (handle nested fields like admin_review.requested_at)
    # Note: Firestore requires composite indexes for queries that filter and order by different fields
    # If index is missing, we'll fall back to in-memory sorting
    direction = firestore.Query.DESCENDING if order_direction == "DESCENDING" else firestore.Query.ASCENDING
    query_with_order = query.order_by(order_by, direction=direction)
    
    # Apply pagination
    # Note: Firestore doesn't support offset efficiently, so we fetch and slice
    # For production, consider using cursor-based pagination
    try:
        if skip > 0:
            docs = list(query_with_order.limit(skip + limit).stream())
            docs = docs[skip:]
        else:
            docs = list(query_with_order.limit(limit).stream())
    except Exception as e:
        # If index is missing, try without ordering (less efficient but works)
        if "index" in str(e).lower() or "FailedPrecondition" in str(type(e).__name__):
            logger.warning(f"Firestore index missing for query, falling back to in-memory sort: {e}")
            # Fetch all matching docs, sort in memory, then paginate
            all_docs = list(query.stream())
            # Sort by the order_by field
            reverse = order_direction == "DESCENDING"
            all_docs.sort(key=lambda d: d.to_dict().get(order_by, datetime.min), reverse=reverse)
            if skip > 0:
                docs = all_docs[skip:skip + limit]
            else:
                docs = all_docs[:limit]
        else:
            logger.error(f"Error querying blogs: {e}")
            raise
    
    items = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        items.append(data)
    
    return items


def count_blogs(query_filters: Dict[str, Any]) -> int:
    """
    Count blogs matching query filters.
    
    Args:
        query_filters: Dictionary of field filters
        
    Returns:
        int: Number of matching blogs
    """
    blogs_col = get_blogs_collection()
    query = blogs_col
    
    # Apply filters
    for field, value in query_filters.items():
        if field == "$or":
            continue
        else:
            query = query.where(filter=FieldFilter(field, '==', value))
    
    # Count documents
    docs = list(query.stream())
    return len(docs)


# Helper functions for images
def create_image(doc: Dict[str, Any]) -> str:
    """
    Create an image document in Firestore and return document ID.
    
    Args:
        doc: Dictionary containing image data
        
    Returns:
        str: The Firestore document ID of the created image
    """
    try:
        images_col = get_images_collection()
        doc['created_at'] = doc.get('created_at', datetime.utcnow())
        _, doc_ref = images_col.add(doc)
        logger.info(f"Created image with ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        logger.error(f"Error creating image: {e}")
        raise


def get_image_by_url(owner_id: str, image_url: str) -> Optional[Dict[str, Any]]:
    """
    Get an image by owner_id and image_url.
    
    Args:
        owner_id: Owner's user ID
        image_url: Image URL
        
    Returns:
        Optional[Dict]: Image data if found, None otherwise
    """
    try:
        images_col = get_images_collection()
        query = images_col.where(filter=FieldFilter('owner_id', '==', owner_id)).where(filter=FieldFilter('image_url', '==', image_url)).limit(1)
        docs = list(query.stream())
        if docs:
            data = docs[0].to_dict()
            data['id'] = docs[0].id
            return data
        return None
    except Exception as e:
        logger.error(f"Error getting image by URL: {e}")
        raise


def query_images(
    query_filters: Dict[str, Any], 
    order_by: str = "created_at",
    order_direction: str = "DESCENDING", 
    skip: int = 0, 
    limit: int = 24
) -> List[Dict[str, Any]]:
    """
    Query images with filters, ordering, and pagination.
    
    Args:
        query_filters: Dictionary of field filters (supports $or for complex queries)
        order_by: Field name to order by
        order_direction: "ASCENDING" or "DESCENDING"
        skip: Number of documents to skip
        limit: Maximum number of documents to return
        
    Returns:
        List[Dict]: List of image documents
    """
    images_col = get_images_collection()
    
    # Handle $or queries for source field
    if "$or" in query_filters:
        # Firestore doesn't support $or directly, so we need to query separately and combine
        or_conditions = query_filters["$or"]
        all_docs = []
        seen_ids = set()
        
        for condition in or_conditions:
            # Handle different $or conditions
            if "source" in condition and condition["source"] is not None:
                source_val = condition["source"]
                if isinstance(source_val, dict) and "$in" in source_val:
                    # Handle source: {"$in": ["nano", "blog"]}
                    for val in source_val["$in"]:
                        query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                        query = query.where(filter=FieldFilter('source', '==', val))
                        docs = list(query.stream())
                        for doc in docs:
                            if doc.id not in seen_ids:
                                all_docs.append(doc)
                                seen_ids.add(doc.id)
                elif isinstance(source_val, dict) and "$exists" in source_val:
                    # Handle source: {"$exists": False}
                    query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                    docs = list(query.stream())
                    for doc in docs:
                        data = doc.to_dict()
                        if doc.id not in seen_ids and (data.get('source') is None or 'source' not in data):
                            all_docs.append(doc)
                            seen_ids.add(doc.id)
            elif "source" not in condition or condition.get("source") is None:
                # Handle source: None or missing source field
                query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                docs = list(query.stream())
                for doc in docs:
                    data = doc.to_dict()
                    if doc.id not in seen_ids and (data.get('source') is None or 'source' not in data):
                        all_docs.append(doc)
                        seen_ids.add(doc.id)
            else:
                # Handle other $or conditions
                query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                for field, value in condition.items():
                    query = query.where(filter=FieldFilter(field, '==', value))
                docs = list(query.stream())
                for doc in docs:
                    if doc.id not in seen_ids:
                        all_docs.append(doc)
                        seen_ids.add(doc.id)
        
        # Sort and paginate
        all_docs.sort(key=lambda d: d.to_dict().get('created_at', datetime.min), reverse=True)
        if skip > 0:
            all_docs = all_docs[skip:]
        all_docs = all_docs[:limit]
        
        items = []
        for doc in all_docs:
            data = doc.to_dict()
            data['id'] = doc.id
            items.append(data)
        return items
    else:
        # Normal query without $or
        query = images_col
        
        # Apply filters
        for field, value in query_filters.items():
            query = query.where(filter=FieldFilter(field, '==', value))
        
        # Apply ordering
        # Note: Firestore requires composite indexes for queries that filter and order by different fields
        # If index is missing, we'll fall back to in-memory sorting
        direction = firestore.Query.DESCENDING if order_direction == "DESCENDING" else firestore.Query.ASCENDING
        query_with_order = query.order_by(order_by, direction=direction)
        
        # Apply pagination
        try:
            if skip > 0:
                docs = list(query_with_order.limit(skip + limit).stream())
                docs = docs[skip:]
            else:
                docs = list(query_with_order.limit(limit).stream())
        except Exception as e:
            # If index is missing, try without ordering (less efficient but works)
            if "index" in str(e).lower() or "FailedPrecondition" in str(type(e).__name__):
                logger.warning(f"Firestore index missing for images query, falling back to in-memory sort: {e}")
                # Fetch all matching docs, sort in memory, then paginate
                all_docs = list(query.stream())
                # Sort by the order_by field
                reverse = order_direction == "DESCENDING"
                all_docs.sort(key=lambda d: d.to_dict().get(order_by, datetime.min), reverse=reverse)
                if skip > 0:
                    docs = all_docs[skip:skip + limit]
                else:
                    docs = all_docs[:limit]
            else:
                logger.error(f"Error querying images: {e}")
                raise
        
        items = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            items.append(data)
        
        return items


def count_images(query_filters: Dict[str, Any]) -> int:
    """
    Count images matching query filters.
    
    Args:
        query_filters: Dictionary of field filters (supports $or for complex queries)
        
    Returns:
        int: Number of matching images
    """
    images_col = get_images_collection()
    
    # Handle $or queries
    if "$or" in query_filters:
        # Similar logic to query_images but just count
        or_conditions = query_filters["$or"]
        seen_ids = set()
        
        for condition in or_conditions:
            if "source" in condition and condition["source"] is not None:
                source_val = condition["source"]
                if isinstance(source_val, dict) and "$in" in source_val:
                    for val in source_val["$in"]:
                        query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                        query = query.where(filter=FieldFilter('source', '==', val))
                        docs = list(query.stream())
                        for doc in docs:
                            seen_ids.add(doc.id)
                elif isinstance(source_val, dict) and "$exists" in source_val:
                    query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                    docs = list(query.stream())
                    for doc in docs:
                        data = doc.to_dict()
                        if data.get('source') is None or 'source' not in data:
                            seen_ids.add(doc.id)
            elif "source" not in condition or condition.get("source") is None:
                query = images_col.where(filter=FieldFilter('owner_id', '==', query_filters.get('owner_id')))
                docs = list(query.stream())
                for doc in docs:
                    data = doc.to_dict()
                    if data.get('source') is None or 'source' not in data:
                        seen_ids.add(doc.id)
        return len(seen_ids)
    else:
        query = images_col
        for field, value in query_filters.items():
            query = query.where(filter=FieldFilter(field, '==', value))
        docs = list(query.stream())
        return len(docs)


