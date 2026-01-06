import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import UploadCloudIcon from "../assets/upload-cloud.svg";
import AiIcon from "../assets/ai-icon.svg";
import { apiGet, apiUpload } from "../lib/api.js";

const tabs = [
  { id: "all", label: "All Images" },
  { id: "upload", label: "Uploaded Images" },
  { id: "ai", label: "AI Generated" },
];

function buildPath(tabId) {
  const base = "/images?limit=60";
  if (tabId === "upload") return `${base}&source=upload`;
  if (tabId === "ai") return `${base}&source=ai`;
  return base;
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

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

  const parseAspectRatio = (meta) => {
    const ratio = meta?.aspect_ratio || meta?.aspectRatio;
    if (typeof ratio === "string" && ratio.includes(":")) {
      const [w, h] = ratio.split(":").map((value) => Number(value));
      if (w > 0 && h > 0) return w / h;
    }
    if (typeof ratio === "number" && ratio > 0) {
      return ratio;
    }
    const width = Number(meta?.width || meta?.w);
    const height = Number(meta?.height || meta?.h);
    if (width > 0 && height > 0) {
      return width / height;
    }
    return 1;
  };

  const loadImages = async (tab = activeTab) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet(buildPath(tab));
      const items = (data?.items || []).map((img) => ({
        id: img.id,
        src: img.image_url,
        source: img.source || "",
        meta: img.meta || {},
      }));
      setImages(items);
    } catch (err) {
      setError(err?.message || "Failed to load images.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages(activeTab);
  }, [activeTab]);

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
    images.forEach((img) => {
      const ratio = parseAspectRatio(img.meta);
      const estimatedHeight = 1 / Math.max(0.4, ratio);
      let target = cols[0];
      for (const col of cols) {
        if (col.height < target.height) {
          target = col;
        }
      }
      target.items.push({ ...img, ratio });
      target.height += estimatedHeight + gap;
    });
    return cols.map((col) => col.items);
  }, [images, columnCount]);

  const triggerUpload = () => fileRef.current?.click();

  const handleUpload = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploadError("");

    try {
      for (const file of list) {
        await apiUpload("/blogs/uploads/images", file);
      }
      await loadImages(activeTab);
    } catch (err) {
      setUploadError(err?.message || "Failed to upload images.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar activeKey="gallery" />

        <div className="flex-1">
          <div className="px-10 pt-8 pb-12">
            <h1 className="text-[36px] leading-[38px] font-bold text-[#111827]">
              Welcome to Gallery
            </h1>
            <p className="mt-3 max-w-[950px] text-[14px] leading-[22px] text-[#6B7280]">
             We are pleased to welcome you to the Gallery, a centralized repository designed for the management of your visual assets. This professional interface allows you to efficiently review both your manually uploaded files and the high-fidelity images generated using the Nano Banana model. By consolidating these resources, the Gallery provides a streamlined environment to monitor your creative progress and maintain a comprehensive record of your digital projects.
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-6">
                {tabs.map((tab) => {
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "text-[13px] font-semibold pb-2 border-b-2",
                        active
                          ? "text-[#4443E4] border-[#4443E4]"
                          : "text-[#6B7280] border-transparent hover:text-[#374151]",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={triggerUpload}
                  className="
                    h-[40px] px-5 rounded-[10px]
                    bg-white border border-[#D1D5DB]
                    text-[14px] font-medium text-[#111827]
                    hover:bg-[#F9FAFB]
                    flex items-center gap-2
                  "
                >
                  <img src={UploadCloudIcon} alt="" className="w-[18px] h-[18px]" />
                  Upload Image from Device
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/generate-image")}
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

            {uploadError ? (
              <div className="mt-3 text-[12px] text-[#DC2626]">{uploadError}</div>
            ) : null}

            <div className="mt-6">
              {loading ? (
                <div className="text-[13px] text-[#6B7280]">Loading images...</div>
              ) : images.length ? (
                <div className="rounded-[18px] bg-[#050505] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                  <div ref={gridRef} className="flex gap-3">
                    {columns.map((column, colIdx) => (
                      <div key={`col-${colIdx}`} className="flex-1 min-w-0 flex flex-col gap-3">
                        {column.map((img) => (
                          <div key={img.id} className="group relative overflow-hidden rounded-[16px] border border-white/10 bg-[#0F0F0F]">
                            <img
                              src={img.src}
                              alt=""
                              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-[#6B7280]">No images available.</div>
              )}

              {error ? (
                <div className="mt-3 text-[12px] text-[#DC2626]">{error}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
