import React, { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────

const roleColors = {
  patient: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  doctor: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700">
    <span className="mt-0.5 p-2 rounded-lg bg-medical-primary/10 text-medical-primary">
      <Icon size={16} />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted uppercase font-bold tracking-wide mb-0.5">
        {label}
      </p>
      {children}
    </div>
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
        ${
          type === "success"
            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
        }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit name
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // change password
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwFields, setPwFields] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);

  // avatar
  const [avatarColor, setAvatarColor] = useState("#0284C7");
  const fileRef = useRef();

  // toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    API.get("/patient/profile")
      .then((res) => {
        setProfile(res.data);
        setNameValue(res.data.fullname);
      })
      .catch(() => setError("Could not load profile. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── save name ──
  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === profile.fullname) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await API.patch("/patient/profile", { fullname: nameValue.trim() });
      setProfile((p) => ({ ...p, fullname: nameValue.trim() }));
      showToast("Name updated successfully.");
      setEditingName(false);
    } catch {
      showToast("Failed to update name.", "error");
    } finally {
      setSavingName(false);
    }
  };

  // ── change password ──
  const handleChangePw = async () => {
    if (!pwFields.current || !pwFields.next)
      return showToast("Fill in all fields.", "error");
    if (pwFields.next !== pwFields.confirm)
      return showToast("New passwords do not match.", "error");
    if (pwFields.next.length < 8)
      return showToast("Password must be at least 8 characters.", "error");
    setSavingPw(true);
    try {
      await API.patch("/patient/profile/password", {
        current_password: pwFields.current,
        new_password: pwFields.next,
      });
      showToast("Password changed successfully.");
      setShowPwForm(false);
      setPwFields({ current: "", next: "", confirm: "" });
    } catch {
      showToast("Incorrect current password.", "error");
    } finally {
      setSavingPw(false);
    }
  };

  const pwStrength = (pw) => {
    if (!pw) return null;
    const score = [
      pw.length >= 8,
      /[A-Z]/.test(pw),
      /[0-9]/.test(pw),
      /[^A-Za-z0-9]/.test(pw),
    ].filter(Boolean).length;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", w: "w-1/4" };
    if (score === 2)
      return { label: "Fair", color: "bg-amber-400", w: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", w: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", w: "w-full" };
  };

  const strength = pwStrength(pwFields.next);

  // ── loading / error ──
  if (loading)
    return (
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center gap-3 text-medical-lightMuted dark:text-medical-darkMuted">
        <Loader2 size={32} className="animate-spin text-medical-primary" />
        <span className="text-sm font-medium">Loading profile…</span>
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center gap-3">
        <AlertCircle size={32} className="text-medical-danger" />
        <p className="text-sm text-medical-danger font-medium">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-medical-primary text-white hover:bg-medical-primaryHover transition-colors"
        >
          Retry
        </button>
      </div>
    );

  const initials = profile.fullname
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-medical-lightText dark:text-medical-darkText">
          My Profile
        </h2>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-700 text-medical-lightMuted dark:text-medical-darkMuted hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-medical-darkSurface rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Avatar band */}
        <div className="h-24 bg-gradient-to-br from-medical-primary to-medical-accent" />

        <div className="px-8 pb-8 -mt-12 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white dark:border-medical-darkSurface mx-auto"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            {/* Color picker trigger */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Change avatar colour"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-medical-primary text-white flex items-center justify-center shadow border-2 border-white dark:border-medical-darkSurface hover:bg-medical-primaryHover transition-colors"
            >
              <Camera size={12} />
            </button>
            {/* Hidden color input repurposed as colour picker */}
            <input
              ref={fileRef}
              type="color"
              className="sr-only"
              value={avatarColor}
              onChange={(e) => setAvatarColor(e.target.value)}
            />
          </div>

          {/* Name (editable) */}
          {editingName ? (
            <div className="flex items-center justify-center gap-2 mb-1">
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="text-xl font-bold text-center border-b-2 border-medical-primary bg-transparent outline-none text-medical-lightText dark:text-medical-darkText w-56"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                {savingName ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(profile.fullname);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-medical-lightText dark:text-medical-darkText">
                {profile.fullname}
              </h3>
              <button
                onClick={() => setEditingName(true)}
                className="text-medical-lightMuted dark:text-medical-darkMuted hover:text-medical-primary transition-colors"
                title="Edit name"
              >
                <Edit3 size={15} />
              </button>
            </div>
          )}

          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-full capitalize ${roleColors[profile.role] ?? "bg-gray-100 text-gray-600"}`}
          >
            {profile.role} Account
          </span>
        </div>

        {/* Info rows */}
        <div className="px-8 pb-8 grid gap-3">
          <InfoRow icon={Mail} label="Email Address">
            <p className="font-medium text-medical-lightText dark:text-medical-darkText truncate">
              {profile.email}
            </p>
          </InfoRow>

          <InfoRow icon={Calendar} label="Member Since">
            <p className="font-medium text-medical-lightText dark:text-medical-darkText">
              {new Date(profile.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </InfoRow>

          <InfoRow icon={Shield} label="Account Security">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                {profile.is_verified ? (
                  <>
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                      Verified Account
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400 text-sm">
                      Not Verified
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowPwForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-medical-primary/10 text-medical-primary hover:bg-medical-primary/20 transition-colors"
              >
                <Lock size={12} />
                {showPwForm ? "Cancel" : "Change Password"}
              </button>
            </div>
          </InfoRow>

          {/* Password change form */}
          {showPwForm && (
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5 bg-gray-50 dark:bg-slate-800/50 space-y-3">
              <p className="text-sm font-semibold text-medical-lightText dark:text-medical-darkText mb-1">
                Change Password
              </p>

              {[
                { key: "current", label: "Current Password" },
                { key: "next", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" },
              ].map(({ key, label }) => (
                <div key={key} className="relative">
                  <input
                    type={showPw[key] ? "text" : "password"}
                    placeholder={label}
                    value={pwFields[key]}
                    onChange={(e) =>
                      setPwFields((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-medical-darkSurface text-medical-lightText dark:text-medical-darkText placeholder:text-medical-lightMuted dark:placeholder:text-medical-darkMuted focus:outline-none focus:ring-2 focus:ring-medical-primary/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-medical-lightMuted dark:text-medical-darkMuted hover:text-medical-primary transition-colors"
                  >
                    {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              ))}

              {/* Strength bar */}
              {pwFields.next && strength && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color} ${strength.w}`}
                    />
                  </div>
                  <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted">
                    Strength:{" "}
                    <span className="font-semibold">{strength.label}</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleChangePw}
                disabled={savingPw}
                className="w-full py-2.5 rounded-xl bg-medical-primary text-white text-sm font-semibold hover:bg-medical-primaryHover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {savingPw ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save New Password"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;
