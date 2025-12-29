// src/SavedBlogPage.jsx
import { useMemo, useState } from "react";

import MainHeader from "../interface/MainHeader";
import HeaderBottomBar from "../interface/HeaderBottomBar";
import Sidebar from "../interface/SidebarInterface";
import BackToDashBoardButton from "../buttons/BackToDashBoardButton";
import TemplateTableCard from "../interface/TemplateTableCard";

export default function SavedBlogPage() {
  const [rows, setRows] = useState(() => [
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
      tone: "Informative",
      creativity: "Regular",
      createdDate: "22 Jan 2022",
      createdBy: "Admin",
      status: "Saved",
    },
    {
      id: 3,
      blogTitle: "Lorem ipsum dolor",
      language: "English",
      tone: "Formal",
      creativity: "Regular",
      createdDate: "20 Jan 2022",
      createdBy: "Admin",
      status: "Pending",
    },
    {
      id: 4,
      blogTitle: "Lorem ipsum dolor",
      language: "English",
      tone: "Serious",
      creativity: "High",
      createdDate: "18 Jan 2022",
      createdBy: "Admin",
      status: "Published",
    },
  ]);

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = (nextIds) => setSelectedIds(nextIds);

  const deleteAll = () => {
    setRows([]);
    setSelectedIds([]);
  };

  const deleteRow = (row) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setSelectedIds((prev) => prev.filter((id) => id !== row.id));
  };

  const downloadAll = async () => {
    alert("TODO: Call backend to Download All Blogs as PDF");
  };

  const filterClick = () => {
    alert("TODO: Open filters panel/modal");
  };

  const badgeText = useMemo(() => `${rows.length} Blogs`, [rows.length]);

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
              onFilterClick={filterClick}
              onDeleteAll={deleteAll}
              onDownloadAll={downloadAll}
              selectable
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              getRowId={(r) => r.id}
              showDots
              onDeleteRow={deleteRow}
              // If you want custom modal content, pass renderDetails:
              // renderDetails={(row) => <div>custom UI here</div>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
