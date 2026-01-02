import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";
import ReviewInformationTemplate from "../interface/ReviewInformationTemplate";
import PreviousButton from "../buttons/PreviousButton";
import { apiPost } from "../lib/api.js";
import { loadDraft } from "../lib/storage.js";

export default function ReviewInfoPage() {
  const navigate = useNavigate();
  const draft = loadDraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const meta = useMemo(
    () => ({
      language: draft.language || "English",
      tone: draft.tone || "Formal",
      creativity: draft.creativity || "Regular",
      focus_or_niche: draft.focus_or_niche || draft.selected_idea || "",
      targeted_keyword: draft.targeted_keyword || "",
      targeted_audience: draft.targeted_audience || "",
      reference_links: draft.reference_links || "",
      selected_idea: draft.selected_idea || draft.focus_or_niche || "",
      title: draft.title || "",
      intro_md: draft.intro_md || "",
      outline: draft.outline || [],
      image_prompt: draft.image_prompt || "",
      cover_image_url: draft.cover_image_url || "",
    }),
    [draft]
  );

  const helperText =
    "Review the information below. You can jump back to any step to make changes before generating your blog.";

  const handleGenerate = async () => {
    if (!meta.selected_idea || !meta.title || !meta.intro_md || !meta.outline.length) {
      setError("Please complete all steps before generating the blog.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const finalBlog = await apiPost("/ai/blog-generate", {
        tone: meta.tone,
        creativity: meta.creativity,
        focus_or_niche: meta.focus_or_niche,
        targeted_keyword: meta.targeted_keyword,
        targeted_audience: meta.targeted_audience,
        reference_links: meta.reference_links,
        selected_idea: meta.selected_idea,
        title: meta.title,
        intro_md: meta.intro_md,
        outline: meta.outline,
        cover_image_url: meta.cover_image_url,
      });

      const saved = await apiPost("/blog", {
        meta,
        final_blog: finalBlog,
      });

      const blogId = saved?.blog_id || "";
      if (blogId) {
        localStorage.setItem("cms_last_blog_id", blogId);
      }
      navigate(`/create-blog/generated${blogId ? `?id=${blogId}` : ""}`);
    } catch (err) {
      setError(err?.message || "Failed to generate blog.");
    } finally {
      setLoading(false);
    }
  };

  const goEditBlogDetails = () => navigate("/create-blog");
  const goEditBlogTitle = () => navigate("/create-blog/title");
  const goEditBlogIntro = () => navigate("/create-blog/intro");
  const goEditBlogOutline = () => navigate("/create-blog/outline");
  const goEditBlogImage = () => navigate("/create-blog/image");

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      <div className="sticky top-[76px] z-[55] w-full">
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-10 pt-6 pb-10">
            <BackToDashBoardButton />

            <div className="mt-4">
              <IncreasingDotsInterface />
            </div>

            <p className="mt-6 text-center text-[13px] leading-[18px] text-[#111827] font-semibold">
              Verify the information before generating Blog
            </p>

            <div className="mt-10 flex justify-center">
              <ReviewInformationTemplate
                pageTitle="Review Information"
                helperText={helperText}
                blogLanguage={meta.language}
                blogTone={meta.tone}
                blogCreativity={meta.creativity}
                blogAbout={meta.focus_or_niche}
                blogKeywords={meta.targeted_keyword}
                blogAudience={meta.targeted_audience}
                blogReferences={meta.reference_links}
                onEditBlogDetails={goEditBlogDetails}
                blogTitle={meta.title}
                onEditBlogTitle={goEditBlogTitle}
                blogIntro={meta.intro_md}
                onEditBlogIntro={goEditBlogIntro}
                blogOutline={meta.outline}
                onEditBlogOutline={goEditBlogOutline}
                headerImageSrc={meta.cover_image_url}
                onEditBlogImage={goEditBlogImage}
              />
            </div>

            {error ? (
              <div className="mt-4 text-center text-[12px] text-[#DC2626]">
                {error}
              </div>
            ) : null}

            <div className="mt-10 flex items-center justify-between max-w-[980px] mx-auto">
              <PreviousButton />

              <button
                type="button"
                className="
                  h-[44px] px-10 rounded-full
                  bg-[#4443E4] text-white
                  text-[14px] font-semibold
                  hover:opacity-95
                "
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Blog"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
