// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/auth/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Dashboard from './pages/dashboard/Dashboard';
import ResumeTips from './pages/dashboard/ResumeTips';
import Profile from './pages/profile/Profile';
import Resumes from './pages/profile/Resumes';
import Skills from './pages/profile/Skills';
import Education from './pages/profile/Education';
import Experience from './pages/profile/Experience';

import Companies from './pages/companies/Companies';

import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import AdminRecruiters from './pages/admin/AdminRecruiters';

import ManageJobs from './pages/recruiter/ManageJobs';

import JobCategories from './pages/admin/JobCategories';

import JobSearch from './pages/jobs/JobSearch';
import ApplyJob from './pages/jobs/ApplyJob';
import MyApplications from './pages/jobs/MyApplications';
import JobDetail from './pages/jobs/JobDetail';
import SavedJobs from './pages/jobs/SavedJobs';
import Candidates from './pages/recruiter/Candidates';

import Interviews from './pages/recruiter/Interviews';
import OnlineInterviews from './pages/recruiter/OnlineInterviews';
import MyInterviews from './pages/jobs/MyInterviews';

import Recommendations from './pages/jobs/Recommendations';

import AIAssistant from './pages/ai/AIAssistant';
import Notifications from './pages/communication/Notifications';
import Messaging from './pages/communication/Messaging';

import ApplicationDashboard from './pages/jobs/ApplicationDashboard';
import HiringDashboard from './pages/recruiter/HiringDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import Analytics from './pages/analytics/Analytics';

import SubscriptionPlans from './pages/recruiter/SubscriptionPlans';
import ManagePlans from './pages/admin/ManagePlans';
import PaymentHistory from './pages/recruiter/PaymentHistory';

import Reviews from './pages/reviews/Reviews';
import AuditLogs from './pages/admin/AuditLogs';
import AdminModeration from './pages/admin/AdminModeration';
import BusinessIntelligence from './pages/admin/BusinessIntelligence';

import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />

          <main className="flex-1 overflow-x-hidden">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* COMMON PROTECTED ROUTES */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              

              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/resumes"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Resumes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/skills"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Skills />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/education"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Education />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/experience"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Experience />
                  </ProtectedRoute>
                }
              />

              {/* JOBS */}
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <JobSearch />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <JobDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/apply/:jobId"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ApplyJob />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/application-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ApplicationDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-interviews"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <MyInterviews />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />

              {/* COMPANIES */}
              <Route
                path="/companies"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Companies />
                  </ProtectedRoute>
                }
              />

              {/* RECRUITER */}
              <Route
                path="/recruiter-profile"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <RecruiterProfile />
                  </ProtectedRoute>
                }
              />

              {/* This route fixes /recruiters/1 page not found */}
              <Route
                path="/recruiters/:id"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <RecruiterProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recruiter-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hiring-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <HiringDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-jobs"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <ManageJobs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/candidates/:jobId"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <Candidates />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interviews"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <Interviews />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/online-interviews"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <OnlineInterviews />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/subscription-plans"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <SubscriptionPlans />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment-history"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <PaymentHistory />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/recruiters"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminRecruiters />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <JobCategories />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/plans"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManagePlans />
                  </ProtectedRoute>
                }
              />

              {/* ANALYTICS */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* COMMUNICATION */}
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <AIAssistant />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Messaging />
                  </ProtectedRoute>
                }
              />

              {/* REVIEWS */}
              <Route
                path="/reviews/:type/:id"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                    <Reviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/business-intelligence"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <BusinessIntelligence />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-tips"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ResumeTips />
                  </ProtectedRoute>
                }
              />


              {/* KEEP LAST */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
          toastClassName="rounded-2xl shadow-2xl"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;