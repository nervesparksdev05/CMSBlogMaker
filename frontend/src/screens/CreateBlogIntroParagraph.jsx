// src/screen/CreateBlogIntroParagraph.jsx
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

export default function CreateBlogIntroParagraph() {
  const [mode, setMode] = useState("ai"); // "ai" | "manual"

  // AI state: empty => show button, after generate => show selectable list
  const [aiIntros, setAiIntros] = useState([]);
  const [selectedAiIndex, setSelectedAiIndex] = useState(0);

  // Manual state
  const [manualIntro, setManualIntro] = useState("");

  const selectedIntro = useMemo(() => {
    if (mode === "manual") return manualIntro;
    return aiIntros[selectedAiIndex] || "";
  }, [mode, manualIntro, aiIntros, selectedAiIndex]);

  const handleGenerate = () => {
    // replace with your API call
    const demo = [
      "Artificial Intelligence is reshaping how we live and work—powering tools that learn from data, automate routine tasks, and unlock new creative possibilities. From personalized recommendations to smarter healthcare, AI is already influencing everyday decisions in subtle but powerful ways.",
      "In the last decade, AI has moved from research labs into real products, changing industries at a rapid pace. As models become more capable, organizations and individuals are discovering new ways to use AI for productivity, creativity, and innovation—while also navigating new ethical questions.",
      "Whether you're a student, a professional, or simply curious, understanding AI today is becoming essential. In this blog, we’ll explore what AI is, where it’s being used, and how its evolution may shape the future of society, careers, and technology.",
    ];
    setAiIntros(demo);
    setSelectedAiIndex(0);
  };

  const AiList = (
    <div className="mt-4 border border-[#D1D5DB] rounded-[8px] bg-white ">
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

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />
      <HeaderBottomBar title="Content Management System" />

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1 px-10 py-6">
          <div className="mb-4">
            <BackToDashBoardButton />
          </div>

          <IncreasingDotsInterface />

          {/* helper text (like screenshot) */}
          <div className="mt-4 text-center text-[11px] text-[#111827] font-medium">
            Let&apos;s now write your blog introduction which will be the beginning of an
            amazing blog post. You will be able to edit it afterwards.
          </div>

          <div className="mt-3">
            <GeneratorCard
              headerTitle="Generate an intro paragraph or write your own"
              options={[
                { key: "ai", label: "Generate Title with AI" }, // keep label as your screenshot
                { key: "manual", label: "Write Manually" },
              ]}
              selectedKey={mode}
              onSelect={setMode}
              centerTitle="Generate Blog Intro with AI"
              centerSubtitle="Click on this button to generate intro for your blog"
              buttonText="Generate Blog Intro"
              onButtonClick={handleGenerate}
            >
              {/* same behavior as previous page */}
              {mode === "ai" ? (aiIntros.length ? AiList : null) : ManualBox}
            </GeneratorCard>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <PreviousButton />
            <NextButton />
          </div>

          {/* debug */}
          {/* <pre className="mt-4 text-xs">{selectedIntro}</pre> */}
        </div>
      </div>
    </div>
  );
}
