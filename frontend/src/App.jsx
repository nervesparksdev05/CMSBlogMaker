import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import AuthPage from "./Pages/AuthPage.jsx";
import CmsHomePage from "./Pages/CmsHomePage.jsx";
import CreateBlogPage from "./Pages/CreateBlogPage.jsx";
import CreateBlogTitlePage from "./Pages/CreateBlogTitlePage.jsx";
import CreateBlogIntroParagraphPage from "./Pages/CreateBlogIntroParagraphPage.jsx";
import CreateBlogOutlinePage from "./Pages/CreateBlogOutlinepage.jsx";
import CreateBlogImageUploadPage from "./Pages/CreateBlogImageUploadPage.jsx";
import ReviewInfoPage from "./Pages/ReviewInfoPage.jsx";
import GeneratedBlogPage from "./Pages/GeneratedBlogPage.jsx";
import SavedBlogPage from "./Pages/SavedBlogPage.jsx";
import NanoBananaPage from "./Pages/NanoBananaPage.jsx";
import PreviewEditedPage from "./Pages/PreviewEditedPage.jsx";
import GalleryPage from "./Pages/GalleryPage.jsx";
import { getStoredAuth } from "./lib/api.js";

function RequireAuth({ children }) {
  const location = useLocation();
  const auth = getStoredAuth();
  if (!auth?.access_token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  const isAuthed = Boolean(getStoredAuth()?.access_token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthed ? "/dashboard" : "/auth"} replace />} />

        <Route path="/auth" element={<AuthPage />} />

        <Route path="/dashboard" element={<RequireAuth><CmsHomePage /></RequireAuth>} />
        <Route path="/create-blog" element={<RequireAuth><CreateBlogPage /></RequireAuth>} />
        <Route path="/saved-blogs" element={<RequireAuth><SavedBlogPage /></RequireAuth>} />
        <Route path="/generate-image" element={<RequireAuth><NanoBananaPage /></RequireAuth>} />
        <Route path="/gallery" element={<RequireAuth><GalleryPage /></RequireAuth>} />

        <Route path="/create-blog/title" element={<RequireAuth><CreateBlogTitlePage /></RequireAuth>} />
        <Route path="/create-blog/intro" element={<RequireAuth><CreateBlogIntroParagraphPage /></RequireAuth>} />
        <Route path="/create-blog/outline" element={<RequireAuth><CreateBlogOutlinePage /></RequireAuth>} />
        <Route path="/create-blog/image" element={<RequireAuth><CreateBlogImageUploadPage /></RequireAuth>} />
        <Route path="/create-blog/review" element={<RequireAuth><ReviewInfoPage /></RequireAuth>} />
        <Route path="/create-blog/generated" element={<RequireAuth><GeneratedBlogPage /></RequireAuth>} />

        <Route path="/preview-edited" element={<RequireAuth><PreviewEditedPage /></RequireAuth>} />

        <Route path="*" element={<Navigate to={isAuthed ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
