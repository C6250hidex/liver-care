import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { Calendar, User } from "lucide-react";
import BlogSubscribe from "../../components/BlogSubscribe";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blog");
        setBlogs(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-4xl font-bold">Medical Insights</h2>
          <p className="text-medical-lightMuted dark:text-medical-darkMuted mt-2">
            Latest research and updates from our hepatology team.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.id}`}
                className="card-style overflow-hidden flex flex-col group transition hover:shadow-lg"
              >
                {blog.image_url && (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="h-48 w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="p-6 flex-grow">
                  <span className="text-xs font-bold text-medical-primary uppercase tracking-widest">
                    {blog.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-4 group-hover:text-medical-primary transition">
                    {blog.title}
                  </h3>
                  <p className="text-medical-lightMuted dark:text-medical-darkMuted text-sm line-clamp-3 mb-6">
                    {blog.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-medical-lightMuted dark:text-medical-darkMuted mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" /> {blog.author_name}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />{" "}
                      {new Date(blog.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BlogSubscribe />
    </div>
  );
};

export default Blog;
