import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const DomainsPage = lazy(() => import('./pages/domains/DomainsPage'));
const DomainSearchPage = lazy(() => import('./pages/domains/DomainSearchPage'));
const DomainDetailPage = lazy(() => import('./pages/domains/DomainDetailPage'));
const HostingPage = lazy(() => import('./pages/hosting/HostingPage'));
const HostingPlansPage = lazy(() => import('./pages/hosting/HostingPlansPage'));
const HostingDetailPage = lazy(() => import('./pages/hosting/HostingDetailPage'));
const VPSPage = lazy(() => import('./pages/hosting/VPSPage'));
const AIBuilderPage = lazy(() => import('./pages/ai-builder/AIBuilderPage'));
const FileManagerPage = lazy(() => import('./pages/file-manager/FileManagerPage'));
const DNSPage = lazy(() => import('./pages/dns/DNSPage'));
const EmailPage = lazy(() => import('./pages/email/EmailPage'));
const BillingPage = lazy(() => import('./pages/billing/BillingPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const SupportPage = lazy(() => import('./pages/admin/SupportPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DeploymentsPage = lazy(() => import('./pages/deployment/DeploymentsPage'));

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>}>
    {children}
  </Suspense>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin' && user?.role !== 'superadmin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => { loadUser(); }, [loadUser]);

  useEffect(() => {
    setTheme('dark');
    document.documentElement.classList.add('dark');
  }, [setTheme]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/ai-chat" element={<LazyLoad><AIChatPage /></LazyLoad>} />
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<LazyLoad><DashboardPage /></LazyLoad>} />
        <Route path="/domains" element={<LazyLoad><DomainsPage /></LazyLoad>} />
        <Route path="/domains/search" element={<LazyLoad><DomainSearchPage /></LazyLoad>} />
        <Route path="/domains/:id" element={<LazyLoad><DomainDetailPage /></LazyLoad>} />
        <Route path="/hosting" element={<LazyLoad><HostingPage /></LazyLoad>} />
        <Route path="/hosting/plans" element={<LazyLoad><HostingPlansPage /></LazyLoad>} />
        <Route path="/hosting/:id" element={<LazyLoad><HostingDetailPage /></LazyLoad>} />
        <Route path="/vps" element={<LazyLoad><VPSPage /></LazyLoad>} />
        <Route path="/ai-builder" element={<LazyLoad><AIBuilderPage /></LazyLoad>} />
        <Route path="/files" element={<LazyLoad><FileManagerPage /></LazyLoad>} />
        <Route path="/dns" element={<LazyLoad><DNSPage /></LazyLoad>} />
        <Route path="/dns/:domain" element={<LazyLoad><DNSPage /></LazyLoad>} />
        <Route path="/email" element={<LazyLoad><EmailPage /></LazyLoad>} />
        <Route path="/billing" element={<LazyLoad><BillingPage /></LazyLoad>} />
        <Route path="/settings" element={<LazyLoad><SettingsPage /></LazyLoad>} />
        <Route path="/support" element={<LazyLoad><SupportPage /></LazyLoad>} />
        <Route path="/deployments" element={<LazyLoad><DeploymentsPage /></LazyLoad>} />
      </Route>
      <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route path="/admin" element={<LazyLoad><AdminPage /></LazyLoad>} />
      </Route>
    </Routes>
  );
}
