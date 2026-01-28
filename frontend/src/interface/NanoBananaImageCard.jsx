// src/interface/NanoBananaImageCard.jsx
import { useMemo, useRef, useState, useLayoutEffect } from "react";
import GenerateImageIcon from "../assets/generate-image.svg";
import RadioIcon from "../assets/radio.svg";
import EmptyRadioIcon from "../assets/empty-radio.svg";
import WidgetColorInterface from "./WidgetColorInterface.jsx";
import CustomizeColorButton from "../buttons/CustomizeColorButton.jsx";

function ProgressRing({ value = 0 }) {
  const size = 240;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const dash = (pct / 100) * c;

  return (
    <div className="relative w-[240px] h-[240px]">
      <svg width={size} height={size} className="block">
        <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
          <circle r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
          <circle
            r={r}
            fill="none"
            stroke="#3F3CEB"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[18px] font-semibold text-[#111827]">Generating...</div>
        <div className="mt-1 text-[26px] font-semibold text-[#111827]">{pct}%</div>
      </div>
    </div>
  );
}

/** ✅ smaller + fully rounded */
function ThumbDelete({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove reference image"
      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-md border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F3F4F6]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 6L6 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function NanoBananaImageCard({
  open = false,
  onClose,

  stage = "form",
  progress = 0,
  generatedImages = [],
  onGenerateAnother,
  onDoneSave,

  prompt = "",
  onPromptChange,
  aspect = "square",
  onAspectChange,
  quality = "",
  onQualityChange,

  primaryColor = "#F4B02A",
  onPrimaryColorChange,

  referenceImages = [],
  onUploadReference,
  onRemoveReference,
  onGenerate,
  error = "",
}) {
  const fileRef = useRef(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState({ left: 0, top: 0 });
  const pickerBtnRef = useRef(null);
  const paletteRef = useRef(null);

  const aspects = useMemo(
    () => [
      { key: "square", label: "Square (1:1)" },
      { key: "landscape", label: "Landscape (4:3)" },
      { key: "portrait", label: "Portrait (3:4)" },
    ],
    []
  );

  const computePickerPos = () => {
    const btnEl = pickerBtnRef.current;
    if (!btnEl) return;

    const btn = btnEl.getBoundingClientRect();
    const paletteW = 320;
    const paletteH = 260;
    const gap = 12;

    let left = btn.left - paletteW - gap;
    let top = btn.top + btn.height / 2 - paletteH / 2;

    if (left < 12) left = btn.right + gap;

    left = Math.max(12, Math.min(window.innerWidth - paletteW - 12, left));
    top = Math.max(12, Math.min(window.innerHeight - paletteH - 12, top));

    setPickerPos({ left, top });
  };

  const togglePicker = () => {
    setPickerOpen((v) => {
      const next = !v;
      if (next) requestAnimationFrame(computePickerPos);
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!pickerOpen) return;

    computePickerPos();
    const onResize = () => computePickerPos();
    const onScroll = () => computePickerPos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  useLayoutEffect(() => {
    if (!pickerOpen) return;

    const onDown = (e) => {
      const btnEl = pickerBtnRef.current;
      const palEl = paletteRef.current;

      if (palEl && palEl.contains(e.target)) return;
      if (btnEl && btnEl.contains(e.target)) return;

      setPickerOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setPickerOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  if (!open) return null;

  const showForm = stage === "form";
  const showGenerating = stage === "generating";
  const showDone = stage === "done";

  const hasRefs = (referenceImages || []).length > 0;
  const handlePickRefs = () => fileRef.current?.click();

  const removeRefAt = (idx) => {
    if (typeof onRemoveReference !== "function") return;
    try {
      onRemoveReference(idx);
    } catch {
      onRemoveReference();
    }
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/30 px-6">
      {/* ✅ more rounded modal */}
      <div className="w-[1180px] h-[700px] rounded-[22px] bg-white shadow-xl ">
        {/* Top */}
        <div className="px-10 pt-8 pb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center">
              <img src={GenerateImageIcon} alt="" className="w-[38px] h-[38px]" />
            </div>

            <div>
              <div className="text-[28px] leading-[34px] font-semibold text-[#111827]">
                Generate Image with Nano Banana
              </div>
              <div className="mt-1 text-[14px] text-[#6B7280]">Generate images based on keywords</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F3F4F6]"
            aria-label="Close"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6L6 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="px-10 pb-10">
          {showGenerating ? (
            <div className="min-h-[520px] flex flex-col items-center justify-center">
              <ProgressRing value={progress} />
              <p className="mt-10 max-w-[860px] text-center text-[18px] leading-[30px] text-[#111827]">
                Your high-fidelity image is currently being rendered by the Nano Banana model; please remain on standby
                while we transform your vision into a visual reality.
              </p>
            </div>
          ) : null}

          {showDone ? (
            <div className="min-h-[520px] flex flex-col items-center justify-center">
              <div className="w-[70px] h-[70px] rounded-full bg-[#22C55E] flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mt-5 text-[20px] font-semibold text-[#111827]">Image Generation is Completed</div>

              <div className="mt-8 flex items-center justify-center gap-18">
                <div className="flex gap-10">
                  {(generatedImages || []).slice(0, 2).map((src, idx) => (
                    <div key={src + idx} className="w-[210px]">
                      <img src={src} alt="" className="w-full h-[320px] object-cover rounded-[10px]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 w-full flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={onGenerateAnother}
                  className="h-[44px] px-10 rounded-full bg-white border border-[#111827]/40 text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Generate another Image
                </button>

                <button
                  type="button"
                  onClick={onDoneSave}
                  className="h-[44px] px-10 rounded-full bg-[#4443E4] text-white text-[14px] font-semibold hover:opacity-95"
                >
                  Done &amp; Save Gallery
                </button>
              </div>
            </div>
          ) : null}

          {showForm ? (
            <>
              <div className="text-[14px] font-semibold text-[#111827] mb-2">
                Image Prompt <span className="text-red-500">*</span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => onPromptChange?.(e.target.value)}
                placeholder="Describe your image..."
                className="w-full h-[110px] rounded-[12px] border border-[#D1D5DB] px-5 py-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none resize-none"
              />

              <div className="mt-8 text-[14px] font-semibold text-[#111827]">
                Aspect Ratio <span className="text-red-500">*</span>
              </div>

              <div className="mt-4 flex items-center gap-24">
                {aspects.map((a) => {
                  const active = a.key === aspect;
                  return (
                    <button key={a.key} type="button" onClick={() => onAspectChange?.(a.key)} className="flex items-center gap-3">
                      <img src={active ? RadioIcon : EmptyRadioIcon} alt="" className="w-[22px] h-[22px]" />
                      <span className="text-[16px] text-[#111827]">{a.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-start justify-between gap-10">
                <div className="w-[520px]">
                  <div className="text-[14px] font-semibold text-[#111827] mb-3">Image Quantity</div>

                  <div className="relative">
                    <select
                      value={quality}
                      onChange={(e) => onQualityChange?.(e.target.value)}
                      className="w-full h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-[14px] text-[#111827] outline-none appearance-none"
                    >
                      <option value="">-Select Image quality-</option>
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-start justify-end gap-8">
                  <div>
                    <div className="text-[14px] font-semibold text-[#111827] mb-3 text-center">Primary color</div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={togglePicker}
                        className="w-[64px] h-[64px] rounded-full border border-[#E5E7EB]"
                        style={{ background: primaryColor }}
                        aria-label="Toggle color palette"
                      />
                      <span ref={pickerBtnRef} className="inline-flex">
                        <CustomizeColorButton onClick={togglePicker} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {pickerOpen ? (
                <div ref={paletteRef} className="fixed z-[99999]" style={{ left: pickerPos.left, top: pickerPos.top }}>
                  <WidgetColorInterface
                    label="Primary color"
                    value={primaryColor}
                    onChange={(c) => onPrimaryColorChange?.(c)}
                    onClose={() => setPickerOpen(false)}
                  />
                </div>
              ) : null}

              {/* ✅ Reference Image section: smaller thumbs + fully rounded corners */}
              <div className="mt-3">
                <div className="text-[14px] font-semibold mb-3 text-[#111827] ">Reference Image</div>

                <div className="w-full h-[92px] rounded-[14px] bg-[#F3F4F6] border border-[#E5E7EB] flex items-center px-4 overflow-hidden">
                  {!hasRefs ? (
                    <div className="text-[13px] text-[#6B7280]">Upload a reference image (optional)</div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {(referenceImages || []).slice(0, 6).map((src, idx) => (
                        <div
                          key={`${src}-${idx}`}
                          className="relative w-[44px] h-[44px] rounded-full bg-white border border-[#E5E7EB] overflow-hidden"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" draggable="false" />
                          <ThumbDelete onClick={() => removeRefAt(idx)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length) onUploadReference?.(files);
                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={handlePickRefs}
                  className="h-[44px] px-8 rounded-full bg-white border border-[#111827]/40 text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Upload Reference Image
                </button>

                <button
                  type="button"
                  onClick={onGenerate}
                  className="h-[44px] px-10 rounded-full text-[14px] font-semibold text-white bg-[#4443E4] hover:opacity-95"
                >
                  Generate Image
                </button>
              </div>

              {error ? (
                <div className="mt-3 text-[12px] text-[#DC2626] text-right">
                  {error}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
