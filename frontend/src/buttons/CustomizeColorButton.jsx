export default function CustomizeColor({ onClick }) {
  const handleClick = onClick || (() => {
    console.log("Customize Color clicked");
  });

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center justify-center
        w-[155px] h-[36px]
        rounded-[6px]
        bg-[#4443E4]
        border border-[#00000000]
        text-[14px] leading-[22px] font-normal
        text-white text-center
        cursor-pointer
      "
    >
      Customize Color
    </button>
  );
}