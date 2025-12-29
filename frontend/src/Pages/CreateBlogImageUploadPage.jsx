import { useMemo, useState, useEffect } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import GalleryCard from "../interface/GalleryCard";
import NanoBananaImageCard from "../interface/NanoBananaImageCard";
import PreviousButton from "../buttons/PreviousButton";
import NextButton from "../buttons/NextButton";

export default function CreateBlogImageUploadPage() {
  const [nanoOpen, setNanoOpen] = useState(false);

  // gallery images shown on page
  const [images, setImages] = useState([]); // [{id, src}]
  const hasImages = images.length > 0;

  // modal form state
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("square");
  const [quality, setQuality] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#F4B02A");

  // reference images (inside modal)
  const [refImages, setRefImages] = useState([]); // [{id, src, file}]

  // modal stages
  const [stage, setStage] = useState("form"); // "form" | "generating" | "done"
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState([]); // [url,url]

  const helperText = useMemo(
    () =>
      "Please select your preferred high-fidelity image from the gallery to serve as the official blog header. This choice will ensure a professional and cohesive visual identity for your published content.",
    []
  );

  const addToGalleryFromFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const mapped = list.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      src: URL.createObjectURL(f),
      file: f,
    }));

    setImages((prev) => [...mapped, ...prev]);
  };

  const handleUploadFromDevice = (files) => addToGalleryFromFiles(files);

  const handleUploadReference = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const mapped = list.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      src: URL.createObjectURL(f),
      file: f,
    }));

    setRefImages(mapped);
  };

  // fake progress animation for "Generating..."
  useEffect(() => {
    if (stage !== "generating") return;

    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.floor(Math.random() * 7) + 3);
        return next;
      });
    }, 250);

    return () => clearInterval(t);
  }, [stage]);

  // when progress hits 100, move to done and set demo images
  useEffect(() => {
    if (stage !== "generating") return;
    if (progress < 100) return;

    const timeout = setTimeout(() => {
      setGeneratedImages([
        // demo results (replace with API outputs)
        "https://picsum.photos/seed/bad/360/520",
        "https://picsum.photos/seed/good/360/520",
      ]);
      setStage("done");
    }, 400);

    return () => clearTimeout(timeout);
  }, [stage, progress]);

  const handleGenerate = async () => {
    // call your API here, then update progress via events OR keep fake progress like now
    setStage("generating");
  };

  const handleGenerateAnother = () => {
    setGeneratedImages([]);
    setStage("form");
    setProgress(0);
  };

  const handleDoneSave = () => {
    // save generated images to gallery
    const mapped = (generatedImages || []).map((src) => ({
      id: `gen-${Date.now()}-${Math.random()}`,
      src,
    }));
    setImages((prev) => [...mapped, ...prev]);

    // close + reset modal
    setNanoOpen(false);
    setStage("form");
    setProgress(0);
    setGeneratedImages([]);
    setRefImages([]);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <HeaderBottomBar title="Content Management System" />

          <div className="px-10 pt-6 pb-28">
            <BackToDashBoardButton />

            <div className="mt-3">
              <IncreasingDotsInterface />
            </div>

            <p className="mt-6 text-center text-[12px] leading-[18px] text-[#111827] font-medium">
              {helperText}
            </p>

            <div className="mt-8">
              <GalleryCard
                title="Gallery"
                images={images.map((x) => x.src)}
                onUpload={(files) => handleUploadFromDevice(files)}
                onGenerate={() => {
                  setNanoOpen(true);
                  setStage("form");
                }}
              />
            </div>
          </div>

          {/* ✅ Improved bottom header bar */}
          <div className="fixed left-0 right-0 bottom-0 z-40">
            {/* subtle blur + border */}
            <div className="bg-white/80 backdrop-blur-md border-t border-[#E5E7EB]">
              <div className="max-w-[1200px] mx-auto px-10 py-3 flex items-center justify-between">
                {/* left status */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hasImages ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="text-[12px] text-[#111827]">
                    <span className="font-semibold">
                      {hasImages ? "Cover selected" : "Cover required"}
                    </span>
                    <span className="text-[#6B7280]">
                      {" "}
                      • {images.length} image{images.length === 1 ? "" : "s"} in
                      gallery
                    </span>
                  </div>
                </div>

                {/* right actions */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <PreviousButton />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNanoOpen(true);
                      setStage("form");
                    }}
                    className="h-[36px] px-4 rounded-[10px] border border-[#E5E7EB] bg-white text-[#111827] text-[12px] font-semibold hover:bg-[#F9FAFB] active:scale-[0.99]"
                  >
                    Generate with Nano Banana
                  </button>

                  <NextButton disabled={!hasImages} />
                </div>
              </div>

              {/* small helper row for mobile */}
              <div className="sm:hidden px-10 pb-3 flex items-center justify-between">
                <PreviousButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NanoBananaImageCard
        open={nanoOpen}
        onClose={() => {
          setNanoOpen(false);
          setStage("form");
          setProgress(0);
          setGeneratedImages([]);
          setRefImages([]);
        }}
        stage={stage}
        progress={progress}
        generatedImages={generatedImages}
        onGenerateAnother={handleGenerateAnother}
        onDoneSave={handleDoneSave}
        referenceImages={refImages.map((x) => x.src)}
        onRemoveReference={() => setRefImages([])}
        prompt={prompt}
        onPromptChange={setPrompt}
        aspect={aspect}
        onAspectChange={setAspect}
        quality={quality}
        onQualityChange={setQuality}
        primaryColor={primaryColor}
        onPrimaryColorChange={setPrimaryColor}
        onUploadReference={handleUploadReference}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
