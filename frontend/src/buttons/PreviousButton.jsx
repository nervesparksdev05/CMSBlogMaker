// src/buttons/PreviousButton.jsx
import { ArrowLeft } from "lucide-react";

export default function PreviousButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-[112px] h-[36px]
        rounded-[8px]
        border border-[#D1D5DB]
        bg-white
        flex items-center justify-center gap-2
        text-[13px] font-medium text-[#374151]
        hover:bg-[#F3F4F6]
        transition
      "
    >
      <ArrowLeft size={16} className="text-[#374151]" />
      Previous
    </button>
  );
}
