import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "patient", // Default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/register", formData);
      // Success: Navigate to login
      navigate("/login", {
        state: { message: "Account created! Please login." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="card-style w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-[#0284c7]/10 mb-4 transition-transform hover:rotate-6">
            <ShieldCheck className="text-[#0284c7] w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-slate-500 dark:text-[#94a3b8] mt-2">
            Join LiverCare for smart health monitoring
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 flex items-center text-sm">
            <AlertCircle size={18} className="mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#0284c7] outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#0284c7] outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#0284c7] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "patient" })}
                className={`py-2 rounded-lg border transition-all ${
                  formData.role === "patient"
                    ? "bg-[#0284c7] border-[#0284c7] text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "doctor" })}
                className={`py-2 rounded-lg border transition-all ${
                  formData.role === "doctor"
                    ? "bg-[#0284c7] border-[#0284c7] text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                Doctor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Creating Account...
              </>
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 dark:text-[#94a3b8]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#0284c7] font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
