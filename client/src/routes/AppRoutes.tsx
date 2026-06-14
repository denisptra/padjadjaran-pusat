import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../config/roles';
import { ROUTES } from '../config/routes';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';
import LoadingScreen from '../components/common/LoadingScreen';

// Public Pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const BranchPage = lazy(() => import('../pages/public/BranchPage'));
const PublicationPage = lazy(() => import('../pages/public/PublicationPage'));
const PublicationDetailPage = lazy(() => import('../pages/public/PublicationDetailPage'));
const GalleryPage = lazy(() => import('../pages/public/GalleryPage'));
const VerificationPage = lazy(() => import('../pages/public/VerificationPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('../pages/public/TermsConditionsPage'));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const RegisterOtp = lazy(() => import('../pages/auth/RegisterOtp'));
const RegisterStep2 = lazy(() => import('../pages/auth/RegisterStep2'));
const RegisterStep3 = lazy(() => import('../pages/auth/RegisterStep3'));
const RegisterPayment = lazy(() => import('../pages/auth/RegisterPayment'));
const WaitingApprovalPage = lazy(() => import('../pages/auth/WaitingApprovalPage'));
const RevisionRequiredPage = lazy(() => import('../pages/auth/RevisionRequiredPage'));
const RegistrationRejectedPage = lazy(() => import('../pages/auth/RegistrationRejectedPage'));
const AccountInactivePage = lazy(() => import('../pages/auth/AccountInactivePage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Common Pages
const NotFoundPage = lazy(() => import('../pages/common/NotFoundPage'));
const Announcements = lazy(() => import('../pages/common/Announcements'));
const AnnouncementDetail = lazy(() => import('../pages/common/AnnouncementDetail'));
const Profile = lazy(() => import('../pages/common/Profile'));
const Settings = lazy(() => import('../pages/common/Settings'));
const MemberDetail = lazy(() => import('../pages/common/MemberDetail'));

// Member Pages
const MemberDashboard = lazy(() => import('../pages/member/Dashboard'));

// Admin Wilayah Pages
const AdminWilayahDashboard = lazy(() => import('../pages/admin-wilayah/dashboard/Dashboard'));
const AdminWilayahRegionProfile = lazy(() => import('../pages/admin-wilayah/profile/RegionProfile'));

// Admin Pusat Pages
const AdminPusatDashboard = lazy(() => import('../pages/admin-pusat/dashboard/Dashboard'));
const AdminPusatMembers = lazy(() => import('../pages/admin-pusat/members/MembersList'));
const AdminPusatMemberForm = lazy(() => import('../pages/admin-pusat/members/MemberForm'));
const AdminPusatApprovalDetail = lazy(() => import('../pages/admin-pusat/approvals/ApprovalDetail'));
const AdminPusatRegions = lazy(() => import('../pages/admin-pusat/regions/Regions'));
const AdminPusatRegionForm = lazy(() => import('../pages/admin-pusat/regions/RegionForm'));
const AdminPusatRegionDetail = lazy(() => import('../pages/admin-pusat/regions/RegionDetail'));
const AdminPusatAnnouncements = lazy(() => import('../pages/admin-pusat/announcements/Announcements'));
const AdminPusatAnnouncementForm = lazy(() => import('../pages/admin-pusat/announcements/AnnouncementForm'));
const AdminPusatPaymentSettings = lazy(() => import('../pages/admin-pusat/payments/PaymentSettings'));

// CMS Pages
const CMSHero = lazy(() => import('../pages/admin-pusat/cms/CMSHero'));
const HeroForm = lazy(() => import('../pages/admin-pusat/cms/HeroForm'));
const CMSGuruBesar = lazy(() => import('../pages/admin-pusat/cms/CMSGuruBesar'));
const GuruBesarForm = lazy(() => import('../pages/admin-pusat/cms/GuruBesarForm'));
const CMSGallery = lazy(() => import('../pages/admin-pusat/cms/CMSGallery'));
const GalleryForm = lazy(() => import('../pages/admin-pusat/cms/GalleryForm'));
const CMSNews = lazy(() => import('../pages/admin-pusat/cms/CMSNews'));
const NewsForm = lazy(() => import('../pages/admin-pusat/cms/NewsForm'));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('../pages/super-admin/dashboard/Dashboard'));
const SuperAdminUsers = lazy(() => import('../pages/super-admin/users/Users'));
const SuperAdminActionMatrix = lazy(() => import('../pages/super-admin/action-matrix/ActionMatrix'));
const SuperAdminFeatureControl = lazy(() => import('../pages/super-admin/feature-control/FeatureControl'));
const SuperAdminImpersonate = lazy(() => import('../pages/super-admin/impersonate/Impersonate'));
const SuperAdminAuditLogs = lazy(() => import('../pages/super-admin/audit-logs/AuditLogs'));
const SuperAdminBackup = lazy(() => import('../pages/super-admin/backup/Backup'));
const SuperAdminSystemSettings = lazy(() => import('../pages/super-admin/settings/SystemSettings'));
const SuperAdminProfile = lazy(() => import('../pages/super-admin/profile/Profile'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.PUBLIC.HOME} element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.ABOUT} element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.BRANCHES} element={<PublicLayout><BranchPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.PUBLICATIONS} element={<PublicLayout><PublicationPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.PUBLICATION_DETAIL} element={<PublicLayout><PublicationDetailPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.GALLERY} element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.VERIFICATION} element={<PublicLayout><VerificationPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.PRIVACY} element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path={ROUTES.PUBLIC.TERMS} element={<PublicLayout><TermsConditionsPage /></PublicLayout>} />

        {/* Public Auth Routes */}
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.AUTH.VERIFY_OTP} element={<RegisterOtp />} />
        <Route path="/register/otp" element={<Navigate to={ROUTES.AUTH.VERIFY_OTP} replace />} />
        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Protected Auth / Onboarding Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/register/profile" element={<RegisterStep2 />} />
          <Route path="/register/documents" element={<RegisterStep3 />} />
          <Route path="/waiting-approval" element={<WaitingApprovalPage />} />
          <Route path="/register/revision" element={<RevisionRequiredPage />} />
          <Route path="/registration-rejected" element={<RegistrationRejectedPage />} />
          <Route path="/account-inactive" element={<AccountInactivePage />} />
        </Route>

        {/* Protected App Routes */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/app/member/dashboard" replace />} />

          {/* MEMBER ROUTES */}
          <Route path="member">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardLayout><MemberDashboard /></DashboardLayout>} />
            <Route path="announcements" element={<DashboardLayout><Announcements /></DashboardLayout>} />
            <Route path="announcements/:id" element={<DashboardLayout><AnnouncementDetail /></DashboardLayout>} />
            <Route path="profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="member-detail/:id" element={<DashboardLayout><MemberDetail /></DashboardLayout>} />
          </Route>

          {/* Admin Wilayah Routes */}
          <Route path="admin-wilayah">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminWilayahDashboard /></DashboardLayout></RoleRoute>} />
            <Route path="members" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMembers /></DashboardLayout></RoleRoute>} />
            <Route path="members/add" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMemberForm /></DashboardLayout></RoleRoute>} />
            <Route path="members/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><MemberDetail /></DashboardLayout></RoleRoute>} />
            <Route path="members/:id/edit" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMemberForm /></DashboardLayout></RoleRoute>} />
            <Route path="approvals" element={<Navigate to="/app/admin-wilayah/members" replace />} />
            <Route path="approvals/:id" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatApprovalDetail /></DashboardLayout></RoleRoute>} />
            <Route path="announcements" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><Announcements /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatAnnouncementForm /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AnnouncementDetail /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatAnnouncementForm /></DashboardLayout></RoleRoute>} />
            <Route path="profile-wilayah" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminWilayahRegionProfile /></DashboardLayout></RoleRoute>} />
            <Route path="profile" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><Profile /></DashboardLayout></RoleRoute>} />
            <Route path="settings" element={<RoleRoute allowedRoles={[ROLES.ADMIN_WILAYAH, ROLES.SUPER_ADMIN]}><DashboardLayout><Settings /></DashboardLayout></RoleRoute>} />
          </Route>

          {/* Admin Pusat Routes */}
          <Route path="admin-pusat">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatDashboard /></DashboardLayout></RoleRoute>} />
            <Route path="members" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMembers /></DashboardLayout></RoleRoute>} />
            <Route path="members/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMemberForm /></DashboardLayout></RoleRoute>} />
            <Route path="members/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><MemberDetail /></DashboardLayout></RoleRoute>} />
            <Route path="members/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatMemberForm /></DashboardLayout></RoleRoute>} />
            <Route path="approvals" element={<Navigate to="/app/admin-pusat/members?tab=APPROVAL" replace />} />
            <Route path="approvals/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatApprovalDetail /></DashboardLayout></RoleRoute>} />
            <Route path="regions" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatRegions /></DashboardLayout></RoleRoute>} />
            <Route path="regions/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatRegionForm /></DashboardLayout></RoleRoute>} />
            <Route path="regions/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatRegionDetail /></DashboardLayout></RoleRoute>} />
            <Route path="regions/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatRegionForm /></DashboardLayout></RoleRoute>} />
            <Route path="announcements" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatAnnouncements /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatAnnouncementForm /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatAnnouncementForm /></DashboardLayout></RoleRoute>} />
            <Route path="announcements/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AnnouncementDetail /></DashboardLayout></RoleRoute>} />
            <Route path="payment-settings" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><AdminPusatPaymentSettings /></DashboardLayout></RoleRoute>} />
            <Route path="profile" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><Profile /></DashboardLayout></RoleRoute>} />
            <Route path="settings" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN]}><DashboardLayout><Settings /></DashboardLayout></RoleRoute>} />

            {/* CMS Routes */}
            <Route path="cms/hero-slider" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><CMSHero /></DashboardLayout></RoleRoute>} />
            <Route path="cms/hero-slider/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><HeroForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/hero-slider/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><HeroForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/guru-besar" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><CMSGuruBesar /></DashboardLayout></RoleRoute>} />
            <Route path="cms/guru-besar/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><GuruBesarForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/guru-besar/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><GuruBesarForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/articles" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><CMSNews /></DashboardLayout></RoleRoute>} />
            <Route path="cms/articles/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><NewsForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/articles/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><NewsForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/gallery" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><CMSGallery /></DashboardLayout></RoleRoute>} />
            <Route path="cms/gallery/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><GalleryForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/gallery/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><GalleryForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/news" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><CMSNews /></DashboardLayout></RoleRoute>} />
            <Route path="cms/news/add" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><NewsForm /></DashboardLayout></RoleRoute>} />
            <Route path="cms/news/:id/edit" element={<RoleRoute allowedRoles={[ROLES.ADMIN_PUSAT]}><DashboardLayout><NewsForm /></DashboardLayout></RoleRoute>} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="super-admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminDashboard /></DashboardLayout></RoleRoute>} />
            <Route path="users" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminUsers /></DashboardLayout></RoleRoute>} />
            <Route path="action-matrix" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminActionMatrix /></DashboardLayout></RoleRoute>} />
            <Route path="feature-control" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminFeatureControl /></DashboardLayout></RoleRoute>} />
            <Route path="impersonate" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminImpersonate /></DashboardLayout></RoleRoute>} />
            <Route path="audit-logs" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminAuditLogs /></DashboardLayout></RoleRoute>} />
            <Route path="backup" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminBackup /></DashboardLayout></RoleRoute>} />
            <Route path="system-settings" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminSystemSettings /></DashboardLayout></RoleRoute>} />
            <Route path="profile" element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><SuperAdminProfile /></DashboardLayout></RoleRoute>} />
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
