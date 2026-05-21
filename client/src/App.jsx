import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import RoleRedirector from "./components/RoleRedirector";
import DashboardLayout from "./layouts/DashboardLayout";
import VerifyEmail from "./pages/VerifyEmail";
// Pages
import Home from "./pages/public/Home";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import Services from "./pages/public/Services";
import About from "./pages/public/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
// doctor imports
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import PatientClinicalFile from "./pages/dashboard/PatientClinicalFile";
import MyPatients from "./pages/dashboard/MyPatients";
import DoctorSchedule from "./pages/dashboard/DoctorSchedule";
import DoctorProfile from "./pages/dashboard/DoctorProfile";
import DoctorBlog from "./pages/dashboard/DoctorBlog";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManageUsers from "./pages/dashboard/ManageUsers";
import AdminBlogManager from "./pages/dashboard/AdminBlogManager";
import AdminSettings from "./pages/dashboard/AdminSettings";
import SymptomChecker from "./pages/dashboard/SymptomChecker";
import Profile from "./pages/dashboard/Profile";
import HealthRecords from "./pages/dashboard/HealthRecords";
import AssessmentHistory from "./pages/dashboard/AssessmentHistory";
import MyAppointments from "./pages/dashboard/MyAppointments";
import AssessmentReport from "./pages/dashboard/AssessmentReport";
import DoctorSearch from "./pages/dashboard/DoctorSearch";
// 1. Import the new pages

import { Toaster } from "react-hot-toast";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* ✅ Toaster MUST be outside Routes */}
          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Route>

            {/* PROTECTED DASHBOARD ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleRedirector />} />
              {/* patient routes */}
              <Route
                path="patient"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/symptom-checker"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <SymptomChecker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/doctors"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <DoctorSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/profile"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/records"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <HealthRecords />
                  </ProtectedRoute>
                }
              />
              <Route path="patient/report/:id" element={<AssessmentReport />} />
              <Route
                path="patient/history"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <AssessmentHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/report/:id"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <AssessmentReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/appointments"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient/schedule"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              {/* doctor routes */}
              <Route
                path="doctor"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/patient/:id"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <PatientClinicalFile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/patients"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <MyPatients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/schedule"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/profile"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/blogs"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorBlog />
                  </ProtectedRoute>
                }
              />
              {/* admin routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/blogs"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBlogManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
