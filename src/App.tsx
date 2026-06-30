import { Routes, Route } from 'react-router'
import { Suspense, lazy } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const LessonDetail = lazy(() => import('./pages/LessonDetail'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const QuizResult = lazy(() => import('./pages/QuizResult'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const RegisterCenter = lazy(() => import('./pages/RegisterCenter'))
const GermanyMapPage = lazy(() => import('./pages/GermanyMapPage'))
const AdminPortal = lazy(() => import('./pages/AdminPortal'))
const CenterPage = lazy(() => import('./pages/CenterPage'))
const CenterDirectory = lazy(() => import('./pages/CenterDirectory'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8f5e9]">
      <Spinner className="w-8 h-8 text-[#00695c]" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  return (
    <RouteErrorBoundary>
      {children}
    </RouteErrorBoundary>
  )
}

import { ThemeInitializer } from '@/components/ThemeInitializer';

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeInitializer />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
        <Route path="/lessons/:id/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/quiz/:attemptId" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/register-center" element={<ProtectedRoute><RegisterCenter /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><GermanyMapPage /></ProtectedRoute>} />
        <Route path="/admin-portal" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
        <Route path="/centers" element={<CenterDirectory />} />
        <Route path="/c/:slug" element={<CenterPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
