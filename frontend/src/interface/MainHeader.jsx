// src/interface/MainHeader.jsx
import NodaIcon from "../assets/noda-icon.svg";
import HeaderRightTop from "./HeaderRightTopInterface.jsx";
import AlarmIcon from "../assets/alarm-icon.svg";
import FemaleIcon from "../assets/female-icon.svg";

export default function MainHeader() {
  return (
    <header className="w-full bg-white sticky top-0 z-50">
      {/* Top bar – ~76px height */}
      <div className="w-full h-[75.92px] border-b border-[#797a85] flex items-center">
        <div className="w-full flex items-center justify-between px-4 md:px-6">
          {/* Left: logo */}
          <div className="flex items-center">
            <img
              src={NodaIcon}
              alt="Noda Technologies"
              className="h-12 w-auto ml-18"
              draggable="false"
            />
          </div>

          {/* Right: tabs + divider + bell + profile */}
          <div className="flex items-center gap-2">
            <HeaderRightTop />

            {/* Vertical divider */}
            <div className="h-10 w-px bg-[#b4bcc9]" />

            {/* Bell icon */}
            <button
              type="button"
              className="hidden sm:flex items-center justify-center w-18 h-18 rounded-full"
            >
              <img src={AlarmIcon} alt="Notifications" draggable="false" />
            </button>

            {/* Profile avatar */}
            <img
              src={FemaleIcon}
              alt="Profile"
              className="w-10 h-10 mr-30 ml-1 rounded-full"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
