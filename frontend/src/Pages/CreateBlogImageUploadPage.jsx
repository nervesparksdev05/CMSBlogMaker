import { useMemo, useState, useEffect, useRef } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import GalleryCard from "../interface/GalleryCard";
import NanoBananaImageCard from "../interface/NanoBananaImageCard";
import PreviousButton from "../buttons/PreviousButton";
import NextButton from "../buttons/NextButton";
import { apiPost, apiUpload } from "../lib/api.js";
import { loadDraft, saveDraft } from "../lib/storage.js";

const aspectMap = {
  square: "1:1",
  landscape: "4:3",
  portrait: "3:4",
};

const qualityMap = {
  standard: "medium",
  high: "high",
};

export default function CreateBlogImageUploadPage() {
  const draft = loadDraft();
  const [nanoOpen, setNanoOpen] = useState(false);

  const [images, setImages] = useState([]);
  const [selectedCover, setSelectedCover] = useState(draft.cover_image_url || "");

  const [prompt, setPrompt] = useState(draft.image_prompt || "");
  const [aspect, setAspect] = useState("square");
  const [quality, setQuality] = useState("standard");
  const [primaryColor, setPrimaryColor] = useState("#F4B02A");

  const [refImages, setRefImages] = useState([]);
  const [stage, setStage] = useState("form");
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState("");
  const progressTimer = useRef(null);

  const helperText = useMemo(
    () =>
      "Please select your preferred high-fidelity image from the gallery to serve as the official blog header. This choice will ensure a professional and cohesive visual identity for your published content.",
    []
  );

  useEffect(() => {
    if (draft.cover_image_url) {
      setImages([{ id: `saved-${draft.cover_image_url}`, src: draft.cover_image_url }]);
    }
  }, []);

  useEffect(() => {
    saveDraft({ cover_image_url: selectedCover, image_prompt: prompt });
  }, [selectedCover, prompt]);

  const handleUploadFromDevice = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setError("");

    try {
      const uploaded = [];
      for (const file of list) {
        const res = await apiUpload("/blogs/uploads/images", file);
        if (res?.image_url) {
          uploaded.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            src: res.image_url,
          });
        }
      }

      if (uploaded.length) {
        setImages((prev) => [...uploaded, ...prev]);
        setSelectedCover(uploaded[0].src);
      }
    } catch (err) {
      setError(err?.message || "Failed to upload image.");
    }
  };

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

  const handleDeleteImage = (src) => {
    setImages((prev) => {
      const next = prev.filter((x) => x.src !== src);
      if (selectedCover === src) {
        setSelectedCover(next[0]?.src || "");
      }
      return next;
    });
  };

  useEffect(() => {
    if (!images.length) {
      setSelectedCover("");
      return;
    }
    const srcs = new Set(images.map((x) => x.src));
    if (!selectedCover || !srcs.has(selectedCover)) {
      setSelectedCover(images[0].src);
    }
  }, [images, selectedCover]);

  useEffect(() => {
    if (stage !== "generating") return;
    setProgress(0);

    progressTimer.current = setInterval(() => {
      setProgress((p) => Math.min(98, p + Math.floor(Math.random() * 7) + 3));
    }, 250);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [stage]);

  const handleGenerate = async () => {
    const payload = {
      tone: draft.tone || "Formal",
      creativity: draft.creativity || "Regular",
      focus_or_niche: draft.focus_or_niche || draft.selected_idea || "",
      targeted_keyword: draft.targeted_keyword || "",
      selected_idea: draft.selected_idea || draft.focus_or_niche || "",
      title: draft.title || "",
      prompt,
      aspect_ratio: aspectMap[aspect] || "4:3",
      quality: qualityMap[quality] || "medium",
      primary_color: primaryColor,
      source: "blog",
    };

    if (!payload.title || !payload.selected_idea || !payload.prompt) {
      setError("Please complete details, title, and image prompt first.");
      return;
    }

    try {
      setError("");
      setStage("generating");
      const data = await apiPost("/ai/image-generate", payload);
      const url = data?.image_url;
      if (!url) throw new Error("Image generation failed.");

      setGeneratedImages([url]);
      setProgress(100);
      setStage("done");
    } catch (err) {
      setStage("form");
      setProgress(0);
      setError(err?.message || "Failed to generate image.");
    } finally {
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedImages([]);
    setStage("form");
    setProgress(0);
  };

  const handleDoneSave = () => {
    const mapped = (generatedImages || []).map((src) => ({
      id: `gen-${Date.now()}-${Math.random()}`,
      src,
    }));

    if (mapped.length) {
      setImages((prev) => [...mapped, ...prev]);
      setSelectedCover(mapped[0].src);
    }

    setNanoOpen(false);
    setStage("form");
    setProgress(0);
    setGeneratedImages([]);
    setRefImages([]);
  };

  const canProceed = Boolean(selectedCover);

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-10 pt-6 pb-10">
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
                selectedSrc={selectedCover}
                onSelect={setSelectedCover}
                onDelete={handleDeleteImage}
                onUpload={(files) => handleUploadFromDevice(files)}
                onGenerate={() => {
                  setNanoOpen(true);
                  setStage("form");
                }}
              />
            </div>

            {error ? (
              <div className="mt-3 text-center text-[12px] text-[#DC2626]">
                {error}
              </div>
            ) : null}

            <div className="mt-3 flex items-center">
              <PreviousButton />
              <div className="ml-auto">
                <NextButton disabled={!canProceed} />
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
        error={error}
      />
    </div>
  );
}
