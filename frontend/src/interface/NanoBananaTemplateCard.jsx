export default function NanoBananaTemplateCard({ image }) {
  if (!image) return null;
  return (
    <div className="rounded-[14px] bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="aspect-[4/3] bg-[#F3F4F6]">
        <img
          src={image.src}
          alt={image.title || "Generated"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4 py-3">
        <div className="text-[13px] font-medium text-[#111827]">
          {image.title || "Generated Image"}
        </div>
        <div className="text-[12px] text-[#6B7280]">{image.subtitle || ""}</div>
      </div>
    </div>
  );
}
