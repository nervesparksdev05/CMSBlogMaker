// src/interface/FourCardsRow.jsx
import BlogsGeneratedIcon from "../assets/blogs-generated-icon.svg";
import SavedBlogIcon from "../assets/blog-saved-icon.svg";
import GeneratedImageIcon from "../assets/generated-image.svg";
import PublishedBlogIcon from "../assets/published-blog-icon.svg";

function StatCard({ title, value, icon }) {
  return (
    <div
      className="
        relative
        w-[292px] h-[180px]
        rounded-[12px]
        border border-[#E5E7EB]
        bg-white
        px-7 py-5
      "
    >
      <div className="text-[13px] tracking-[0.18em] font-medium text-[#6B7280]">
        {title}
      </div>

      <div className="mt-3 text-[38px] leading-[42px] font-semibold text-[#111827]">
        {value}
      </div>

      {/* icon bottom-right */}
      <img
        src={icon}
        alt=""
        className="absolute right-7 bottom-5 w-[56px] h-[56px] select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

export default function FourCardsRow({
  blogsGenerated = 17,
  savedBlogs = 2233,
  generatedImages = 2,
  publishedBlogs = 0,
  className = "",
}) {
  const cards = [
    {
      key: "blogsGenerated",
      title: "BLOGS GENERATED",
      value: blogsGenerated,
      icon: BlogsGeneratedIcon,
    },
    {
      key: "savedBlogs",
      title: "SAVED BLOGS",
      value: savedBlogs,
      icon: SavedBlogIcon,
    },
    {
      key: "generatedImages",
      title: "GENERATED IMAGES",
      value: generatedImages,
      icon: GeneratedImageIcon,
    },
    {
      key: "publishedBlogs",
      title: "PUBLISHED BLOGS",
      value: publishedBlogs,
      icon: PublishedBlogIcon,
    },
  ];

  return (
    <div
      className={[
        "w-full flex items-center gap-[10px] flex-wrap",
        className,
      ].join(" ")}
    >
      {cards.map((c) => (
        <StatCard key={c.key} title={c.title} value={c.value} icon={c.icon} />
      ))}
    </div>
  );
}
