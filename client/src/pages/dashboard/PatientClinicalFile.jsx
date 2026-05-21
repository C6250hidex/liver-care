import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Activity,
  ClipboardList,
  ShieldAlert,
  Thermometer,
  Droplets,
  AlertCircle,
} from "lucide-react";
import API from "../../services/api";

const PatientClinicalFile = () => {
  const { id } = useParams(); // Patient ID
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get(`/doctor/patient/${id}/records`);
        setData(res.data);
      } catch (err) {
        console.error("Clinical fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [id]);

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setNoteError("Please enter a note before saving.");
      return;
    }

    setNoteLoading(true);
    setNoteError("");

    try {
      const res = await API.post(`/doctor/patient/${id}/notes`, {
        note: noteText.trim(),
      });
      setData((prev) => ({
        ...prev,
        notes: [res.data, ...(prev?.notes || [])],
      }));
      setNoteText("");
      setIsNoteModalOpen(false);
    } catch (err) {
      setNoteError(err.response?.data?.message || "Unable to save note.");
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-spin">
        <Activity size={40} className="mx-auto text-medical-primary" />
      </div>
    );
  if (!data)
    return <div className="p-20 text-center font-bold">Record not found.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 animate-in slide-in-from-right duration-500">
      {/* 1. Clinical Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-medical-lightText dark:text-medical-darkText">
              {data.profile.fullname}
            </h2>
            <p className="text-sm text-medical-lightMuted uppercase font-semibold tracking-wider">
              Patient File ID: #{data.profile.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-4 py-2 bg-medical-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-medical-primary/20"
          >
            Write Note
          </button>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:bg-gray-50">
            Export EMR
          </button>
        </div>
      </div>

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[1.5rem] bg-medical-lightSurface dark:bg-medical-darkSurface border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-medical-lightText dark:text-medical-darkText">
                  Add clinical note
                </h3>
                <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted">
                  Record a new observation for this patient.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>
            <form onSubmit={handleNoteSubmit} className="p-6 space-y-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note here..."
                className="w-full min-h-[180px] resize-none rounded-3xl border border-gray-200 dark:border-slate-700 bg-transparent p-4 text-sm text-medical-lightText dark:text-medical-darkText outline-none focus:ring-2 focus:ring-medical-primary/40 transition"
              />
              {noteError && <p className="text-sm text-red-500">{noteError}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-medical-lightText dark:text-medical-darkText hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteLoading}
                  className="rounded-2xl bg-medical-primary px-5 py-3 text-sm font-semibold text-white hover:bg-medical-primaryHover transition disabled:opacity-60"
                >
                  {noteLoading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: AI Analysis History */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold flex items-center gap-2 px-2 text-medical-primary">
            <Activity size={20} /> AI Risk Trajectory
          </h3>
          <div className="space-y-4">
            {data.aiHistory.map((report) => (
              <div
                key={report.id}
                className="card-style p-5 border-l-4 border-medical-primary relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-medical-lightMuted uppercase tracking-tighter">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.risk_score > 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                  >
                    {report.warning_level}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-medical-lightText dark:text-medical-darkText">
                  {report.risk_score}%
                </h4>
                <p className="text-xs text-medical-lightMuted mt-2 line-clamp-2 italic">
                  "{report.recommendations[0]}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Daily Health Logs */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold flex items-center gap-2 px-2 text-medical-accent">
            <ClipboardList size={20} /> Symptom Trend Logs
          </h3>
          <div className="card-style overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-medical-lightMuted border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Logged Date</th>
                  <th className="px-6 py-4">Temp</th>
                  <th className="px-6 py-4">Fatigue</th>
                  <th className="px-6 py-4">Jaundice</th>
                  <th className="px-6 py-4">Nausea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {data.healthLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="text-sm hover:bg-medical-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Thermometer
                          size={14}
                          className={
                            log.fever > 37.5 ? "text-red-500" : "text-blue-500"
                          }
                        />
                        <span className="font-mono font-bold">
                          {log.fever}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{log.fatigue}</td>
                    <td className="px-6 py-4">
                      {log.jaundice ? (
                        <span className="flex items-center gap-1 text-amber-600 font-black text-[10px] animate-pulse">
                          <Droplets size={12} /> OBSERVED
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">
                          NEGATIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize">{log.nausea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-style p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-medical-lightText dark:text-medical-darkText">
                  Doctor Notes
                </h3>
                <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted">
                  Keep a record of your clinical notes for this patient.
                </p>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="px-4 py-2 bg-medical-primary text-white rounded-xl text-sm font-semibold"
              >
                Add note
              </button>
            </div>

            {data.notes?.length > 0 ? (
              <div className="space-y-4">
                {data.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-4 text-xs text-medical-lightMuted dark:text-medical-darkMuted mb-2">
                      <span>{note.doctor_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-medical-lightText dark:text-medical-darkText leading-relaxed">
                      {note.note_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-medical-primary/40 bg-white dark:bg-slate-900 p-6 text-center text-sm text-medical-lightMuted">
                No notes have been added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientClinicalFile;
