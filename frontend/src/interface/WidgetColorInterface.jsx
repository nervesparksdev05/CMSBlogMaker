import { useMemo } from "react";

export default function WidgetColorInterface({
  label = "Pick a color",
  value = "#F3A822",
  onChange,
  onClose,
}) {
  const swatches = useMemo(
    () => [
      "#111827",
      "#4443E4",
      "#2563EB",
      "#22C55E",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#A855F7",
      "#14B8A6",
      "#6B7280",
      "#FFFFFF",
      "#000000",
    ],
    []
  );

  return (
    <div className="w-[320px] rounded-[12px] border border-[#E5E7EB] bg-white shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold text-[#111827]">{label}</div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-3 rounded-[10px] border border-[#D1D5DB] text-[14px] hover:bg-[#F9FAFB]"
        >
          Close
        </button>
      </div>

      {/* swatches */}
      <div className="mt-4 grid grid-cols-6 gap-3">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange?.(c)}
            className={[
              "w-10 h-10 rounded-[10px] border",
              c.toLowerCase() === value.toLowerCase()
                ? "border-[#111827]"
                : "border-[#E5E7EB]",
            ].join(" ")}
            style={{ backgroundColor: c }}
            aria-label={`Select ${c}`}
            title={c}
          />
        ))}
      </div>

      {/* custom picker */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[12px] text-[#6B7280]">Custom</div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-10 w-14 border border-[#E5E7EB] rounded-[10px] bg-white"
        />
      </div>
    </div>
  );
}
