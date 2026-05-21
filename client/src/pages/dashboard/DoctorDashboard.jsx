import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Calendar,
  ShieldAlert,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import FinalizeConsultationModal from "../../components/dashboard/FinalizeConsultationModal"; // ✅ Imported
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: { pending: 0, confirmed: 0, total_patients: 0 },
    appointments: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState("");

  // ── Modal States ──
  const [selectedApp, setSelectedApp] = useState(null); // Track which appointment is being finished
  const [showFinalize, setShowFinalize] = useState(false);

  // ── Open Modal Handler ──
  const openFinalize = (app) => {
    setSelectedApp(app);
    setShowFinalize(true);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/doctor/summary");
      setData(res.data);
    } catch {
      toast.error("Failed to sync clinical records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadData();
    };
    void init();
  }, [loadData]);

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/doctor/appointment/${id}`, { status });
      toast.success(`Session marked as ${status}`);
      loadData(); // Refresh table and stats
    } catch {
      toast.error("Status update failed.");
    }
  };

  // Filter logic for searching patients in the queue
  const filteredAppointments = data.appointments.filter((app) => {
    const email = app.patient_email || "";
    const name = app.patient_name || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-bold text-medical-primary">
        Opening Physician Portal...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
            Clinical Overview
          </h2>
          <p className="text-medical-lightMuted dark:text-medical-darkMuted mt-1">
            Managing patient triage and AI-assisted diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search patient..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-medical-darkSurface outline-none focus:ring-2 focus:ring-medical-primary transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all active:rotate-180 duration-500"
          >
            <RefreshCw
              size={20}
              className={
                loading ? "animate-spin text-medical-primary" : "text-slate-400"
              }
            />
          </button>
          <button
            onClick={() => navigate("/dashboard/doctor/blogs")}
            className="py-3 px-4 rounded-2xl bg-medical-primary text-white text-sm font-bold hover:bg-medical-primaryHover transition-all"
          >
            Publish Article
          </button>
        </div>
      </div>

      {/* ── 2. Summary Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-style p-6 border-l-4 border-medical-primary shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-medical-lightMuted uppercase tracking-widest">
                Pending Requests
              </p>
              <h3 className="text-3xl font-black mt-1">{data.stats.pending}</h3>
            </div>
            <div className="p-3 bg-medical-primary/10 rounded-xl text-medical-primary">
              <Clock size={22} />
            </div>
          </div>
        </div>
        <div className="card-style p-6 border-l-4 border-medical-accent shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-medical-lightMuted uppercase tracking-widest">
                Active Schedule
              </p>
              <h3 className="text-3xl font-black mt-1">
                {data.stats.confirmed}
              </h3>
            </div>
            <div className="p-3 bg-medical-accent/10 rounded-xl text-medical-accent">
              <Calendar size={22} />
            </div>
          </div>
        </div>
        <div className="card-style p-6 border-l-4 border-slate-400 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-medical-lightMuted uppercase tracking-widest">
                Total Managed
              </p>
              <h3 className="text-3xl font-black mt-1">
                {data.stats.total_patients}
              </h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
              <Users size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Patient Triage Queue ── */}
      <div className="card-style overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h4 className="font-bold flex items-center gap-2 text-medical-lightText dark:text-medical-darkText">
            Patient Triage Queue
          </h4>
          <span className="text-xs font-bold text-medical-lightMuted">
            {filteredAppointments.length} Active Rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-medical-lightMuted uppercase bg-white dark:bg-medical-darkSurface border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Patient Identity</th>
                <th className="px-6 py-4">AI Risk Assessment</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAppointments.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-medical-primary/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-medical-lightText dark:text-medical-darkText">
                      {app.patient_name}
                    </p>
                    <p className="text-[10px] text-medical-lightMuted uppercase font-mono tracking-tighter">
                      {app.patient_email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {app.risk_score ? (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${app.risk_score > 50 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}
                      >
                        <ShieldAlert size={14} /> {app.risk_score}% (
                        {(app.warning_level || "Unknown")
                          .toString()
                          .toUpperCase()}
                        )
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic uppercase">
                        Pending AI Test
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
                      {new Date(app.appointment_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-medical-lightMuted">
                      {new Date(app.appointment_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                        app.status === "confirmed"
                          ? "bg-medical-accent/10 border-medical-accent/20 text-medical-accent"
                          : app.status === "completed"
                            ? "bg-green-100 border-green-200 text-green-700"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Confirm Button */}
                    {app.status === "pending" && (
                      <button
                        onClick={() => handleStatus(app.id, "confirmed")}
                        className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-all active:scale-90"
                        title="Confirm Consultation"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    {/* ✅ Mark Completed Button (Now triggers Modal) */}
                    {app.status === "confirmed" && (
                      <button
                        onClick={() => openFinalize(app)}
                        className="px-3 py-2 bg-medical-primary text-white text-xs font-bold rounded-xl hover:bg-medical-primaryHover transition-all active:scale-95 shadow-sm"
                      >
                        Mark Done
                      </button>
                    )}

                    {/* Link to Clinical File */}
                    <button
                      onClick={() =>
                        navigate(`/dashboard/doctor/patient/${app.patient_id}`)
                      }
                      className="p-2.5 bg-medical-primary/10 text-medical-primary rounded-xl hover:bg-medical-primary hover:text-white transition-all group active:scale-95 border border-transparent hover:border-medical-primary shadow-sm"
                      title="Open Patient Clinical File"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black hidden group-hover:block uppercase tracking-tighter">
                          View Records
                        </span>
                        <ExternalLink size={18} />
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">
              Queue is empty
            </div>
          )}
        </div>
      </div>

      {/* ── 🟢 MODAL INJECTION ── */}
      {showFinalize && (
        <FinalizeConsultationModal
          appointment={selectedApp}
          onClose={() => setShowFinalize(false)}
          onSuccess={() => {
            setShowFinalize(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
