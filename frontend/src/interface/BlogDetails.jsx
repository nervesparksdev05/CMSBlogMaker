// src/pages/BlogDetails.jsx
import { useState } from "react";
import BlogTopicIdeaGeneratorModal from "../interface/BlogTopicIdeaGeneratorModal";
import AiIcon from "../assets/bot-icon.svg";
import DetailIcon from "../assets/detail-icon.svg";

export default function BlogDetails() {
  const [openIdeas, setOpenIdeas] = useState(false);

  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Formal");
  const [creativity, setCreativity] = useState("Regular");

  const [about, setAbout] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [reference, setReference] = useState("");

  return (
    <div className="p-[18px]">
      <div className="bg-white border border-[#E5E7EB] rounded-[10px]">
        {/* Header */}
        <div className="px-[22px] pt-[16px]">
          <div className="flex items-center gap-[10px]">
            {/* ✅ Detail icon */}
            <div className="w-[24px] h-[24px] shrink-0">
              <img
                src={DetailIcon}
                alt="Details"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[16px] font-semibold text-[#111827]">
              Details of Blog
            </div>
          </div>
        </div>

        <div className="px-[22px] pb-[22px] pt-[14px]">
          {/* Top Row */}
          <div className="grid grid-cols-3 gap-[24px]">
            <FieldSelect
              label="Language"
              required
              value={language}
              onChange={setLanguage}
              options={["English", "Hindi", "Spanish"]}
            />
            <FieldSelect
              label="Tone of Blog"
              required
              value={tone}
              onChange={setTone}
              options={["Formal", "Casual", "Friendly"]}
            />
            <FieldSelect
              label="Creativity"
              required
              value={creativity}
              onChange={setCreativity}
              options={["Regular", "High", "Low"]}
            />
          </div>

          {/* About + AI link */}
          <div className="mt-[22px]">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#111827]">
                What do you want to write about?{" "}
                <span className="text-red-500">*</span>
              </label>

              {/* ✅ AI icon in button */}
              <button
                type="button"
                onClick={() => setOpenIdeas(true)}
                className="flex items-center gap-[8px] text-[#4443E4] text-[13px] font-medium hover:underline"
              >
                <img
                  src={AiIcon}
                  alt=""
                  className="w-[18px] h-[18px] object-contain"
                />
                Suggest Blog Topics ideas by AI
              </button>
            </div>

            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe about blog..."
              className="
                mt-[10px]
                w-full h-[78px]
                bg-[#F3F4F6]
                border border-[#E5E7EB]
                rounded-[8px]
                px-[14px] py-[12px]
                text-[13px]
                placeholder:text-[#9CA3AF]
                outline-none resize-none
              "
            />
          </div>

          {/* Targeted Keyword */}
          <div className="mt-[18px]">
            <FieldInput
              label="Targeted Keyword (optional)"
              value={keyword}
              onChange={setKeyword}
              placeholder="e.g. AI Technology"
            />
          </div>

          {/* Targeted Audience */}
          <div className="mt-[18px]">
            <FieldInput
              label="Targeted Audience (optional)"
              value={audience}
              onChange={setAudience}
              placeholder="e.g. Researchers"
            />
          </div>

          {/* Reference links */}
          <div className="mt-[18px]">
            <FieldInput
              label="Add Reference links (optional)"
              value={reference}
              onChange={setReference}
              placeholder="e.g. www.example.com"
            />
          </div>
        </div>
      </div>

      {/* ✅ Modal */}
      <BlogTopicIdeaGeneratorModal
        open={openIdeas}
        onClose={() => setOpenIdeas(false)}
        onDone={(pickedIdea) => setAbout(pickedIdea)}
      />
    </div>
  );
}

function FieldSelect({ label, required, value, onChange, options }) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-[#111827]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      <div className="relative mt-[8px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full h-[40px]
            bg-[#F3F4F6]
            border border-[#E5E7EB]
            rounded-[8px]
            pl-[12px] pr-[40px]
            text-[13px]
            outline-none appearance-none
          "
        >
          {options.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9L12 15L18 9"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-[#111827]">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          mt-[8px]
          w-full h-[44px]
          bg-[#F3F4F6]
          border border-[#E5E7EB]
          rounded-[8px]
          px-[14px]
          text-[13px]
          placeholder:text-[#9CA3AF]
          outline-none
        "
      />
    </div>
  );
}
