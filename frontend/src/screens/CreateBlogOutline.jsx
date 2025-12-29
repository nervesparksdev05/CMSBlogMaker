// src/screen/CreateBlogOutline.jsx
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function CreateBlogOutline() {
  const [mode, setMode] = useState("ai"); // "ai" | "manual"

  // AI state
  const [aiOutlines, setAiOutlines] = useState([]);
  const [selectedAiIndex, setSelectedAiIndex] = useState(0);

  // Manual state (multi-line)
  const [manualOutline, setManualOutline] = useState("");

  const selectedOutline = useMemo(() => {
    if (mode === "manual") return manualOutline;
    return aiOutlines[selectedAiIndex] || "";
  }, [mode, manualOutline, aiOutlines, selectedAiIndex]);

  const handleGenerate = () => {
    // replace with your API call
    const demo = [
      "• Introduction\n• What is AI?\n• How AI Works (Data + Models)\n• Real-world Applications\n• Benefits and Risks\n• Ethical Considerations\n• Future of AI\n• Conclusion",
      "• Hook + Context\n• History of AI (brief)\n• Core Concepts (ML, DL)\n• Use Cases by Industry\n• Challenges (bias, privacy)\n• Practical Tips to Get Started\n• Summary + CTA",
      "• Opening Story\n• Definitions + Key Terms\n• Why AI Matters Today\n• AI in Everyday Life\n• AI in Business\n• Common Misconceptions\n• What’s Next\n• Wrap-up",
    ];
    setAiOutlines(demo);
    setSelectedAiIndex(0);
  };

  const AiList = (
    <div className="mt-4 border border-[#D1D5DB] rounded-[8px] bg-white ">
      <div className="max-h-[210px] overflow-auto p-3 space-y-2">
        {aiOutlines.map((t, idx) => {
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

          <div className="mt-4 text-center text-[11px] text-[#111827] font-medium">
            Write your blog outline which will be the structure of your article. You will be able to edit it afterwards.
          </div>

          <div className="mt-3">
            <GeneratorCard
              headerTitle="Generate an outline (subheadings) for your post"
              options={[
                { key: "ai", label: "Generate Title with AI" }, // keep label like screenshot
                { key: "manual", label: "Write Manually" },
              ]}
              selectedKey={mode}
              onSelect={setMode}
              centerTitle="Generate Blog Outline with AI"
              centerSubtitle="Click on this button to generate outline for your blog"
              buttonText="Generate Blog outline"
              onButtonClick={handleGenerate}
            >
              {mode === "ai" ? (aiOutlines.length ? AiList : null) : ManualBox}
            </GeneratorCard>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <PreviousButton />
            <NextButton />
          </div>

          {/* debug */}
          {/* <pre className="mt-4 text-xs whitespace-pre-wrap">{selectedOutline}</pre> */}
        </div>
      </div>
    </div>
  );
}
