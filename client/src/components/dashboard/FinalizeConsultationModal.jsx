import { useState } from "react";
import { CheckCircle, X, Loader2 } from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const FinalizeConsultationModal = ({ appointment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState({ diagnosis: "", clinical_advice: "" });

  const handleFinalize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/doctor/appointment/${appointment.id}/complete`, {
        ...note,
        patient_id: appointment.patient_id,
      });
      toast.success("Medical record updated.");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Finalization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-medical-darkBg/60 backdrop-blur-sm">
      <div className="card-style w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 bg-medical-primary text-white flex justify-between items-center">
          <h3 className="font-bold uppercase tracking-tighter">
            Finalize Session: {appointment.patient_name}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleFinalize} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-medical-lightMuted">
              Primary Diagnosis
            </label>
            <input
              required
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="e.g. Acute Hepatitis B, Stage 1"
              onChange={(e) => setNote({ ...note, diagnosis: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-medical-lightMuted">
              Clinical Advice & Next Steps
            </label>
            <textarea
              required
              rows="4"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-medical-primary resize-none"
              placeholder="Provide dietary changes or follow-up instructions..."
              onChange={(e) =>
                setNote({ ...note, clinical_advice: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle size={20} /> Sign & Complete Visit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinalizeConsultationModal;
