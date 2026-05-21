import React, { useState } from "react";
import { BellRing, CheckCircle } from "lucide-react";
import API from "../services/api";

const BlogSubscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await API.post("/blog/subscribe", { email });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      alert("Subscription failed.");
    }
  };

  return (
    <section className="py-16 bg-medical-primary/5 dark:bg-medical-darkSurface border-y border-medical-primary/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex p-3 rounded-full bg-medical-primary/10 mb-4 text-medical-primary">
          <BellRing size={28} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Join our Medical Newsletter</h2>
        <p className="text-medical-lightMuted dark:text-medical-darkMuted mb-8">
          Get notified immediately when our doctors post new liver care research
          and hepatitis updates.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center space-x-2 text-medical-accent font-bold animate-bounce">
            <CheckCircle size={24} />
            <span>You are subscribed!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col md:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              className="flex-grow px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary py-3 px-8 whitespace-nowrap"
            >
              {status === "loading" ? "Joining..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default BlogSubscribe;
