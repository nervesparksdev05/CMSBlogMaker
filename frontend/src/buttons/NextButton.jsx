// src/buttons/NextButton.jsx
import { ArrowRight } from "lucide-react";

export default function NextButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-[87px] h-[36px]
        bg-[#4443E4]
        rounded-[8px]
        flex items-center justify-center gap-2
        text-white text-[14px] font-medium
        hover:bg-[#3a3adb]
        transition
      "
    >
      Next
      <ArrowRight size={16} className="text-white" />
    </button>
  );
}
