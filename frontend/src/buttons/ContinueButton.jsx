export default function ContinueButton({ onClick, disabled = false, label = "Continue" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full h-[44px] rounded-[26px]",
        "bg-[#4443E4] text-white text-[14px] font-semibold",
        "transition-opacity",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-95",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
