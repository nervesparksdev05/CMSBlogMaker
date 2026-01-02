import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import FourCardsRow from "../interface/FourCardsRow";
import TemplateTableCard from "../interface/TemplateTableCard";
import { apiGet, apiRequest, API_BASE_URL } from "../lib/api.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const formatDate = (value) => {
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

const toAbsoluteUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("data:") || /^https?:\/\//i.test(src)) return src;
  const cleaned = src.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleaned}`;
};

const normalizeHtmlImages = (html) => {
  if (!html) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const imgs = Array.from(doc.querySelectorAll("img"));
    imgs.forEach((img) => {
      const src = img.getAttribute("src") || "";
      const absolute = toAbsoluteUrl(src);
      if (absolute) img.setAttribute("src", absolute);
      img.setAttribute("crossorigin", "anonymous");
    });
    return doc.body.innerHTML;
  } catch {
    return html;
  }
};

const waitForImages = async (root) => {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
};

const buildBlogElement = (blog, summary) => {
  const article = document.createElement("article");
  article.className = "pdf-blog";

  const title =
    blog?.meta?.title ||
    blog?.final_blog?.render?.title ||
    summary?.title ||
    "Untitled Blog";
  const createdDate = formatDate(blog?.created_at) || formatDate(summary?.created_at) || "";
  const createdBy = blog?.owner_name || summary?.created_by || "";
  const status = blog?.status || summary?.status || "";
  const coverUrl = toAbsoluteUrl(
    blog?.meta?.cover_image_url || blog?.final_blog?.render?.cover_image_url || ""
  );
  const html = blog?.final_blog?.html || "";

  const titleEl = document.createElement("h1");
  titleEl.className = "pdf-title";
  titleEl.textContent = title;

  const metaEl = document.createElement("div");
  metaEl.className = "pdf-meta";
  const metaLine = (label, value) => {
    const line = document.createElement("div");
    line.textContent = `${label}: ${value || "-"}`;
    metaEl.appendChild(line);
  };
  metaLine("Created Date", createdDate);
  metaLine("Created By", createdBy);
  metaLine("Status", status);

  article.appendChild(titleEl);
  article.appendChild(metaEl);

  if (coverUrl) {
    const cover = document.createElement("div");
    cover.className = "pdf-cover";
    const img = document.createElement("img");
    img.src = coverUrl;
    img.alt = "";
    img.setAttribute("crossorigin", "anonymous");
    cover.appendChild(img);
    article.appendChild(cover);
  }

  const body = document.createElement("div");
  body.className = "pdf-body";
  body.innerHTML = normalizeHtmlImages(html);
  if (coverUrl) {
    const firstImg = body.querySelector("img");
    if (firstImg && toAbsoluteUrl(firstImg.getAttribute("src") || "") === coverUrl) {
      firstImg.remove();
    }
  }
  article.appendChild(body);

  return article;
};

const addCanvasToPdf = (doc, canvas, margin, isFirstBlog) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageBodyHeight = pageHeight - margin * 2;

  let position = 0;
  let pageIndex = 0;
  while (position < imgHeight - 1) {
    if (!isFirstBlog || pageIndex > 0) {
      doc.addPage();
    }
    doc.addImage(canvas, "PNG", margin, margin - position, imgWidth, imgHeight);
    position += pageBodyHeight;
    pageIndex += 1;
  }
};

const fetchAllBlogSummaries = async () => {
  const limit = 50;
  let page = 1;
  let items = [];
  let total = 0;

  while (true) {
    const list = await apiGet(`/blog?page=${page}&limit=${limit}`);
    const chunk = list?.items || [];
    total = list?.total ?? total;
    items = items.concat(chunk);
    if (!chunk.length || (total && items.length >= total)) {
      break;
    }
    page += 1;
  }

  return items;
};

export default function CmsHomePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    total_blogs: 0,
    saved_blogs: 0,
    pending_blogs: 0,
    published_blogs: 0,
    generated_images: 0,
  });
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const statData = await apiGet("/blogs/stats");
        setStats(statData || {});
      } catch {
        // ignore
      }

      try {
        const list = await apiGet("/blog?page=1&limit=10");
        const items = (list?.items || []).map((item) => ({
          id: item.id,
          blogTitle: item.title,
          language: item.language || "English",
          tone: item.tone || "",
          creativity: item.creativity || "",
          createdDate: formatDate(item.created_at),
          createdBy: item.created_by,
          status: item.status,
        }));
        setRows(items);
      } catch {
        setRows([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const ids = new Set(rows.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => ids.has(id)));
  }, [rows]);

  const onToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (nextIds) => setSelectedIds(nextIds);

  const onDeleteRow = async (row) => {
    try {
      await apiRequest(`/blogs/${row.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // ignore
    }
  };

  const onDeleteAll = async () => {
    const ids = selectedIds.length ? selectedIds : rows.map((r) => r.id);
    for (const id of ids) {
      try {
        await apiRequest(`/blogs/${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedIds([]);
  };

  const onDownloadAll = async () => {
    if (downloading) return;

    try {
      setDownloading(true);
      setDownloadError("");

      const summaries = await fetchAllBlogSummaries();
      if (!summaries.length) return;

      const mount = document.createElement("div");
      mount.style.position = "fixed";
      mount.style.left = "-10000px";
      mount.style.top = "0";
      mount.style.width = "820px";
      mount.style.background = "#ffffff";
      mount.style.color = "#111827";
      mount.style.pointerEvents = "none";

      const style = document.createElement("style");
      style.textContent = `
        .pdf-blog { width: 760px; padding: 24px 32px; box-sizing: border-box; font-family: Arial, sans-serif; }
        .pdf-title { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
        .pdf-meta { font-size: 12px; color: #4B5563; margin-bottom: 12px; }
        .pdf-cover { margin: 12px 0 16px; border-radius: 12px; overflow: hidden; }
        .pdf-cover img { width: 100%; height: auto; display: block; }
        .pdf-body { font-size: 12px; line-height: 1.7; }
        .pdf-body h1 { font-size: 18px; margin: 16px 0 8px; }
        .pdf-body h2 { font-size: 16px; margin: 14px 0 8px; }
        .pdf-body h3 { font-size: 14px; margin: 12px 0 6px; }
        .pdf-body p { margin: 8px 0; }
        .pdf-body ul { margin: 8px 0 8px 18px; }
        .pdf-body img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
      `;
      mount.appendChild(style);
      document.body.appendChild(mount);

      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const margin = 40;
      let firstPage = true;

      for (let i = 0; i < summaries.length; i += 1) {
        let blog;
        try {
          blog = await apiGet(`/blogs/${summaries[i].id}`);
        } catch {
          blog = null;
        }

        const article = buildBlogElement(blog, summaries[i]);
        mount.appendChild(article);
        await waitForImages(article);

        const canvas = await html2canvas(article, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        addCanvasToPdf(doc, canvas, margin, firstPage);
        firstPage = false;
        mount.removeChild(article);
      }

      document.body.removeChild(mount);
      doc.save("blogs.pdf");
    } catch (err) {
      setDownloadError(err?.message || "Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const onViewDetails = (row) => {
    navigate(`/create-blog/generated?id=${row.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-8 py-6">
            <FourCardsRow
              blogsGenerated={stats.total_blogs}
              savedBlogs={stats.saved_blogs}
              generatedImages={stats.generated_images}
              publishedBlogs={stats.published_blogs}
            />

            <div className="mt-8">
              <TemplateTableCard
                title="Previous generated blog posts"
                subtitle={null}
                badge={null}
                rows={rows}
                pageSize={7}
                searchValue={search}
                onSearchChange={setSearch}
                onDeleteAll={onDeleteAll}
                onDownloadAll={onDownloadAll}
                downloadAllLabel={downloading ? "Preparing PDF..." : "Download All Blog as PDF"}
                downloadAllDisabled={downloading || rows.length === 0}
                selectable
                selectedIds={selectedIds}
                onToggleRow={onToggleRow}
                onToggleAll={onToggleAll}
                getRowId={(r) => r.id}
                showDots
                onDeleteRow={onDeleteRow}
                onViewDetails={onViewDetails}
              />
              {downloadError ? (
                <div className="mt-3 text-[12px] text-[#DC2626]">{downloadError}</div>
              ) : null}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                className="text-[16px] font-medium text-[#2563EB] hover:underline"
                onClick={() => navigate("/saved-blogs")}
              >
                Show All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
