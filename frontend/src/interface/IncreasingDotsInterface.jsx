import { useLayoutEffect, useMemo, useRef, useState } from "react";

export default function IncreasingDotsInterface() {
  const steps = useMemo(
    () => [
      "Details of Blog",
      "Blog Title",
      "Introduction",
      "Outlined",
      "Image",
      "Verify Content",
    ],
    []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  // refs to measure dot center positions
  const wrapRef = useRef(null);
  const dotRefs = useRef([]);
  const [line, setLine] = useState({ left: 0, right: 0, progressW: 0 });

  useLayoutEffect(() => {
    const calc = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const dots = dotRefs.current.filter(Boolean);
      if (dots.length < 2) return;

      const wRect = wrap.getBoundingClientRect();
      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();

      const firstCenter = first.left - wRect.left + first.width / 2;
      const lastCenter = last.left - wRect.left + last.width / 2;

      // base line from first center to last center
      const left = firstCenter;
      const right = wRect.width - lastCenter;
      const baseW = Math.max(0, wRect.width - left - right);

      // progress line ends at selected center
      const sel = dots[Math.min(selectedIndex, dots.length - 1)].getBoundingClientRect();
      const selCenter = sel.left - wRect.left + sel.width / 2;
      const progressW = Math.max(0, Math.min(baseW, selCenter - firstCenter));

      setLine({ left, right, progressW });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [steps.length, selectedIndex]);

  return (
    <div className="w-full flex justify-center py-4">
      <div
        className="
          w-[1100px] h-[84px]
          bg-white border border-[#E5E7EB]
          rounded-[10px]
          flex items-center
          px-[44px]
        "
      >
        <div ref={wrapRef} className="relative w-full">
          {/* Base grey line: EXACTLY between first/last centers */}
          <div
            className="absolute top-[14px] h-[4px] bg-[#4B5563] rounded-full"
            style={{ left: line.left, right: line.right }}
          />

          {/* Purple progress line: EXACTLY ends at selected center */}
          <div
            className="absolute top-[14px] h-[4px] bg-[#4443E4] rounded-full"
            style={{ left: line.left, width: line.progressW }}
          />

          {/* Dots + labels */}
          <div className="relative z-10 flex items-start justify-between">
            {steps.map((label, idx) => {
              const done = idx <= selectedIndex;
              const selected = idx === selectedIndex;

              // done = purple ring + purple inner
              // pending = grey ring + grey inner
              const ringBorder = done ? "border-[#4443E4]" : "border-[#D1D5DB]";
              const innerBg = done ? "bg-[#4443E4]" : "bg-[#D1D5DB]";
              const ringBg = "bg-white"; // keep ring background clean like screenshot

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="flex flex-col items-center gap-[10px] min-w-0"
                >
                  <span
                    ref={(el) => (dotRefs.current[idx] = el)}
                    className={[
                      "w-[26px] h-[26px] rounded-full border-[4px] flex items-center justify-center",
                      ringBorder,
                      ringBg,
                      selected ? "scale-105" : "",
                      "transition-transform",
                    ].join(" ")}
                  >
                    <span className={["w-[12px] h-[12px] rounded-full", innerBg].join(" ")} />
                  </span>

                  <span
                    className={[
                      "text-[13px] leading-[16px] text-center",
                      selected ? "text-[#111827] font-semibold" : "text-[#111827] font-medium",
                      done ? "" : "opacity-60",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
