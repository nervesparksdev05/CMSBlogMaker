// GalleryCard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
  loading = false,
  emptyMessage = "You have not Uploaded or Generated any image",
  className = "",
}) {
  const fileRef = useRef(null);
  const menuRef = useRef(null);
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);
  const [ratios, setRatios] = useState({});

  const [menu, setMenu] = useState({
    open: false,
    src: "",
    x: 0,
    y: 0,
  });

  const triggerPick = () => fileRef.current?.click();

  const getColumnCount = (width, count) => {
    let base = 1;
    if (width >= 1280) {
      base = 4;
    } else if (width >= 1024) {
      base = 3;
    } else if (width >= 640) {
      base = 2;
    }
    const total = Math.max(1, count || 1);
    return Math.min(base, total);
  };

  const handleImageLoad = (src, event) => {
    if (!event?.currentTarget) return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    setRatios((prev) => {
      if (prev[src]) return prev;
      return { ...prev, [src]: ratio };
    });
  };

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

  useEffect(() => {
    if (!gridRef.current) return;
    const updateColumns = () => {
      const width = gridRef.current?.clientWidth || window.innerWidth;
      setColumnCount(getColumnCount(width, images.length));
    };
    updateColumns();
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateColumns);
      observer.observe(gridRef.current);
    } else {
      window.addEventListener("resize", updateColumns);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener("resize", updateColumns);
      }
    };
  }, [images.length]);

  const columns = useMemo(() => {
    const count = Math.max(1, columnCount);
    const cols = Array.from({ length: count }, () => ({
      items: [],
      height: 0,
    }));
    const gap = 0.12;
    (images || []).forEach((src) => {
      const ratio = ratios[src] || 1;
      const estimatedHeight = 1 / Math.max(0.4, ratio);
      let target = cols[0];
      for (const col of cols) {
        if (col.height < target.height) {
          target = col;
        }
      }
      target.items.push({ src });
      target.height += estimatedHeight + gap;
    });
    return cols.map((col) => col.items);
  }, [images, columnCount, ratios]);

  const Thumb = ({ src }) => {
    const active = selectedSrc === src;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelect?.(src)}
          className={[
            "group relative w-full overflow-hidden rounded-[16px] border bg-[#0F0F0F] text-left",
            active ? "border-[#4443E4] ring-2 ring-[#4443E4]/30" : "border-white/10",
          ].join(" ")}
          title="Select as cover"
        >
          <img
            src={src}
            alt=""
            onLoad={(e) => handleImageLoad(src, e)}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            draggable="false"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {active ? (
            <div className="absolute left-3 top-3 rounded-full bg-[#4443E4] text-white text-[11px] px-2 py-[3px]">
              Selected
            </div>
          ) : null}
        </button>

        {onDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMenuAt(src, e);
            }}
            className="absolute right-3 top-3 bg-white/90 border border-[#E5E7EB] rounded-full w-8 h-8 flex items-center justify-center text-[#111827]"
            title="Options"
          >
            ...
          </button>
        ) : null}
      </div>
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
        {loading ? (
          <div className="h-[160px] flex items-center justify-center">
            <div className="text-[14px] text-[#6B7280]">Loading images...</div>
          </div>
        ) : !images?.length ? (
          <div className="h-[160px] flex items-center justify-center">
            <div className="text-[18px] font-semibold text-[#111827]">
              {emptyMessage}
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <div className="rounded-[18px] bg-[#050505] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
              <div ref={gridRef} className="flex gap-3">
                {columns.map((column, colIdx) => (
                  <div key={`col-${colIdx}`} className="flex-1 min-w-0 flex flex-col gap-3">
                    {column.map((item) => (
                      <Thumb key={item.src} src={item.src} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[12px] text-[#6B7280]">
              Click an image to select it as the cover.
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
