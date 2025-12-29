// src/pages/CreateBlogDashboard.jsx
import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import BlogDetails from "../interface/BlogDetails";
import NextButton from "../buttons/NextButton";

export default function CreateBlogDashboard() {
  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      {/* ✅ sticky stack */}
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        {/* ✅ right content takes full remaining width */}
        <div className="flex-1 w-full">
          <div className="px-8 py-6">
            <div className="mb-4">
              <BackToDashBoardButton />
            </div>

            <IncreasingDotsInterface />

            <div className="mt-2 mb-4 text-center text-[12px] font-semibold text-[#111827]">
              Describe the blog post that you want to create
            </div>

            <div className="flex justify-center">
              <div className="w-[980px] max-w-full">
                <BlogDetails />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <NextButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
