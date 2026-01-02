import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import FourCardsRow from "../interface/FourCardsRow";
import TemplateTableCard from "../interface/TemplateTableCard";
import { apiGet, apiRequest } from "../lib/api.js";

const formatDate = (value) => {
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

export default function CmsHomePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    total_blogs: 0,
    saved_blogs: 0,
    pending_blogs: 0,
    published_blogs: 0,
    generated_images: 0,
  });
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const statData = await apiGet("/blogs/stats");
        setStats(statData || {});
      } catch {
        // ignore
      }

      try {
        const list = await apiGet("/blog?page=1&limit=10");
        const items = (list?.items || []).map((item) => ({
          id: item.id,
          blogTitle: item.title,
          language: item.language || "English",
          tone: item.tone || "",
          creativity: item.creativity || "",
          createdDate: formatDate(item.created_at),
          createdBy: item.created_by,
          status: item.status,
        }));
        setRows(items);
      } catch {
        setRows([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const ids = new Set(rows.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => ids.has(id)));
  }, [rows]);

  const onToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (nextIds) => setSelectedIds(nextIds);

  const onDeleteRow = async (row) => {
    try {
      await apiRequest(`/blogs/${row.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // ignore
    }
  };

  const onDeleteAll = async () => {
    const ids = selectedIds.length ? selectedIds : rows.map((r) => r.id);
    for (const id of ids) {
      try {
        await apiRequest(`/blogs/${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedIds([]);
  };

  const onDownloadAll = () => {
    const headers = [
      "blogTitle",
      "language",
      "tone",
      "creativity",
      "createdDate",
      "createdBy",
      "status",
    ];

    const escapeCsv = (v) => {
      const s = String(v ?? "");
      if (/[\",\\n]/.test(s)) return `\"${s.replaceAll('\"', '\"\"')}\"`;
      return s;
    };

    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "blogs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const onViewDetails = (row) => {
    navigate(`/create-blog/generated?id=${row.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-8 py-6">
            <FourCardsRow
              blogsGenerated={stats.total_blogs}
              savedBlogs={stats.saved_blogs}
              generatedImages={stats.generated_images}
              publishedBlogs={stats.published_blogs}
            />

            <div className="mt-8">
              <TemplateTableCard
                title="Previous generated blog posts"
                subtitle={null}
                badge={null}
                rows={rows}
                pageSize={7}
                searchValue={search}
                onSearchChange={setSearch}
                onDeleteAll={onDeleteAll}
                onDownloadAll={onDownloadAll}
                selectable
                selectedIds={selectedIds}
                onToggleRow={onToggleRow}
                onToggleAll={onToggleAll}
                getRowId={(r) => r.id}
                showDots
                onDeleteRow={onDeleteRow}
                onViewDetails={onViewDetails}
              />
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                className="text-[16px] font-medium text-[#2563EB] hover:underline"
                onClick={() => navigate("/saved-blogs")}
              >
                Show All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
