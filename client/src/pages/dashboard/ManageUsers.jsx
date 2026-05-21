import { useEffect, useState } from "react";
import { UserCheck, UserX, ShieldCheck } from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };

    loadUsers();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await API.patch(`/admin/verify-user/${id}`, { status });
      toast.success("User status updated");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    }
  };

  const handleToggleLock = async (id, isCurrentlyActive) => {
    try {
      // If currently active, lock it (send false). If locked, unlock it (send true).
      const newState = !isCurrentlyActive;
      await API.patch(`/admin/user/${id}/lockdown`, {
        is_active: newState,
      });
      toast.success(
        newState
          ? "Account unlocked successfully"
          : "Account locked successfully",
      );
      fetchUsers();
    } catch (err) {
      console.error("Lock toggle error:", err.response?.data || err.message);
      toast.error("Unable to update account status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-black mb-8">User Management</h2>
      <div className="card-style overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase text-medical-lightMuted">
            <tr>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-6 py-4">
                  <p className="font-bold text-sm">{user.fullname}</p>
                  <p className="text-xs text-medical-lightMuted">
                    {user.email}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user.role === "doctor" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.is_verified ? (
                    <span className="flex items-center text-green-500 font-bold text-xs">
                      <ShieldCheck size={14} className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">
                      Unverified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!user.is_verified ? (
                    <button
                      onClick={() => handleVerify(user.id, true)}
                      className="p-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primaryHover transition"
                    >
                      <UserCheck size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(user.id, false)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleLock(user.id, !user.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                      user.is_active
                        ? "border-green-200 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        : "bg-red-600 text-white border-red-600"
                    }`}
                  >
                    {user.is_active ? "Active" : "Locked"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
