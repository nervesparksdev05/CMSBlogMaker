import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function IncreasingDotsInterface() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

 const steps = useMemo(
  () => [
    { label: "Details of Blog", path: "/create-blog" },
    { label: "Blog Title", path: "/create-blog/title" },
    { label: "Introduction", path: "/create-blog/intro" },
    { label: "Outlined", path: "/create-blog/outline" },
    { label: "Image", path: "/create-blog/image" },          // ✅ Image first
    { label: "Verify Content", path: "/create-blog/review" }, // ✅ then Verify
  ],
  []
);

  const selectedIndex = useMemo(() => {
    const clean = pathname.replace(/\/+$/, "") || "/";
    if (clean.startsWith("/create-blog/generated")) {
      return steps.length - 1;
    }
    const idx = steps.findIndex((s) => s.path === clean);
    return idx >= 0 ? idx : 0;
  }, [pathname, steps]);

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

      const left = firstCenter;
      const right = wRect.width - lastCenter;
      const baseW = Math.max(0, wRect.width - left - right);

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
          {/* Dark base line (matches screenshot) */}
          <div
            className="absolute top-[14px] h-[4px] bg-[#1F2937] rounded-full"
            style={{ left: line.left, right: line.right }}
          />

          {/* Blue progress line */}
          <div
            className="absolute top-[14px] h-[4px] bg-[#4443E4] rounded-full"
            style={{ left: line.left, width: line.progressW }}
          />

          <div className="relative z-10 flex items-start justify-between">
            {steps.map((step, idx) => {
              const done = idx <= selectedIndex;
              const selected = idx === selectedIndex;

              return (
                <button
                  key={step.path}
                  type="button"
                  onClick={() => navigate(step.path)}
                  className="flex flex-col items-center gap-[10px] min-w-0"
                >
                  {/* ✅ Circles match screenshot */}
                  <span
                    ref={(el) => (dotRefs.current[idx] = el)}
                    className={[
                      "w-[26px] h-[26px] rounded-full flex items-center justify-center",
                      done
                        ? "bg-white border-[4px] border-[#4443E4]" // empty ring (completed/current)
                        : "bg-[#E5E7EB]", // solid grey (upcoming)
                      selected ? "scale-105" : "",
                      "transition-transform",
                    ].join(" ")}
                  />

                  {/* ✅ Labels: upcoming grey, current bold */}
                  <span
                    className={[
                      "text-[13px] leading-[16px] text-center whitespace-pre-line",
                      done ? "text-[#111827]" : "text-[#9CA3AF]",
                      selected ? "font-semibold" : "font-medium",
                    ].join(" ")}
                  >
                    {step.label}
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
