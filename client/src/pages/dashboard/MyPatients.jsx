import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  ChevronRight,
  Mail,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const MyPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/doctor/my-patients").then((res) => {
      setPatients(res.data);
      setLoading(false);
    });
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-medical-lightText dark:text-medical-darkText">
            Patient Database
          </h2>
          <p className="text-medical-lightMuted font-medium">
            Manage your clinical relationships and records.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-medical-darkSurface outline-none focus:ring-2 focus:ring-medical-primary shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 card-style animate-pulse bg-slate-100 dark:bg-slate-800"
              ></div>
            ))
          : filteredPatients.map((p) => (
              <div
                key={p.id}
                className="card-style p-6 group hover:border-medical-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => navigate(`/dashboard/doctor/patient/${p.id}`)}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-medical-primary/10 rounded-2xl flex items-center justify-center font-black text-medical-primary text-xl uppercase">
                    {p.fullname.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-lg truncate">{p.fullname}</h4>
                    <div className="flex items-center text-xs text-medical-lightMuted gap-1">
                      <Mail size={12} />{" "}
                      <span className="truncate">{p.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Total Visits
                    </p>
                    <p className="font-bold text-sm">{p.total_appointments}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Last Seen
                    </p>
                    <p className="font-bold text-sm">
                      {new Date(p.last_visit).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button className="w-full mt-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-medical-primary font-bold text-xs rounded-xl flex items-center justify-center gap-2 group-hover:bg-medical-primary group-hover:text-white transition-all">
                  <ExternalLink size={14} /> Open Clinical File
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MyPatients;
