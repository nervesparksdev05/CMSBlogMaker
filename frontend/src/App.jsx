// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CmsHomePage from "./Pages/CmsHomePage.jsx";
import CreateBlogPage from "./Pages/CreateBlogPage.jsx";
import CreateBlogTitlePage from "./Pages/CreateBlogTitlePage.jsx";
import CreateBlogIntroParagraphPage from "./Pages/CreateBlogIntroParagraphPage.jsx";
import CreateBlogOutlinePage from "./Pages/CreateBlogOutlinepage.jsx";
import CreateBlogImageUploadPage from "./Pages/CreateBlogImageUploadPage.jsx";
import ReviewInfoPage from "./Pages/ReviewInfoPage.jsx";
import GeneratedBlogPage from "./Pages/GeneratedBlogPage.jsx";
import SavedBlogPage from "./Pages/SavedBlogPage.jsx";
import NanoBananaPage from "./Pages/NanoBananaPage.jsx";
import PreviewEditedPage from "./Pages/PreviewEditedPage.jsx"; // ✅ add

function GalleryPage() {
  return <div className="p-6 text-[#111827]">Gallery page coming soon.</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* sidebar routes */}
        <Route path="/dashboard" element={<CmsHomePage />} />
        <Route path="/create-blog" element={<CreateBlogPage />} />
        <Route path="/saved-blogs" element={<SavedBlogPage />} />
        <Route path="/generate-image" element={<NanoBananaPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* step routes */}
        <Route path="/create-blog/title" element={<CreateBlogTitlePage />} />
        <Route path="/create-blog/intro" element={<CreateBlogIntroParagraphPage />} />
        <Route path="/create-blog/outline" element={<CreateBlogOutlinePage />} />
        <Route path="/create-blog/image" element={<CreateBlogImageUploadPage />} />
        <Route path="/create-blog/review" element={<ReviewInfoPage />} />
        <Route path="/create-blog/generated" element={<GeneratedBlogPage />} />

        {/* ✅ Preview / Edit page */}
        <Route path="/preview-edited" element={<PreviewEditedPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
