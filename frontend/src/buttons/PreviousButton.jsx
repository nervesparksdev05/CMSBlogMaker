// src/buttons/PreviousButton.jsx
import { useLocation, useNavigate } from "react-router-dom";
import LeftArrow from "../assets/left-arrow.svg";

const STEPS = [
  "/create-blog",
  "/create-blog/title",
  "/create-blog/intro",
  "/create-blog/outline",
  "/create-blog/image",  // ✅ Image first
  "/create-blog/review", // ✅ Verify Content last
];

export default function PreviousButton({ disabled = false, className = "" }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const clean = pathname.replace(/\/+$/, "") || "/";
  const index = STEPS.indexOf(clean);

  const canGoPrev = index > 0;
  const isDisabled = disabled || !canGoPrev;

  const handlePrev = () => {
    if (isDisabled) return;
    navigate(STEPS[index - 1]);
  };

  return (
    <button
      type="button"
      onClick={handlePrev}
      disabled={isDisabled}
      className={[
        `
        w-[112px] h-[36px]
        rounded-[8px]
        border border-[#D1D5DB]
        bg-white
        flex items-center justify-center gap-2
        text-[13px] font-medium text-[#374151]
        transition
        `,
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[#F3F4F6]",
        className,
      ].join(" ")}
    >
      <img src={LeftArrow} alt="" className="w-[16px] h-[16px]" draggable="false" />
      Previous
    </button>
  );
}
