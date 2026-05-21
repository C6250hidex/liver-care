import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";
import { ArrowLeft, Calendar, User } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await API.get(`/blog/${id}`);
        setBlog(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this article.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-medical-primary hover:underline mb-10"
        >
          <ArrowLeft size={16} /> Back to articles
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            <h2 className="text-xl font-bold">Article not available</h2>
            <p className="mt-3 text-sm">{error}</p>
          </div>
        ) : (
          <article className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-medical-primary uppercase tracking-widest">
                {blog.category}
              </span>
              <h1 className="text-4xl font-black text-medical-lightText dark:text-medical-darkText">
                {blog.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-medical-lightMuted dark:text-medical-darkMuted">
                <span className="inline-flex items-center gap-2">
                  <User size={16} /> {blog.author_name}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(blog.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {blog.image_url && (
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-[420px] object-cover"
                />
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none">
              {blog.content.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
