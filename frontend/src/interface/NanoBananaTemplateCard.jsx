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
    </div>
  );
}
