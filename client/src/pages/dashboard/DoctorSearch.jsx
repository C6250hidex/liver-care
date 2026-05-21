import { useState, useEffect } from "react";
import { Search, MapPin, Star, Calendar, Loader2 } from "lucide-react";
import API from "../../services/api";
import BookingModal from "../../components/dashboard/BookingModal"; // Import the new modal

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/patient/doctors");
        setDoctors(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const name = doc.fullname?.toLowerCase() || "";
    const specialty = doc.specialization?.toLowerCase() || "";
    const profession = doc.profession?.toLowerCase() || "";

    return (
      name.includes(query) ||
      specialty.includes(query) ||
      profession.includes(query)
    );
  });

  const openBooking = (doc) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
            Hepatology Specialists
          </h2>
          <p className="text-medical-lightMuted mt-1">
            Book a verified consultation based on your AI assessment.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-medical-darkSurface outline-none focus:ring-2 focus:ring-medical-primary shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-medical-primary" size={40} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full card-style p-16 text-center text-medical-lightMuted">
              No doctors match your search. Try a different name or specialty.
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc.doctor_user_id}
                className="card-style p-6 group hover:border-medical-primary transition-all duration-300"
              >
                {/* Doctor Identity */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-xl uppercase">
                    {doc.fullname?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-medical-primary transition-colors">
                      {doc.fullname}
                    </h4>
                    <p className="text-sm font-semibold text-medical-primary/80">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted line-clamp-2 h-10 mb-6 italic">
                  "
                  {doc.bio ||
                    "Dedicated to providing the highest quality liver care through advanced diagnostics."}
                  "
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-gray-50 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Experience
                    </p>
                    <p className="font-bold text-sm">
                      {doc.experience_years} Years
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Fee
                    </p>
                    <p className="font-bold text-sm text-green-600">
                      ${doc.consultation_fee}
                    </p>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={() => openBooking(doc)}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-medical-primary/10"
                >
                  <Calendar size={18} />
                  Schedule Visit
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🛑 MODAL INTEGRATION */}
      {isModalOpen && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DoctorSearch;
