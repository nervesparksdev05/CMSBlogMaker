import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import NanoBananaTemplateCard from "../interface/NanoBananaTemplateCard.jsx";
import GenerateImageIcon from "../assets/generate-image.svg";
import { apiGet, apiPost } from "../lib/api.js";

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
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(
    "A sleek, futuristic dashboard with clear data gauges and a success checkmark."
  );
  const [ratio, setRatio] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [primaryColor, setPrimaryColor] = useState("#F2B233");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const fileInputRef = useRef(null);
  const [referenceFiles, setReferenceFiles] = useState([]);
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

  const removeReferenceAt = (idx) => {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearForm = () => {
    setPrompt("");
    setRatio("1:1");
    setQuality("standard");
    setPrimaryColor("#F2B233");
    setReferenceFiles([]);
    setPendingImage(null);
    setError("");
  };

  const onGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await apiPost("/ai/image-generate", {
        tone: "Formal",
        creativity: "Regular",
        focus_or_niche: prompt,
        targeted_keyword: "",
        selected_idea: prompt,
        title: "Generated Image",
        prompt,
        aspect_ratio: ratio,
        quality: quality === "high" ? "high" : "medium",
        primary_color: primaryColor,
        source: "nano",
        save_to_gallery: false,
      });
      if (data?.image_url) {
        setLoadError("");
        setPendingImage({
          id: `pending-${Date.now()}-${Math.random()}`,
          src: data.image_url,
          title: "Nano Banana",
          subtitle: data?.meta?.prompt || "",
          meta: data?.meta || {},
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const colorAnchorRef = useRef(null);
  const colorInputRef = useRef(null);

  const openColorPickerNearWidget = () => {
    const input = colorInputRef.current;
    if (!input) return;
    input.focus();
    input.click();
  };

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

  useEffect(() => {
    let ignore = false;

    const loadImages = async () => {
      try {
        setLoadError("");
        const data = await apiGet("/images?limit=24&source=nano");
        if (ignore) return;
        const items = (data?.items || []).map((img) => ({
          id: img.id,
          src: img.image_url,
          title: "Nano Banana",
          subtitle: img?.meta?.prompt || "",
        }));
        setGeneratedImages(items);
      } catch (err) {
        if (!ignore) {
          setLoadError(err?.message || "Failed to load saved images.");
        }
      }
    };

    loadImages();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSavePending = async () => {
    if (!pendingImage?.src || saving) return;
    try {
      setSaving(true);
      setError("");
      await apiPost("/images/save", {
        image_url: pendingImage.src,
        meta: pendingImage.meta || {},
        source: "nano",
      });
      setGeneratedImages((prev) => {
        const next = prev.filter((img) => img.src !== pendingImage.src);
        return [
          {
            id: `saved-${Date.now()}-${Math.random()}`,
            src: pendingImage.src,
            title: pendingImage.title || "Nano Banana",
            subtitle: pendingImage.subtitle || "",
          },
          ...next,
        ];
      });
      setPendingImage(null);
    } catch (err) {
      setError(err?.message || "Failed to save image to gallery.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />
      <HeaderBottomBar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-8 py-7">
            <h1 className="text-[38px] leading-[42px] font-bold text-[#111827]">
              Welcome to Image Generation with Nano Banana
            </h1>
            <p className="mt-3 max-w-[980px] text-[14px] font-semibold leading-[22px] text-[#6B7280]">
              Generate images based on a prompt. This demo uses the same AI backend as the blog flow.
            </p>

            <div className="mt-6 w-full rounded-[14px] bg-white border border-[#E5E7EB] shadow-sm">
              <div className="px-7 py-6 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center">
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

                <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
                  <div className="min-w-[320px]">
                    <div className="text-[13px] font-medium text-[#111827]">Image Quality</div>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="mt-2 w-[320px] max-w-full h-[44px] rounded-[12px] border border-[#D1D5DB] bg-white px-4 text-[14px] text-[#111827] outline-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                    </select>
                  </div>

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

                <div className="mt-7">
                  <div className="text-[13px] font-medium text-[#111827]">Reference Image</div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1 min-h-[64px] rounded-[12px] border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 flex items-center">
                      <div className="flex items-center gap-3">
                        {referencePreviews.length ? (
                          referencePreviews.slice(0, 6).map((p, idx) => (
                            <div
                              key={p.url}
                              className="relative w-[40px] h-[40px] rounded-[10px] overflow-hidden border border-[#E5E7EB] bg-white"
                            >
                              <img
                                src={p.url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeReferenceAt(idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6]"
                                aria-label="Remove reference image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[12px] text-[#6B7280]">
                            Upload a reference image (optional)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[38px] px-5 rounded-[999px] bg-white border border-[#D1D5DB] text-[13px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
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
                        disabled={loading}
                        className="h-[38px] px-6 rounded-[999px] bg-[#4443E4] text-white text-[13px] font-medium hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? "Generating..." : "Generate Image"}
                      </button>
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="mt-3 text-[12px] text-[#DC2626] text-right">{error}</div>
                ) : null}
              </div>
            </div>

            {pendingImage ? (
              <div className="mt-8 w-full rounded-[14px] bg-white border border-[#E5E7EB] shadow-sm">
                <div className="px-7 py-6">
                  <div className="text-[18px] font-semibold text-[#111827]">
                    Image Generation is Completed
                  </div>
                  <div className="mt-2 text-[13px] text-[#6B7280]">
                    Review the image below. You can regenerate with a better prompt or save it to the gallery.
                  </div>

                  <div className="mt-5 max-w-[360px]">
                    <NanoBananaTemplateCard image={pendingImage} />
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPendingImage(null)}
                      className="h-[40px] px-6 rounded-[999px] bg-white border border-[#D1D5DB] text-[13px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
                    >
                      Generate another Image
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePending}
                      disabled={saving}
                      className="h-[40px] px-6 rounded-[999px] bg-[#4443E4] text-white text-[13px] font-medium hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Done & Save Gallery"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-10">
              <h2 className="text-[22px] font-semibold text-[#111827]">
                Previous generated Images
              </h2>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.length ? (
                  generatedImages.slice(0, 3).map((img) => (
                    <NanoBananaTemplateCard key={img.id} image={img} />
                  ))
                ) : (
                  <div className="text-[13px] text-[#6B7280]">
                    No images generated yet.
                  </div>
                )}
              </div>

              {loadError ? (
                <div className="mt-3 text-[12px] text-[#DC2626]">{loadError}</div>
              ) : null}

              {generatedImages.length ? (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/gallery")}
                    className="text-[13px] font-semibold text-[#4443E4] hover:underline"
                  >
                    Show All
                  </button>
                </div>
              ) : null}
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
