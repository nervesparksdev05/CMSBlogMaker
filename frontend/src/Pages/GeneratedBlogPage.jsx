// src/screen/GeneratedBlogPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";

import FacebookIcon from "../assets/facebook-icon.svg";
import TwitterIcon from "../assets/twitter-icon.svg";
import LinkedInIcon from "../assets/linkedin-icon.svg";

const PREVIEW_STORAGE_KEY = "cms_preview_edited_html_v2";

const BLOG = {
  title:
    "Unlocking Innovation: A Student's Essential Introduction to AI in Healthcare",
  heroUrl:
    "http://127.0.0.1:8000/uploads/71ec914b6be54adb87643c3108d369f7.png",
  html: `<h1>Unlocking Innovation: A Student's Essential Introduction to AI in Healthcare</h1>
<p>The world of healthcare is undergoing a monumental transformation, and at its heart lies Artificial Intelligence. For students embarking on their journeys in medicine, nursing, public health, or health technology, understanding “AI in healthcare” isn’t just an advantage; it’s a necessity. This rapidly evolving field promises to reshape everything from diagnostics and treatment to patient management and drug discovery. As future healthcare leaders and practitioners, grasping the fundamentals of AI will equip you with the foresight and skills to navigate and contribute meaningfully to this exhilarating new era. Prepare to discover how intelligent systems are not just futuristic concepts, but practical tools already revolutionizing care.</p>

<h2 id="s1">What Exactly is AI in Healthcare?</h2>
<p>At its core, Artificial Intelligence refers to the ability of machines to perform tasks that typically require human intelligence. When we talk about AI in healthcare, we’re discussing algorithms and software designed to analyze complex medical data, learn from it, and make informed decisions or predictions.</p>
<p>Think of it less as a robot doctor and more as a super-smart assistant. Key branches of AI you’ll encounter include:</p>
<ul>
  <li><strong>Machine Learning (ML):</strong> Computers learn from data without explicit programming.</li>
  <li><strong>Deep Learning (DL):</strong> Neural networks excel at medical images and complex data.</li>
  <li><strong>Natural Language Processing (NLP):</strong> Understand and process clinical notes and research.</li>
</ul>
<p>These technologies enable systems to process information at a scale and speed impossible for humans, opening new avenues for diagnosis, treatment, and operational efficiency.</p>

<h2 id="s2">Why Should Healthcare Students Care About AI?</h2>
<p>As a student in the health sciences, you are entering a profession that is rapidly integrating technology. Understanding AI isn’t about becoming a programmer; it’s about being an informed, effective, and future-ready practitioner.</p>
<ul>
  <li><strong>Enhanced Diagnostics:</strong> Assist radiology/pathology in detecting subtle abnormalities.</li>
  <li><strong>Personalized Treatment:</strong> Tailor therapy using genetics, history, lifestyle.</li>
  <li><strong>Improved Outcomes:</strong> Better prediction, allocation, and faster interventions.</li>
  <li><strong>Research Acceleration:</strong> Drug discovery, clinical trials, new insights.</li>
  <li><strong>Career Readiness:</strong> Tech-literate clinicians will be in higher demand.</li>
</ul>

<h2 id="s3">AI in Action: Real-World Applications You'll Encounter</h2>
<p>The impact of AI in healthcare is no longer confined to sci-fi novels. Here are a few ways AI is already making a tangible difference:</p>
<ul>
  <li><strong>Medical Imaging:</strong> Faster, accurate scan analysis for early detection.</li>
  <li><strong>Drug Discovery:</strong> Identify candidates quickly from massive datasets.</li>
  <li><strong>Predictive Analytics:</strong> Forecast deterioration and outbreaks.</li>
  <li><strong>Robotics:</strong> Surgical precision and better rehabilitation.</li>
  <li><strong>Admin Efficiency:</strong> Automate scheduling, billing, documentation.</li>
</ul>

<h2 id="s4">Navigating the Future: Opportunities and Ethical Considerations</h2>
<p>While the promise of AI in healthcare is immense, it’s crucial to approach this revolution with a balanced perspective.</p>
<p><strong>Opportunities:</strong></p>
<ul>
  <li><strong>Access to care:</strong> Extend expertise to underserved regions.</li>
  <li><strong>Disease prevention:</strong> Shift from reactive to proactive care.</li>
  <li><strong>Reduced burden:</strong> Reduce burnout by automating routine work.</li>
</ul>
<p><strong>Ethical considerations:</strong></p>
<ul>
  <li><strong>Privacy:</strong> Protect sensitive patient data.</li>
  <li><strong>Bias:</strong> Prevent models from amplifying disparities.</li>
  <li><strong>Accountability:</strong> Define responsibility for AI-assisted decisions.</li>
  <li><strong>Human oversight:</strong> AI assists; clinicians remain essential.</li>
</ul>

<h2 id="s5">Your Role in the AI Revolution: Getting Started</h2>
<ol>
  <li><strong>Embrace digital literacy:</strong> Understand basic concepts.</li>
  <li><strong>Cultivate critical thinking:</strong> Question outputs and limitations.</li>
  <li><strong>Learn data literacy:</strong> Know how data is collected and used.</li>
  <li><strong>Promote ethics:</strong> Advocate for responsible AI.</li>
  <li><strong>Collaborate:</strong> Work across disciplines to build solutions.</li>
</ol>

<h2 id="s6">Conclusion</h2>
<p>The integration of AI into healthcare is not a distant future; it’s happening now. For the next generation of healthcare leaders, understanding AI is a foundational skill—helping you innovate, improve outcomes, and build a healthier world. Stay curious and be ready to lead in this new era.</p>

<h2 id="refs">References</h2>
<ul>
  <li><a href="https://www.who.int" target="_blank" rel="noreferrer">https://www.who.int</a></li>
  <li><a href="https://www.nih.gov" target="_blank" rel="noreferrer">https://www.nih.gov</a></li>
</ul>`,
};

export default function GeneratedBlogPage() {
  const navigate = useNavigate();

  const toc = useMemo(
    () => [
      { id: "s1", label: "What Exactly is AI in Healthcare?" },
      { id: "s2", label: "Why Should Healthcare Students Care About AI?" },
      { id: "s3", label: "AI in Action: Real-World Applications You'll Encounter" },
      { id: "s4", label: "Navigating the Future: Opportunities and Ethical Considerations" },
      { id: "s5", label: "Your Role in the AI Revolution: Getting Started" },
      { id: "s6", label: "Conclusion" },
      { id: "refs", label: "References" },
    ],
    []
  );

  const [activeId, setActiveId] = useState(toc[0]?.id || "s1");

  useEffect(() => {
    const ids = toc.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id && ids.includes(visible.target.id)) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePreview = () => {
    localStorage.setItem(
      PREVIEW_STORAGE_KEY,
      JSON.stringify({
        title: BLOG.title,
        heroUrl: BLOG.heroUrl,
        html: BLOG.html,
      })
    );
    navigate("/preview-edited");
  };

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

            <div className="mt-6 flex gap-6 items-start">
              {/* LEFT: TOC */}
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
                      onClick={() => alert("Publish will be connected later")}
                      className="
                        flex-1 h-[44px] rounded-full
                        bg-[#4443E4] text-white
                        text-[14px] font-semibold
                        hover:opacity-95
                      "
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: Hero + Article */}
              <div className="flex-1 min-w-0">
                <div className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
                  <div className="relative">
                    <img
                      src={BLOG.heroUrl}
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
                          {BLOG.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm p-6">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: BLOG.html }}
                    />
                  </div>

                  {/* Share bar */}
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
            {/* /Main row */}
          </div>
        </div>
      </div>
    </div>
  );
}
