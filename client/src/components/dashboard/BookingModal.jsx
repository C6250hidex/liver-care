import { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  Stethoscope,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:30", label: "03:30 PM" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Parse doctor.availability_json — might be an array or a JSON string
const parseAvailability = (raw) => {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const dayNameFromIndex = (i) =>
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][i];

// ── mini calendar ─────────────────────────────────────────────────────────────

const MiniCalendar = ({ selected, onChange, availableDays }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (d) => {
    if (!d) return true;
    const date = new Date(year, month, d);
    if (date < today) return true;
    if (availableDays) {
      const name = dayNameFromIndex(date.getDay());
      return !availableDays.includes(name);
    }
    return false;
  };

  const toStr = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* nav */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold text-medical-lightMuted dark:text-medical-darkMuted py-1.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* cells */}
      <div className="grid grid-cols-7 p-2 gap-1 bg-white dark:bg-medical-darkSurface">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const str = toStr(d);
          const disabled = isDisabled(d);
          const isSelected = selected === str;
          const isToday =
            new Date(year, month, d).getTime() === today.getTime();

          return (
            <button
              key={str}
              type="button"
              disabled={disabled}
              onClick={() => onChange(str)}
              className={`
                h-8 w-full rounded-lg text-sm font-medium transition-colors
                ${
                  isSelected
                    ? "bg-medical-primary text-white shadow-sm"
                    : isToday && !disabled
                      ? "bg-medical-primary/10 text-medical-primary font-bold"
                      : disabled
                        ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-medical-lightText dark:text-medical-darkText"
                }
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────

const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]); // slots already taken on selected date
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "09:00",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = date/time, 2 = reason, 3 = confirm

  const availability = parseAvailability(doctor.availability_json);

  // Fetch already-booked slots when date changes
  useEffect(() => {
    if (!formData.date || !doctor.doctor_user_id) return;
    Promise.resolve().then(() => setLoadingSlots(true));
    API.get(
      `/patient/booked-slots?doctor_id=${doctor.doctor_user_id}&date=${formData.date}`,
    )
      .then((res) => setBookedSlots(res.data?.booked_times ?? []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [formData.date, doctor.doctor_user_id]);

  // Auto-select first available time when date changes
  useEffect(() => {
    if (!formData.date) return;
    const firstFree = TIME_SLOTS.find((s) => !bookedSlots.includes(s.value));
    if (firstFree)
      Promise.resolve().then(() =>
        setFormData((f) => ({ ...f, time: firstFree.value })),
      );
  }, [bookedSlots, formData.date]);

  // ── validation ──
  const validate = useCallback(() => {
    const e = {};
    if (!formData.date) e.date = "Please select a date.";
    if (!formData.time) e.time = "Please select a time slot.";
    if (step === 2 && formData.reason.trim().length < 10)
      e.reason = "Please describe your symptoms (min 10 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData, step]);

  const handleNext = () => {
    if (validate()) setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/patient/book-appointment", {
        doctor_id: doctor.doctor_user_id,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        assessment_id: localStorage.getItem("last_assessment_id") || null,
      });
      toast.success(`Request sent to ${doctor.fullname}`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  // ── close on backdrop click ──
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const selectedSlotLabel = TIME_SLOTS.find(
    (s) => s.value === formData.time,
  )?.label;
  const charCount = formData.reason.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-medical-darkBg/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
      onClick={handleBackdrop}
    >
      <div className="bg-medical-lightSurface dark:bg-medical-darkSurface w-full max-w-4xl rounded-[2rem] shadow-[0_30px_80px_rgba(15,23,42,0.35)] border border-gray-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-medical-primary to-medical-accent p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Book Consultation</h3>
              <p className="text-blue-100 text-sm">{doctor.fullname}</p>
              {doctor.specialization && (
                <p className="text-blue-200 text-xs">{doctor.specialization}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          {["Date & Time", "Reason", "Confirm"].map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors relative
                ${
                  step === i + 1
                    ? "text-medical-primary"
                    : i + 1 < step
                      ? "text-medical-accent cursor-pointer"
                      : "text-medical-lightMuted dark:text-medical-darkMuted cursor-default"
                }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-1.5
                ${step === i + 1 ? "bg-medical-primary text-white" : i + 1 < step ? "bg-medical-accent text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500"}`}
              >
                {i + 1}
              </span>
              {label}
              {step === i + 1 && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-primary rounded-t" />
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0"
        >
          {/* ── Step 1: Date & Time ── */}
          {step === 1 && (
            <>
              {/* Availability hint */}
              {availability && (
                <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Available days</p>
                    <p>{availability.join(", ")}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-medical-lightText dark:text-medical-darkText flex items-center gap-2">
                      <Calendar size={15} className="text-medical-primary" />{" "}
                      Preferred Date
                    </label>
                    <MiniCalendar
                      selected={formData.date}
                      onChange={(d) => {
                        setFormData((f) => ({ ...f, date: d }));
                        setErrors((e) => ({ ...e, date: null }));
                      }}
                      availableDays={availability}
                    />
                    {errors.date && (
                      <p className="text-xs text-medical-danger flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-medical-lightText dark:text-medical-darkText flex items-center gap-2">
                      <Clock size={15} className="text-medical-primary" /> Time
                      Slot
                      {loadingSlots && (
                        <Loader2
                          size={12}
                          className="animate-spin text-medical-primary"
                        />
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const taken = bookedSlots.includes(slot.value);
                        const selected = formData.time === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            disabled={taken || !formData.date}
                            onClick={() => {
                              setFormData((f) => ({ ...f, time: slot.value }));
                              setErrors((e) => ({ ...e, time: null }));
                            }}
                            className={`py-2 rounded-xl text-sm font-semibold border transition-all
                              ${
                                selected
                                  ? "bg-medical-primary text-white border-medical-primary shadow-sm"
                                  : taken
                                    ? "bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-slate-600 border-gray-200 dark:border-slate-700 cursor-not-allowed line-through"
                                    : !formData.date
                                      ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-700 text-medical-lightMuted"
                                      : "border-gray-200 dark:border-slate-700 hover:border-medical-primary hover:bg-medical-primary/5 text-medical-lightText dark:text-medical-darkText"
                              }`}
                          >
                            {slot.label}
                            {taken && (
                              <span className="block text-xs font-normal">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {errors.time && (
                      <p className="text-xs text-medical-danger flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                <aside className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/70 p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-medical-lightText dark:text-medical-darkText">
                      Doctor details
                    </p>
                    <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted">
                      Everything you need for a smooth booking experience.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-xs uppercase tracking-[0.2em] text-medical-lightMuted dark:text-medical-darkMuted mb-2">
                      Specialist
                    </p>
                    <p className="font-semibold text-medical-lightText dark:text-medical-darkText text-lg">
                      {doctor.specialization || "General Hepatology"}
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-medical-lightText dark:text-medical-darkText">
                      <div className="flex items-center justify-between">
                        <span className="text-medical-lightMuted dark:text-medical-darkMuted">
                          Experience
                        </span>
                        <span className="font-semibold">
                          {doctor.experience_years || 0} yrs
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-medical-lightMuted dark:text-medical-darkMuted">
                          Fee
                        </span>
                        <span className="font-semibold text-green-600">
                          ${doctor.consultation_fee || "120"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 text-sm text-medical-lightText dark:text-medical-darkText">
                    <p className="font-semibold mb-2">What to expect</p>
                    <ul className="space-y-2 list-disc list-inside text-sm text-medical-lightMuted dark:text-medical-darkMuted">
                      <li>Secure video or in-person consultation</li>
                      <li>Review of your recent symptoms</li>
                      <li>Personalized liver health advice</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          )}

          {/* ── Step 2: Reason ── */}
          {step === 2 && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-medical-lightText dark:text-medical-darkText flex items-center gap-2">
                <FileText size={15} className="text-medical-primary" /> Reason
                for Visit
              </label>
              <textarea
                placeholder="Describe your symptoms or reason for the visit…"
                value={formData.reason}
                onChange={(e) => {
                  setFormData((f) => ({ ...f, reason: e.target.value }));
                  setErrors((e2) => ({ ...e2, reason: null }));
                }}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-medical-primary/40 transition-all min-h-[130px] resize-none text-sm text-medical-lightText dark:text-medical-darkText placeholder:text-medical-lightMuted dark:placeholder:text-medical-darkMuted"
              />
              <div className="flex justify-between items-center">
                {errors.reason ? (
                  <p className="text-xs text-medical-danger flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.reason}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ${charCount < 10 ? "text-medical-lightMuted" : "text-green-600 dark:text-green-400"}`}
                >
                  {charCount} chars
                </span>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
                Review your appointment
              </p>
              {[
                { label: "Doctor", value: doctor.fullname },
                {
                  label: "Date",
                  value: new Date(
                    formData.date + "T00:00:00",
                  ).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
                { label: "Time", value: selectedSlotLabel },
                { label: "Reason", value: formData.reason || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700"
                >
                  <span className="text-xs font-bold text-medical-lightMuted dark:text-medical-darkMuted uppercase tracking-wide w-14 shrink-0 pt-0.5">
                    {label}
                  </span>
                  <span className="text-sm text-medical-lightText dark:text-medical-darkText font-medium leading-relaxed">
                    {value}
                  </span>
                </div>
              ))}
              {localStorage.getItem("last_assessment_id") && (
                <div className="flex items-start gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-xs text-teal-700 dark:text-teal-300">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  Your latest AI assessment will be attached to this
                  appointment.
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 font-bold text-medical-lightMuted hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all text-sm"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 font-bold text-medical-lightMuted hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] py-3 font-bold rounded-xl bg-medical-primary text-white hover:bg-medical-primaryHover transition-colors text-sm flex items-center justify-center gap-2"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 font-bold rounded-xl bg-medical-primary text-white hover:bg-medical-primaryHover disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <CheckCircle size={18} /> Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
