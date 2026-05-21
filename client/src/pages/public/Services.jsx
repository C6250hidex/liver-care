import React from "react";
import {
  Activity,
  Calendar,
  FileText,
  Bell,
  Search,
  Shield,
} from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "AI Symptom Checker",
      desc: "Advanced analysis of liver symptoms using medical rule-based logic.",
      icon: Activity,
    },
    {
      title: "Appointment Booking",
      desc: "Securely book consultations with verified hepatologists.",
      icon: Calendar,
    },
    {
      title: "Patient Records",
      desc: "Centralized storage for your hepatitis history and lab reports.",
      icon: FileText,
    },
    {
      title: "Medication Reminders",
      desc: "Automated alerts for your treatment and follow-up schedules.",
      icon: Bell,
    },
    {
      title: "Doctor Search",
      desc: "Filter specialists by availability, rating, and expertise.",
      icon: Search,
    },
    {
      title: "Data Privacy",
      desc: "End-to-end encrypted medical data following strict privacy protocols.",
      icon: Shield,
    },
  ];

  return (
    <div className="py-20 max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Comprehensive Liver Care</h2>
        <p className="text-medical-lightMuted dark:text-medical-darkMuted max-w-2xl mx-auto text-lg">
          We provide a full ecosystem of tools designed specifically for
          hepatitis management and liver health optimization.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div
            key={i}
            className="card-style p-8 hover:border-medical-primary transition-all group"
          >
            <div className="w-14 h-14 bg-medical-primary/10 rounded-2xl flex items-center justify-center text-medical-primary mb-6 group-hover:bg-medical-primary group-hover:text-white transition-all">
              <s.icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{s.title}</h3>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
