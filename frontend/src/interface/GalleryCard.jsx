import { useRef } from "react";
import GalleryIcon from "../assets/gallery-icon.svg";
import AiIcon from "../assets/ai-icon.svg";

export default function GalleryCard({
  title = "Gallery",
  images = [], // array of URLs
  selectedSrc = "", // ✅ selected cover url
  onSelect, // ✅ (src) => void
  onUpload, // (files) => void
  onGenerate, // () => void
  className = "",
}) {
  const fileRef = useRef(null);

  const triggerPick = () => fileRef.current?.click();

  const handleFiles = (e) => {
    const files = e.target.files;
    if (files && files.length) onUpload?.(files);
    e.target.value = "";
  };

  const leftThumbs = (images || []).slice(0, 2);
  const mainImage = (images || [])[2] || (images || [])[0];

  const Thumb = ({ src, big = false }) => {
    const active = selectedSrc === src;

    return (
      <button
        type="button"
        onClick={() => onSelect?.(src)}
        className={[
          "w-full text-left rounded-[6px] border bg-white overflow-hidden",
          active ? "border-[#4443E4] ring-2 ring-[#4443E4]/25" : "border-[#E5E7EB]",
        ].join(" ")}
        title="Select as cover"
      >
        <img
          src={src}
          alt=""
          className={[
            "w-full object-cover",
            big ? "h-[220px]" : "h-[170px]",
          ].join(" ")}
          draggable="false"
        />
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
          <div className="flex gap-6">
            <div className="w-[240px]">
              <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-2">
                <div className="grid grid-cols-2 gap-2">
                  {leftThumbs.map((src, idx) => (
                    <Thumb key={`${src}-${idx}`} src={src} />
                  ))}
                  {leftThumbs.length === 1 ? (
                    <div className="rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] h-[170px]" />
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-2">
                <Thumb src={mainImage} big />
              </div>

              <div className="mt-2 text-[12px] text-[#6B7280]">
                Click an image to select it as the cover.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
