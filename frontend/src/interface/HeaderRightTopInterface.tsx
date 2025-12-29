// HeaderRightTop.tsx
import { useState } from "react";

export default function HeaderRightTopInterface() {
  const tabs = ["Dashboard", "Playbook", "Agent", "Help"];

  // default active tab
  const [activeTab, setActiveTab] = useState("Agent");

  return (
    <div className="w-full flex justify-center py-4">
      {/* Outer box */}
      <div
        className="
          w-[299px] h-[40px]
          rounded-[4px]
          -mr-8
          flex items-center justify-between
          px-2
        "
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center justify-center
                w-[89px] h-[24px]
                rounded-[5px]
                px-[10px] py-[3px]
                text-[14px] leading-[18px]
                cursor-pointer
                ${
                  isActive
                    ? "bg-[#d5daf2] text-[#4443E4]"
                    : "bg-transparent text-[#2F3542]"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
