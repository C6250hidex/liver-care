import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  DollarSign,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import API from "../../services/api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/summary");
      setData(res.data);
    } catch (err) {
      console.error("Admin summary fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHealthCensus = () => {
    const rows = [
      ["Risk Level", "Cases"],
      ...(data.distribution || []).map((item) => [
        item.warning_level,
        item.count,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "health_census.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewAuditTrail = () => setAuditOpen(true);

  const closeAuditModal = () => setAuditOpen(false);

  useEffect(() => {
    Promise.resolve().then(fetchStats);
  }, []);

  if (loading || !data)
    return (
      <div className="p-20 text-center animate-pulse font-black text-medical-primary">
        LOADING SYSTEM CORE...
      </div>
    );

  const totalAssessments = data.counts?.total_assessments || 1;

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-4 space-y-8 animate-in fade-in duration-700">
      {/* ── 1. Top Performance Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-medical-lightText dark:text-medical-darkText tracking-tighter">
            System Control
          </h2>
          <p className="text-medical-lightMuted font-medium italic">
            Live platform oversight and clinical distribution.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            className="p-3 bg-white dark:bg-medical-darkSurface border border-slate-200 dark:border-slate-800 rounded-2xl hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw size={20} className="text-medical-primary" />
          </button>
          <div className="px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20">
            Network: Operational
          </div>
        </div>
      </div>

      {/* ── 2. High-Level Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Ecosystem",
            val: data.counts?.total_users ?? 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "AI Risk Reports",
            val: data.counts?.total_assessments ?? 0,
            icon: Activity,
            color: "text-medical-primary",
            bg: "bg-medical-primary/10",
          },
          {
            label: "Pending Triage",
            val: data.counts?.pending_appointments ?? 0,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Platform Revenue",
            val: `$${data.counts?.platform_revenue ?? 0}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="card-style p-6 relative overflow-hidden group"
          >
            <div
              className={`absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={80} />
            </div>
            <stat.icon className={`${stat.color} mb-4`} size={28} />
            <h3 className="text-3xl font-black">{stat.val}</h3>
            <p className="text-xs font-bold text-medical-lightMuted uppercase tracking-widest mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── 3. Main Intelligence Area ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Population Risk Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-style p-8 h-full">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <ShieldAlert className="text-medical-primary" /> Population Risk
              Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Custom CSS Chart */}
              <div className="space-y-6">
                {data.distribution?.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                      <span>{item.warning_level} Risk</span>
                      <span className="text-medical-primary">
                        {item.count} Cases
                      </span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${item.warning_level === "Critical" ? "bg-red-500" : "bg-medical-primary"}`}
                        style={{
                          width: `${(item.count / totalAssessments) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                <p className="text-sm font-bold text-medical-lightMuted leading-relaxed italic">
                  "AI Analysis shows that 65% of the current patient population
                  falls within the 'Low to Medium' risk category, suggesting
                  effective early-intervention reach."
                </p>
                <button
                  onClick={handleDownloadHealthCensus}
                  className="mt-6 text-medical-primary font-black text-xs uppercase flex items-center gap-1 hover:underline"
                >
                  Download Health Census <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Stream (The "Activity On Site") */}
        <div className="lg:col-span-1">
          <div className="card-style p-6 h-full flex flex-col">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <RefreshCw
                className="text-medical-primary animate-spin-slow"
                size={20}
              />{" "}
              Global Activity Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {data.activities?.map((act, idx) => (
                <div
                  key={act.id ?? idx}
                  className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                      act.severity === "critical"
                        ? "bg-red-100 text-red-600"
                        : "bg-medical-primary/10 text-medical-primary"
                    }`}
                  >
                    {act.action_type === "ai_checkup" ? (
                      <Activity size={18} />
                    ) : (
                      <Users size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-medical-lightText dark:text-medical-darkText break-words">
                      {act.fullname}{" "}
                      <span className="font-normal text-medical-lightMuted capitalize">
                        ({act.role})
                      </span>
                    </p>
                    <p className="text-[11px] text-medical-lightMuted line-clamp-2 mt-0.5">
                      {act.description}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">
                      {new Date(act.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleViewAuditTrail}
              className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-medical-primary hover:text-white transition-all"
            >
              View Audit Trail
            </button>
          </div>
        </div>
      </div>

      {auditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-medical-primary font-bold">
                  Audit Trail
                </p>
                <h3 className="text-xl font-black text-medical-lightText dark:text-medical-darkText">
                  Recent Platform Activity
                </h3>
              </div>
              <button
                onClick={closeAuditModal}
                className="text-medical-lightMuted hover:text-medical-primary transition-colors"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              {(data.activities || []).length === 0 ? (
                <div className="text-sm text-medical-lightMuted">
                  No audit records available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
                          {act.fullname}{" "}
                          <span className="text-xs font-normal text-medical-lightMuted">
                            ({act.role})
                          </span>
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-medical-primary font-black">
                          {act.severity}
                        </span>
                      </div>
                      <p className="text-sm text-medical-lightMuted leading-relaxed">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase mt-3">
                        {new Date(act.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
