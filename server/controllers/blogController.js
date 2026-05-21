const db = require("../config/db");
const {
  sendEmail,
  addBlogSubscriber,
} = require("../utils/notificationService");

/**
 * 1. Create Blog Post (Admin/Doctor only)
 * Saves to DB and notifies all subscribers via Brevo
 */
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category, image_url } = req.body;
    const author_id = req.userId; // Provided by authMiddleware

    // A. Validation
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    // B. Save to Database
    const [result] = await db.execute(
      "INSERT INTO blogs (title, content, author_id, category, image_url) VALUES (?, ?, ?, ?, ?)",
      [
        title,
        content,
        author_id,
        category || "Liver Health",
        image_url || null,
      ],
    );

    // C. Fetch all subscribers
    const [subscribers] = await db.execute(
      "SELECT email FROM blog_subscribers",
    );

    // D. Mass Notification (Async Background Process)
    // We don't want to make the Admin wait for 100 emails to send
    if (subscribers.length > 0) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0284c7; padding: 20px; text-align: center; color: white;">
            <h2>New Health Article: ${title}</h2>
          </div>
          <div style="padding: 30px; color: #334155;">
            <p>Our medical experts have just published a new article that might be helpful for your liver health journey.</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${title}</h3>
              <p>${content.substring(0, 150)}...</p>
            </div>
            <a href="http://localhost:5173/blog" style="display: inline-block; background: #0284c7; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Read Full Article</a>
          </div>
        </div>
      `;

      // Use Promise.allSettled to send emails in parallel without crashing if one fails
      Promise.allSettled(
        subscribers.map((sub) =>
          sendEmail(sub.email, `New Update: ${title}`, emailHtml),
        ),
      ).then((results) => {
        const successes = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        console.log(
          `📢 Blog notifications: ${successes}/${subscribers.length} sent successfully.`,
        );
      });
    }

    res.status(201).json({
      message:
        "Blog published successfully! Subscribers are being notified in the background.",
      blogId: result.insertId,
    });
  } catch (error) {
    console.error("Blog Creation Error:", error);
    res.status(500).json({ message: "Failed to publish blog." });
  }
};

/**
 * 2. Handle Subscription (Public)
 * Adds user to DB and Brevo Contact List
 */
exports.handleSubscription = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // A. Check if already subscribed in local DB
    const [existing] = await db.execute(
      "SELECT id FROM blog_subscribers WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "You are already subscribed to our newsletter." });
    }

    // B. Add to local MySQL DB
    await db.execute("INSERT INTO blog_subscribers (email) VALUES (?)", [
      email,
    ]);

    // C. Sync with Brevo Contact List
    await addBlogSubscriber(email);

    // D. Send Welcome Email
    const welcomeHtml = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #0284c7;">Welcome to LiverCare Insights!</h1>
        <p style="font-size: 16px; color: #475569;">You've successfully subscribed to our medical newsletter.</p>
        <p>You will now receive the latest updates on Hepatitis research, liver health tips, and platform news.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <small style="color: #94a3b8;">You can unsubscribe at any time from your dashboard or via the link in our emails.</small>
      </div>
    `;

    await sendEmail(email, "Welcome to LiverCare Insights!", welcomeHtml);

    res.status(200).json({ message: "Thank you for subscribing!" });
  } catch (error) {
    console.error("Subscription Error:", error);
    res
      .status(500)
      .json({ message: "Subscription failed. Please try again later." });
  }
};

/**
 * 3. Get Single Blog Post (Public)
 */
exports.getBlogById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ message: "Invalid blog id." });
    }

    const [blogs] = await db.execute(
      `SELECT b.*, u.fullname as author_name
       FROM blogs b
       JOIN users u ON b.author_id = u.id
       WHERE b.id = ?`,
      [id],
    );

    if (!blogs[0]) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    res.status(200).json(blogs[0]);
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    res.status(500).json({ message: "Error fetching blog post." });
  }
};

/**
 * 4. Get All Blogs (Public)
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await db.execute(
      `SELECT b.id, b.title, b.content, b.excerpt, b.category, b.image_url, b.status, u.fullname as author_name, b.created_at
       FROM blogs b
       JOIN users u ON b.author_id = u.id
       WHERE b.status = 'published'
       ORDER BY b.created_at DESC`,
    );
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Get All Blogs Error:", error);
    res.status(500).json({ message: "Error fetching blog posts." });
  }
};

exports.getAllModerationBlogs = async (req, res) => {
  try {
    const [blogs] = await db.execute(
      `SELECT b.id, b.title, b.content, b.category, b.image_url, b.status, u.fullname as author_name
       FROM blogs b
       JOIN users u ON b.author_id = u.id
       WHERE b.status = 'pending'
       ORDER BY b.created_at DESC`,
    );
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Get Moderation Blogs Error:", error);
    res.status(500).json({ message: "Error fetching moderation posts." });
  }
};

/**
 * PATCH /api/admin/blog/:id/moderate
 */
exports.moderateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' or 'rejected'

    // 1. Update the database status
    await db.execute("UPDATE blogs SET status = ? WHERE id = ?", [status, id]);

    // 2. If Published, Trigger Mass Notification via Brevo
    if (status === "published") {
      // Fetch blog details and subscribers
      const [[blog]] = await db.execute(
        "SELECT title, content FROM blogs WHERE id = ?",
        [id],
      );
      const [subscribers] = await db.execute(
        "SELECT email FROM blog_subscribers",
      );

      if (subscribers.length > 0) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0284c7; padding: 20px; text-align: center; color: white;">
              <h1 style="margin:0;">LiverCare Insights</h1>
            </div>
            <div style="padding: 30px; color: #334155;">
              <h2 style="color: #0f172a;">${blog.title}</h2>
              <p>Our medical team has published a new update regarding liver health.</p>
              <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;"/>
              <a href="http://localhost:5173/blog" style="background: #0284c7; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Read Full Article</a>
            </div>
          </div>
        `;

        // Parallel processing for speed
        Promise.allSettled(
          subscribers.map((sub) =>
            sendEmail(sub.email, `Health Update: ${blog.title}`, emailHtml),
          ),
        ).then((results) => {
          console.log(
            `📢 Verified Blog Notification: ${results.length} emails processed.`,
          );
        });
      }
    }

    res.json({ message: `Article successfully ${status}` });
  } catch (error) {
    console.error("Moderation Error:", error);
    res.status(500).json({ message: "Failed to process moderation." });
  }
};
