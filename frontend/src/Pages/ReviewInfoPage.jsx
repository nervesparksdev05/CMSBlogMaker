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
  const blogLanguage = "English";
  const blogTone = "Informative";
  const blogCreativity = "Regular";
  const blogAbout = "You are a tech blogger who writes informative and engaging content about emerging technologies";
  const blogKeywords = "Tech, AI, Startups, Learners";
  const blogAudience = "Researchers, Students, Tech Enthusiasts";
  const blogReferences = "www.example.com, www.example2.com, www.example3.com";
  
  const blogTitle = "The AI Revolution: Transforming Society as We Know It";
  
  const blogIntro = "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum interdum sit.Lorem ipsum";
  
  const blogOutline = [
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
  ];
  
  const headerImageSrc = ""; // Add your image URL here

  const helperText = "Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.Lorem ipsum dolor sit amet consectetur. Congue et fringilla dictum ac id elit porttitor interdum sit.";

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

            {/* ✅ Review Information Template */}
            <div className="mt-10 flex justify-center">
              <ReviewInformationTemplate
                pageTitle="Review Information"
                helperText={helperText}
                
                blogLanguage={blogLanguage}
                blogTone={blogTone}
                blogCreativity={blogCreativity}
                blogAbout={blogAbout}
                blogKeywords={blogKeywords}
                blogAudience={blogAudience}
                blogReferences={blogReferences}
                onEditBlogDetails={() => console.log("Edit blog details")}
                
                blogTitle={blogTitle}
                onEditBlogTitle={() => console.log("Edit blog title")}
                
                blogIntro={blogIntro}
                onEditBlogIntro={() => console.log("Edit blog intro")}
                
                blogOutline={blogOutline}
                onEditBlogOutline={() => console.log("Edit blog outline")}
          
              />
            </div>

            {/* Footer */}
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