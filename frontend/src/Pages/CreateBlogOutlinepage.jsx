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

function parseOutline(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
    .filter(Boolean);
}

export default function CreateBlogOutlinePage() {
  const draft = loadDraft();
  const initialMode = draft.outline_mode || "ai";
  const initialAiOutlines =
    Array.isArray(draft.outline_options) && draft.outline_options.length
      ? draft.outline_options
      : initialMode === "ai" && Array.isArray(draft.outline) && draft.outline.length
        ? [draft.outline]
        : [];
  const outlineKey = (value) => JSON.stringify(value || []);
  const initialSelectedIndex = (() => {
    if (
      typeof draft.outline_selected_idx === "number" &&
      initialAiOutlines[draft.outline_selected_idx]
    ) {
      return draft.outline_selected_idx;
    }
    if (Array.isArray(draft.outline) && draft.outline.length) {
      const idx = initialAiOutlines.findIndex(
        (item) => outlineKey(item) === outlineKey(draft.outline)
      );
      if (idx >= 0) return idx;
    }
    return 0;
  })();

  const [mode, setMode] = useState(initialMode);
  const [aiOutlines, setAiOutlines] = useState(initialAiOutlines);
  const [selectedAiIndex, setSelectedAiIndex] = useState(initialSelectedIndex);
  const [manualOutline, setManualOutline] = useState(
    Array.isArray(draft.outline) ? draft.outline.join("\n") : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedOutline = useMemo(() => {
    if (mode === "manual") return parseOutline(manualOutline);
    return aiOutlines[selectedAiIndex] || [];
  }, [mode, manualOutline, aiOutlines, selectedAiIndex]);

  useEffect(() => {
    saveDraft({ outline: selectedOutline, outline_mode: mode });
  }, [selectedOutline, mode]);

  useEffect(() => {
    if (!aiOutlines.length) return;
    saveDraft({ outline_options: aiOutlines, outline_selected_idx: selectedAiIndex });
  }, [aiOutlines, selectedAiIndex]);

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
      intro_md: draft.intro_md || "",
    };

    if (!payload.selected_idea || !payload.title || !payload.intro_md) {
      setError("Please complete blog details, title, and intro first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await apiPost("/ai/outlines", payload);
      const options = (data?.options || []).map((o) => o.outline || []);
      setAiOutlines(options);
      setSelectedAiIndex(0);
    } catch (err) {
      setError(err?.message || "Failed to generate outlines.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAiOutline = (value) => {
    const parsed = parseOutline(value);
    setAiOutlines((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      next[selectedAiIndex] = parsed;
      return next;
    });
  };

  const AiList = (
    <div className="mt-4 border border-[#D1D5DB] rounded-[8px] bg-white">
      <div className="max-h-[210px] overflow-auto p-3 space-y-2">
        {aiOutlines.map((outline, idx) => {
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
              <span className="text-[13px] leading-[18px] text-[#111827] whitespace-pre-line">
                {(outline || []).join("\n")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const AiContent = aiOutlines.length ? (
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
          Edit selected outline
        </div>
        <textarea
          value={(aiOutlines[selectedAiIndex] || []).join("\n")}
          onChange={(e) => handleEditAiOutline(e.target.value)}
          placeholder="Edit selected outline..."
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
        Write outline of Blog
      </div>
      <textarea
        value={manualOutline}
        onChange={(e) => setManualOutline(e.target.value)}
        placeholder="Write outline of blog..."
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

  const canNext = selectedOutline.length > 0;

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
            Write your blog outline which will be the structure of your article. You will be able to edit it afterwards.
          </div>

          <div className="mt-3">
            <GeneratorCard
              headerTitle="Generate an outline (subheadings) for your post"
              options={[
                { key: "ai", label: "Generate Title with AI" },
                { key: "manual", label: "Write Manually" },
              ]}
              selectedKey={mode}
              onSelect={(k) => {
                setMode(k);
                if (k === "manual" && !manualOutline.trim() && selectedOutline.length) {
                  setManualOutline(selectedOutline.join("\n"));
                }
              }}
              centerTitle="Generate Blog Outline with AI"
              centerSubtitle="Click on this button to generate outline for your blog"
              buttonText={loading ? "Generating..." : "Generate Blog outline"}
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
