// src/buttons/BackToDashBoardButton.jsx
import BlueArrowIcon from "../assets/blue-arrow.svg";

export default function BackToDashBoardButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[21px]  flex items-center gap-1 text-[#4443E4]"
    >
      <img
        src={BlueArrowIcon}
        alt="Back"
        className="w-4 h-4 font-semibold"
      />

      <span className="font-normal ">
        Back to Dashboard
      </span>
    </button>
  );
}
