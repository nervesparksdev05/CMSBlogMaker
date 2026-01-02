// src/interface/TemplateTableCard.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import CheckBox from "../assets/checkbox.svg";
import EmptyCheckbox from "../assets/checkbox-empty.svg";
import TripleDot from "../assets/triple-dot.svg";

const pillClass = (status = "Saved") => {
  const s = String(status).toLowerCase();
  if (s === "published") return "bg-[#EEF2FF] text-[#4443E4] border-[#C7D2FE]";
  if (s === "pending") return "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";
  return "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]";
};

export default function TemplateTableCard({
  title = "Saved Blogs",
  badge = "5000 Blogs",
  subtitle = "Check all Blogs with details",

  rows = [],
  pageSize = 7,

  searchValue = "",
  onSearchChange,

  onDeleteAll,
  onDownloadAll,
  downloadAllLabel = "Download All Blog as PDF",
  downloadAllDisabled = false,

  // selection
  selectable = true,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  getRowId = (r) => r.id,

  // row actions
  showDots = true,
  onDeleteRow, // (row) => void
  onViewDetails, // (row) => void  ✅ use this to navigate to Generated Blog Page

  className = "",
}) {
  // search
  const filtered = useMemo(() => {
    const q = String(searchValue).trim().toLowerCase();
    if (!q) return rows || [];
    return (rows || []).filter((r) =>
      [
        r?.blogTitle,
        r?.language,
        r?.tone,
        r?.creativity,
        r?.createdDate,
        r?.createdBy,
        r?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, searchValue]);

  // pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setPage(1), [searchValue]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // selection (only current page)
  const pageIds = useMemo(() => pageRows.map(getRowId), [pageRows, getRowId]);
  const allSelected =
    selectable &&
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    if (!onToggleAll) return;
    if (allSelected) {
      const set = new Set(pageIds);
      onToggleAll(selectedIds.filter((id) => !set.has(id)));
    } else {
      onToggleAll(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  // 3-dots menu (NO MODAL anymore)
  const [menu, setMenu] = useState({ open: false, row: null, x: 0, y: 0 });
  const menuRef = useRef(null);

  const closeMenu = () => setMenu({ open: false, row: null, x: 0, y: 0 });

  const openMenu = (row, e) => {
    e?.stopPropagation?.();
    const rect = e.currentTarget.getBoundingClientRect();

    const width = 180;
    const x = Math.max(12, Math.min(window.innerWidth - width - 12, rect.right - width));
    const y = rect.bottom + 8;

    setMenu({ open: true, row, x, y });
  };

  useEffect(() => {
    if (!menu.open) return;

    const onDown = (ev) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(ev.target)) closeMenu();
    };
    const onKey = (ev) => {
      if (ev.key === "Escape") closeMenu();
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu.open]);

  const viewDetails = (row) => {
    // ✅ redirect to GeneratedBlogPage (handled by parent)
    onViewDetails?.(row);
    closeMenu();
  };

  const deleteItem = (row) => {
    onDeleteRow?.(row);
    closeMenu();
  };

  return (
    <div
      className={[
        "w-full rounded-[10px] border border-[#E5E7EB] bg-white ",
        className,
      ].join(" ")}
    >
      {/* header */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>
            {badge ? (
              <span className="px-3 py-[3px] rounded-full bg-[#EDEDFF] text-[#4443E4] text-[12px] font-semibold">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-[13px] text-[#6B7280]">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDeleteAll}
            className="h-[40px] px-6 rounded-[10px] bg-white border border-[#D1D5DB] text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
          >
            Delete all
          </button>

          <button
            type="button"
            onClick={onDownloadAll}
            disabled={downloadAllDisabled}
            className={[
              "h-[40px] px-6 rounded-[10px] bg-[#4443E4] text-white text-[14px] font-medium flex items-center gap-2",
              downloadAllDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-95",
            ].join(" ")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M8 10l4 4 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M4 17v3h16v-3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {downloadAllLabel}
          </button>
        </div>
      </div>

      {/* search */}
      <div className="px-6 pb-4 flex items-center justify-end">
        <div className="relative w-[360px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>

          <input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search"
            className="w-full h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white pl-11 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>
      </div>

      {/* table */}
      <table className="w-full">
        <thead className="bg-[#F4F6FF]">
          <tr className="text-left">
            {selectable ? (
              <th className="w-[56px] px-6 py-4">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="w-5 h-5 flex items-center justify-center"
                >
                  <img
                    src={allSelected ? CheckBox : EmptyCheckbox}
                    alt=""
                    className="w-5 h-5"
                  />
                </button>
              </th>
            ) : null}

            {[
              "Blog Title",
              "Language",
              "Tone",
              "Creativity",
              "Created Date",
              "Created By",
              "Status",
            ].map((h) => (
              <th key={h} className="px-4 py-4 text-[13px] font-medium text-[#6B7280]">
                {h}
              </th>
            ))}

            {showDots ? <th className="w-[56px] px-4 py-4" /> : null}
          </tr>
        </thead>

        <tbody>
          {pageRows.map((row) => {
            const id = getRowId(row);
            const checked = selectable ? selectedIds.includes(id) : false;

            return (
              <tr key={id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAFF]">
                {selectable ? (
                  <td className="w-[56px] px-6 py-5">
                    <button
                      type="button"
                      onClick={() => onToggleRow?.(id)}
                      className="w-5 h-5 flex items-center justify-center"
                    >
                      <img
                        src={checked ? CheckBox : EmptyCheckbox}
                        alt=""
                        className="w-5 h-5"
                      />
                    </button>
                  </td>
                ) : null}

                <td className="px-4 py-5 text-[14px] font-semibold text-[#111827]">
                  {row?.blogTitle ?? ""}
                </td>
                <td className="px-4 py-5 text-[14px] text-[#6B7280]">{row?.language ?? ""}</td>
                <td className="px-4 py-5 text-[14px] text-[#6B7280]">{row?.tone ?? ""}</td>
                <td className="px-4 py-5 text-[14px] text-[#6B7280]">{row?.creativity ?? ""}</td>
                <td className="px-4 py-5 text-[14px] text-[#6B7280]">{row?.createdDate ?? ""}</td>
                <td className="px-4 py-5 text-[14px] text-[#6B7280]">{row?.createdBy ?? ""}</td>

                <td className="px-4 py-5">
                  <span
                    className={[
                      "inline-flex items-center px-3 py-[6px] rounded-full border text-[12px] font-semibold",
                      pillClass(row?.status),
                    ].join(" ")}
                  >
                    {row?.status ?? "Saved"}
                  </span>
                </td>

                {showDots ? (
                  <td className="w-[56px] px-4 py-5">
                    <button
                      type="button"
                      onClick={(e) => openMenu(row, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6]"
                    >
                      <img src={TripleDot} alt="" className="w-4 h-4" />
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}

          {pageRows.length === 0 ? (
            <tr>
              <td
                colSpan={(selectable ? 1 : 0) + 7 + (showDots ? 1 : 0)}
                className="px-6 py-10 text-center text-[14px] text-[#6B7280]"
              >
                No records found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* footer */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-[14px] text-[#111827]">{`Page ${page} of ${totalPages}`}</div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={[
              "h-[40px] px-5 rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]",
              page === 1 ? "opacity-50 cursor-not-allowed hover:bg-white" : "",
            ].join(" ")}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={[
              "h-[40px] px-6 rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB]",
              page === totalPages ? "opacity-50 cursor-not-allowed hover:bg-white" : "",
            ].join(" ")}
          >
            Next
          </button>
        </div>
      </div>

      {/* 3 dots dropdown */}
      {menu.open ? (
        <div
          ref={menuRef}
          style={{ left: menu.x, top: menu.y }}
          className="fixed z-[9998] w-[180px] rounded-[12px] bg-white border border-[#E5E7EB] shadow-lg"
        >
          <button
            onClick={() => viewDetails(menu.row)}
            className="w-full px-4 py-3 text-left text-[14px] text-[#111827] hover:bg-[#F9FAFB]"
          >
            View details
          </button>

          <button
            onClick={() => deleteItem(menu.row)}
            className="w-full px-4 py-3 text-left text-[14px] text-[#DC2626] hover:bg-[#FEF2F2]"
          >
            Delete item
          </button>
        </div>
      ) : null}
    </div>
  );
}
