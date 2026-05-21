import React, { useState } from "react";
import { Lock, Bell, Database, X } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminSettings = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleManageAccess = () => {
    setActiveModal("security");
    toast.success("Security & Access manager opened");
  };

  const handleConfigureAlerts = () => {
    setActiveModal("notifications");
    toast.success("Notification settings opened");
  };

  const handleUpdatePolicy = () => {
    setActiveModal("retention");
    toast.success("Data retention policy opened");
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-black">Platform Settings</h2>
        <p className="text-medical-lightMuted">
          Configure system-wide preferences, application policies, and
          platform-level controls.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-style p-6 space-y-3 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-500" />
            <h3 className="text-lg font-bold">Security & Access</h3>
          </div>
          <p className="text-sm text-medical-lightMuted">
            Manage admin permissions, session timeouts, and login requirements
            for the platform.
          </p>
          <button
            onClick={handleManageAccess}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase hover:shadow-lg transition-shadow"
          >
            Manage Access
          </button>
        </div>

        <div className="card-style p-6 space-y-3 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-orange-500" />
            <h3 className="text-lg font-bold">Notifications</h3>
          </div>
          <p className="text-sm text-medical-lightMuted">
            Control global notification rules for blog subscribers, appointment
            alerts, and admin announcements.
          </p>
          <button
            onClick={handleConfigureAlerts}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase hover:shadow-lg transition-shadow"
          >
            Configure Alerts
          </button>
        </div>

        <div className="card-style p-6 space-y-3 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-green-500" />
            <h3 className="text-lg font-bold">Data Retention</h3>
          </div>
          <p className="text-sm text-medical-lightMuted">
            Set governance policies for clinical records, assessment history,
            and user audit logs.
          </p>
          <button
            onClick={handleUpdatePolicy}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase hover:shadow-lg transition-shadow"
          >
            Update Policy
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-medical-lightText dark:text-medical-darkText">
                {activeModal === "security" && "Security & Access Settings"}
                {activeModal === "notifications" && "Notification Settings"}
                {activeModal === "retention" && "Data Retention Policy"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {activeModal === "security" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Require 2FA for admins</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">30-minute session timeout</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">IP whitelist enforcement</span>
                  </label>
                </div>
              )}
              {activeModal === "notifications" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Send subscriber digests</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Appointment reminders</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">
                      Critical alert notifications
                    </span>
                  </label>
                </div>
              )}
              {activeModal === "retention" && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <label className="text-sm font-semibold">
                      Retain assessment records
                    </label>
                    <select className="w-full mt-2 p-2 rounded border border-gray-300 dark:border-slate-700 dark:bg-slate-800">
                      <option>6 months</option>
                      <option selected>1 year</option>
                      <option>2 years</option>
                      <option>Indefinite</option>
                    </select>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <label className="text-sm font-semibold">
                      Activity log retention
                    </label>
                    <select className="w-full mt-2 p-2 rounded border border-gray-300 dark:border-slate-700 dark:bg-slate-800">
                      <option>3 months</option>
                      <option selected>6 months</option>
                      <option>1 year</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Settings saved successfully!");
                  closeModal();
                }}
                className="btn-primary px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
