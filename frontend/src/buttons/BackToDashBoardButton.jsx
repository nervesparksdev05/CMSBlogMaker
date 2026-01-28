// src/buttons/BackToDashBoardButton.jsx
import { useNavigate } from "react-router-dom";
import BlueArrowIcon from "../assets/blue-arrow.svg";

export default function BackToDashBoardButton({ to = "/dashboard", className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={[
        "text-[21px] flex items-center gap-1 text-[#4443E4]",
        className,
      ].join(" ")}
    >
      <img src={BlueArrowIcon} alt="Back" className="w-4 h-4" draggable={false} />
      <span className="font-normal">Back to Dashboard</span>
    </button>
  );
}
