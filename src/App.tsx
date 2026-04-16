import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/admin/LoginPage.tsx";
import DashboardPage from "./pages/admin/DashboardPage.tsx";
import TripsPage from "./pages/admin/TripsPage.tsx";
import BookingsPage from "./pages/admin/BookingsPage.tsx";
import InquiriesPage from "./pages/admin/InquiriesPage.tsx";
import BlogsPage from "./pages/admin/BlogsPage.tsx";
import ReviewsPage from "./pages/admin/ReviewsPage.tsx";
import MediaPage from "./pages/admin/MediaPage.tsx";
import SettingsPage from "./pages/admin/SettingsPage.tsx";
import PagesPage from "./pages/admin/PagesPage.tsx";
import PageEditorPage from "./pages/admin/PageEditorPage.tsx";
import ThemePage from "./pages/admin/ThemePage.tsx";
import SeoCenterPage from "./pages/admin/SeoCenterPage.tsx";
import InquiryFormPage from "./pages/admin/InquiryFormPage.tsx";
import { AdminLayout } from "./components/admin/AdminLayout.tsx";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin/trips" element={<AdminRoute><TripsPage /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><BookingsPage /></AdminRoute>} />
          <Route path="/admin/blogs" element={<AdminRoute><BlogsPage /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ReviewsPage /></AdminRoute>} />
          <Route path="/admin/pages" element={<AdminRoute><PagesPage /></AdminRoute>} />
          <Route path="/admin/pages/:id" element={<AdminRoute><PageEditorPage /></AdminRoute>} />
          <Route path="/admin/theme" element={<AdminRoute><ThemePage /></AdminRoute>} />
          <Route path="/admin/seo" element={<AdminRoute><SeoCenterPage /></AdminRoute>} />
          <Route path="/admin/inquiry-form" element={<AdminRoute><InquiryFormPage /></AdminRoute>} />
          <Route path="/admin/inquiries" element={<AdminRoute><InquiriesPage /></AdminRoute>} />
          <Route path="/admin/media" element={<AdminRoute><MediaPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
