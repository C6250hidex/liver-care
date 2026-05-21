import React, { useEffect, useState, useMemo } from "react";
import {
  Thermometer,
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  ClipboardList,
  Frown,
  Wind,
  Zap,
} from "lucide-react";
import API from "../../services/api";

// ── helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_ORDER = { none: 0, mild: 1, moderate: 2, severe: 3 };

const severityBadge = (level) => {
  const map = {
    none: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    mild: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    moderate:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    severe: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[level] ?? "bg-gray-100 text-gray-600";
};

const feverClass = (temp) => {
  if (temp == null)
    return "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300";
  if (temp >= 39)
    return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
  if (temp >= 37.5)
    return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

// ── sub-components ────────────────────────────────────────────────────────────

const SortIcon = ({ field, sortKey, dir }) => {
  if (sortKey !== field)
    return <ChevronsUpDown size={13} className="ml-1 opacity-40" />;
  return dir === "asc" ? (
    <ChevronUp size={13} className="ml-1 text-medical-primary" />
  ) : (
    <ChevronDown size={13} className="ml-1 text-medical-primary" />
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-medical-darkSurface rounded-xl px-4 py-3 border border-gray-100 dark:border-slate-700 shadow-sm">
    <span className={`p-2 rounded-lg ${color}`}>
      <Icon size={16} />
    </span>
    <div>
      <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted font-medium">
        {label}
      </p>
      <p className="text-lg font-bold text-medical-lightText dark:text-medical-darkText leading-tight">
        {value}
      </p>
    </div>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const HealthRecords = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("logged_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const fetchLogs = () => {
    setLoading(true);
    setError(null);
    API.get("/patient/health-logs")
      .then((res) => setLogs(res.data.logs ?? res.data))
      .catch(() => setError("Failed to load health records. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ── sort + filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        !q ||
        new Date(l.logged_at).toLocaleDateString().includes(q) ||
        (l.fatigue ?? "").toLowerCase().includes(q) ||
        (l.nausea ?? "").toLowerCase().includes(q),
    );
  }, [logs, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey],
        vb = b[sortKey];
      if (sortKey === "logged_at") {
        va = new Date(va);
        vb = new Date(vb);
      }
      if (sortKey === "fatigue" || sortKey === "nausea") {
        va = SEVERITY_ORDER[va] ?? -1;
        vb = SEVERITY_ORDER[vb] ?? -1;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ── summary stats ──
  const stats = useMemo(() => {
    if (!logs.length) return null;
    const avgTemp = logs.reduce((s, l) => s + (l.fever ?? 0), 0) / logs.length;
    const jaundiceCount = logs.filter((l) => l.jaundice).length;
    const severeCount = logs.filter(
      (l) => l.fatigue === "severe" || l.nausea === "severe",
    ).length;
    const abdominalCount = logs.filter((l) => l.abdominal_pain).length;
    return { avgTemp, jaundiceCount, severeCount, abdominalCount };
  }, [logs]);

  // ── th helper ──
  const Th = ({ field, children, className = "" }) => (
    <th
      className={`px-5 py-3.5 cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center">
        {children}
        <SortIcon field={field} sortKey={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  // ── render states ──
  const renderBody = () => {
    if (loading)
      return (
        <tr>
          <td colSpan={6} className="py-20 text-center">
            <div className="flex flex-col items-center gap-3 text-medical-lightMuted dark:text-medical-darkMuted">
              <RefreshCw
                size={28}
                className="animate-spin text-medical-primary"
              />
              <span className="text-sm font-medium">
                Loading health records…
              </span>
            </div>
          </td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={6} className="py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle size={28} className="text-medical-danger" />
              <p className="text-sm text-medical-danger font-medium">{error}</p>
              <button
                onClick={fetchLogs}
                className="mt-1 px-4 py-1.5 text-xs font-semibold rounded-lg bg-medical-primary text-white hover:bg-medical-primaryHover transition-colors"
              >
                Retry
              </button>
            </div>
          </td>
        </tr>
      );

    if (!paginated.length)
      return (
        <tr>
          <td colSpan={6} className="py-20 text-center">
            <div className="flex flex-col items-center gap-2 text-medical-lightMuted dark:text-medical-darkMuted">
              <ClipboardList size={28} className="opacity-50" />
              <span className="text-sm font-medium">
                {search
                  ? "No records match your search."
                  : "No health logs recorded yet."}
              </span>
            </div>
          </td>
        </tr>
      );

    return paginated.map((log) => (
      <tr
        key={log.id}
        className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        {/* Date */}
        <td className="px-5 py-3.5 font-medium text-medical-lightText dark:text-medical-darkText whitespace-nowrap">
          <div>
            {new Date(log.logged_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-medical-lightMuted dark:text-medical-darkMuted">
            {new Date(log.logged_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </td>

        {/* Temp */}
        <td className="px-5 py-3.5 text-center">
          {log.fever != null ? (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${feverClass(log.fever)}`}
            >
              {log.fever}°C
            </span>
          ) : (
            <span className="text-xs text-medical-lightMuted dark:text-medical-darkMuted italic">
              —
            </span>
          )}
        </td>

        {/* Fatigue */}
        <td className="px-5 py-3.5">
          <span
            className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${severityBadge(log.fatigue)}`}
          >
            {log.fatigue ?? "—"}
          </span>
        </td>

        {/* Jaundice */}
        <td className="px-5 py-3.5">
          {log.jaundice ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs">
              <AlertCircle size={13} /> Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs">
              <CheckCircle2 size={13} /> No
            </span>
          )}
        </td>

        {/* Nausea */}
        <td className="px-5 py-3.5">
          <span
            className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${severityBadge(log.nausea)}`}
          >
            {log.nausea ?? "—"}
          </span>
        </td>

        {/* Abdominal Pain */}
        <td className="px-5 py-3.5">
          {log.abdominal_pain ? (
            <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold text-xs">
              <AlertCircle size={13} /> Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs">
              <CheckCircle2 size={13} /> No
            </span>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
            Daily Health Records
          </h2>
          {!loading && !error && (
            <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mt-0.5">
              {logs.length} {logs.length === 1 ? "entry" : "entries"} total
            </p>
          )}
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-medical-primary text-white hover:bg-medical-primaryHover disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Thermometer}
            label="Avg Temperature"
            value={`${stats.avgTemp.toFixed(1)}°C`}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            icon={Activity}
            label="Jaundice Episodes"
            value={stats.jaundiceCount}
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <StatCard
            icon={Zap}
            label="Severe Symptoms"
            value={stats.severeCount}
            color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          />
          <StatCard
            icon={Wind}
            label="Abdominal Pain"
            value={stats.abdominalCount}
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
        </div>
      )}

      {/* Search + Page size */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Search by date, fatigue, nausea…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-72 px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-medical-darkSurface text-medical-lightText dark:text-medical-darkText placeholder:text-medical-lightMuted dark:placeholder:text-medical-darkMuted focus:outline-none focus:ring-2 focus:ring-medical-primary/40 transition"
        />
        <div className="flex items-center gap-2 text-sm text-medical-lightMuted dark:text-medical-darkMuted">
          <span>Rows:</span>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => {
                setPageSize(n);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                pageSize === n
                  ? "bg-medical-primary text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-medical-lightMuted dark:text-medical-darkMuted hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-sm bg-white dark:bg-medical-darkSurface">
          <thead className="bg-gray-50 dark:bg-slate-800 text-medical-lightMuted dark:text-medical-darkMuted uppercase text-xs font-bold">
            <tr>
              <Th field="logged_at">Date</Th>
              <Th field="fever" className="text-center">
                Temp
              </Th>
              <Th field="fatigue">Fatigue</Th>
              <Th field="jaundice">Jaundice</Th>
              <Th field="nausea">Nausea</Th>
              <Th field="abdominal_pain">Abdominal Pain</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-medical-lightText dark:text-medical-darkText">
            {renderBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-medical-lightMuted dark:text-medical-darkMuted">
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
              )
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-1.5">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      page === n
                        ? "bg-medical-primary text-white"
                        : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Next ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
