// src/interface/Sidebar.jsx
import { NavLink } from "react-router-dom";

import DashboardIcon from "../assets/dashboard.svg";
import CreateBlogIcon from "../assets/write-icon.svg";
import SavedBlogIcon from "../assets/savedblog-icon.svg";
import NanoBananaIcon from "../assets/bot-icon.svg";
import GalleryIcon from "../assets/gallery.svg";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: DashboardIcon },
  { key: "create", label: "Create Blog", to: "/create-blog", icon: CreateBlogIcon },
  { key: "saved", label: "Saved Blogs", to: "/saved-blogs", icon: SavedBlogIcon },
  { key: "nano", label: "Generate Image (Nano\nBanana)", to: "/generate-image", icon: NanoBananaIcon },
  { key: "gallery", label: "Gallery", to: "/gallery", icon: GalleryIcon },
];

export default function Sidebar({ onItemClick }) {
  return (
    <aside className="w-[256px] bg-white border-r border-[#E5E7EB] sticky top-[143.92px] h-[calc(100vh-143.92px)] overflow-y-auto">
      <div className="px-[10px] pt-[10px]">
        <nav className="flex flex-col gap-[6px]">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              onClick={() => {
                if (typeof onItemClick === "function") onItemClick(item);
              }}
              className={({ isActive }) =>
                [
                  "w-full min-h-[44px] flex items-center gap-[12px] px-[14px] rounded-[8px] text-left transition-colors",
                  isActive
                    ? "bg-[#EDEDFF] text-[#4443E4] font-semibold"
                    : "bg-transparent text-[#6B7280] font-normal hover:bg-[#F3F4FF]",
                ].join(" ")
              }
            >
              <img src={item.icon} alt="" className="w-[20px] h-[20px] shrink-0" />
              <span className="text-[14px] leading-[18px] whitespace-pre-line">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
