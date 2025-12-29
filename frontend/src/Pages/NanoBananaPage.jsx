// src/pages/NanoBananaPage.jsx
import { useMemo, useRef, useState, useLayoutEffect } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import NanoBananaImageCard from "../interface/NanoBananaImageCard";
import GenerateImageIcon from "../assets/generate-image.svg";

function RatioOption({ label, value, selected, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="radio"
        name="ratio"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        className={[
          "w-5 h-5 rounded-full border flex items-center justify-center",
          selected ? "border-[#4443E4]" : "border-[#D1D5DB]",
        ].join(" ")}
      >
        {selected ? <span className="w-3 h-3 rounded-full bg-[#4443E4]" /> : null}
      </span>
      <span className="text-[14px] text-[#111827]">{label}</span>
    </label>
  );
}

export default function NanoBananaPage() {
  const [prompt, setPrompt] = useState(
    `A sleek, futuristic dashboard or data visualization. On the left, a blurry, impressionistic "VIBES" meter with a needle wobbling uncertainly. On the right, a clear, crisp set of digital gauges and graphs showing various metrics (e.g., "Context Recall: 85%", "Faithfulness: 92%"). A green checkmark or "SUCCESS" indicator.`
  );

  const [ratio, setRatio] = useState("1:1"); // 1:1 | 4:3 | 3:4
  const [quality, setQuality] = useState("standard"); // standard | high
  const [primaryColor, setPrimaryColor] = useState("#F2B233");

  // reference images upload
  const fileInputRef = useRef(null);
  const [referenceFiles, setReferenceFiles] = useState([]); // File[]
  const referencePreviews = useMemo(() => {
    return referenceFiles.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
  }, [referenceFiles]);

  const onUploadReference = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setReferenceFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const clearForm = () => {
    setPrompt("");
    setRatio("1:1");
    setQuality("standard");
    setPrimaryColor("#F2B233");
    setReferenceFiles([]);
  };

  const onGenerate = async () => {
    alert("TODO: Call backend to generate image");
  };

  // Mock previous images (replace with API)
  const previousImages = useMemo(
    () => [
      { id: 1, src: "/images/demo1.png", title: "Bonsai 1" },
      { id: 2, src: "/images/demo2.png", title: "Bonsai 2" },
      { id: 3, src: "/images/demo3.png", title: "Portrait" },
    ],
    []
  );

  // ✅ native color picker positioning near the widget
  const colorAnchorRef = useRef(null);
  const colorInputRef = useRef(null);

  const openColorPickerNearWidget = () => {
    const input = colorInputRef.current;
    if (!input) return;

    // (optional) ensure it's visually near the widget for consistent UX,
    // but still uses the SAME native <input type="color"> (no extra widget copy).
    // Some browsers ignore moving the native color dialog (it's OS-controlled),
    // but this guarantees the click happens from the right place.
    input.focus();
    input.click();
  };

  // (optional) keep the hidden input positioned near the anchor (for browsers that care)
  const [colorPos, setColorPos] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    const el = colorAnchorRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    setColorPos({
      left: Math.round(r.left),
      top: Math.round(r.bottom + 8),
    });
  }, [primaryColor]);

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />
      <HeaderBottomBar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-8 py-7">
            {/* Hero */}
            <h1 className="text-[38px] leading-[42px] font-bold text-[#111827]">
              Welcome to Image Generation with Nano Banana
            </h1>
            <p className="mt-3 max-w-[980px] text-[14px] font-semibold leading-[22px] text-[#6B7280]">
              We are excited to introduce you to Nano Banana, our state-of-the-art image generation
              model. Whether you are looking to visualize a brand new concept, edit an existing
              image, or experiment with complex artistic styles, Nano Banana offers a high-fidelity,
              intuitive experience.
            </p>

            {/* Generate Card */}
            <div className="mt-6 w-full rounded-[14px] bg-white border border-[#E5E7EB] shadow-sm">
              <div className="px-7 py-6 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  {/* ✅ use imported icon */}
                  <div className="w-10 h-10 rounded-[10px]  flex items-center justify-center">
                    <img
                      src={GenerateImageIcon}
                      alt=""
                      className="w-[38px] h-[38px]"
                      draggable={false}
                    />
                  </div>

                  <div>
                    <h2 className="text-[18px] font-semibold text-[#111827]">
                      Generate Image with Nano Banana
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      Generate images based on keywords
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearForm}
                  className="w-10 h-10 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center"
                  aria-label="Clear"
                  title="Clear"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-7 pb-7">
                {/* prompt */}
                <div>
                  <div className="text-[13px] font-medium text-[#111827]">
                    Image Prompt <span className="text-[#DC2626]">*</span>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-[12px] border border-[#D1D5DB] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none focus:border-[#4443E4]"
                    placeholder="Describe what you want to generate..."
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="mt-6">
                  <div className="text-[13px] font-medium text-[#111827]">
                    Aspect Ratio <span className="text-[#DC2626]">*</span>
                  </div>

                  <div className="mt-3 flex items-center gap-10">
                    <RatioOption
                      label="Square (1:1)"
                      value="1:1"
                      selected={ratio === "1:1"}
                      onChange={setRatio}
                    />
                    <RatioOption
                      label="Landscape (4:3)"
                      value="4:3"
                      selected={ratio === "4:3"}
                      onChange={setRatio}
                    />
                    <RatioOption
                      label="Portrait (3:4)"
                      value="3:4"
                      selected={ratio === "3:4"}
                      onChange={setRatio}
                    />
                  </div>
                </div>

                {/* Image Quantity + Primary color row */}
                <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
                  <div className="min-w-[320px]">
                    <div className="text-[13px] font-medium text-[#111827]">Image Quantity</div>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="mt-2 w-[320px] max-w-full h-[44px] rounded-[12px] border border-[#D1D5DB] bg-white px-4 text-[14px] text-[#111827] outline-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* ✅ Anchor wrapper so picker opens “near widget” */}
                  <div ref={colorAnchorRef} className="flex items-end gap-4 relative">
                    <div>
                      <div className="text-[13px] font-medium text-[#111827]">Primary color</div>
                      <div
                        className="mt-2 w-12 h-12 rounded-full border border-[#E5E7EB]"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={openColorPickerNearWidget}
                        className="h-[40px] px-6 rounded-[10px] bg-[#4443E4] text-white text-[14px] font-medium hover:opacity-95"
                      >
                        Customize Color
                      </button>

                      {/* ✅ SAME native input, just not "hidden" (some browsers block click on display:none) */}
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        aria-label="Choose color"
                        className="fixed opacity-0 pointer-events-none"
                        style={{
                          left: `${colorPos.left}px`,
                          top: `${colorPos.top}px`,
                          width: 1,
                          height: 1,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reference previews + buttons */}
                <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    {referencePreviews.slice(0, 4).map((p) => (
                      <img
                        key={p.url}
                        src={p.url}
                        alt={p.name}
                        className="w-10 h-10 rounded-[10px] object-cover border border-[#E5E7EB]"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[44px] px-6 rounded-[999px] bg-white border border-[#D1D5DB] text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
                    >
                      Upload Reference Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onUploadReference}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={onGenerate}
                      className="h-[44px] px-7 rounded-[999px] bg-[#4443E4] text-white text-[14px] font-medium hover:opacity-95"
                    >
                      Generate Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Previous generated Images */}
            <div className="mt-10">
              <h2 className="text-[22px] font-semibold text-[#111827]">
                Previous generated Images
              </h2>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousImages.map((img) => (
                  <NanoBananaImageCard key={img.id} image={img} />
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="text-[14px] font-medium text-[#2563EB] hover:underline"
                  onClick={() => alert("TODO: Show All")}
                >
                  Show All
                </button>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
