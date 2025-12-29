// src/interface/GeneratorCard.jsx
import Radio from "../assets/radio.svg";
import EmptyRadio from "../assets/empty-radio.svg";
import HeaderIcon from "../assets/detail-icon.svg"; // ✅ same icon for all cards

export default function GeneratorCard({
  headerTitle = "Generate a post title or write your own",

  // radio section
  options = [
    { key: "ai", label: "Generate Title with AI" },
    { key: "manual", label: "Write Manually" },
  ],
  selectedKey = "ai",
  onSelect,

  // center section (the big text + small text + button)
  centerTitle = "Generate Blog Title with AI",
  centerSubtitle = "Click on this button to generate title for your blog",
  buttonText = "Generate Blog Titles",
  onButtonClick,
  buttonDisabled = false,

  // optional: render custom content (ex: generated list)
  children,
}) {
  return (
    <section className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-[26px] pt-[18px] pb-[18px]">
      {/* Header */}
      <div className="flex items-center gap-[10px]">
        {/* ✅ fixed header icon */}
        <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center">
          <img src={HeaderIcon} alt="" className="w-[22px] h-[22px]" />
        </div>

        <h2 className="text-[16px] leading-[20px] font-semibold text-[#111827]">
          {headerTitle}
        </h2>
      </div>

      {/* Radio row */}
      <div className="mt-[14px] flex items-center gap-[44px]">
        {options.map((opt) => {
          const active = opt.key === selectedKey;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect?.(opt.key)}
              className="flex items-center gap-[10px]"
            >
              <img
                src={active ? Radio : EmptyRadio}
                alt=""
                className="w-[22px] h-[22px]"
              />

              <span className="text-[14px] text-[#111827]">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="mt-[18px]">
        {children ? (
          children
        ) : (
          <div className="min-h-[150px] flex flex-col items-center justify-center text-center">
            <div className="text-[20px] font-semibold text-[#111827]">
              {centerTitle}
            </div>

            <div className="mt-[6px] text-[12px] text-[#6B7280]">
              {centerSubtitle}
            </div>

            <button
              type="button"
              disabled={buttonDisabled}
              onClick={onButtonClick}
              className={[
                "mt-[18px]",
                "h-[44px]",
                "px-[34px]",
                "rounded-full",
                "text-[14px]",
                "font-semibold",
                buttonDisabled
                  ? "bg-[#4443E4]/60 text-white cursor-not-allowed"
                  : "bg-[#4443E4] text-white hover:opacity-95",
              ].join(" ")}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
