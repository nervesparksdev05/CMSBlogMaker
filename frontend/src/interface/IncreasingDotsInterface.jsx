import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadDraft } from "../lib/storage.js";

export default function IncreasingDotsInterface() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [draft, setDraft] = useState(loadDraft());

  const steps = useMemo(
    () => [
      { label: "Details of Blog", path: "/create-blog" },
      { label: "Blog Title", path: "/create-blog/title" },
      { label: "Introduction", path: "/create-blog/intro" },
      { label: "Outlined", path: "/create-blog/outline" },
      { label: "Image", path: "/create-blog/image" },
      { label: "Verify Content", path: "/create-blog/review" },
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

  const maxIndex = useMemo(() => {
    const detailsDone = Boolean(
      (draft.selected_idea || draft.focus_or_niche || "").trim()
    );
    const titleDone = Boolean((draft.title || "").trim());
    const introDone = Boolean((draft.intro_md || "").trim());
    const outlineDone = Array.isArray(draft.outline) && draft.outline.length > 0;
    const imageDone = Boolean((draft.cover_image_url || "").trim());

    if (!detailsDone) return 0;
    if (!titleDone) return 1;
    if (!introDone) return 2;
    if (!outlineDone) return 3;
    if (!imageDone) return 4;
    return 5;
  }, [draft]);

  useEffect(() => {
    const handleDraft = (event) => {
      setDraft(event?.detail || loadDraft());
    };
    window.addEventListener("cms:draft", handleDraft);
    return () => window.removeEventListener("cms:draft", handleDraft);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/create-blog/generated")) return;
    if (selectedIndex > maxIndex) {
      navigate(steps[maxIndex].path);
    }
  }, [pathname, selectedIndex, maxIndex, navigate, steps]);

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
          <div
            className="absolute top-[14px] h-[4px] bg-[#1F2937] rounded-full"
            style={{ left: line.left, right: line.right }}
          />

          <div
            className="absolute top-[14px] h-[4px] bg-[#4443E4] rounded-full"
            style={{ left: line.left, width: line.progressW }}
          />

          <div className="relative z-10 flex items-start justify-between">
            {steps.map((step, idx) => {
              const done = idx <= selectedIndex;
              const selected = idx === selectedIndex;
              const locked = idx > maxIndex;

              return (
                <button
                  key={step.path}
                  type="button"
                  onClick={() => {
                    if (!locked) navigate(step.path);
                  }}
                  disabled={locked}
                  className={[
                    "flex flex-col items-center gap-[10px] min-w-0",
                    locked ? "cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <span
                    ref={(el) => (dotRefs.current[idx] = el)}
                    className={[
                      "w-[26px] h-[26px] rounded-full flex items-center justify-center",
                      done && !locked
                        ? "bg-white border-[4px] border-[#4443E4]"
                        : "bg-[#E5E7EB]",
                      selected ? "scale-105" : "",
                      "transition-transform",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "text-[13px] leading-[16px] text-center whitespace-pre-line",
                      done && !locked ? "text-[#111827]" : "text-[#9CA3AF]",
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
