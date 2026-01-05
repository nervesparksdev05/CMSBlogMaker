import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function CreateBlogTitlePage() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [mode, setMode] = useState(draft.title_mode || "ai");
  const [aiTitles, setAiTitles] = useState([]);
  const [selectedAiIndex, setSelectedAiIndex] = useState(0);
  const [manualTitle, setManualTitle] = useState(draft.title || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTitle = useMemo(() => {
    if (mode === "manual") return manualTitle;
    return aiTitles[selectedAiIndex] || "";
  }, [mode, manualTitle, aiTitles, selectedAiIndex]);

  useEffect(() => {
    saveDraft({ title: selectedTitle, title_mode: mode });
  }, [selectedTitle, mode]);

  const handleGenerate = async () => {
    const payload = {
      tone: draft.tone || "Formal",
      creativity: draft.creativity || "Regular",
      focus_or_niche: draft.focus_or_niche || draft.selected_idea || "",
      targeted_keyword: draft.targeted_keyword || "",
      targeted_audience: draft.targeted_audience || "",
      reference_links: draft.reference_links || "",
      selected_idea: draft.selected_idea || draft.focus_or_niche || "",
    };

    if (!payload.selected_idea) {
      setError("Please complete blog details first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await apiPost("/ai/titles", payload);
      setAiTitles(data?.options || []);
      setSelectedAiIndex(0);
    } catch (err) {
      setError(err?.message || "Failed to generate titles.");
    } finally {
      setLoading(false);
    }
  };

  const AiList = (
    <div className="mt-4 border border-[#D1D5DB] rounded-[8px] bg-white ">
      <div className="max-h-[180px] overflow-auto p-3 space-y-2">
        {aiTitles.map((t, idx) => {
          const active = idx === selectedAiIndex;
          return (
            <button
              key={`${t}-${idx}`}
              type="button"
              onClick={() => setSelectedAiIndex(idx)}
              className="
                w-full
                flex items-center gap-3
                px-3 py-2
                rounded-[6px]
                border border-[#D1D5DB]
                hover:bg-[#F9FAFB]
                text-left
              "
            >
              <img
                src={active ? Radio : EmptyRadio}
                alt=""
                className="w-[18px] h-[18px]"
              />
              <span className="text-[13px] text-[#111827]">{t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ManualBox = (
    <div className="mt-4">
      <div className="text-[12px] font-medium text-[#111827] mb-2">
        Write title of Blog
      </div>
      <textarea
        value={manualTitle}
        onChange={(e) => setManualTitle(e.target.value)}
        placeholder="Write title of blog..."
        className="
          w-full
          h-[140px]
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

  const canNext = selectedTitle.trim().length > 0;

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
            Generate or write a title for your blog post. The description you previously
            filled and the title you choose will have an influence on the generated
            content.
          </div>

          <div className="mt-3">
            <GeneratorCard
              headerTitle="Generate a post title or write your own"
              options={[
                { key: "ai", label: "Generate Title with AI" },
                { key: "manual", label: "Write Manually" },
              ]}
              selectedKey={mode}
              onSelect={(k) => setMode(k)}
              centerTitle="Generate Blog Title with AI"
              centerSubtitle="Click on this button to generate title for your blog"
              buttonText={loading ? "Generating..." : "Generate Blog Titles"}
              onButtonClick={handleGenerate}
              buttonDisabled={loading}
            >
              {mode === "ai" ? (aiTitles.length ? AiList : null) : ManualBox}
            </GeneratorCard>
          </div>

          {error ? (
            <div className="mt-3 text-[12px] text-[#DC2626] text-center">{error}</div>
          ) : null}

          <div className="mt-3 flex items-center gap-3">
            <PreviousButton />
            <div className="ml-auto flex items-center gap-3">
              <NextButton disabled={!canNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
