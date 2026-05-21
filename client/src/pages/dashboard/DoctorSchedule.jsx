import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldAlert,
  CheckCircle,
  Printer,
  ChevronRight,
} from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const loadSchedule = () => {
    setLoading(true);
    return API.get("/doctor/summary")
      .then((res) => {
        const confirmedOnly = (res.data.appointments || []).filter(
          (app) => app.status === "confirmed",
        );
        setAppointments(confirmedOnly);
      })
      .catch(() => {
        toast.error("Could not sync your schedule.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    Promise.resolve().then(() => loadSchedule());
  }, []);

  const handleComplete = async (id) => {
    try {
      await API.patch(`/doctor/appointment/${id}`, { status: "completed" });
      toast.success("Consultation marked as completed.");
      loadSchedule();
    } catch {
      toast.error("Update failed.");
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const appointmentDate = new Date(app.appointment_date)
      .toISOString()
      .split("T")[0];
    return appointmentDate === filterDate;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* ── Header & Day Picker ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-medical-lightText dark:text-medical-darkText">
            Clinical Schedule
          </h2>
          <p className="text-medical-lightMuted font-medium mt-1">
            Confirmed appointments and patient timeline.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <CalendarIcon
              className="absolute left-3 top-3 text-medical-primary"
              size={18}
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-medical-darkSurface font-bold text-sm outline-none focus:ring-2 focus:ring-medical-primary"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Printer size={20} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* ── Schedule Timeline ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-medical-primary font-bold">
            Syncing Daily Timeline...
          </div>
        ) : appointments.length === 0 ? (
          <div className="card-style p-20 text-center flex flex-col items-center">
            <Clock size={48} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold">No Appointments Confirmed</h3>
            <p className="text-medical-lightMuted mt-1 text-sm">
              Once you confirm requests from the dashboard, they will appear
              here.
            </p>
            <button
              onClick={() => navigate("/dashboard/doctor")}
              className="mt-6 text-medical-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              Go to Triage Queue <ChevronRight size={14} />
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card-style p-20 text-center flex flex-col items-center">
            <Clock size={48} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold">No appointments on this date</h3>
            <p className="text-medical-lightMuted mt-1 text-sm">
              Change the selected day or confirm more requests from the
              dashboard.
            </p>
            <button
              onClick={() => navigate("/dashboard/doctor")}
              className="mt-6 text-medical-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              Go to Triage Queue <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div key={app.id} className="group relative flex gap-6">
              {/* Time Column */}
              <div className="w-20 pt-2 shrink-0 text-right">
                <p className="text-sm font-black text-medical-lightText dark:text-medical-darkText">
                  {new Date(app.appointment_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-[10px] font-bold text-medical-lightMuted uppercase tracking-tighter">
                  Starts
                </p>
              </div>

              {/* Status/Connector Line */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-4 border-white dark:border-medical-darkBg z-10 ${app.risk_score > 60 ? "bg-red-500" : "bg-medical-primary"}`}
                ></div>
                <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 absolute top-4"></div>
              </div>

              {/* Patient Card */}
              <div className="flex-1 pb-8">
                <div className="card-style p-6 hover:border-medical-primary transition-all shadow-sm group-hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-medical-primary border border-slate-100 dark:border-slate-700">
                        {app.patient_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-medical-lightText dark:text-medical-darkText">
                          {app.patient_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {app.risk_score && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${app.risk_score > 50 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                            >
                              Risk: {app.risk_score}%
                            </span>
                          )}
                          <span className="text-[10px] text-medical-lightMuted uppercase font-bold flex items-center gap-1">
                            <ShieldAlert size={10} /> AI Assessment Link
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/doctor/patient/${app.patient_id}`,
                          )
                        }
                        className="flex-1 md:flex-none px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-medical-primary hover:text-white transition-all"
                      >
                        Review File
                      </button>
                      <button
                        onClick={() => handleComplete(app.id)}
                        className="flex-1 md:flex-none px-4 py-2 text-xs font-bold bg-medical-primary text-white rounded-xl shadow-lg shadow-medical-primary/20 hover:bg-medical-primaryHover transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} /> Finish Session
                      </button>
                    </div>
                  </div>

                  {app.reason_for_visit && (
                    <div className="mt-4 p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-medical-lightMuted italic">
                        <span className="font-bold uppercase not-italic mr-2">
                          Reason:
                        </span>
                        "{app.reason_for_visit}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
