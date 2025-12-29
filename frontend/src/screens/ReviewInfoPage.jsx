// src/pages/ReviewInfoPage.jsx
import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import ReviewInformationTemplate from "../interface/ReviewInformationTemplate";
import PreviousButton from "../buttons/PreviousButton";

export default function ReviewInfoPage() {
  // demo data (replace with your store/context values)
  const blogDetails = {
    description:
      "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.",
    language: "English",
    tone: "Informative",
    creativity: "Regular",
    about:
      "You are a tech blogger who writes informative and engaging content about emerging technologies",
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      {/* ✅ Sticky Main Header */}
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      {/* ✅ Sticky Bottom Bar (FULL WIDTH) */}
      <div className="sticky top-[76px] z-[55] w-full">
        <HeaderBottomBar title="Content Management System" />
      </div>

      {/* Body */}
      <div className="w-full flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1">
          {/* Page content */}
          <div className="px-10 pt-6 pb-10">
            <BackToDashBoardButton />

            <div className="mt-4">
              <IncreasingDotsInterface />
            </div>

            <p className="mt-6 text-center text-[13px] leading-[18px] text-[#111827] font-semibold">
              Verify the information before generating Blog
            </p>

            {/* ✅ Bigger card area */}
            <div className="mt-10 flex justify-center">
              <div className="w-full max-w-[1080px]">
                <ReviewInformationTemplate
                  title="Review Information"
                  onEdit={() => console.log("edit clicked")}
                  blogDetailsTitle="Blog Details"
                  blogDetailsDescription={blogDetails.description}
                  language={blogDetails.language}
                  tone={blogDetails.tone}
                  creativity={blogDetails.creativity}
                  aboutValue={blogDetails.about}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center justify-between max-w-[1080px] mx-auto">
              <PreviousButton />

              <button
                type="button"
                className="
                  h-[44px] px-10 rounded-full
                  bg-[#4443E4] text-white
                  text-[14px] font-semibold
                  hover:opacity-95
                "
                onClick={() => console.log('generate blog')}
              >
                Generate Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
