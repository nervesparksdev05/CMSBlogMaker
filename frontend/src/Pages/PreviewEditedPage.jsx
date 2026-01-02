// src/Pages/PreviewEditedPage.jsx
import { useMemo, useRef, useState } from "react";
import { getPreviewData, setPreviewData } from "../lib/storage.js";

import MainHeader from "../interface/MainHeader";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";

import FacebookIcon from "../assets/facebook-icon.svg";
import TwitterIcon from "../assets/twitter-icon.svg";
import LinkedInIcon from "../assets/linkedin-icon.svg";

function safeParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

function RichTextToolbar({ onChange }) {
  const exec = (cmd, value = null) => {
    try {
      document.execCommand("styleWithCSS", false, true);
    } catch {
      // ignore
    }
    document.execCommand(cmd, false, value);
    onChange?.();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    exec("createLink", url);
  };

  return (
    <div className="sticky top-[76px] z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {/* Bold/Italic/Underline */}
        <div className="flex items-center gap-1 pr-3 border-r border-[#E5E7EB]">
          <button type="button" onClick={() => exec("bold")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Bold">
            <b>B</b>
          </button>
          <button type="button" onClick={() => exec("italic")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Italic">
            <i>I</i>
          </button>
          <button type="button" onClick={() => exec("underline")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Underline">
            <u>U</u>
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 px-3 border-r border-[#E5E7EB]">
          <button type="button" onClick={() => exec("formatBlock", "p")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Paragraph">
            P
          </button>
          <button type="button" onClick={() => exec("formatBlock", "h2")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Heading 2">
            H2
          </button>
          <button type="button" onClick={() => exec("formatBlock", "h3")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Heading 3">
            H3
          </button>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 px-3 border-r border-[#E5E7EB]">
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              exec("fontSize", e.target.value);
              e.target.value = "";
            }}
            className="text-sm border border-[#D1D5DB] rounded px-2 py-1 focus:outline-none"
            defaultValue=""
          >
            <option value="">Font</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">XL</option>
          </select>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 px-3 border-r border-[#E5E7EB]">
          <button type="button" onClick={() => exec("justifyLeft")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Left">
            L
          </button>
          <button type="button" onClick={() => exec("justifyCenter")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Center">
            C
          </button>
          <button type="button" onClick={() => exec("justifyRight")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Right">
            R
          </button>
          <button type="button" onClick={() => exec("justifyFull")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Justify">
            J
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 px-3 border-r border-[#E5E7EB]">
          <button type="button" onClick={() => exec("insertUnorderedList")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Bullets">
            •
          </button>
          <button type="button" onClick={() => exec("insertOrderedList")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Numbers">
            1.
          </button>
        </div>

        {/* Indent */}
        <div className="flex items-center gap-1 px-3 border-r border-[#E5E7EB]">
          <button type="button" onClick={() => exec("outdent")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Outdent">
            ←
          </button>
          <button type="button" onClick={() => exec("indent")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Indent">
            →
          </button>
        </div>

        {/* Link/Undo/Redo/Clear/Color */}
        <div className="flex items-center gap-1 px-3">
          <button type="button" onClick={addLink} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Link">
            🔗
          </button>
          <button type="button" onClick={() => exec("undo")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Undo">
            ↶
          </button>
          <button type="button" onClick={() => exec("redo")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Redo">
            ↷
          </button>
          <button type="button" onClick={() => exec("removeFormat")} className="p-2 hover:bg-[#F3F4F6] rounded-md" title="Clear formatting">
            ✕
          </button>

          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#F3F4F6] rounded-md" title="Text Color">
            🎨
            <input
              type="color"
              onChange={(e) => exec("foreColor", e.target.value)}
              className="w-0 h-0 opacity-0"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function PreviewEditedPage() {
  const editorRef = useRef(null);

  const initial = useMemo(() => {
    const saved = getPreviewData();
    return (
      saved || {
        title: "Preview",
        heroUrl:
          "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
        html: "<h1>Nothing to preview yet.</h1>",
      }
    );
  }, []);

  const [title, setTitle] = useState(initial.title || "");
  const [heroUrl, setHeroUrl] = useState(initial.heroUrl || "");
  const [html, setHtml] = useState(initial.html || "");
  const [isEditing, setIsEditing] = useState(false);

  const syncHtml = () => {
    if (!editorRef.current) return;
    setHtml(editorRef.current.innerHTML);
  };

  const save = () => {
    setPreviewData({
      title,
      heroUrl,
      html: editorRef.current?.innerHTML ?? html,
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      {isEditing ? <RichTextToolbar onChange={syncHtml} /> : null}

      <div className="px-10 pt-6 pb-10">
        <BackToDashBoardButton />

        <div className="mt-6 flex gap-6 items-start">
          {/* LEFT Actions */}
          <div className="w-[360px] shrink-0">
            <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
              <div className="text-[18px] font-semibold text-[#111827]">
                Actions
              </div>

              <div className="mt-4">
                <div className="text-[12px] font-semibold text-[#111827] mb-2">
                  Title
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[42px] rounded-[10px] border border-[#E5E7EB] px-3 text-[13px] outline-none"
                  disabled={!isEditing}
                />

                <div className="text-[12px] font-semibold text-[#111827] mt-4 mb-2">
                  Cover Image URL
                </div>
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full h-[42px] rounded-[10px] border border-[#E5E7EB] px-3 text-[13px] outline-none"
                  disabled={!isEditing}
                />
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                  className={[
                    "flex-1 h-[44px] rounded-full",
                    "border border-[#D1D5DB] bg-white",
                    "text-[14px] font-medium text-[#111827]",
                    isEditing ? "opacity-50 cursor-not-allowed" : "hover:bg-[#F9FAFB]",
                  ].join(" ")}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={save}
                  disabled={!isEditing}
                  className={[
                    "flex-1 h-[44px] rounded-full",
                    "bg-[#4443E4] text-white",
                    "text-[14px] font-semibold",
                    !isEditing ? "opacity-50 cursor-not-allowed" : "hover:opacity-95",
                  ].join(" ")}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT Blog */}
          <div className="flex-1 min-w-0">
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
              {/* Hero */}
              <div className="relative">
                <img
                  src={heroUrl}
                  alt=""
                  className="w-full h-[260px] object-cover"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-[6px] text-[12px] font-medium text-[#111827]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#4443E4]" />
                      Preview / Edit
                    </div>

                    <div className="mt-3 text-white text-[26px] leading-[32px] font-semibold max-w-[920px]">
                      {title}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div
                  ref={editorRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onInput={syncHtml}
                  dangerouslySetInnerHTML={{ __html: html }}
                  className={[
                    "prose max-w-none rounded-[12px] border p-4 min-h-[420px] outline-none",
                    isEditing
                      ? "border-[#4443E4] ring-2 ring-[#4443E4]/20"
                      : "border-[#E5E7EB]",
                  ].join(" ")}
                />
              </div>
            </div>

            {/* Share bar */}
            <div className="mt-6">
              <div className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#0B1E85]">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-white text-[14px] font-semibold">
                    Like what you see? Share with a friend.
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                      <img src={FacebookIcon} alt="" className="w-[18px] h-[18px]" />
                    </button>
                    <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                      <img src={TwitterIcon} alt="" className="w-[18px] h-[18px]" />
                    </button>
                    <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                      <img src={LinkedInIcon} alt="" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
