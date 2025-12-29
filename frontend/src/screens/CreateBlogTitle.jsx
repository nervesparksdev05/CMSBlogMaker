// src/screen/CreateBlogTitle.jsx
import { useMemo, useState } from "react";

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

export default function CreateBlogTitle() {
  const [mode, setMode] = useState("ai"); // "ai" | "manual"

  // AI list state
  const [aiTitles, setAiTitles] = useState([]); // [] => empty state, otherwise list view
  const [selectedAiIndex, setSelectedAiIndex] = useState(0);

  // Manual state
  const [manualTitle, setManualTitle] = useState("");

  const selectedTitle = useMemo(() => {
    if (mode === "manual") return manualTitle;
    return aiTitles[selectedAiIndex] || "";
  }, [mode, manualTitle, aiTitles, selectedAiIndex]);

  const handleGenerate = () => {
    // replace with your API call
    const demo = [
      "The AI Revolution: Transforming Society as We Know It",
      "AI for Beginners: A Practical Guide to Getting Started",
      "How Generative AI Is Changing Content Creation",
      "Top 10 AI Tools Every Creator Should Try in 2025",
      "Future of Work: Will AI Replace Humans?",
    ];
    setAiTitles(demo);
    setSelectedAiIndex(0);
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

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />

      {/* top title bar */}
      <HeaderBottomBar title="Content Management System" />

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
              // these are used only when children is NOT passed (AI empty state)
              centerTitle="Generate Blog Title with AI"
              centerSubtitle="Click on this button to generate title for your blog"
              buttonText="Generate Blog Titles"
              onButtonClick={handleGenerate}
            >
              {/* ✅ This is what makes it “change” like your 3 screenshots */}
              {mode === "ai" ? (aiTitles.length ? AiList : null) : ManualBox}
            </GeneratorCard>
          </div>

          {/* bottom buttons like screenshot */}
          <div className="mt-3 flex items-center justify-between">
            <PreviousButton />
            <NextButton />
          </div>

          {/* debug: selected title */}
          {/* <pre className="mt-4 text-xs">{selectedTitle}</pre> */}
        </div>
      </div>
    </div>
  );
}
