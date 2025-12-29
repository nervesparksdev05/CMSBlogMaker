export default function DownloadFileButton() {
  const handleClick = () => {
    alert("DownloadFileButton!");
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center justify-center
        w-[330px] h-[45px]
        rounded-[26px]
        border border-[#00000000]
        bg-[#4443E4]
        text-white text-[18px] leading-7 font-normal
        cursor-pointer
      "
    >
      Download Your File
    </button>
  );
}
