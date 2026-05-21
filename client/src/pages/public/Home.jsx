import React from "react";
import {
  ShieldCheck,
  Activity,
  Users,
  ArrowRight,
  CheckCircle,
  Microscope,
  HelpCircle,
  Stethoscope,
  ShieldAlert,
  HeartPulse,
  Star,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import BlogSubscribe from "../../components/BlogSubscribe"; // Assuming this is your subscription component

const Home = () => {
  return (
    <div className="flex flex-col bg-medical-lightBg dark:bg-medical-darkBg transition-colors duration-300">
      {/* 1. Hero Section (Existing) */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <span className="bg-medical-primary/10 text-medical-primary px-4 py-2 rounded-full text-sm font-bold">
              AI-Powered Hepatology
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold mt-6 leading-tight text-medical-lightText dark:text-medical-darkText">
              Advanced Care for Your{" "}
              <span className="text-medical-primary">Liver Health.</span>
            </h1>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted text-lg mt-6 max-w-lg">
              Monitor hepatitis symptoms, consult top hepatologists, and get
              AI-assisted health analysis in one secure platform.
            </p>
            <div className="flex space-x-4 mt-10">
              <Link
                to="/register"
                className="btn-primary py-4 px-8 text-lg flex items-center shadow-lg shadow-medical-primary/20"
              >
                Get Started <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/services"
                className="border border-slate-200 dark:border-slate-700 py-4 px-8 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative animate-in zoom-in duration-700">
            <div className="w-full h-[400px] bg-medical-primary/5 rounded-3xl border border-medical-primary/10 backdrop-blur-3xl relative flex items-center justify-center">
              <Activity
                size={120}
                className="text-medical-primary animate-pulse"
              />
              <div className="absolute -bottom-6 -left-6 card-style p-6 shadow-xl animate-bounce">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg text-white">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Active Patients</p>
                    <p className="font-bold">12,400+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*SECTION: Trust / Compliance Indicators */}
      <section className="py-8 border-y border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-medical-darkSurface/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
            Compliant with Leading Healthcare Frameworks
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center space-x-2 font-semibold text-medical-lightText dark:text-medical-darkText">
              <Building2 size={20} /> <span>HIPAA Secured</span>
            </div>
            <div className="flex items-center space-x-2 font-semibold text-medical-lightText dark:text-medical-darkText">
              <ShieldCheck size={20} /> <span>HL7 Standards</span>
            </div>
            <div className="flex items-center space-x-2 font-semibold text-medical-lightText dark:text-medical-darkText">
              <HeartPulse size={20} /> <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>
      {/* 2. How It Works (NEW) - Process Flow */}
      <section className="py-24 bg-medical-lightSurface dark:bg-medical-darkSurface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-medical-lightText dark:text-medical-darkText mb-4">
              The LiverCare Journey
            </h2>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted">
              Three simple steps to proactive liver health management.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Decorative Connector Line (Hidden on Mobile) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>

            {[
              {
                step: "01",
                title: "AI Screening",
                desc: "Complete our smart symptom checker to receive a real-time risk assessment.",
                icon: Microscope,
              },
              {
                step: "02",
                title: "Expert Consult",
                desc: "Connect with verified hepatologists for a deep-dive clinical consultation.",
                icon: Stethoscope,
              },
              {
                step: "03",
                title: "Daily Monitoring",
                desc: "Track symptoms and medication with automated alerts and progress charts.",
                icon: CheckCircle,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-medical-lightBg dark:bg-medical-darkBg p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center z-10"
              >
                <div className="w-12 h-12 bg-medical-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold shadow-lg shadow-medical-primary/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-medical-lightMuted dark:text-medical-darkMuted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Specialized Services (Existing) */}
      <section className="py-24 bg-white dark:bg-medical-darkBg">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-medical-lightText dark:text-medical-darkText">
            Clinical Excellence
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Symptom Analysis",
                icon: Activity,
                desc: "Real-time hepatitis risk assessment using rule-based medical AI.",
              },
              {
                title: "Verified Doctors",
                icon: ShieldCheck,
                desc: "Connect with certified liver specialists worldwide for second opinions.",
              },
              {
                title: "Remote Monitoring",
                icon: Users,
                desc: "Log daily fatigue, jaundice, and medication adherence seamlessly.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-medical-primary transition-all group hover:bg-medical-primary/5"
              >
                <item.icon
                  className="mx-auto text-medical-primary mb-4 transition-transform group-hover:scale-110"
                  size={40}
                />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-medical-darkMuted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Accuracy Matters (NEW) - Clinical Trust */}
      <section className="py-24 bg-medical-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <ShieldAlert size={400} />
        </div>
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              Built on Clinical Guidelines
            </h2>
            <div className="space-y-6">
              {[
                "94% Accuracy in identifying early hepatitis symptoms",
                "End-to-End Encryption for all medical records",
                "24/7 Access to specialized hepatology resources",
                "Compliant with international healthcare data standards",
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <CheckCircle className="text-blue-200 shrink-0" size={24} />
                  <span className="text-lg font-medium">{text}</span>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="inline-block mt-12 bg-white text-medical-primary px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition"
            >
              Read Our Clinical Whitepaper
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
              <p className="text-4xl font-bold mb-2">99.9%</p>
              <p className="text-blue-100 text-sm">System Uptime</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 mt-8">
              <p className="text-4xl font-bold mb-2">256-bit</p>
              <p className="text-blue-100 text-sm">Data Encryption</p>
            </div>
          </div>
        </div>
      </section>
      {/* NEW SECTION: Platform Impact Data / Performance Numbers */}
      <section className="py-20 bg-white dark:bg-medical-darkSurface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { val: "250K+", label: "Evaluations Processed" },
              { val: "150+", label: "Affiliated Hepatologists" },
              { val: "4.9/5", label: "Patient Retention Rating" },
              { val: "12+", label: "Supported Global Regions" },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <p className="text-3xl sm:text-4xl font-extrabold text-medical-primary dark:text-sky-400 tracking-tight">
                  {stat.val}
                </p>
                <p className="text-medical-lightMuted dark:text-medical-darkMuted text-xs sm:text-sm font-semibold tracking-wide uppercase mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION: Patient Testimonials Grid */}
      <section className="py-24 bg-medical-lightBg dark:bg-medical-darkBg/60 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-medical-lightText dark:text-medical-darkText tracking-tight">
              What Our Community Says
            </h2>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted mt-4">
              Real validation from patients who have redefined their lifestyle
              tracking using our tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The AI symptom checker instantly helped flag risk factors that my general clinic had overlooked. Truly a brilliant, intuitive interface.",
                user: "Sarah K.",
                role: "Patient Advocate",
              },
              {
                text: "Managing a chronic hepatitis plan became simpler once my regular blood panels could map seamlessly to tracking charts. High clarity text outputs.",
                user: "David M.",
                role: "Active Member",
              },
              {
                text: "Highly encrypted, responsive support, and instantaneous responses from specialist physicians. Highly recommended for premium virtual health safety.",
                user: "Elena R.",
                role: "Chronic Care Patient",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 bg-white dark:bg-medical-darkSurface rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 space-x-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={16} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-medical-lightMuted dark:text-medical-darkMuted text-sm leading-relaxed italic">
                    "{item.text}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-medical-primary/20 flex items-center justify-center font-bold text-xs text-medical-primary">
                    {item.user[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-medical-lightText dark:text-medical-darkText">
                      {item.user}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions (NEW) */}
      <section className="py-24 bg-medical-lightSurface dark:bg-medical-darkSurface">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <HelpCircle
              size={48}
              className="text-medical-primary mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is the AI analysis a medical diagnosis?",
                a: "No. The AI analysis provides a risk assessment based on symptoms. It is meant to assist, not replace, a professional medical diagnosis.",
              },
              {
                q: "How do I book an appointment?",
                a: "Once registered, you can visit the 'Find Doctors' page, select a specialist, and choose an available time slot.",
              },
              {
                q: "Is my data shared with insurance companies?",
                a: "Never. Your medical data is strictly private and only accessible by you and the doctors you authorize.",
              },
            ].map((faq, i) => (
              <details key={i} className="group card-style p-6 cursor-pointer">
                <summary className="font-bold text-lg flex justify-between items-center list-none">
                  {faq.q}
                  <span className="text-medical-primary group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-medical-lightMuted dark:text-medical-darkMuted border-t pt-4 border-slate-100 dark:border-slate-800">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Blog & Newsletter (Brevo Integration) */}
      <BlogSubscribe />
    </div>
  );
};

export default Home;
