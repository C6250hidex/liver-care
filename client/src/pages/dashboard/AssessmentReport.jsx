import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  Calendar,
  Activity,
  ShieldCheck,
  Download,
  Printer,
} from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const AssessmentReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await API.get(`/ai/report/${id}`);
        setData(res.data);
      } catch (err) {
        toast.error("Could not find the requested report.");
        navigate("/dashboard/patient/history");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-medical-primary font-bold text-xl">
        Generating Clinical Report...
      </div>
    );
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom duration-500">
      {/* 1. Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-medical-lightMuted hover:text-medical-primary mb-6 font-bold transition-colors"
      >
        <ChevronLeft size={20} /> Back to History
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-medical-lightText dark:text-medical-darkText">
            Medical Assessment Report
          </h2>
          <p className="text-medical-lightMuted flex items-center gap-2 mt-1">
            <FileText size={14} /> ID: #{data.id}{" "}
            <Calendar size={14} className="ml-2" />{" "}
            {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
          >
            <Printer size={20} />
          </button>
          <button className="btn-primary flex items-center gap-2 px-6">
            <Download size={18} /> Save PDF
          </button>
        </div>
      </div>

      {/* 2. Core Result Card */}
      <div className="card-style p-8 border-l-8 border-medical-primary mb-8 bg-gradient-to-r from-medical-primary/5 to-transparent">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-widest text-medical-primary opacity-70 mb-2">
              Calculated Risk Score
            </p>
            <h3 className="text-7xl font-black text-medical-primary">
              {data.risk_score}%
            </h3>
            <p className="text-xl font-bold mt-2">
              {data.warning_level} Risk Level Identified
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold flex items-center gap-2 mb-3 text-medical-primary">
              <Activity size={18} /> Clinical Summary
            </h4>
            <p className="text-sm text-medical-lightMuted leading-relaxed italic">
              "This analysis indicates a {data.risk_score}% probability of
              hepatic inflammation based on self-reported physical markers and
              medical history."
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 3. Factors Breakdown */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold flex items-center gap-2 px-2">
            <ShieldCheck size={20} className="text-medical-primary" />{" "}
            Contributing Factors
          </h4>
          <div className="space-y-3">
            {data.symptoms_json.symptomFactors?.map((f, i) => (
              <div
                key={i}
                className="card-style p-4 border-l-4 border-medical-primary"
              >
                <p className="font-bold text-sm mb-1">{f.label}</p>
                <p className="text-xs text-medical-lightMuted">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recommendations */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold flex items-center gap-2 px-2">
            <FileText size={20} className="text-medical-accent" /> Recommended
            Actions
          </h4>
          <div className="bg-medical-accent/5 rounded-3xl p-6 space-y-4 border border-medical-accent/10">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-medical-accent text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-medical-lightMuted font-medium">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Legal Disclaimer */}
      <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 text-center">
        <p className="text-[10px] text-medical-lightMuted uppercase tracking-tighter leading-relaxed">
          Disclaimer: This AI result is a clinical guidance tool and does NOT
          constitute a final medical diagnosis. Patients are advised to present
          this report to a licensed hepatologist or GP for further clinical
          verification and laboratory blood testing (ALT/AST/Serology).
        </p>
      </div>
    </div>
  );
};

export default AssessmentReport;
