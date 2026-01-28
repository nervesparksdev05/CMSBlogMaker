// src/interface/HeaderBottomBar.jsx
import { useNavigate } from "react-router-dom";
import CmsIcon from "../assets/cms-icon.svg";
import { clearDraft } from "../lib/storage.js";

export default function HeaderBottomBar({
  iconSrc = CmsIcon,
  title = "Content Management System",

  // optional: override right side button completely
  rightButton = null,

  className = "",
  leftClassName = "",

  // optional default button controls
  showNewBlogButton = true,

  // ✅ route to Create Blog page
  newBlogTo = "/create-blog",

  // optional callback (still supported)
  onNewBlog,
}) {
  const navigate = useNavigate();

  const handleNewBlog = () => {
    onNewBlog?.();
    clearDraft();
    navigate(newBlogTo);
  };

  return (
    <div
      className={[
        "w-full h-[68px] bg-white border-b border-[#797a85] flex items-center",
        "sticky top-[75.92px] z-40",
        className,
      ].join(" ")}
    >
      <div className="w-full flex items-center justify-between px-[88px]">
        {/* Left */}
        <div className={["flex items-center gap-[10px]", leftClassName].join(" ")}>
          <div className="flex items-center justify-center">
            {iconSrc ? <img src={iconSrc} alt="" className="w-[34px] h-[34px]" /> : null}
          </div>

          <span className="text-[18px] font-semibold text-[#111827]">{title}</span>
        </div>

        {/* Right */}
        <div className="flex items-center mr-12">
          {rightButton ? (
            rightButton
          ) : showNewBlogButton ? (
            <button
              type="button"
              onClick={handleNewBlog}
              className="
                h-[38px]
                px-[22px]
                rounded-full
                bg-[#4443E4]
                text-white
                text-[13px]
                font-medium
                shadow-sm
                hover:opacity-95
              "
            >
              + New Blog
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
