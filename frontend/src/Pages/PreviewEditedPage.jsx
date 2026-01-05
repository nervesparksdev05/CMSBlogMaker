// src/Pages/PreviewEditedPage.jsx
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { getPreviewData, loadDraft, setPreviewData } from "../lib/storage.js";
import { apiGet, apiRequest } from "../lib/api.js";

import MainHeader from "../interface/MainHeader";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";


const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80";

const DEFAULT_MARKDOWN = [
  "# Start writing your blog",
  "",
  "Use **Markdown** on the left. The preview updates as you type.",
  "",
  "## Example section",
  "- Bullet one",
  "- Bullet two",
].join("\n");

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function PreviewEditedPage() {
  const initial = useMemo(() => {
    const saved = getPreviewData();
    const draft = loadDraft();
    return {
      title: saved?.title || "Preview",
      heroUrl: saved?.heroUrl || DEFAULT_HERO,
      markdown: saved?.markdown || saved?.html || DEFAULT_MARKDOWN,
      blogId: saved?.blogId || saved?.blog_id || draft?.blog_id || "",
    };
  }, []);

  const [title] = useState(initial.title);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [blogId] = useState(initial.blogId);
  const [blogData, setBlogData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const previewHtml = useMemo(
    () => marked.parse(markdown || ""),
    [markdown]
  );

  const extractCoverUrl = (content) => {
    if (!content) return "";
    const coverMatch = content.match(/!\[cover[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/i);
    if (coverMatch?.[1]) return coverMatch[1];
    const head = content.slice(0, 800);
    const mdMatch = head.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (mdMatch?.[1]) return mdMatch[1];
    const htmlMatch = head.match(/<img[^>]+src=["']([^"']+)["']/i);
    return htmlMatch?.[1] || "";
  };

  const extractTitleFromMarkdown = (content) => {
    if (!content) return "";
    const match = content.match(/^#{1,6}\s+(.+)\s*$/m);
    return match?.[1]?.trim() || "";
  };

  const coverUrl = useMemo(() => extractCoverUrl(markdown), [markdown]);

  useEffect(() => {
    setPreviewData({ title, heroUrl: coverUrl, markdown, html: previewHtml, blogId });
  }, [title, coverUrl, markdown, previewHtml, blogId]);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;
      try {
        const data = await apiGet(`/blogs/${blogId}`);
        setBlogData(data);
      } catch (err) {
        setSaveError(err?.message || "Failed to load blog.");
      }
    };
    fetchBlog();
  }, [blogId]);

  const handleSave = async () => {
    if (!blogId) {
      setSaveError("No blog selected to save.");
      return;
    }
    if (!blogData) {
      setSaveError("Blog data not loaded yet.");
      return;
    }
    try {
      setSaving(true);
      setSaveError("");
      setSaveMessage("");
      const extractedTitle = extractTitleFromMarkdown(markdown);
      const resolvedTitle =
        extractedTitle ||
        blogData?.meta?.title ||
        blogData?.final_blog?.render?.title ||
        title;
      const nextMeta = {
        ...(blogData.meta || {}),
        cover_image_url: coverUrl,
        title: resolvedTitle,
      };
      const nextRender = {
        ...(blogData.final_blog?.render || {}),
        cover_image_url: coverUrl,
        title: resolvedTitle,
      };
      const payload = {
        meta: nextMeta,
        final_blog: {
          ...blogData.final_blog,
          render: nextRender,
          markdown,
          html: previewHtml,
        },
      };
      await apiRequest(`/blogs/${blogId}`, { method: "PUT", json: payload });
      setBlogData((prev) =>
        prev
          ? {
            ...prev,
            meta: payload.meta,
            final_blog: payload.final_blog,
          }
          : prev
      );
      setSaveMessage("Saved.");
    } catch (err) {
      setSaveError(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0B0B0F] overflow-hidden">
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      <div className="px-6 pt-4 pb-6 h-[calc(100vh-76px)] flex flex-col">
        <BackToDashBoardButton />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-[12px] text-[#9CA3AF]">
            Changes update the preview instantly. Click Save to persist.
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !blogId}
            className={[
              "h-[38px] px-5 rounded-full",
              "bg-[#4443E4] text-white text-[13px] font-semibold",
              "hover:opacity-95",
              saving || !blogId ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {saveError ? (
          <div className="mt-2 text-[12px] text-[#F87171]">{saveError}</div>
        ) : null}
        {saveMessage ? (
          <div className="mt-2 text-[12px] text-[#34D399]">{saveMessage}</div>
        ) : null}

        <div className="mt-4 flex flex-row gap-6 flex-1 min-h-0">
          <div className="flex-1 min-w-0 min-h-0 rounded-[16px] border border-[#1F2430] bg-[#0E1117] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] flex flex-col">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#7B8494]">
              Markdown
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="mt-4 flex-1 min-h-0 w-full rounded-[12px] border border-[#1F2430] bg-[#0B0E14] px-4 py-4 text-[14px] leading-6 text-[#E5E7EB] outline-none font-mono resize-none overflow-y-auto"
              placeholder="Write your markdown here..."
            />
          </div>

          <div className="flex-1 min-w-0 min-h-0 rounded-[16px] border border-[#1F2430] bg-[#0E1117] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] flex flex-col">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#7B8494]">
              Preview
            </div>
            <div className="mt-4 flex-1 min-h-0 overflow-y-auto rounded-[12px] border border-[#1F2430] bg-[#0B0E14] px-6 py-5">
              <div
                className="preview-body"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
