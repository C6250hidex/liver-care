import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Calendar,
  RefreshCw,
  ShieldAlert,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRiskStyle = (score) => {
  if (score >= 75)
    return {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      bar: "bg-red-500",
    };
  if (score >= 45)
    return {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-500 dark:text-orange-400",
      badge:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      bar: "bg-orange-500",
    };
  if (score >= 25)
    return {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-500 dark:text-amber-400",
      badge:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      bar: "bg-amber-500",
    };
  return {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    badge:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    bar: "bg-medical-primary",
  };
};

const LEVELS = ["All", "Low", "Medium", "High", "Critical"];

const SkeletonRow = () => (
  <div className="card-style p-6 flex items-center justify-between animate-pulse mb-3">
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AssessmentHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchHistory = useCallback(async (offset = 0, replace = true) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/ai/history?limit=10&offset=${offset}`);
      const { assessments, pagination: p } = res.data;
      setHistory((prev) => (replace ? assessments : [...prev, ...assessments]));
      setPagination(p);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to load assessment history.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0, true);
  }, [fetchHistory]);

  const displayed = history.filter((item) => {
    const matchLevel = filter === "All" || item.warning_level === filter;
    const matchSearch =
      item.warning_level.toLowerCase().includes(search.toLowerCase()) ||
      String(item.risk_score).includes(search) ||
      new Date(item.created_at).toLocaleDateString().includes(search);
    return matchLevel && matchSearch;
  });

  const handleLoadMore = () =>
    fetchHistory(pagination.offset + pagination.limit, false);

  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.risk_score, 0) / history.length)
    : 0;
  const highRisk = history.filter((h) => h.risk_score >= 45).length;
  const avgStyle = getRiskStyle(avgScore);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
            Clinical History
          </h2>
          <p className="text-medical-lightMuted dark:text-medical-darkMuted mt-1">
            Review your AI-assisted liver health evaluations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchHistory(0, true)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <RefreshCw
              size={17}
              className={`text-medical-lightMuted ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => navigate("/dashboard/patient/symptom-checker")}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-3"
          >
            <Activity size={16} /> New Checkup
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-style p-4 text-center border-l-4 border-medical-primary">
            <p className="text-2xl font-black">{pagination.total}</p>
            <p className="text-[10px] uppercase font-bold text-medical-lightMuted">
              Total Reports
            </p>
          </div>
          <div className="card-style p-4 text-center border-l-4 border-amber-400">
            <p className={`text-2xl font-black ${avgStyle.text}`}>
              {avgScore}%
            </p>
            <p className="text-[10px] uppercase font-bold text-medical-lightMuted">
              Avg. Risk
            </p>
          </div>
          <div className="card-style p-4 text-center border-l-4 border-red-500">
            <p
              className={`text-2xl font-black ${highRisk > 0 ? "text-red-500" : "text-green-600"}`}
            >
              {highRisk}
            </p>
            <p className="text-[10px] uppercase font-bold text-medical-lightMuted">
              Critical Flags
            </p>
          </div>
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by score or date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-medical-darkSurface outline-none focus:ring-2 focus:ring-medical-primary text-sm shadow-sm"
          />
        </div>
        <div className="flex bg-white dark:bg-medical-darkSurface p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === lvl ? "bg-medical-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className="space-y-3">
        {loading && history.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : displayed.length === 0 ? (
          <div className="card-style p-16 text-center">
            <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
            <h4 className="font-bold">No results found</h4>
            <p className="text-sm text-medical-lightMuted">
              Try adjusting your search or run a new checkup.
            </p>
          </div>
        ) : (
          displayed.map((item) => {
            const style = getRiskStyle(item.risk_score);
            return (
              <div
                key={item.id}
                className="card-style p-5 flex items-center justify-between group hover:border-medical-primary transition-all cursor-pointer active:scale-[0.99]"
                /* ✅ FIXED: Corrected path to match App.jsx route */
                onClick={() => navigate(`/dashboard/patient/report/${item.id}`)}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 ${style.bg}`}
                  >
                    <span className={`text-xl font-black ${style.text}`}>
                      {item.risk_score}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${style.text} opacity-70`}
                    >
                      Risk
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-medical-lightText dark:text-medical-darkText">
                        {item.warning_level} Risk Level
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        {item.risk_score >= 45 ? "ACTION REQ." : "STABLE"}
                      </span>
                    </div>
                    <p className="text-xs text-medical-lightMuted flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <div className="w-32 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${style.bar} transition-all duration-1000`}
                        style={{ width: `${item.risk_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:bg-medical-primary group-hover:text-white transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Load More ── */}
      {!loading && pagination.hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-bold text-sm text-slate-500 hover:border-medical-primary transition-all"
          >
            Load Older Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
