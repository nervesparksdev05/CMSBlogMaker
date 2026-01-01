// GalleryCard.jsx
import { useEffect, useRef, useState } from "react";
import GalleryIcon from "../assets/gallery-icon.svg";
import AiIcon from "../assets/ai-icon.svg";

export default function GalleryCard({
  title = "Gallery",
  images = [], // array of URLs
  selectedSrc = "", // selected cover url
  onSelect, // (src) => void
  onDelete, // ✅ (src) => void
  onUpload, // (files) => void
  onGenerate, // () => void
  className = "",
}) {
  const fileRef = useRef(null);
  const menuRef = useRef(null);

  const [menu, setMenu] = useState({
    open: false,
    src: "",
    x: 0,
    y: 0,
  });

  const triggerPick = () => fileRef.current?.click();

  const handleFiles = (e) => {
    const files = e.target.files;
    if (files && files.length) onUpload?.(files);
    e.target.value = "";
  };

  const openMenuAt = (src, evt) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    setMenu({
      open: true,
      src,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const closeMenu = () => setMenu({ open: false, src: "", x: 0, y: 0 });

  useEffect(() => {
    if (!menu.open) return;

    const onDocDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menu.open]);

  const Thumb = ({ src }) => {
    const active = selectedSrc === src;

    return (
      <button
        type="button"
        onClick={(e) => openMenuAt(src, e)}
        className={[
          "w-full text-left rounded-[6px] border bg-white overflow-hidden relative",
          active ? "border-[#4443E4] ring-2 ring-[#4443E4]/25" : "border-[#E5E7EB]",
        ].join(" ")}
        title="Options"
      >
        <img
          src={src}
          alt=""
          className="w-full h-[160px] object-cover"
          draggable="false"
        />
        {/* tiny hint */}
        <div className="absolute right-2 top-2 bg-white/90 border border-[#E5E7EB] rounded-full w-8 h-8 flex items-center justify-center text-[#111827]">
          ⋮
        </div>
      </button>
    );
  };

  return (
    <section
      className={[
        "w-full rounded-[10px] border border-[#E5E7EB] bg-white",
        "px-6 py-5",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
            <img src={GalleryIcon} alt="" className="w-[22px] h-[22px]" />
          </div>
          <div className="text-[18px] font-semibold text-[#111827]">{title}</div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />

          <button
            type="button"
            onClick={triggerPick}
            className="
              h-[40px] px-5 rounded-[10px]
              bg-white border border-[#D1D5DB]
              text-[14px] font-medium text-[#111827]
              hover:bg-[#F9FAFB]
              flex items-center gap-2
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M7 8l5-4 5 4"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M4 20h16" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Upload Image from Device
          </button>

          <button
            type="button"
            onClick={onGenerate}
            className="
              h-[40px] px-5 rounded-[10px]
              bg-[#4443E4] text-white
              text-[14px] font-medium
              hover:opacity-95
              flex items-center gap-2
            "
          >
            <img src={AiIcon} alt="" className="w-[18px] h-[18px]" />
            Generate Image with Nano Banana
          </button>
        </div>
      </div>

      <div className="mt-6">
        {!images?.length ? (
          <div className="h-[140px] flex items-center justify-center">
            <div className="text-[18px] font-semibold text-[#111827]">
              You have not Upload or Generated any image
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(images || []).map((src, idx) => (
                <Thumb key={`${src}-${idx}`} src={src} />
              ))}
            </div>

            <div className="mt-2 text-[12px] text-[#6B7280]">
              Click an image to see options: Select or Delete.
            </div>
          </div>
        )}
      </div>

      {/* ✅ Floating Options Menu */}
      {menu.open ? (
        <div
          className="fixed inset-0 z-[9999]"
          onMouseDown={closeMenu}
          aria-hidden="true"
        >
          <div
            ref={menuRef}
            className="
              fixed z-[10000]
              w-[180px] rounded-[10px] border border-[#E5E7EB]
              bg-white shadow-lg overflow-hidden
            "
            style={{
              left: Math.max(12, Math.min(menu.x - 90, window.innerWidth - 12 - 180)),
              top: Math.max(12, Math.min(menu.y - 20, window.innerHeight - 12 - 96)),
            }}
            onMouseDown={(e) => e.stopPropagation()}
            role="menu"
          >
            <button
              type="button"
              className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#F9FAFB]"
              onClick={() => {
                onSelect?.(menu.src);
                closeMenu();
              }}
            >
              Select as cover
            </button>

            <div className="h-px bg-[#E5E7EB]" />

            <button
              type="button"
              className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#FEF2F2] text-[#B91C1C]"
              onClick={() => {
                onDelete?.(menu.src);
                closeMenu();
              }}
            >
              Delete image
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
