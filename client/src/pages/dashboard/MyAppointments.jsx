import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  XCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    badge:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
    dot: "bg-blue-500",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    badge:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700",
    dot: "bg-teal-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    dot: "bg-red-400",
    icon: XCircle,
  },
};

const getStatusConfig = (s) =>
  STATUS_CONFIG[s] ?? {
    label: s,
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    icon: AlertCircle,
  };

const isUpcoming = (dateStr) => new Date(dateStr) >= new Date();

const FILTER_TABS = [
  "All",
  "Upcoming",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

const ConfirmDialog = ({ onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white dark:bg-medical-darkSurface rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 max-w-sm w-full">
      <div className="flex items-center gap-3 mb-3">
        <span className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <XCircle size={20} className="text-red-500" />
        </span>
        <h4 className="font-bold text-medical-lightText dark:text-medical-darkText">
          Cancel Appointment?
        </h4>
      </div>
      <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mb-5">
        This action cannot be undone. The doctor will be notified of the
        cancellation.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-medical-lightMuted hover:bg-gray-200 transition-colors"
        >
          Keep It
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

// ── AppointmentCard ───────────────────────────────────────────────────────────

const AppointmentCard = ({ app, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = getStatusConfig(app.status);
  const upcoming = isUpcoming(app.appointment_date);
  const canCancel = app.status === "pending" || app.status === "confirmed";
  const date = new Date(app.appointment_date);

  return (
    <div
      className={`bg-white dark:bg-medical-darkSurface rounded-2xl border transition-all ${upcoming && app.status !== "cancelled" ? "border-medical-primary/20 shadow-sm" : "border-gray-100 dark:border-slate-800"}`}
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Date block */}
        <div
          className={`shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm ${upcoming && app.status !== "cancelled" ? "bg-gradient-to-br from-medical-primary to-medical-accent" : "bg-gray-200 dark:bg-slate-700 !text-gray-500 dark:!text-slate-400"}`}
        >
          <span className="text-xs font-bold uppercase leading-none">
            {date.toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="text-xl font-extrabold leading-tight">
            {date.getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h4 className="font-bold text-medical-lightText dark:text-medical-darkText">
              Dr. {app.doctor_name}
            </h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          {app.doctor_specialization && (
            <p className="text-xs text-medical-primary font-medium mb-2">
              {app.doctor_specialization}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-medical-lightMuted dark:text-medical-darkMuted">
            <span className="flex items-center gap-1">
              <Calendar size={12} />{" "}
              {date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {app.consultation_fee != null && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />₦
                {Number(app.consultation_fee).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canCancel && (
            <button
              onClick={() => onCancel(app.id)}
              disabled={cancelling === app.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelling === app.id ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <XCircle size={13} />
              )}{" "}
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medical-lightMuted dark:text-medical-darkMuted hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <FileText size={13} /> Details{" "}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
          {/* Reason for Visit */}
          <div>
            <p className="text-xs font-bold text-medical-lightMuted dark:text-medical-darkMuted uppercase tracking-wide mb-1">
              Reason for Visit
            </p>
            <p className="text-sm text-medical-lightText dark:text-medical-darkText leading-relaxed">
              {app.reason_for_visit || "No reason provided."}
            </p>
          </div>

          {/* ✅ INTEGRATED: Official Consultation Summary (Visible when status is completed) */}
          {app.status === "completed" && app.diagnosis && (
            <div className="p-5 bg-medical-primary/5 dark:bg-medical-primary/10 rounded-2xl border border-medical-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-medical-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-medical-primary">
                  Official Consultation Summary
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Diagnosis
                  </p>
                  <p className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
                    {app.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Clinical Advice
                  </p>
                  <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed italic">
                    "{app.clinical_advice}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-medical-lightMuted dark:text-medical-darkMuted uppercase tracking-wide mb-1">
              Booked On
            </p>
            <p className="text-sm text-medical-lightText dark:text-medical-darkText">
              {new Date(app.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/patient/appointments");
      setAppointments(res.data);
    } catch {
      console.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchAppointments();
    };
    void init();
  }, []);

  const handleCancelConfirm = async () => {
    const id = confirmId;
    setConfirmId(null);
    setCancelling(id);
    try {
      await API.patch(`/patient/appointments/${id}/cancel`);
      toast.success("Appointment cancelled.");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
      );
    } catch {
      toast.error("Cancellation failed.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = useMemo(() => {
    if (activeFilter === "All") return appointments;
    if (activeFilter === "Upcoming")
      return appointments.filter(
        (a) => isUpcoming(a.appointment_date) && a.status !== "cancelled",
      );
    return appointments.filter(
      (a) => a.status.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [appointments, activeFilter]);

  const counts = useMemo(() => {
    const c = {
      All: appointments.length,
      Upcoming: 0,
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
    };
    appointments.forEach((a) => {
      const s = a.status.charAt(0).toUpperCase() + a.status.slice(1);
      if (c[s] != null) c[s]++;
      if (isUpcoming(a.appointment_date) && a.status !== "cancelled")
        c.Upcoming++;
    });
    return c;
  }, [appointments]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={32} className="animate-spin text-medical-primary" />
        <span className="text-sm font-medium">Loading appointments…</span>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {confirmId && (
        <ConfirmDialog
          onConfirm={handleCancelConfirm}
          onClose={() => setConfirmId(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
            My Consultations
          </h2>
          <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mt-0.5">
            {appointments.length} total sessions
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-medical-primary text-white hover:bg-medical-primaryHover transition-all shadow-sm shadow-medical-primary/20"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeFilter === tab ? "bg-medical-primary text-white border-medical-primary shadow-md" : "bg-white dark:bg-medical-darkSurface text-medical-lightMuted dark:text-medical-darkMuted border-gray-100 dark:border-slate-800 hover:bg-gray-50"}`}
          >
            {tab}{" "}
            {counts[tab] > 0 && (
              <span className="ml-1 opacity-60">({counts[tab]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((app) => (
          <AppointmentCard
            key={app.id}
            app={app}
            onCancel={setConfirmId}
            cancelling={cancelling}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-medical-darkSurface rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
            <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              No {activeFilter.toLowerCase()} appointments scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
