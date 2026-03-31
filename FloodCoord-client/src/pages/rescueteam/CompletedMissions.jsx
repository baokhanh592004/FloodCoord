import { useEffect, useState, useMemo } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

function StarRating({ rating }) {
  if (!rating) return <span className="text-gray-400 italic text-xs">Chưa đánh giá</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <StarSolidIcon key={star} className="h-3.5 w-3.5 text-amber-400" />
        ) : (
          <StarIcon key={star} className="h-3.5 w-3.5 text-gray-300" />
        )
      )}
      <span className="ml-1 text-xs font-medium text-amber-600">{rating}/5</span>
    </div>
  );
}

function DetailModal({ mission, onClose }) {
  if (!mission) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Chi tiết nhiệm vụ</h2>
              <p className="text-xs text-gray-500 font-mono font-medium tracking-wide">#{mission.trackingCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Thông tin yêu cầu */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Thông tin yêu cầu</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 w-32 shrink-0">Tiêu đề:</span>
                <span className="font-semibold text-gray-900 text-right">{mission.title || "Yêu cầu cứu hộ"}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 w-32 shrink-0">Người báo tin:</span>
                <span className="font-medium text-gray-800 text-right">{mission.contactName} - <span className="text-blue-600 font-bold">{mission.contactPhone}</span></span>
              </div>
              <div className="flex gap-2 bg-blue-50/50 rounded-xl border border-blue-100 p-3 mt-2">
                <MapPinIcon className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-0.5">Địa chỉ cứu hộ</p>
                  <p className="text-sm text-gray-800 leading-snug">{mission.location?.addressText || "Không có thông tin địa chỉ"}</p>
                </div>
              </div>
              {mission.description && (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 mt-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Mô tả sự cố:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{mission.description}</p>
                </div>
              )}
              {mission.completedAt && (
                <div className="flex justify-between items-start text-sm mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500 w-32 shrink-0">Hoàn thành lúc:</span>
                  <span className="font-semibold text-emerald-600 text-right">{formatDate(mission.completedAt)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Lực lượng & Trang bị */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Lực lượng & Phương tiện</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Đội phụ trách</span>
                <span className="font-semibold text-gray-800 block">{mission.assignedTeamName || "—"}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Phương tiện</span>
                <span className="font-semibold text-gray-800 block">{mission.vehicle?.name || "—"} {mission.vehicle?.licensePlate ? `(${mission.vehicle.licensePlate})` : ""}</span>
              </div>
              {mission.supplies && mission.supplies.length > 0 && (
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Vật tư mang theo</span>
                  <div className="flex flex-wrap gap-2">
                    {mission.supplies.map((s, idx) => (
                      <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {s.supplyName}: {s.quantity} {s.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Báo cáo tổng kết */}
          {mission.report && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 border-b border-emerald-100 pb-2 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                Báo cáo tổng kết nhiệm vụ
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                  <span className="text-xs text-emerald-600 font-semibold block mb-1">Thời gian báo cáo</span>
                  <span className="font-bold text-emerald-900 block text-sm">{formatDate(mission.report.reportedAt)}</span>
                </div>
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                  <span className="text-xs text-emerald-600 font-semibold block mb-1">Số người thực tế cứu</span>
                  <span className="font-bold text-emerald-900 block text-sm">{mission.report.rescuedPeople} người</span>
                </div>
              </div>
              {mission.report.reportNote && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-2">
                  <span className="text-xs text-gray-500 font-semibold block mb-1">Ghi chú từ đội trưởng:</span>
                  <span className="text-sm text-gray-800 leading-relaxed block">{mission.report.reportNote}</span>
                </div>
              )}
            </section>
          )}

          {/* Đánh giá */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Phản hồi từ người dân</h3>
            {mission.citizenFeedback || mission.citizenRating ? (
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
                {mission.citizenFeedback && (
                  <p className="text-sm text-gray-800 italic leading-relaxed mb-3">"{mission.citizenFeedback}"</p>
                )}
                {mission.citizenRating && (
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-100/50">
                    <span className="text-xs font-semibold text-purple-700">Đánh giá chung:</span>
                    <StarRating rating={mission.citizenRating} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-sm text-gray-500 italic">Người dân chưa để lại đánh giá hoặc nhận xét.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompletedMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const res = await rescueTeamApi.getCompletedMissions();
      setMissions(res || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, ratingFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const filtered = useMemo(() => {
    return missions.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        m.trackingCode?.toLowerCase().includes(q) ||
        m.location?.addressText?.toLowerCase().includes(q) ||
        m.title?.toLowerCase().includes(q);
      const matchRating =
        ratingFilter === "ALL" ||
        (ratingFilter === "RATED" && m.citizenRating) ||
        (ratingFilter === "UNRATED" && !m.citizenRating);
      return matchSearch && matchRating;
    });
  }, [missions, search, ratingFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const avgRating = useMemo(() => {
    const rated = missions.filter((m) => m.citizenRating);
    if (!rated.length) return null;
    return (rated.reduce((acc, m) => acc + m.citizenRating, 0) / rated.length).toFixed(1);
  }, [missions]);

  const ratedCount = missions.filter((m) => m.citizenRating).length;

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lịch sử cứu hộ</h1>
          <p className="text-xs text-gray-500">Danh sách các nhiệm vụ đã hoàn thành và đánh giá từ người dân.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400">
              Cập nhật: {lastRefresh.toLocaleTimeString("vi-VN")}
            </span>
          )}
          <button
            onClick={loadMissions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Stat badges */}
      <div className="flex-shrink-0 flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
          <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-gray-800">{missions.length}</span>
          <span className="text-gray-500">nhiệm vụ hoàn thành</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
          <StarSolidIcon className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-gray-800">{avgRating ?? "—"}</span>
          <span className="text-gray-500">điểm TB ({ratedCount} lượt)</span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã, địa chỉ, tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
          {[
            { key: "ALL", label: `Tất cả (${missions.length})` },
            { key: "RATED", label: `Đã đánh giá (${ratedCount})` },
            { key: "UNRATED", label: `Chưa đánh giá (${missions.length - ratedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRatingFilter(tab.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                ratingFilter === tab.key
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Mã yêu cầu</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Tiêu đề</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Địa chỉ</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-20">Số người</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-20">Độ sâu</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-36">Ngày hoàn thành</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-36">Đánh giá</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Nhận xét</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-16">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <ExclamationCircleIcon className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">
                      {search || ratingFilter !== "ALL"
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Chưa có nhiệm vụ nào hoàn thành"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((m, index) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-gray-400 font-mono">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-blue-600 font-medium">{m.trackingCode}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-gray-900 max-w-[160px] truncate" title={m.title}>
                        {m.title || "Yêu cầu cứu hộ"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-gray-600 max-w-[200px] truncate" title={m.location?.addressText}>
                        {m.location?.addressText || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <UserGroupIcon className="h-3.5 w-3.5 text-gray-400" />
                        {m.report?.rescuedPeople ?? m.peopleCount ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600">
                      {m.location?.floodDepth != null ? `${m.location.floodDepth} m` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {formatDate(m.completedAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StarRating rating={m.citizenRating} />
                    </td>
                    <td className="px-3 py-2.5">
                      {m.citizenFeedback ? (
                        <p className="text-gray-600 italic max-w-[200px] truncate" title={m.citizenFeedback}>
                          "{m.citizenFeedback}"
                        </p>
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => setSelectedMission(m)}
                        title="Xem chi tiết"
                        className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            <span>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} kết quả
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1 rounded border transition-colors ${
                    page === currentPage
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-gray-200 bg-white hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedMission && (
        <DetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} />
      )}
    </div>
  );
}
