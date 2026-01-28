import CmsIcon from "../assets/cms-icon.svg";

export default function SimpleHeaderInterface() {
  return (
    <header className="w-full border-b border-[#E5E7EB] bg-white">
      <div className="h-[72px] flex items-center px-6">
        <img
          src={CmsIcon}
          alt="CMS"
          className="h-[36px] w-auto"
          draggable="false"
        />
      </div>
    </header>
  );
}
