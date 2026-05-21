import React from "react";
import { ShieldCheck, Heart, Award, Stethoscope, Target } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      title: "Medical Accuracy",
      desc: "Our AI logic is built upon validated clinical guidelines for hepatitis and liver disease screening.",
      icon: Award,
      color: "text-blue-500",
    },
    {
      title: "Patient Privacy",
      desc: "We utilize end-to-end encryption and secure MySQL storage to ensure your medical history remains private.",
      icon: ShieldCheck,
      color: "text-green-500",
    },
    {
      title: "Compassionate Care",
      desc: "Beyond technology, we connect you with real hepatologists who understand your journey.",
      icon: Heart,
      color: "text-red-500",
    },
  ];

  const doctors = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Senior Hepatologist",
      specialty: "Viral Hepatitis Research",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    },
    {
      name: "Dr. Marcus Chen",
      role: "Liver Transplant Specialist",
      specialty: "Chronic Liver Disease",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Clinical Pathologist",
      specialty: "Diagnostic AI Integration",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
    },
  ];

  return (
    <div className="bg-medical-lightBg dark:bg-medical-darkBg min-h-screen transition-colors duration-300">
      {/* 1. Hero / Mission Statement */}
      <section className="py-20 bg-medical-primary/5 border-b border-medical-primary/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-medical-lightText dark:text-medical-darkText mb-6">
            Bridging Technology and <br />
            <span className="text-medical-primary">Clinical Expertise.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed">
            LiverCare was founded with a single goal: to reduce the global
            burden of hepatitis through early AI-assisted detection and seamless
            access to specialized medical care.
          </p>
        </div>
      </section>

      {/* 2. Our Values */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
          <div className="flex-1">
            <div className="inline-flex p-3 rounded-xl bg-medical-primary/10 text-medical-primary mb-4">
              <Target size={28} />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted text-lg mb-8">
              We believe that healthcare should be proactive, not reactive. By
              combining advanced data science with traditional medicine, we
              empower patients to take control of their liver health.
            </p>
            <div className="grid gap-6">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-1 ${v.color}`}>
                    <v.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{v.title}</h4>
                    <p className="text-medical-lightMuted dark:text-medical-darkMuted">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-medical-primary/20 rounded-3xl blur-2xl animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                alt="Medical team"
                className="relative rounded-3xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Meet the Specialists */}
      <section className="py-24 bg-medical-lightSurface dark:bg-medical-darkSurface border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Expert Medical Board</h2>
            <p className="text-medical-lightMuted dark:text-medical-darkMuted">
              The clinical minds behind the LiverCare AI protocols.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doc, i) => (
              <div key={i} className="card-style p-6 text-center group">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-medical-primary rounded-full scale-0 group-hover:scale-105 transition-transform duration-300"></div>
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="relative w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800"
                  />
                </div>
                <h3 className="text-xl font-bold">{doc.name}</h3>
                <p className="text-medical-primary font-semibold text-sm mb-2">
                  {doc.role}
                </p>
                <div className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-medical-lightMuted dark:text-medical-darkMuted">
                  <Stethoscope size={12} className="mr-1" /> {doc.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Join the Community CTA */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4">
        <div className="card-style p-12 bg-medical-primary text-white dark:bg-medical-primary border-none shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to prioritize your health?
          </h2>
          <p className="text-blue-100 mb-10 text-lg">
            Join thousands of patients who use LiverCare to monitor their health
            and connect with experts daily.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-medical-primary hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="bg-medical-primaryHover text-white border border-white/20 px-8 py-3 rounded-xl font-bold transition"
            >
              Patient Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
