// src/interface/BlogTopicIdeaGeneratorModal.jsx
import { useEffect, useMemo, useState } from "react";

export default function BlogTopicIdeaGeneratorModal({
  open = false,
  onClose,
  // optional: plug your API here
  // should return: ["idea 1", "idea 2", ...]
  onGenerateIdeas,
  // called when user clicks Done
  onDone,
}) {
  const [focus, setFocus] = useState("");
  const [count, setCount] = useState(""); // "3" | "5" | "10"
  const [ideas, setIdeas] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasIdeas = ideas.length > 0;

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setIdeas([]);
    setSelectedIdx(0);
    setLoading(false);
    setError("");
  }, [open]);

  const canGenerate = useMemo(() => {
    return focus.trim().length > 0 && String(count).trim().length > 0 && !loading;
  }, [focus, count, loading]);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    try {
      setLoading(true);
      setError("");
      const n = Number(count) || 5;

      if (typeof onGenerateIdeas !== "function") {
        throw new Error("Idea generator is not available.");
      }

      const generated = await onGenerateIdeas({ focus: focus.trim(), count: n });

      if (!Array.isArray(generated) || generated.length === 0) {
        throw new Error("No ideas returned from AI.");
      }

      setIdeas(generated);
      setSelectedIdx(0);
    } catch (err) {
      setError(err?.message || "Failed to generate ideas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    // regenerate without changing fields
    handleGenerate();
  };

  const handleDone = () => {
    const picked = ideas[selectedIdx] ?? "";
    onDone?.(picked);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center bg-black/40 pt-[22px] pb-[22px]"
      onMouseDown={() => onClose?.()}
    >
      <div
        className="
          w-[1100px]
          bg-white
          rounded-[12px]
          border border-[#E5E7EB]
          shadow-[0_10px_30px_rgba(0,0,0,0.18)]
          flex flex-col
          max-h-[calc(100vh-44px)]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[28px] pt-[22px] pb-[12px] shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[14px]">
              <div className="w-[40px] h-[40px] rounded-full border-2 border-[#4443E4] flex items-center justify-center">
                <span className="text-[#4443E4] text-[18px] leading-none font-semibold">
                  i
                </span>
              </div>

              <div>
                <div className="text-[26px] leading-[30px] font-semibold text-[#111827]">
                  Blog Topic Idea Generator
                </div>
                <div className="text-[14px] text-[#6B7280] mt-[6px]">
                  Generate blog topic ideas based on keywords
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onClose?.()}
              className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-[#F3F4F6]"
              aria-label="Close"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-[28px] pb-[18px] flex-1 min-h-0 overflow-y-auto">
          {/* Focus input */}
          <div className="mt-[6px]">
            <label className="block text-[14px] font-semibold text-[#111827] mb-[10px]">
              What is the focus or niche of your blog?
            </label>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder='e.g. “finance”, “marketing”, “Technology” etc.'
              className="
                w-full
                h-[52px]
                bg-white
                border border-[#D1D5DB]
                rounded-[8px]
                px-[14px]
                text-[14px]
                text-[#111827]
                placeholder:text-[#9CA3AF]
                outline-none
              "
            />
          </div>

          {/* Count select */}
          <div className="mt-[18px]">
            <label className="block text-[14px] font-semibold text-[#111827] mb-[10px]">
              No of Blogs ideas
            </label>

            <div className="relative">
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="
                  w-full
                  h-[52px]
                  bg-[#F3F4F6]
                  border border-[#E5E7EB]
                  rounded-[8px]
                  pl-[14px]
                  pr-[44px]
                  text-[14px]
                  text-[#111827]
                  outline-none
                  appearance-none
                "
              >
                <option value="">-Select Number of Ideas-</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>

              <div className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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

          {/* Generated list (only when ideas exist) */}
          {hasIdeas && (
            <div className="mt-[20px]">
              <label className="block text-[14px] font-semibold text-[#111827] mb-[10px]">
                Generated Blogs ideas
              </label>

              <div className="border border-[#D1D5DB] rounded-[8px] p-[12px] max-h-[260px] overflow-y-auto">
                <div className="flex flex-col gap-[10px]">
                  {ideas.map((idea, idx) => {
                    const active = idx === selectedIdx;
                    return (
                      <button
                        key={`${idea}-${idx}`}
                        type="button"
                        onClick={() => setSelectedIdx(idx)}
                        className={[
                          "w-full text-left",
                          "border rounded-[8px]",
                          "px-[14px] py-[14px]",
                          "flex items-start gap-[12px]",
                          active ? "border-[#9CA3AF]" : "border-[#E5E7EB]",
                          "hover:bg-[#F9FAFB]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-[2px]",
                            "w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0",
                            active ? "border-[#4443E4]" : "border-[#9CA3AF]",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {active && (
                            <span className="w-[10px] h-[10px] rounded-full bg-[#4443E4]" />
                          )}
                        </span>

                        <span className="text-[14px] leading-[20px] text-[#111827] font-medium">
                          {idea}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {!hasIdeas ? (
            <div className="mt-[28px] flex justify-center pb-[6px]">
              <button
                type="button"
                disabled={!canGenerate}
                onClick={handleGenerate}
                className={[
                  "w-[420px] h-[56px] rounded-full",
                  "text-[16px] font-medium",
                  "transition-opacity",
                  !canGenerate
                    ? "bg-[#4443E4]/60 text-white cursor-not-allowed"
                    : "bg-[#4443E4] text-white hover:opacity-95",
                ].join(" ")}
              >
                {loading ? "Generating..." : "Generate Ideas"}
              </button>
            </div>
          ) : (
            <div className="mt-[22px] mb-[8px] flex justify-center gap-[18px]">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="
                  w-[360px] h-[56px] rounded-full
                  bg-[#F3F4FF] text-[#4443E4]
                  border border-[#E5E7EB]
                  text-[16px] font-medium
                  hover:opacity-95
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {loading ? "Regenerating..." : "Regenerate Ideas"}
              </button>

              <button
                type="button"
                onClick={handleDone}
                className="
                  w-[360px] h-[56px] rounded-full
                  bg-[#4443E4] text-white
                  text-[16px] font-medium
                  hover:opacity-95
                "
              >
                Done
              </button>
            </div>
          )}

          {error ? (
            <div className="mt-2 text-center text-[12px] text-[#DC2626]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
