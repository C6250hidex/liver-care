import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  AlertCircle,
} from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      console.log("Fetching moderation blogs...");
      const res = await API.get("/blog/moderation/all");
      console.log("Blogs fetched successfully:", res.data);
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Fetch blogs error - Status:", err.response?.status);
      console.error("Fetch blogs error - Data:", err.response?.data);
      console.error("Fetch blogs error - Message:", err.message);
      toast.error(err.response?.data?.message || "Failed to load posts");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      await API.patch(`/admin/blog/${id}/moderate`, { status });
      toast.success(`Post ${status}`);
      fetchBlogs();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10">
        <h2 className="text-3xl font-black">Content Moderation</h2>
        <p className="text-medical-lightMuted">
          Approve or reject clinical articles submitted by Doctors.
        </p>
      </div>

      <div className="grid gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="card-style p-6 flex flex-col md:flex-row gap-6 items-start"
          >
            <div className="w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0">
              {blog.image_url ? (
                <img
                  src={blog.image_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="text-slate-300" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${blog.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}
                >
                  {blog.status}
                </span>
                <span className="text-xs text-medical-lightMuted font-bold">
                  Author: Dr. {blog.author_name}
                </span>
              </div>
              <h4 className="text-xl font-bold text-medical-lightText dark:text-medical-darkText mb-2">
                {blog.title}
              </h4>
              <p className="text-sm text-medical-lightMuted line-clamp-2 mb-4">
                {blog.content}
              </p>

              <div className="flex gap-3">
                {blog.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleModerate(blog.id, "published")}
                      className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                    >
                      <CheckCircle size={14} /> Approve & Notify
                    </button>
                    <button
                      onClick={() => handleModerate(blog.id, "rejected")}
                      className="bg-red-50 text-red-600 border border-red-100 py-2 px-4 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                    >
                      <XCircle size={14} className="inline mr-1" /> Reject
                    </button>
                  </>
                )}
                <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-medical-primary">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {blogs.length === 0 && !loading && (
          <div className="p-20 text-center card-style border-dashed border-2">
            <CheckCircle className="mx-auto text-green-200 mb-4" size={48} />
            <p className="text-slate-500 font-bold">
              No posts awaiting moderation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogManager;
