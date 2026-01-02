import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";

import FacebookIcon from "../assets/facebook-icon.svg";
import TwitterIcon from "../assets/twitter-icon.svg";
import LinkedInIcon from "../assets/linkedin-icon.svg";
import { apiGet, apiPost } from "../lib/api.js";

const PREVIEW_STORAGE_KEY = "cms_preview_edited_html_v2";

export default function GeneratedBlogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bodyRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const blogId = searchParams.get("id") || localStorage.getItem("cms_last_blog_id");

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setError("No blog selected.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiGet(`/blogs/${blogId}`);
        setBlog(data);
      } catch (err) {
        setError(err?.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  useEffect(() => {
    if (!blog?.final_blog?.html) return;
    const container = bodyRef.current;
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2"));
    const items = headings.map((h, idx) => {
      const id = `section-${idx}`;
      h.id = id;
      return { id, label: h.textContent || `Section ${idx + 1}` };
    });

    setToc(items);
    setActiveId(items[0]?.id || "");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [blog]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePreview = () => {
    const html = blog?.final_blog?.html || "";
    const title = blog?.meta?.title || blog?.final_blog?.render?.title || "";
    const heroUrl = blog?.meta?.cover_image_url || blog?.final_blog?.render?.cover_image_url || "";
    localStorage.setItem(
      PREVIEW_STORAGE_KEY,
      JSON.stringify({ title, heroUrl, html })
    );
    navigate("/preview-edited");
  };

  const handlePublish = async () => {
    if (!blogId) return;
    try {
      setPublishing(true);
      await apiPost(`/blogs/${blogId}/publish-request`, {});
      setBlog((prev) => (prev ? { ...prev, status: "pending" } : prev));
    } catch (err) {
      setError(err?.message || "Failed to request publish.");
    } finally {
      setPublishing(false);
    }
  };

  const heroUrl =
    blog?.meta?.cover_image_url || blog?.final_blog?.render?.cover_image_url || "";
  const title = blog?.meta?.title || blog?.final_blog?.render?.title || "Generated Blog";
  const html = blog?.final_blog?.html || "";

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      <div className="sticky top-[76px] z-[55] w-full shadow-[0_1px_0_0_rgba(229,231,235,1)]">
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-10 pt-6 pb-10">
            <BackToDashBoardButton />

            {loading ? (
              <div className="mt-6 text-[14px] text-[#6B7280]">Loading blog...</div>
            ) : null}

            {error ? (
              <div className="mt-6 text-[14px] text-[#DC2626]">{error}</div>
            ) : null}

            {!loading && !error ? (
              <div className="mt-6 flex gap-6 items-start">
                <div className="w-[360px] shrink-0">
                  <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
                    <div className="text-[18px] font-semibold text-[#111827]">
                      Table of contents
                    </div>

                    <div className="mt-4 space-y-2">
                      {toc.map((item) => {
                        const isActive = item.id === activeId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollTo(item.id)}
                            className={[
                              "w-full text-left rounded-[8px] px-3 py-2",
                              "hover:bg-[#F4F6FF]",
                              isActive ? "bg-[#F4F6FF]" : "bg-transparent",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={[
                                  "mt-[3px] w-[3px] h-[24px] rounded-full",
                                  isActive ? "bg-[#4443E4]" : "bg-transparent",
                                ].join(" ")}
                              />
                              <span
                                className={[
                                  "text-[14px] leading-[20px]",
                                  isActive
                                    ? "text-[#1D4ED8] font-semibold"
                                    : "text-[#111827] font-medium",
                                ].join(" ")}
                              >
                                {item.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePreview}
                        className="
                          flex-1 h-[44px] rounded-full
                          border border-[#D1D5DB] bg-white
                          text-[14px] font-medium text-[#111827]
                          hover:bg-[#F9FAFB]
                        "
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="
                          flex-1 h-[44px] rounded-full
                          bg-[#4443E4] text-white
                          text-[14px] font-semibold
                          hover:opacity-95
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      >
                        {publishing ? "Submitting..." : "Publish"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
                    {heroUrl ? (
                      <div className="relative">
                        <img
                          src={heroUrl}
                          alt=""
                          className="w-full h-[260px] object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                          <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-[6px] text-[12px] font-medium text-[#111827]">
                              <span className="w-[8px] h-[8px] rounded-full bg-[#4443E4]" />
                              Blog
                            </div>
                            <div className="mt-3 text-white text-[26px] leading-[32px] font-semibold max-w-[920px]">
                              {title}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-5 text-[20px] font-semibold text-[#111827]">
                        {title}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm p-6">
                      <div
                        ref={bodyRef}
                        className="prose max-w-none blog-body"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>

                    <div className="mt-10">
                      <div className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#0B1E85]">
                        <div className="flex items-center justify-between px-6 py-4">
                          <div className="text-white text-[14px] font-semibold">
                            Like what you see? Share with a friend.
                          </div>

                          <div className="flex items-center gap-3">
                            <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                              <img src={FacebookIcon} alt="" className="w-[18px] h-[18px]" />
                            </button>
                            <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                              <img src={TwitterIcon} alt="" className="w-[18px] h-[18px]" />
                            </button>
                            <button type="button" className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center">
                              <img src={LinkedInIcon} alt="" className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-10" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
