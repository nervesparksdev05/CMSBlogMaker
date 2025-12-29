// src/pages/CmsDashboard.jsx
import { useEffect, useState } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import FourCardsRow from "../interface/FourCardsRow";
import TemplateTableCard from "../interface/TemplateTableCard";

export default function CmsHomePage() {
  const [rows, setRows] = useState([
    {
      id: 1,
      blogTitle: "Lorem ipsum dolor",
      language: "English",
      tone: "Informative",
      creativity: "Regular",
      createdDate: "22 Jan 2022",
      createdBy: "Admin",
      status: "Saved",
    },
    {
      id: 2,
      blogTitle: "Lorem ipsum dolor",
      language: "English",
      tone: "Formal",
      creativity: "Regular",
      createdDate: "20 Jan 2022",
      createdBy: "Admin",
      status: "Saved",
    },
    {
      id: 3,
      blogTitle: "Lorem ipsum dolor",
      language: "English",
      tone: "Serious",
      creativity: "High",
      createdDate: "18 Jan 2022",
      createdBy: "Admin",
      status: "Published",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // ✅ keep selection valid if rows change
  useEffect(() => {
    const ids = new Set(rows.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => ids.has(id)));
  }, [rows]);

  const getRowId = (r) => r.id;

  const onToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (nextIds) => {
    setSelectedIds(nextIds);
  };

  const onDeleteRow = (row) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const onDeleteAll = () => {
    if (selectedIds.length) {
      const sel = new Set(selectedIds);
      setRows((prev) => prev.filter((r) => !sel.has(r.id)));
      setSelectedIds([]);
      return;
    }
    setRows([]);
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
      if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
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

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB]">
      {/* ✅ Sticky header stack */}
      <div className="sticky top-0 z-50 w-full">
        <MainHeader />
        <HeaderBottomBar title="Content Management System" />
      </div>

      <div className="w-full flex">
        <Sidebar />

        <div className="flex-1">
          <div className="px-8 py-6">
            <FourCardsRow />

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
                getRowId={getRowId}
                onDeleteRow={onDeleteRow}
                // ✅ IMPORTANT: DO NOT pass onViewDetails
                // so TemplateTableCard opens its default details modal
              />
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                className="text-[16px] font-medium text-[#2563EB] hover:underline"
                onClick={() => console.log("Show All clicked")}
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
