import { useEffect, useMemo, useState } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import GeneratorCard from "../interface/GeneratorCard";
import PreviousButton from "../buttons/PreviousButton";
import NextButton from "../buttons/NextButton";

import Radio from "../assets/radio.svg";
import EmptyRadio from "../assets/empty-radio.svg";
import { apiPost } from "../lib/api.js";
import { loadDraft, saveDraft } from "../lib/storage.js";

export default function CreateBlogIntroParagraphPage() {
  const draft = loadDraft();
  const initialMode = draft.intro_mode || "ai";
  const initialAiIntros =
    Array.isArray(draft.intro_options) && draft.intro_options.length
      ? draft.intro_options
      : initialMode === "ai" && draft.intro_md
        ? [draft.intro_md]
        : [];
  const initialSelectedIndex = (() => {
    if (
      typeof draft.intro_selected_idx === "number" &&
      initialAiIntros[draft.intro_selected_idx]
    ) {
      return draft.intro_selected_idx;
    }
    if (draft.intro_md) {
      const idx = initialAiIntros.indexOf(draft.intro_md);
      if (idx >= 0) return idx;
    }
    return 0;
  })();

  const [mode, setMode] = useState(initialMode);
  const [aiIntros, setAiIntros] = useState(initialAiIntros);
  const [selectedAiIndex, setSelectedAiIndex] = useState(initialSelectedIndex);
  const [manualIntro, setManualIntro] = useState(draft.intro_md || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedIntro = useMemo(() => {
    if (mode === "manual") return manualIntro;
    return aiIntros[selectedAiIndex] || "";
  }, [mode, manualIntro, aiIntros, selectedAiIndex]);

  useEffect(() => {
    saveDraft({ intro_md: selectedIntro, intro_mode: mode });
  }, [selectedIntro, mode]);

  useEffect(() => {
    if (!aiIntros.length) return;
    saveDraft({ intro_options: aiIntros, intro_selected_idx: selectedAiIndex });
  }, [aiIntros, selectedAiIndex]);

  const handleGenerate = async () => {
    const payload = {
      tone: draft.tone || "Formal",
      creativity: draft.creativity || "Regular",
      focus_or_niche: draft.focus_or_niche || draft.selected_idea || "",
      targeted_keyword: draft.targeted_keyword || "",
      targeted_audience: draft.targeted_audience || "",
      reference_links: draft.reference_links || "",
      selected_idea: draft.selected_idea || draft.focus_or_niche || "",
      title: draft.title || "",
    };

    if (!payload.selected_idea || !payload.title) {
      setError("Please complete blog details and title first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await apiPost("/ai/intros", payload);
      setAiIntros(data?.options || []);
      setSelectedAiIndex(0);
    } catch (err) {
      setError(err?.message || "Failed to generate introductions.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAiIntro = (value) => {
    setAiIntros((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      next[selectedAiIndex] = value;
      return next;
    });
  };

  const AiList = (
    <div className="mt-4 border border-[#D1D5DB] rounded-[8px] bg-white">
      <div className="max-h-[210px] overflow-auto p-3 space-y-2">
        {aiIntros.map((t, idx) => {
          const active = idx === selectedAiIndex;
          return (
            <button
              key={`${idx}`}
              type="button"
              onClick={() => setSelectedAiIndex(idx)}
              className="
                w-full
                flex items-start gap-3
                px-3 py-3
                rounded-[6px]
                border border-[#D1D5DB]
                hover:bg-[#F9FAFB]
                text-left
              "
            >
              <img
                src={active ? Radio : EmptyRadio}
                alt=""
                className="w-[18px] h-[18px] mt-[2px]"
              />
              <span className="text-[13px] leading-[18px] text-[#111827]">
                {t}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const AiContent = aiIntros.length ? (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-medium text-[#111827]">
          AI suggestions
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className={[
            "h-[34px] px-4 rounded-full text-[12px] font-medium",
            loading
              ? "bg-[#4443E4]/60 text-white cursor-not-allowed"
              : "bg-[#4443E4] text-white hover:opacity-95",
          ].join(" ")}
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      {AiList}

      <div className="mt-4">
        <div className="text-[12px] font-medium text-[#111827] mb-2">
          Edit selected introduction
        </div>
        <textarea
          value={aiIntros[selectedAiIndex] || ""}
          onChange={(e) => handleEditAiIntro(e.target.value)}
          placeholder="Edit selected introduction..."
          className="
            w-full
            h-[170px]
            rounded-[8px]
            border border-[#E5E7EB]
            bg-[#F3F4F6]
            px-4 py-3
            text-[13px]
            text-[#111827]
            placeholder:text-[#9CA3AF]
            outline-none
            resize-none
          "
        />
      </div>
    </div>
  ) : null;

  const ManualBox = (
    <div className="mt-4">
      <div className="text-[12px] font-medium text-[#111827] mb-2">
        Write Introduction of Blog
      </div>
      <textarea
        value={manualIntro}
        onChange={(e) => setManualIntro(e.target.value)}
        placeholder="Write introduction of blog..."
        className="
          w-full
          h-[170px]
          rounded-[8px]
          border border-[#E5E7EB]
          bg-[#F3F4F6]
          px-4 py-3
          text-[13px]
          text-[#111827]
          placeholder:text-[#9CA3AF]
          outline-none
          resize-none
        "
      />
    </div>
  );

  const canNext = selectedIntro.trim().length > 0;

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />
      <HeaderBottomBar title="Content Management System" showNewBlogButton={false} />

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1 px-10 py-6">
          <div className="mb-4">
            <BackToDashBoardButton />
          </div>

          <IncreasingDotsInterface />

          <div className="mt-4 text-center text-[11px] text-[#111827] font-medium">
            Let&apos;s now write your blog introduction which will be the beginning of an
            amazing blog post. You will be able to edit it afterwards.
          </div>

          <div className="mt-3">
            <GeneratorCard
              headerTitle="Generate an intro paragraph or write your own"
              options={[
                { key: "ai", label: "Generate Title with AI" },
                { key: "manual", label: "Write Manually" },
              ]}
              selectedKey={mode}
              onSelect={(k) => {
                setMode(k);
                if (k === "manual" && !manualIntro.trim() && selectedIntro.trim()) {
                  setManualIntro(selectedIntro);
                }
              }}
              centerTitle="Generate Blog Intro with AI"
              centerSubtitle="Click on this button to generate intro for your blog"
              buttonText={loading ? "Generating..." : "Generate Blog Intro"}
              onButtonClick={handleGenerate}
              buttonDisabled={loading}
            >
              {mode === "ai" ? AiContent : ManualBox}
            </GeneratorCard>
          </div>

          {error ? (
            <div className="mt-3 text-[12px] text-[#DC2626] text-center">{error}</div>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <PreviousButton />
            <NextButton disabled={!canNext} />
          </div>
        </div>
      </div>
    </div>
  );
}
