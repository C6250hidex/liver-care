import React, { useState, useEffect } from "react";
import {
  Save,
  Stethoscope,
  DollarSign,
  BookOpen,
  Award,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../services/api";

const DoctorProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    specialization: "",
    experience_years: "",
    consultation_fee: "",
    bio: "",
  });

  useEffect(() => {
    API.get("/doctor/profile").then((res) => {
      if (res.data) setProfile(res.data);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.patch("/doctor/profile", profile);
      toast.success("Professional profile published!");
    } catch (err) {
      toast.error("Update failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-medical-lightText dark:text-medical-darkText">
          Professional Identity
        </h2>
        <p className="text-medical-lightMuted">
          Configure how patients see you in search results.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-style p-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-medical-lightMuted tracking-widest flex items-center gap-2">
                <Stethoscope size={14} className="text-medical-primary" />{" "}
                Specialization
              </label>
              <input
                value={profile.specialization}
                onChange={(e) =>
                  setProfile({ ...profile, specialization: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary font-bold text-sm"
                placeholder="e.g. Consultant Hepatologist"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-medical-lightMuted tracking-widest flex items-center gap-2">
                <Award size={14} className="text-medical-primary" /> Experience
                (Years)
              </label>
              <input
                type="number"
                value={profile.experience_years}
                onChange={(e) =>
                  setProfile({ ...profile, experience_years: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary font-bold text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-medical-lightMuted tracking-widest flex items-center gap-2">
                <DollarSign size={14} className="text-green-500" /> Consultation
                Fee ($)
              </label>
              <input
                type="number"
                value={profile.consultation_fee}
                onChange={(e) =>
                  setProfile({ ...profile, consultation_fee: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-medical-lightMuted tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-medical-primary" />{" "}
              Professional Biography
            </label>
            <textarea
              rows="5"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary font-medium text-sm leading-relaxed"
              placeholder="Provide a detailed overview of your clinical background and interest in liver health..."
            ></textarea>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              disabled={loading}
              className="btn-primary px-10 py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-medical-primary/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <CheckCircle size={18} /> Save Professional Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
