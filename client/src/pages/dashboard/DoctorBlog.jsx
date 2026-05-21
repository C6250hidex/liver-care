import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const DoctorBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Liver Health");
  const [imageUrl, setImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverFile(null);
      setImageUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverFile(file);
      setImageUrl(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and article content.");
      return;
    }

    setSaving(true);
    try {
      await API.post("/doctor/blogs", {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || "Liver Health",
        image_url: imageUrl.trim() || null,
      });
      toast.success("Blog published successfully.");
      setTitle("");
      setCategory("Liver Health");
      setImageUrl("");
      setContent("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish blog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-medical-primary hover:underline"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black text-medical-lightText dark:text-medical-darkText">
            Publish Medical Insights
          </h1>
          <p className="mt-2 text-medical-lightMuted dark:text-medical-darkMuted">
            Create a new blog post and notify newsletter subscribers instantly.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-medical-darkSurface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold text-medical-primary">
            <Sparkles size={18} /> Doctor Only
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-bold">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter headline"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-5 py-4 outline-none focus:ring-2 focus:ring-medical-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Liver Health"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-5 py-4 outline-none focus:ring-2 focus:ring-medical-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold">Cover Image</label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-medical-primary"
              />
              <p className="text-[11px] text-medical-lightMuted dark:text-medical-darkMuted">
                Select an image from your device. If you prefer, you can still
                provide a remote URL.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setCoverFile(null);
                  setImageUrl(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-5 py-4 outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>
          </div>
          {imageUrl && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <img
                src={imageUrl}
                alt="Cover preview"
                className="w-full h-60 object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold">Article Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Write the article details here..."
            className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-transparent px-5 py-4 outline-none focus:ring-2 focus:ring-medical-primary resize-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-medical-darkSurface">
            <div className="flex items-start gap-3">
              <BookOpen size={20} className="text-medical-primary mt-1" />
              <div>
                <h3 className="font-bold">Blog post guidelines</h3>
                <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mt-2">
                  Provide a relevant title, clear medical insights, and a
                  concise summary so patients can understand the health advice.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-medical-darkSurface">
            <div className="flex items-start gap-3">
              <MessageSquare size={20} className="text-medical-accent mt-1" />
              <div>
                <h3 className="font-bold">Subscriber notifications</h3>
                <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted mt-2">
                  When you publish, registered subscribers will receive an email
                  update automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-4 text-lg font-bold rounded-3xl disabled:opacity-60"
        >
          {saving ? "Publishing..." : "Publish Blog Post"}
        </button>
      </form>
    </div>
  );
};

export default DoctorBlog;
