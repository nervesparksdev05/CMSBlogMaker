import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import IncreasingDotsInterface from "../interface/IncreasingDotsInterface";

import FacebookIcon from "../assets/facebook-icon.svg";
import TwitterIcon from "../assets/twitter-icon.svg";
import LinkedInIcon from "../assets/linkedin-icon.svg";
import { apiGet, apiPost } from "../lib/api.js";
import { setPreviewData } from "../lib/storage.js";

export default function GeneratedBlogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bodyRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const blogId = searchParams.get("id");
  const heroUrl =
    blog?.meta?.cover_image_url || blog?.final_blog?.render?.cover_image_url || "";
  const title = blog?.meta?.title || blog?.final_blog?.render?.title || "Generated Blog";
  const html = blog?.final_blog?.html || "";
  const parsedBlog = useMemo(() => {
    if (!html) {
      return { bodyHtml: "", tocItems: [] };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      if (heroUrl) {
        const firstImage = doc.querySelector("img");
        if (firstImage) {
          firstImage.remove();
        }
      }

      const headings = Array.from(doc.querySelectorAll("h2, h3"));
      const tocItems = headings.map((heading, idx) => {
        const id = `section-${idx}`;
        heading.setAttribute("id", id);
        return { id, label: heading.textContent || `Section ${idx + 1}` };
      });

      return { bodyHtml: doc.body.innerHTML, tocItems };
    } catch (err) {
      return { bodyHtml: html, tocItems: [] };
    }
  }, [html, heroUrl]);
  const bodyHtml = parsedBlog.bodyHtml;
  const tocItems = parsedBlog.tocItems;

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
    if (!tocItems.length || !bodyHtml) {
      setActiveId("");
      return;
    }

    const container = bodyRef.current;
    if (!container) return;

    setActiveId(tocItems[0]?.id || "");

    const headingEls = tocItems
      .map((item) => container.querySelector(`#${item.id}`))
      .filter(Boolean);

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

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [bodyHtml, tocItems]);

  const scrollTo = (id) => {
    const container = bodyRef.current;
    const el =
      (container && container.querySelector(`#${id}`)) ||
      document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollBy({ top: -160, behavior: "smooth" });
  };

  const handlePreview = () => {
    const html = blog?.final_blog?.html || "";
    const title = blog?.meta?.title || blog?.final_blog?.render?.title || "";
    const heroUrl = blog?.meta?.cover_image_url || blog?.final_blog?.render?.cover_image_url || "";
    setPreviewData({ title, heroUrl, html });
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

  const tagLabel = useMemo(() => {
    const raw =
      blog?.meta?.targeted_keyword ||
      blog?.meta?.focus_or_niche ||
      blog?.meta?.selected_idea ||
      "";
    const trimmed = raw.trim();
    return trimmed || "Blog";
  }, [blog]);

  const readTime = useMemo(() => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return 0;
    const words = text.split(" ").length;
    return Math.max(1, Math.round(words / 180));
  }, [html]);

  const metaLine = useMemo(() => {
    const parts = [];
    if (blog?.created_at) {
      const createdAt = new Date(blog.created_at);
      if (!Number.isNaN(createdAt.getTime())) {
        const now = new Date();
        const options = { month: "short", day: "numeric" };
        if (createdAt.getFullYear() !== now.getFullYear()) {
          options.year = "numeric";
        }
        parts.push(createdAt.toLocaleDateString("en-US", options));
      }
    }
    if (readTime) {
      parts.push(`${readTime} min read`);
    }
    return parts.join(" - ");
  }, [blog?.created_at, readTime]);

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
          <div className="px-8 pt-6 pb-10">
            <div className="max-w-[1200px] mx-auto">
              <BackToDashBoardButton />

              <div className="mt-4">
                <IncreasingDotsInterface />
              </div>

              {loading ? (
                <div className="mt-6 text-[14px] text-[#6B7280]">Loading blog...</div>
              ) : null}

              {error ? (
                <div className="mt-6 text-[14px] text-[#DC2626]">{error}</div>
              ) : null}

              {!loading && !error ? (
                <div className="mt-8 flex gap-8 items-start">
                  <div className="w-[320px] shrink-0">
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
                      <div className="text-[16px] font-semibold text-[#111827]">
                        Table of contents
                      </div>

                      <div className="mt-4 space-y-1">
                      {tocItems.map((item) => {
                          const isActive = item.id === activeId;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => scrollTo(item.id)}
                              className={[
                                "w-full text-left rounded-[8px] px-3 py-2",
                                "hover:bg-[#EEF2FF]",
                                isActive ? "bg-[#EEF2FF]" : "bg-transparent",
                              ].join(" ")}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={[
                                    "mt-[3px] w-[3px] h-[22px] rounded-full",
                                    isActive ? "bg-[#4443E4]" : "bg-transparent",
                                  ].join(" ")}
                                />
                                <span
                                  className={[
                                    "text-[13px] leading-[18px]",
                                    isActive
                                      ? "text-[#4443E4] font-semibold"
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

                      <div className="mt-6 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePreview}
                          className="
                            flex-1 h-[42px] rounded-full
                            border border-[#D1D5DB] bg-white
                            text-[13px] font-medium text-[#111827]
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
                            flex-1 h-[42px] rounded-full
                            bg-[#4443E4] text-white
                            text-[13px] font-semibold
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
                          <div className="absolute inset-x-0 bottom-0">
                            <div className="absolute inset-x-0 bottom-0 h-[190px] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="relative px-6 pb-6 pt-16">
                              <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/90">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-[6px] text-[12px] font-medium text-[#111827]">
                                  <span className="w-[8px] h-[8px] rounded-full bg-[#4443E4]" />
                                  {tagLabel}
                                </span>
                                {metaLine ? <span>{metaLine}</span> : null}
                              </div>
                              <div className="mt-3 text-white text-[24px] leading-[30px] font-semibold max-w-[860px]">
                                {title}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-6 py-5">
                          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-[6px] text-[12px] font-medium text-[#4443E4]">
                              <span className="w-[8px] h-[8px] rounded-full bg-[#4443E4]" />
                              {tagLabel}
                            </span>
                            {metaLine ? <span>{metaLine}</span> : null}
                          </div>
                          <div className="mt-4 text-[#111827] text-[22px] leading-[28px] font-semibold">
                            {title}
                          </div>
                        </div>
                      )}

                      <div className="px-6 pb-6 pt-5">
                        <div
                          ref={bodyRef}
                          className="blog-body"
                          dangerouslySetInnerHTML={{ __html: bodyHtml }}
                        />
                      </div>
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
