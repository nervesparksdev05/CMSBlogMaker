import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
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

export default function SavedBlogPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiGet("/blog?page=1&limit=50");
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

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = (nextIds) => setSelectedIds(nextIds);

  const deleteRow = async (row) => {
    try {
      await apiRequest(`/blogs/${row.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // ignore
    }
  };

  const deleteAll = async () => {
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

  const downloadAll = async () => {
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

  const badgeText = useMemo(() => `${rows.length} Blogs`, [rows.length]);

  const onViewDetails = (row) => {
    navigate(`/create-blog/generated?id=${row.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      <MainHeader />
      <HeaderBottomBar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6">
          <BackToDashBoardButton />

          <h1 className="mt-2 text-[28px] leading-[34px] font-semibold text-[#111827]">
            Saved Blogs
          </h1>

          <div className="mt-4">
            <TemplateTableCard
              title="Saved Blogs"
              badge={badgeText}
              subtitle="Check all Blogs with details"
              rows={rows}
              pageSize={7}
              searchValue={query}
              onSearchChange={setQuery}
              onDeleteAll={deleteAll}
              onDownloadAll={downloadAll}
              selectable
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              getRowId={(r) => r.id}
              showDots
              onDeleteRow={deleteRow}
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
