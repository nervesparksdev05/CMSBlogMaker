// src/interface/ReviewInformationTemplate.jsx
import ReviewIcon from "../assets/review-icon.svg";
import PenIcon from "../assets/pen-icon.svg";

function SectionTop({ title, helper, editText = "change", onEdit }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="text-[20px] font-semibold text-[#111827]">{title}</div>

          {/* ✅ clickable change button */}
          <button
            type="button"
            onClick={onEdit}
            disabled={!onEdit}
            className={[
              "shrink-0 flex items-center gap-2 text-[14px] font-medium",
              onEdit
                ? "text-[#4443E4] hover:opacity-90"
                : "text-[#9CA3AF] cursor-not-allowed",
            ].join(" ")}
            aria-label={`Change ${title}`}
            title={onEdit ? `Change ${title}` : "No action"}
          >
            <img
              src={PenIcon}
              alt=""
              className={[
                "w-[14px] h-[14px]",
                onEdit ? "opacity-100" : "opacity-60",
              ].join(" ")}
            />
            {editText}
          </button>
        </div>

        {helper ? (
          <p className="mt-2 text-[13px] leading-[20px] text-[#6B7280] max-w-[980px]">
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-[14px] font-semibold text-[#111827] mb-2">
      {children}
    </div>
  );
}

function ReadonlyBox({ value, className = "" }) {
  return (
    <div
      className={[
        "w-full rounded-[10px] border border-[#E5E7EB] bg-white",
        "px-4 py-3",
        "text-[15px] text-[#111827]",
        "leading-[22px]",
        className,
      ].join(" ")}
    >
      {value}
    </div>
  );
}

export default function ReviewInformationTemplate({
  pageTitle = "Review Information",
  helperText =
    "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.",

  blogLanguage = "English",
  blogTone = "Informative",
  blogCreativity = "Regular",
  blogAbout =
    "You are a tech blogger who writes informative and engaging content about emerging technologies",
  blogKeywords = "Tech, AI, Startups, Learners",
  blogAudience = "Researchers, Students, Tech Enthusiasts",
  blogReferences = "www.example.com, www.example2.com, www.example3.com",

  blogTitle = "The AI Revolution: Transforming Society as We Know It",

  blogIntro =
    "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum interdum sit.Lorem ipsum",

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

  headerImageSrc = "",

  // ✅ NEW: edit handlers (wire these from ReviewInfoPage)
  onEditBlogDetails,
  onEditBlogTitle,
  onEditBlogIntro,
  onEditBlogOutline,
  onEditBlogImage,
}) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[980px] rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm px-10 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px]">
            <img src={ReviewIcon} alt="" className="w-[28px] h-[28px]" />
          </div>
          <div className="text-[24px] font-semibold text-[#111827]">
            {pageTitle}
          </div>
        </div>

        {/* BLOG DETAILS */}
        <div className="mt-8">
          <SectionTop
            title="Blog Details"
            helper={helperText}
            onEdit={onEditBlogDetails} // ✅ /create-blog
          />

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div>
              <Label>Language</Label>
              <ReadonlyBox
                value={blogLanguage}
                className="h-[48px] flex items-center py-0"
              />
            </div>

            <div>
              <Label>Tone of Blog</Label>
              <ReadonlyBox
                value={blogTone}
                className="h-[48px] flex items-center py-0"
              />
            </div>

            <div>
              <Label>Creativity</Label>
              <ReadonlyBox
                value={blogCreativity}
                className="h-[48px] flex items-center py-0"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label>What do you want me to write about?</Label>
            <ReadonlyBox value={blogAbout} className="min-h-[70px]" />
          </div>

          <div className="mt-6">
            <Label>Target Keywords</Label>
            <ReadonlyBox
              value={blogKeywords}
              className="h-[48px] flex items-center py-0"
            />
          </div>

          <div className="mt-6">
            <Label>Target Audience</Label>
            <ReadonlyBox
              value={blogAudience}
              className="h-[48px] flex items-center py-0"
            />
          </div>

          <div className="mt-6">
            <Label>Reference Links</Label>
            <ReadonlyBox
              value={blogReferences}
              className="h-[48px] flex items-center py-0"
            />
          </div>
        </div>

        {/* BLOG TITLE */}
        <div className="mt-10 pt-8 border-t border-[#EEF2F7]">
          <SectionTop
            title="Blog Title"
            helper={helperText}
            onEdit={onEditBlogTitle} // ✅ /create-blog/title
          />
          <div className="mt-4">
            <ReadonlyBox
              value={blogTitle}
              className="h-[48px] flex items-center py-0"
            />
          </div>
        </div>

        {/* BLOG INTRODUCTION */}
        <div className="mt-10 pt-8 border-t border-[#EEF2F7]">
          <SectionTop
            title="Blog Introduction"
            helper={helperText}
            onEdit={onEditBlogIntro} // ✅ /create-blog/intro
          />
          <div className="mt-4">
            <ReadonlyBox value={blogIntro} className="min-h-[90px]" />
          </div>
        </div>

        {/* BLOG OUTLINED */}
        <div className="mt-10 pt-8 border-t border-[#EEF2F7]">
          <SectionTop
            title="Blog Outlined"
            helper={helperText}
            onEdit={onEditBlogOutline} // ✅ /create-blog/outline
          />

          <div className="mt-4 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-5 py-4">
            <ul className="list-disc pl-5 text-[15px] text-[#111827] space-y-2">
              {Array.isArray(blogOutline) &&
                blogOutline.map((item, idx) => {
                  if (Array.isArray(item)) {
                    return (
                      <li key={`nest-wrap-${idx}`} className="list-none">
                        <ul className="list-disc pl-6 mt-1 space-y-2">
                          {item.map((sub, j) => (
                            <li key={`sub-${idx}-${j}`}>{sub}</li>
                          ))}
                        </ul>
                      </li>
                    );
                  }
                  return <li key={`li-${idx}`}>{item}</li>;
                })}
            </ul>
          </div>
        </div>

        {/* HEADER SELECTED IMAGE */}
        <div className="mt-10 pt-8 border-t border-[#EEF2F7]">
          <SectionTop
            title="Header Selected Image"
            helper={helperText}
            onEdit={onEditBlogImage} // ✅ /create-blog/image
          />

          <div className="mt-5 flex justify-center">
            <div className="w-full max-w-[640px]">
              {headerImageSrc ? (
                <img
                  src={headerImageSrc}
                  alt="Header Selected"
                  className="w-full h-[260px] rounded-[10px] border border-[#E5E7EB] object-cover"
                />
              ) : (
                <div className="w-full h-[260px] rounded-[10px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex items-center justify-center text-[14px] text-[#6B7280]">
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
