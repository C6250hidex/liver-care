# 🏥 LiverCare AI - Liver Diagnosis & Consultation Platform

A comprehensive healthcare application for liver disease diagnosis, patient-doctor consultation, and health monitoring powered by AI assessment.

## 📋 Features

- **AI Symptom Assessment**: Intelligent symptom checker for liver disease risk assessment
- **Doctor Consultation**: Book appointments with verified hepatologists
- **Patient Dashboard**: Track health records, appointments, and assessments
- **Doctor Dashboard**: Manage patients, clinical notes, and consultations
- **Admin Panel**: System management, user verification, blog moderation
- **Medical Blog**: Share and browse liver health information
- **Email Notifications**: Verification, appointment reminders, and health alerts
- **Real-time Health Monitoring**: Track symptoms, medications, and lab results

## 🏗️ Architecture

```
liver-care-app/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth & Theme context
│   │   ├── services/      # API client
│   │   └── layouts/       # Page layouts
│   └── public/            # Static assets
│
├── server/                 # Express.js backend
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation
│   ├── models/            # Database schemas
│   ├── config/            # Database connection
│   └── utils/             # Email, logging
│
├── LIVER-_CARE.session.sql # Database schema
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- MySQL 8.0+
- npm or yarn

### Local Development

1. **Clone & Setup**

   ```bash
   git clone https://github.com/C6250hidex/liver-care.git
   cd liver-care-app
   ```

2. **Backend Setup**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your local database details
   npm install
   npm run dev
   ```

3. **Frontend Setup** (in new terminal)

   ```bash
   cd client
   cp .env.example .env
   # Edit .env - for local dev use: VITE_API_BASE_URL=http://localhost:5000/api
   npm install
   npm run dev
   ```

4. **Database Setup**

   ```bash
   mysql -u root -p < LIVER-_CARE.session.sql
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - API Docs: http://localhost:5000/api

## 📦 Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **React Router v7** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Backend

- **Express.js v5** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Brevo (Sendinblue)** - Email service
- **Dotenv** - Environment management

### Database

- **MySQL 8.0** (Aiven for production)
- Database: `liver_care_db`

## 📚 API Endpoints

### Authentication

```
POST   /api/auth/register       - Register user
POST   /api/auth/login          - Login user
GET    /api/auth/verify-email   - Verify email token
```

### Patient Routes

```
GET    /api/patient/doctors          - Get available doctors
GET    /api/patient/booked-slots     - Get doctor's booked slots
POST   /api/patient/appointments     - Book appointment
GET    /api/patient/appointments     - Get my appointments
```

### Doctor Routes

```
GET    /api/doctor/dashboard         - Doctor dashboard stats
GET    /api/doctor/my-patients       - List patients
GET    /api/doctor/patient/:id       - Get patient clinical records
POST   /api/doctor/patient/:id/note  - Add clinical note
```

### AI Routes

```
POST   /api/ai/assess               - AI symptom assessment
GET    /api/ai/history              - Assessment history
GET    /api/ai/report/:id           - Get assessment report
```

### Blog Routes

```
GET    /api/blog                    - List blogs
GET    /api/blog/:id                - Get blog post
POST   /api/blog                    - Create blog (doctor/admin)
POST   /api/blog/subscribe          - Subscribe to newsletter
```

### Admin Routes

```
GET    /api/admin/stats             - System statistics
GET    /api/admin/users             - List all users
PUT    /api/admin/user/:id/verify   - Verify user
DELETE /api/admin/user/:id          - Delete user
```

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salt rounds = 12
- **SSL/TLS**: Required for database connections
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Server-side validation on all endpoints
- **SQL Injection Prevention**: Parameterized queries

## 📮 Environment Variables

### Server `.env`

```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET (min 32 chars)
BREVO_API_KEY, SENDER_EMAIL
CLIENT_URL
PORT, NODE_ENV
```

### Client `.env`

```
VITE_API_BASE_URL
```

See `.env.example` files for full documentation.

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide including:

- Aiven MySQL setup
- Render.com deployment
- Environment configuration
- Health checks
- Troubleshooting

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:5000/api/test-db

# Health check
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test User","email":"test@example.com","password":"password123"}'
```

## 📊 Database Schema

Key tables:

- **users** - User accounts (patient, doctor, admin)
- **doctors_profiles** - Doctor specialization & availability
- **appointments** - Patient-doctor appointments
- **ai_results** - AI assessment results
- **health_logs** - Patient health metrics
- **doctor_notes** - Clinical notes
- **blogs** - Blog posts
- **activity_logs** - System activity tracking

See `LIVER-_CARE.session.sql` for full schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

MIT License - feel free to use for educational and commercial purposes.

## 👨‍💻 Author

- **GitHub**: [@C6250hidex](https://github.com/C6250hidex)
- **Email**: chidex6250@gmail.com

## 🙏 Support

For bug reports and feature requests, please use GitHub Issues.

---

**Built with ❤️ for better liver health care**
