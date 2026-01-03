// src/pages/CreateBlogDashboard.jsx
import { useEffect, useState } from "react";
import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import BlogDetails from "../interface/BlogDetails";
import NextButton from "../buttons/NextButton";
import { loadDraft } from "../lib/storage.js";

export default function CreateBlogPage() {
  const [draft, setDraft] = useState(loadDraft());

  useEffect(() => {
    const handleDraft = (event) => {
      setDraft(event?.detail || loadDraft());
    };
    window.addEventListener("cms:draft", handleDraft);
    return () => window.removeEventListener("cms:draft", handleDraft);
  }, []);

  const canNext = Boolean((draft.selected_idea || draft.focus_or_niche || "").trim());

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      {/* ✅ sticky stack */}
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" showNewBlogButton={false} />
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
              <NextButton disabled={!canNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
