// src/Pages/PreviewEditedPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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

const COVER_MD_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/i;
const COVER_IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
const COVER_IMG_LINE_RE = /^<img\b[^>]*>\s*$/i;
const COVER_IMG_P_RE = /^<p>\s*<img\b[^>]*>\s*<\/p>\s*$/i;

const normalizeCoverSyntax = (content) => {
  if (!content) return "";
  let next = String(content);
  next = next.replace(
    /\[\!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)\](?!\s*\()/g,
    "![$1]($2)"
  );
  next = next.replace(/\!\[([^\]]*)\]\s*\(([^)\s]+(?:\s+"[^"]*")?)\)/g, "![$1]($2)");
  return next;
};

const normalizeMarkdown = (content) => {
  if (!content) return "";
  let next = normalizeCoverSyntax(content);
  if (/<[a-z][\s\S]*>/i.test(next)) {
    next = next.replace(
      /<p>\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*<\/p>/gi,
      (_, alt, url) => {
        const safeAlt = String(alt || "").replace(/"/g, "&quot;");
        return `<p><img src="${url}" alt="${safeAlt}" /></p>`;
      }
    );
  }
  return next;
};

const getImgSrcFromTag = (tag) => {
  if (!tag) return "";
  const match = tag.match(COVER_IMG_SRC_RE);
  return match?.[1] || "";
};

const ensureWidthAttr = (tag) => {
  if (!tag || !/^<img\b/i.test(tag)) return tag;
  if (/\bwidth\s*=\s*["']/.test(tag)) return tag;
  if (tag.endsWith("/>")) {
    return tag.replace(/\s*\/>$/, ' width="100%" />');
  }
  if (tag.endsWith(">")) {
    return tag.replace(/\s*>$/, ' width="100%">');
  }
  return `${tag} width="100%"`;
};

const extractCoverLine = (content) => {
  const normalized = normalizeCoverSyntax(content);
  const lines = normalized.split(/\r?\n/);
  let idx = 0;
  while (idx < lines.length && lines[idx].trim() === "") {
    idx += 1;
  }
  if (idx < lines.length && lines[idx].trim().startsWith("#")) {
    idx += 1;
    while (idx < lines.length && lines[idx].trim() === "") {
      idx += 1;
    }
  }
  let coverLine = "";
  let coverUrl = "";
  if (idx < lines.length) {
    const rawLine = lines[idx].trim();
    let imgLine = "";
    if (COVER_IMG_P_RE.test(rawLine)) {
      imgLine = rawLine.replace(/^<p>\s*/i, "").replace(/\s*<\/p>\s*$/i, "");
    } else if (COVER_IMG_LINE_RE.test(rawLine)) {
      imgLine = rawLine;
    }
    if (imgLine) {
      coverLine = ensureWidthAttr(imgLine);
      coverUrl = getImgSrcFromTag(imgLine);
      lines.splice(idx, 1);
      if (lines[idx] === "") {
        lines.splice(idx, 1);
      }
      return { coverLine, coverUrl, body: lines.join("\n") };
    }
    const mdMatch = rawLine.match(COVER_MD_RE);
    if (mdMatch && rawLine.replace(COVER_MD_RE, "").trim() === "") {
      coverUrl = mdMatch[2];
      const alt = mdMatch[1] || "Cover";
      coverLine = `<img src="${coverUrl}" alt="${alt}" width="100%" />`;
      lines.splice(idx, 1);
      if (lines[idx] === "") {
        lines.splice(idx, 1);
      }
    }
  }
  return { coverLine, coverUrl, body: lines.join("\n") };
};

const insertCoverLine = (body, coverLine) => {
  if (!coverLine) return body || "";
  const lines = (body || "").split(/\r?\n/);
  let idx = 0;
  while (idx < lines.length && lines[idx].trim() === "") {
    idx += 1;
  }
  if (idx < lines.length && lines[idx].trim().startsWith("#")) {
    const before = lines.slice(0, idx + 1);
    const after = lines.slice(idx + 1);
    while (after.length && after[0].trim() === "") {
      after.shift();
    }
    return [...before, coverLine, "", ...after].join("\n");
  }
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  return [coverLine, "", ...lines].join("\n");
};

const createEditableMarkdown = (content, heroUrl) => {
  const { coverLine, coverUrl, body } = extractCoverLine(content || "");
  let finalCoverUrl = coverUrl || "";
  if (!finalCoverUrl && heroUrl && heroUrl !== DEFAULT_HERO) {
    finalCoverUrl = heroUrl;
  }
  let finalCoverLine = coverLine;
  if (!finalCoverLine && finalCoverUrl) {
    finalCoverLine = `<img src="${finalCoverUrl}" alt="Cover" width="100%" />`;
  }
  finalCoverLine = ensureWidthAttr(finalCoverLine);
  const markdown = finalCoverLine ? insertCoverLine(body, finalCoverLine) : body || content || "";
  return { markdown, coverUrl: finalCoverUrl };
};

const extractCoverUrl = (content) => {
  if (!content) return "";
  const head = content.slice(0, 1200);
  const imgMatch = head.match(COVER_IMG_SRC_RE);
  if (imgMatch?.[1]) return imgMatch[1];
  const mdMatch = head.match(COVER_MD_RE);
  return mdMatch?.[2] || "";
};

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

  const initialEditable = useMemo(
    () => createEditableMarkdown(initial.markdown, initial.heroUrl),
    [initial]
  );

  const [title] = useState(initial.title);
  const [markdown, setMarkdown] = useState(initialEditable.markdown);
  const [blogId] = useState(initial.blogId);
  const [blogData, setBlogData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const containerRef = useRef(null);
  const [splitPercent, setSplitPercent] = useState(() => {
    if (typeof window === "undefined") return 50;
    const stored = Number(window.localStorage.getItem("previewSplitPercent"));
    return Number.isFinite(stored) && stored >= 25 && stored <= 75 ? stored : 50;
  });
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const normalizedMarkdown = useMemo(
    () => normalizeMarkdown(markdown),
    [markdown]
  );

  const previewHtml = useMemo(
    () => marked.parse(normalizedMarkdown || ""),
    [normalizedMarkdown]
  );

  const extractTitleFromMarkdown = (content) => {
    if (!content) return "";
    const match = content.match(/^#{1,6}\s+(.+)\s*$/m);
    return match?.[1]?.trim() || "";
  };

  const coverUrl = useMemo(() => {
    return extractCoverUrl(normalizedMarkdown) || initialEditable.coverUrl || "";
  }, [normalizedMarkdown, initialEditable.coverUrl]);

  useEffect(() => {
    setPreviewData({
      title,
      heroUrl: coverUrl,
      markdown: normalizedMarkdown,
      html: previewHtml,
      blogId,
    });
  }, [title, coverUrl, normalizedMarkdown, previewHtml, blogId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => setIsWide(event.matches);
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }
    return () => {
      if (media.addEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("previewSplitPercent", String(splitPercent));
  }, [splitPercent]);

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
      const extractedTitle = extractTitleFromMarkdown(normalizedMarkdown);
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
          markdown: normalizedMarkdown,
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

  const handleResizeStart = (event) => {
    if (!containerRef.current || !isWide) return;
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const min = 25;
    const max = 75;
    const onMove = (e) => {
      const x = e.clientX - rect.left;
      const next = (x / rect.width) * 100;
      const clamped = Math.min(max, Math.max(min, next));
      setSplitPercent(clamped);
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
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

        <div
          ref={containerRef}
          className={[
            "mt-4 flex-1 min-h-0",
            isWide ? "grid" : "flex flex-col gap-6",
          ].join(" ")}
          style={
            isWide
              ? { gridTemplateColumns: `${splitPercent}% 12px ${100 - splitPercent}%` }
              : undefined
          }
        >
          <div
            className={[
              "min-w-0 min-h-0 rounded-[16px] border border-[#1F2430] bg-[#0E1117] p-5",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.02)] flex flex-col",
              isWide ? "pr-3" : "",
            ].join(" ")}
          >
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

          {isWide ? (
            <div
              className="relative flex items-center justify-center"
              onPointerDown={handleResizeStart}
              onDoubleClick={() => setSplitPercent(50)}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panels"
              style={{ cursor: "col-resize", touchAction: "none" }}
            >
              <div className="h-[70px] w-[4px] rounded-full bg-[#1F2430]" />
            </div>
          ) : null}

          <div
            className={[
              "min-w-0 min-h-0 rounded-[16px] border border-[#1F2430] bg-[#0E1117] p-5",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.02)] flex flex-col",
              isWide ? "pl-3" : "",
            ].join(" ")}
          >
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
