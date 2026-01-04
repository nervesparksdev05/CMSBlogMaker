// src/Pages/PreviewEditedPage.jsx
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { getPreviewData, setPreviewData } from "../lib/storage.js";

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
    return {
      title: saved?.title || "Preview",
      heroUrl: saved?.heroUrl || DEFAULT_HERO,
      markdown: saved?.markdown || saved?.html || DEFAULT_MARKDOWN,
    };
  }, []);

  const [title] = useState(initial.title);
  const [heroUrl] = useState(initial.heroUrl);
  const [markdown, setMarkdown] = useState(initial.markdown);

  const previewHtml = useMemo(
    () => marked.parse(markdown || ""),
    [markdown]
  );

  useEffect(() => {
    setPreviewData({ title, heroUrl, markdown, html: previewHtml });
  }, [title, heroUrl, markdown, previewHtml]);

  return (
    <div className="w-full min-h-screen bg-[#0B0B0F] overflow-hidden">
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      <div className="px-6 pt-4 pb-6 h-[calc(100vh-76px)] flex flex-col">
        <BackToDashBoardButton />

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
