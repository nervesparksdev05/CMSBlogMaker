// src/screen/GeneratedBlogPage.jsx
import { useMemo } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";


import FacebookIcon from "../assets/facebook-icon.svg";
import TwitterIcon from "../assets/twitter-icon.svg";
import LinkedInIcon from "../assets/linkedin-icon.svg";

export default function GeneratedBlogPage() {
  const toc = useMemo(
    () => [
      { id: "s1", label: "Exploring Generative AI in Content Creation", active: true },
      { id: "s2", label: "Steering Clear of Common AI Writing Pitfalls" },
      { id: "s3", label: "Understanding ChatGPT Capabilities - Define Your Style" },
      { id: "s4", label: "Understand Your Readers" },
      { id: "s5", label: "Creating Quality AI-powered Blogs that Stand Out" },
      { id: "s6", label: "Conclusion: Embracing AI in Blog Creation" },
    ],
    []
  );

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      {/* ✅ Sticky main header */}
      <div className="sticky top-0 z-[60]">
        <MainHeader />
      </div>

      {/* ✅ Improved HeaderBottomBar:
          - full width (across sidebar + content)
          - sticky under MainHeader
          - adds subtle shadow for separation
      */}
      <div className="sticky top-[76px] z-[55] w-full shadow-[0_1px_0_0_rgba(229,231,235,1)]">
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-10 pt-6 pb-10">
            <BackToDashBoardButton />


            {/* Main content row */}
            <div className="mt-6 flex gap-6 items-start">
              {/* LEFT: Table of contents */}
              <div className="w-[360px] shrink-0">
                <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
                  <div className="text-[18px] font-semibold text-[#111827]">
                    Table of contents
                  </div>

                  <div className="mt-4 space-y-4">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollTo(item.id)}
                        className={[
                          "w-full text-left rounded-[8px] px-3 py-2",
                          "hover:bg-[#F4F6FF]",
                          item.active ? "bg-[#F4F6FF]" : "bg-transparent",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={[
                              "mt-[3px] w-[3px] h-[24px] rounded-full",
                              item.active ? "bg-[#4443E4]" : "bg-transparent",
                            ].join(" ")}
                          />
                          <span
                            className={[
                              "text-[14px] leading-[20px]",
                              item.active
                                ? "text-[#1D4ED8] font-semibold"
                                : "text-[#111827] font-medium",
                            ].join(" ")}
                          >
                            {item.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
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
                {/* Hero card */}
                <div className="rounded-[14px] border border-[#E5E7EB] bg-white  shadow-sm">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80"
                      alt=""
                      className="w-full h-[260px] object-cover"
                      draggable={false}
                    />

                    {/* bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                      <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-[6px] text-[12px] font-medium text-[#111827]">
                          <span className="w-[8px] h-[8px] rounded-full bg-[#4443E4]" />
                          Artificial Intelligence
                        </div>

                        <div className="mt-3 text-white text-[26px] leading-[32px] font-semibold max-w-[920px]">
                          Mastering ChatGPT Blog Creation: Dos and Don&apos;ts for SaaS Marketing
                          Managers
                        </div>

                        <div className="mt-2 text-white/80 text-[12px]">
                          Oct 19 &nbsp;•&nbsp; 10 min read
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article */}
                <div className="mt-6">
                  <h1 id="s1" className="text-[22px] leading-[28px] font-semibold text-[#111827]">
                    Exploring Generative AI in Content Creation
                  </h1>

                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    Hello there! As a marketing manager in the SaaS industry, you might be looking
                    for tools to manipulate search rankings. There comes a time when many
                    experienced professionals want to communicate their insights but get stuck due
                    to limited writing skills — that&apos;s where <b>Generative AI</b> can step in.
                    <br />
                    <br />
                    So, together, we&apos;re going explore how this technology could help us deliver
                    valuable content without sounding robotic or defaulting into more regurgitations
                    of existing materials (spoiler alert — common pitfalls!). Hang tight — it&apos;ll
                    be a fun learning journey!
                  </div>

                  <h2 id="s2" className="mt-10 text-[22px] leading-[28px] font-semibold text-[#111827]">
                    Steering Clear of Common AI Writing Pitfalls
                  </h2>

                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    Jumping headfirst into using AI, like{" "}
                    <span className="text-[#2563EB] underline">ChatGPT</span>, without a content
                    strategy can lead to some unfortunate results. One common pitfall I&apos;ve seen
                    is people opting for <b>quantity over quality</b> - they churn out blogs, but
                    each one feels robotic and soulless, reading just like countless others on the
                    internet.
                    <br />
                    <br />
                    Another fault line lies in <b>creating reproductions</b> rather than delivering
                    unique perspectives that offer value to readers; it often happens if you let an
                    AI tool write your full blog unrestrained! Trust me on this — ask any
                    experienced marketer or writer about their takeaways from using generative AI
                    tools. They&apos;ll all agree that adding a human touch and following specific
                    guidelines are key when implementing these tech pieces.
                    <br />
                    <br />
                    Remember, our goal here isn&apos;t merely satisfying search engines but, more
                    importantly, <b>knowledge-hungry humans seeking reliable information online</b>.
                    So keep your audience&apos;s needs at heart while leveraging technology&apos;s
                    assistance!
                  </div>

                  <h2 id="s3" className="mt-10 text-[18px] leading-[24px] font-semibold text-[#111827]">
                    Understanding ChatGPT Capabilities - Define Your Style
                  </h2>
                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    Define what you want the model to sound like, and keep prompts consistent.
                    Consider tone, structure, and examples so outputs feel cohesive across sections.
                  </div>

                  <h2 id="s4" className="mt-10 text-[18px] leading-[24px] font-semibold text-[#111827]">
                    Understand Your Readers
                  </h2>
                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    AI can help draft content, but you must guide it using reader context — pain
                    points, sophistication level, and what &quot;success&quot; looks like for them.
                  </div>

                  <h2 id="s5" className="mt-10 text-[18px] leading-[24px] font-semibold text-[#111827]">
                    Creating Quality AI-powered Blogs that Stand Out
                  </h2>
                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    The most compelling posts happen when you combine AI speed with human judgment:
                    research, brand voice, and editing discipline.
                  </div>

                  <h2 id="s6" className="mt-10 text-[18px] leading-[24px] font-semibold text-[#111827]">
                    Conclusion: Embracing AI in Blog Creation
                  </h2>

                  <div className="mt-3 text-[14px] leading-[24px] text-[#111827]">
                    Let&apos;s be clear: ChatGPT wrote this article and generated the hero image. It
                    combined my personal experience, knowledge, and research. From the initial
                    notes to finish, it took just 37 minutes.
                    <br />
                    <br />
                    Even though it was made by AI, no detection tools could tell. The only thing
                    used was OpenAI&apos;s Chat API, no other external tools.
                    <br />
                    <br />
                    It shows how AI can help in making content interesting and relevant. It&apos;s a
                    new chapter in how we create and share information.
                  </div>

                  {/* Share bar */}
                  <div className="mt-10">
                    <div className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#0B1E85]">
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="text-white text-[14px] font-semibold">
                          Like what you see? Share with a friend.
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center"
                            aria-label="Share on Facebook"
                          >
                            <img src={FacebookIcon} alt="" className="w-[18px] h-[18px]" />
                          </button>

                          <button
                            type="button"
                            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center"
                            aria-label="Share on Twitter"
                          >
                            <img src={TwitterIcon} alt="" className="w-[18px] h-[18px]" />
                          </button>

                          <button
                            type="button"
                            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center"
                            aria-label="Share on LinkedIn"
                          >
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
