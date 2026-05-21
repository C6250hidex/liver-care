import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Activity,
  Calendar,
  Bell,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  Plus,
  Thermometer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Wind,
  Zap,
} from "lucide-react";
import API from "../../services/api";
import HealthChart from "../../components/dashboard/HealthChart"; // ✅ Imported
import { Link, useNavigate } from "react-router-dom";

// ─── Constants & Styles ──────────────────────────────────────────────────────
const getRiskColor = (score) => {
  if (score >= 75)
    return {
      text: "text-red-600",
      bg: "bg-red-50",
      bar: "bg-red-600",
      border: "border-red-200",
    };
  if (score >= 45)
    return {
      text: "text-orange-600",
      bg: "bg-orange-50",
      bar: "bg-orange-500",
      border: "border-orange-200",
    };
  if (score >= 25)
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
      border: "border-amber-200",
    };
  return {
    text: "text-green-600",
    bg: "bg-green-50",
    bar: "bg-medical-primary",
    border: "border-green-200",
  };
};

const getStatusStyle = (status) =>
  status === "Stable"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse";

const INITIAL_LOG = {
  fever: 36.5,
  fatigue: "none",
  jaundice: false,
  nausea: "none",
  abdominal_pain: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  badgeBg,
  badgeText,
  title,
  subtitle,
  footer,
  linkTo,
}) => (
  <div className="card-style p-6 flex flex-col gap-4 group hover:shadow-lg transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      {badge && (
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${badgeBg} ${badgeText}`}
        >
          {badge}
        </span>
      )}
    </div>
    <div className="cursor-default">
      <h3 className="text-2xl font-bold text-medical-lightText dark:text-medical-darkText">
        {title}
      </h3>
      <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mt-0.5">
        {subtitle}
      </p>
    </div>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-sm font-bold text-medical-primary flex items-center gap-1 hover:gap-2 transition-all mt-auto w-fit"
      >
        {footer} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

const ToggleButton = ({ value, onLabel, offLabel, onStyle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full py-3.5 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97]
      ${value ? `${onStyle} shadow-md border-transparent` : "border-gray-100 dark:border-slate-800 text-medical-lightMuted dark:text-medical-darkMuted bg-gray-50/50 dark:bg-slate-800/30 hover:border-medical-primary/30"}`}
  >
    {value ? (
      <>
        <CheckCircle2 size={16} /> {onLabel}
      </>
    ) : (
      <>
        <AlertCircle size={16} className="opacity-40" /> {offLabel}
      </>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")) || {});

  const [stats, setStats] = useState({
    lastRiskScore: 0,
    riskLevel: "No Data",
    status: "Stable",
    nextAppointmentDate: "No upcoming",
    doctorName: "None",
    remindersCount: 0,
    healthLogs: [], // ✅ Stores history for the chart
    loading: true,
    error: false,
  });

  const [logData, setLogData] = useState(INITIAL_LOG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logSubmitted, setLogSubmitted] = useState(false);
  const [medications, setMedications] = useState([
    { name: "Tenofovir", time: "08:00 AM", taken: true },
    { name: "Vitamin B-Complex", time: "02:00 PM", taken: false },
  ]);

  // ── API Operations ────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: false }));
    try {
      const res = await API.get("/patient/summary");
      const d = res.data;
      setStats({
        lastRiskScore: d.latestScore ?? 0,
        riskLevel: d.riskLevel ?? "Not Evaluated",
        status: d.status ?? "Stable",
        nextAppointmentDate: d.nextAppointment
          ? new Date(d.nextAppointment.appointment_date).toLocaleDateString(
              "en-GB",
              { day: "numeric", month: "short", year: "numeric" },
            )
          : "No upcoming",
        doctorName: d.nextAppointment?.doctor_name ?? "None",
        remindersCount:
          d.remindersCount ??
          d.pendingReminderCount ??
          d.reminders?.length ??
          0,
        healthLogs: d.healthLogs ?? [], // ✅ Captured from backend summary
        loading: false,
        error: false,
      });
    } catch {
      setStats((prev) => ({ ...prev, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchDashboardData();
    };
    void init();
  }, [fetchDashboardData]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const temp = parseFloat(logData.fever);
    if (isNaN(temp) || temp < 34 || temp > 43) {
      toast.error("Enter a valid temperature (34-43°C)");
      return;
    }
    setIsSubmitting(true);
    try {
      await API.post("/patient/log", { ...logData, fever: temp });
      toast.success("Health log synced to cloud!");
      setLogSubmitted(true);
      fetchDashboardData();
    } catch {
      toast.error("Failed to save log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMedication = (index) => {
    const updated = [...medications];
    updated[index].taken = !updated[index].taken;
    setMedications(updated);
    if (updated[index].taken)
      toast.success(`${updated[index].name} marked as taken`);
  };

  const risk = getRiskColor(stats.lastRiskScore);
  const firstName = user?.fullname?.split(" ")[0] || "User";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* ── 1. Welcome Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div
          className="group cursor-pointer"
          onClick={() => navigate("/dashboard/patient/profile")}
        >
          <h1 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText group-hover:text-medical-primary transition-colors">
            Welcome back, {firstName}!
          </h1>
          <p className="text-medical-lightMuted dark:text-medical-darkMuted mt-1 flex items-center gap-2">
            Status:{" "}
            <span
              className={`font-bold px-2.5 py-0.5 rounded-lg text-xs ${getStatusStyle(stats.status)}`}
            >
              {stats.status}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <RefreshCw
              size={18}
              className={`${stats.loading ? "animate-spin text-medical-primary" : "text-slate-400"}`}
            />
          </button>
          <Link
            to="/dashboard/patient/symptom-checker"
            className="btn-primary flex items-center gap-2 shadow-lg shadow-medical-primary/20 py-3 px-6"
          >
            <Activity size={18} /> New AI Checkup
          </Link>
        </div>
      </div>

      {/* ── 2. Stat Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldAlert}
          iconBg="bg-medical-primary/10"
          iconColor="text-medical-primary"
          badge={stats.riskLevel}
          badgeBg={risk.bg}
          badgeText={risk.text}
          title={stats.loading ? "..." : `${stats.lastRiskScore}%`}
          subtitle="Hepatitis Risk Score"
          footer="View History"
          linkTo="/dashboard/patient/history"
        />
        <StatCard
          icon={Calendar}
          iconBg="bg-medical-accent/10"
          iconColor="text-medical-accent"
          title={stats.loading ? "..." : stats.nextAppointmentDate}
          subtitle={
            stats.doctorName === "None"
              ? "No active sessions"
              : `Dr. ${stats.doctorName}`
          }
          footer="Manage Bookings"
          linkTo="/dashboard/patient/appointments"
        />
        <StatCard
          icon={Bell}
          iconBg="bg-amber-100 dark:bg-amber-900/20"
          iconColor="text-amber-500"
          badge={`${stats.remindersCount} Pending`}
          badgeBg="bg-amber-50 dark:bg-amber-900/30"
          badgeText="text-amber-600"
          title="Daily Tasks"
          subtitle="Medications & Logs"
          footer="Check Records"
          linkTo="/dashboard/patient/records"
        />
      </div>

      {/* ── 3. Main Split (Updated with Chart) ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ✅ 🟢 NEW INTEGRATED CHART SECTION */}
          <div className="card-style p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-medical-primary" /> Body Temperature
              Trend
            </h3>
            {stats.loading ? (
              <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ) : (
              <HealthChart data={stats.healthLogs} />
            )}
          </div>

          {/* Daily Health Log Form */}
          <div className="card-style p-6 sm:p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
              <Activity size={22} className="text-medical-primary" /> Daily
              Health Log
            </h3>

            {logSubmitted ? (
              <div className="py-12 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h4 className="text-xl font-bold">Log Saved!</h4>
                <button
                  onClick={() => setLogSubmitted(false)}
                  className="btn-primary mt-4 px-6 py-2"
                >
                  Add More
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleLogSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Thermometer size={16} className="text-medical-primary" />{" "}
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary"
                    value={logData.fever}
                    onChange={(e) =>
                      setLogData({ ...logData, fever: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Zap size={16} className="text-medical-primary" /> Fatigue
                  </label>
                  <select
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-medical-primary"
                    value={logData.fatigue}
                    onChange={(e) =>
                      setLogData({ ...logData, fatigue: e.target.value })
                    }
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Wind size={16} className="text-medical-primary" /> Nausea
                  </label>
                  <select
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-medical-primary"
                    value={logData.nausea}
                    onChange={(e) =>
                      setLogData({ ...logData, nausea: e.target.value })
                    }
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Activity size={16} className="text-medical-primary" />{" "}
                    Abdominal Pain?
                  </label>
                  <ToggleButton
                    value={logData.abdominal_pain}
                    onLabel="Yes"
                    offLabel="No"
                    onStyle="bg-medical-danger text-white"
                    onClick={() =>
                      setLogData({
                        ...logData,
                        abdominal_pain: !logData.abdominal_pain,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Droplets size={16} className="text-medical-primary" />{" "}
                    Jaundice Symptoms?
                  </label>
                  <ToggleButton
                    value={logData.jaundice}
                    onLabel="Observed"
                    offLabel="None"
                    onStyle="bg-medical-warning text-white"
                    onClick={() =>
                      setLogData({ ...logData, jaundice: !logData.jaundice })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="md:col-span-2 btn-primary py-4 font-bold text-lg flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <>
                      <Plus /> Update Records
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR (Meds Tracker) */}
        <div className="space-y-6">
          <div className="card-style p-6 bg-medical-primary text-white border-none shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-100 mb-4">
              Care Instruction
            </h3>
            <p className="text-sm text-blue-50 leading-relaxed italic">
              "Regular monitoring is key to managing hepatitis. Your logs help
              the AI detect early inflammatory patterns."
            </p>
          </div>
          <div className="card-style p-6">
            <h3 className="font-bold mb-6">Meds Tracker</h3>
            <div className="space-y-4">
              {medications.map((med, i) => (
                <div
                  key={i}
                  onClick={() => toggleMedication(i)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${med.taken ? "bg-green-50/50 border-green-100 dark:bg-green-900/10" : "border-slate-100 dark:border-slate-800"}`}
                >
                  <div>
                    <p
                      className={`font-bold text-sm ${med.taken ? "line-through text-slate-400" : ""}`}
                    >
                      {med.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {med.time}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${med.taken ? "bg-green-500 border-green-500 text-white" : "border-slate-300"}`}
                  >
                    {med.taken && <CheckCircle2 size={14} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
