// src/buttons/NextButton.jsx
import { useLocation, useNavigate } from "react-router-dom";
import RightArrow from "../assets/right-arrow.svg";

const STEPS = [
  "/create-blog",
  "/create-blog/title",
  "/create-blog/intro",
  "/create-blog/outline",
  "/create-blog/image",  // ✅ Image first
  "/create-blog/review", // ✅ Verify Content last
];

export default function NextButton({ disabled = false, className = "" }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const clean = pathname.replace(/\/+$/, "") || "/";
  const index = STEPS.indexOf(clean);

  const canGoNext = index >= 0 && index < STEPS.length - 1;
  const isDisabled = disabled || !canGoNext;

  const handleNext = () => {
    if (isDisabled) return;
    navigate(STEPS[index + 1]);
  };

  return (
    <button
      type="button"
      onClick={handleNext}
      disabled={isDisabled}
      className={[
        `
        w-[87px] h-[36px]
        bg-[#4443E4]
        rounded-[8px]
        flex items-center justify-center gap-2
        text-white text-[14px] font-medium
        transition
        `,
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[#3a3adb]",
        className,
      ].join(" ")}
    >
      Next
      <img src={RightArrow} alt="" className="w-[16px] h-[16px]" draggable="false" />
    </button>
  );
}
