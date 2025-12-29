// src/interface/ReviewInformationTemplate.jsx
import ReviewIcon from "../assets/review-icon.svg";

function PencilIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 20h9"
        stroke="#4443E4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
        stroke="#4443E4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionTop({ title, helper, onEdit, editText = "Edit" }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
        {helper ? (
          <p className="mt-[6px] text-[11px] leading-[16px] text-[#6B7280] max-w-[980px]">
            {helper}
          </p>
        ) : null}
      </div>

      {typeof onEdit === "function" ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-[6px] text-[12px] font-medium text-[#4443E4] hover:opacity-90"
        >
          <PencilIcon size={14} />
          {editText}
        </button>
      ) : null}
    </div>
  );
}

function ReadonlyBox({ value, className = "" }) {
  return (
    <div
      className={[
        "w-full min-h-[44px] rounded-[6px] border border-[#E5E7EB] bg-white",
        "px-[14px] py-[10px]",
        "text-[13px] text-[#374151]",
        className,
      ].join(" ")}
    >
      {value}
    </div>
  );
}

export default function ReviewInformationTemplate({
  // header
  pageTitle = "Review Information",

  // common helper (matches screenshot lorem)
  helperText =
    "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.",

  // BLOG DETAILS
  blogLanguage = "English",
  blogTone = "Informative",
  blogCreativity = "Regular",
  blogAbout =
    "You are a tech blogger who writes informative and engaging content about emerging technologies",
  blogKeywords = "Tech, AI, Startups, Learners",
  blogAudience = "Researchers, Students, Tech Enthusiasts",
  blogReferences = "www.example.com, www.example2.com, www.example3.com",
  onEditBlogDetails,

  // BLOG TITLE
  blogTitle = "The AI Revolution: Transforming Society as We Know It",
  onEditBlogTitle,

  // BLOG INTRODUCTION
  blogIntro =
    "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum interdum sit.Lorem ipsum",
  onEditBlogIntro,

  // BLOG OUTLINE
  blogOutline = [
    "Introduction to Artificial Intelligence (AI)",
    "What is AI and How Does It Work?",
    "Evolution of AI: From Theory to Reality",
    "Applications of AI in Society",
    ["Healthcare", "Manufacturing", "Finance", "Education", "Transportation"],
    "Benefits and Concerns of AI",
    "Ethical Implications of AI",
    "The Future of AI: Predictions and Possibilities",
    "Challenges and Limitations of AI",
    "Impact on the Job Market: Will Robots Replace Humans?",
    "Government Regulation and Oversight of AI",
    "Conclusion: Embracing the Potential of AI while Addressing",
  ],
  onEditBlogOutline,

  // HEADER IMAGE
  headerImageSrc = "",
  onEditHeaderImage,
}) {
  return (
    <div className="w-full ">
      <div className="w-full rounded-[10px] px-[22px] py-[18px]">
        {/* Page Header */}
        <div className="flex items-center gap-[10px]">
          <div className="w-[22px] h-[22px] flex items-center justify-center">
            <img src={ReviewIcon} alt="" className="w-[18px] h-[18px]" />
          </div>

          <div className="text-[16px] font-semibold text-[#111827]">
            {pageTitle}
          </div>
        </div>

        {/* BLOG DETAILS */}
        <div className="mt-[18px]">
          <SectionTop title="Blog Details" helper={helperText} onEdit={onEditBlogDetails} />

          {/* 3 fields row */}
          <div className="mt-[14px] grid grid-cols-3 gap-[18px]">
            <div>
              <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
                Language
              </div>
              <ReadonlyBox value={blogLanguage} className="h-[40px] flex items-center py-0" />
            </div>

            <div>
              <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
                Tone of Blog
              </div>
              <ReadonlyBox value={blogTone} className="h-[40px] flex items-center py-0" />
            </div>

            <div>
              <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
                Creativity
              </div>
              <ReadonlyBox value={blogCreativity} className="h-[40px] flex items-center py-0" />
            </div>
          </div>

          {/* About */}
          <div className="mt-[16px]">
            <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
              What do you want me to write about?
            </div>
            <ReadonlyBox value={blogAbout} className="min-h-[56px]" />
          </div>

          {/* Keywords */}
          <div className="mt-[14px]">
            <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
              Target Keywords
            </div>
            <ReadonlyBox value={blogKeywords} className="h-[44px] flex items-center py-0" />
          </div>

          {/* Audience */}
          <div className="mt-[14px]">
            <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
              Target Audience
            </div>
            <ReadonlyBox value={blogAudience} className="h-[44px] flex items-center py-0" />
          </div>

          {/* References */}
          <div className="mt-[14px]">
            <div className="text-[12px] font-semibold text-[#111827] mb-[6px]">
              Reference Links
            </div>
            <ReadonlyBox value={blogReferences} className="h-[44px] flex items-center py-0" />
          </div>
        </div>

        {/* BLOG TITLE */}
        <div className="mt-[24px] pt-[16px]">
          <SectionTop title="Blog Title" helper={helperText} onEdit={onEditBlogTitle} />
          <div className="mt-[12px]">
            <ReadonlyBox value={blogTitle} className="h-[44px] flex items-center py-0" />
          </div>
        </div>

        {/* BLOG INTRODUCTION */}
        <div className="mt-[24px] pt-[16px]">
          <SectionTop
            title="Blog Introduction"
            helper={helperText}
            onEdit={onEditBlogIntro}
          />
          <div className="mt-[12px]">
            <ReadonlyBox value={blogIntro} className="min-h-[72px]" />
          </div>
        </div>

        {/* BLOG OUTLINED */}
        <div className="mt-[24px] pt-[16px]">
          <SectionTop title="Blog Outlined" helper={helperText} onEdit={onEditBlogOutline} />

          <div className="mt-[12px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-[14px] py-[12px]">
            <ul className="list-disc pl-[18px] text-[13px] text-[#111827] space-y-[6px]">
              {Array.isArray(blogOutline) &&
                blogOutline.map((item, idx) => {
                  // Support nested bullet list (like Healthcare, Manufacturing...)
                  if (Array.isArray(item)) {
                    return (
                      <ul
                        key={`nested-${idx}`}
                        className="list-disc pl-[18px] mt-[6px] space-y-[6px]"
                      >
                        {item.map((sub, j) => (
                          <li key={`sub-${idx}-${j}`} className="text-[#111827]">
                            {sub}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <li key={`li-${idx}`} className="text-[#111827]">
                      {item}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        {/* HEADER SELECTED IMAGE */}
        <div className="mt-[24px] pt-[16px]">
          <SectionTop
            title="Header Selected Image"
            helper={helperText}
            onEdit={onEditHeaderImage}
          />

          <div className="mt-[12px] flex justify-center">
            <div className="w-full max-w-[560px]">
              {headerImageSrc ? (
                <img
                  src={headerImageSrc}
                  alt="Header Selected"
                  className="w-full rounded-[6px] border border-[#E5E7EB] object-cover"
                />
              ) : (
                <div className="w-full h-[220px] rounded-[6px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex items-center justify-center text-[13px] text-[#6B7280]">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
