import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/components/ui/sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  MessageSquare,
  Image,
  Layout,
  Settings,
  LogOut,
  Loader2,
  Plane,
  BookOpen,
  FileText,
  Paintbrush,
  Star,
  Globe,
  BarChart3,
  Share2,
  CreditCard,
  Users,
  Bell,
  Search,
  HelpCircle,
  ExternalLink,
  Building2,
  Banknote,
  Link2,
  Sparkles,
  RefreshCw,
  Plus,
  User,
  Palette,
  PlusCircle,
  ChevronDown,
  FilePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewInquiryModal from "./NewInquiryModal";
import NewBookingModal from "./NewBookingModal";

// VacationLabs exact navigation structure
const navGroups = [
  {
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ['admin', 'manager', 'user'] },
      { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck, roles: ['admin', 'manager'] },
      { title: "Quotations", url: "/admin/quotations", icon: FileText, badge: "NEW", roles: ['admin', 'manager'] },
      { title: "AI Itinerary", url: "/admin/ai-itinerary", icon: Sparkles, badge: "AI", roles: ['admin', 'manager'] },
      { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare, badge: "NEW", roles: ['admin', 'manager'] },
    ]
  },
  {
    label: "Inventory",
    items: [
      { title: "Trips & Tours", url: "/admin/trips", icon: Map, roles: ['admin', 'manager'] },
      { title: "Vendors", url: "/admin/vendors", icon: Building2, roles: ['admin', 'manager'] },
      { title: "Collections", url: "/admin/collections", icon: LayoutDashboard, roles: ['admin', 'manager'] },
      { title: "Promotions", url: "/admin/promotions", icon: Star, roles: ['admin', 'manager'] },
    ]
  },
  {
    label: "Website Content",
    items: [
      { title: "Page Builder", url: "/admin/page-builder", icon: FilePlus, roles: ['admin'] },
      { title: "Website Theme", url: "/admin/theme", icon: Paintbrush, roles: ['admin'] },
      { title: "Media Manager", url: "/admin/media", icon: Image, roles: ['admin', 'manager'] },
      { title: "Watch & Read", url: "/admin/blogs", icon: BookOpen, roles: ['admin', 'manager'] },
      { title: "Attractions", url: "/admin/attractions", icon: Map, roles: ['admin', 'manager'] },
      { title: "Review Center", url: "/admin/reviews", icon: Star, roles: ['admin', 'manager'] },
      { title: "Question System", url: "/admin/questions", icon: HelpCircle, roles: ['admin', 'manager'] },
      { title: "Footer Management", url: "/admin/footer", icon: Layout, roles: ['admin'] },
    ]
  },
  {
    label: "Marketing & Growth",
    items: [
      { title: "SEO Center", url: "/admin/seo", icon: Globe, roles: ['admin'] },
      { title: "Inquiry Form", url: "/admin/inquiry-form", icon: MessageSquare, roles: ['admin', 'manager'] },
      { title: "Booking Forms", url: "/admin/booking-forms", icon: Link2, roles: ['admin', 'manager'] },
      { title: "Dynamic Sync", url: "/admin/dynamic-sync", icon: RefreshCw, badge: "NEW", roles: ['admin'] },
      { title: "Distribution", url: "/admin/distribution", icon: Share2, roles: ['admin'] },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Reports & Analytics", url: "/admin/reports", icon: BarChart3, roles: ['admin'] },
      { title: "Billing & Plans", url: "/admin/billing", icon: CreditCard, roles: ['admin'] },
      { title: "User Management", url: "/admin/users", icon: Users, roles: ['admin'] },
      { title: "System Settings", url: "/admin/settings", icon: Settings, roles: ['admin'] },
    ]
  }
];

interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

function AdminSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, admin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close sidebar on mobile when navigating
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-100/50 bg-white shadow-sm">
      <SidebarContent className="bg-white scrollbar-hide">
        <div className="p-8 mb-6 flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200">
            <Plane className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-xl tracking-tight leading-none">Youth<span className="text-primary">Camping</span></span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 mt-1">Admin v4.0</span>
            </div>
          )}
        </div>

        {navGroups.map((group, gIdx) => {
          const filteredItems = (group.items as NavItem[]).filter(item => {
            if (!item.roles) return true;
            // Fallback: Show all items if in development or if admin role check is pending
            if (!admin) return true; 
            return item.roles.includes(admin.role);
          });

          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={gIdx} className="px-4">
              {group.label && !collapsed && (
                <SidebarGroupLabel className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 px-4 mt-6">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-11 rounded-2xl transition-all duration-300">
                        <NavLink
                          to={item.url}
                          className="flex items-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-4 group/item"
                          activeClassName="bg-slate-900 text-white font-bold shadow-luxury"
                        >
                          <item.icon className={cn("h-4.5 w-4.5 shrink-0", collapsed ? "mx-auto" : "mr-4 opacity-70 group-hover/item:opacity-100")} />
                          {!collapsed && <span className="text-[12px] font-medium tracking-tight flex-1 truncate">{item.title}</span>}
                          {!collapsed && item.badge && (
                            <span className="bg-primary/10 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <div className="mt-auto p-6 border-t border-slate-50">
          <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={handleLogout}
            className="w-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 justify-start h-11 rounded-2xl px-4">
            <LogOut className="h-4 w-4 mr-3" />
            {!collapsed && <span className="text-[12px] font-medium tracking-tight">Logout System</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    // Auth check bypassed for development
    // checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!admin || isLoading) return;

    // Check if the current route is restricted for the user's role
    const currentPath = location.pathname;
    
    // Skip checks for login and the base admin path if it's the redirect target
    if (currentPath === "/admin/login") return;

    let allowed = true;
    let targetItem = null;

    for (const group of navGroups) {
      const item = group.items.find(i => i.url === currentPath);
      if (item) {
        targetItem = item;
        if (item.roles && !item.roles.includes(admin.role)) {
          allowed = false;
        }
        break;
      }
    }

    if (!allowed && currentPath !== "/admin") {
      console.warn("🚫 Unauthorized access attempt to:", currentPath);
      navigate("/admin");
      // Use a timeout to ensure navigation completes before toast
      setTimeout(() => toast.error("Access Restricted: Unauthorized for your role"), 100);
    }
  }, [location.pathname, admin, isLoading, navigate]);

  // Redirect to login bypassed for development
  /*
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== "/admin/login") {
      console.log("🔒 Not authenticated, redirecting to login...");
      navigate("/admin/login");
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);
  */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white opacity-40">System Initializing...</p>
        </div>
      </div>
    );
  }

  // if (!isAuthenticated && location.pathname !== "/admin/login") {
  //   return null; // Let the useEffect handle redirect
  // }

  // Determine if we should show the "Need Help" sidebar (VacationLabs style)
  const showHelpPanel = location.pathname.includes('/settings') || location.pathname.includes('/seo') || location.pathname.includes('/pages');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FAFAFB]">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Navbar */}
          <header className="h-16 md:h-20 flex items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 sm:px-8 md:px-12 shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-6 min-w-0">
               <SidebarTrigger className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 h-10 w-10 rounded-2xl shrink-0" />
               <div className="h-8 w-px bg-slate-100 hidden md:block" />
               <h2 className="font-bold text-slate-900 text-lg md:text-xl tracking-tight leading-none truncate">
                 {location.pathname === "/admin" || location.pathname === "/" 
                   ? "Dashboard Overview" 
                   : (location.pathname.split("/").filter(Boolean).pop() || "Page").replace(/-/g, " ")}
               </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
               {/* Action Buttons */}
               <div className="hidden sm:flex items-center gap-3">
                  <Button 
                    onClick={() => setInquiryModalOpen(true)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl h-11 px-6 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all border border-slate-200"
                  >
                    <Plus className="w-4 h-4" /><span className="hidden lg:inline">New inquiry</span>
                  </Button>
                  <Button 
                    onClick={() => setBookingModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-6 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" /><span className="hidden lg:inline">New booking</span>
                  </Button>
               </div>

               <div className="w-px h-8 bg-slate-100 mx-2 hidden sm:block" />

               <div className="relative hidden xl:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search panel..." 
                    className="h-11 w-56 bg-slate-50 border-none rounded-2xl text-[12px] font-medium focus-visible:ring-primary pl-10"
                  />
               </div>
               <div className="flex items-center gap-3">
                  <button title="Notifications" className="relative w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-2xl border border-slate-100">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                  </button>
                  <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block" />
                  <div className="flex items-center cursor-pointer group">
                     <div className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-transparent group-hover:border-primary transition-all overflow-hidden p-0.5">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" className="rounded-xl w-full h-full object-cover" />
                     </div>
                  </div>
               </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Main Content Area */}
             <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 lg:p-12 no-scrollbar">
                <div className="max-w-[1440px] mx-auto">
                   {children}
                </div>
             </main>

             {/* Help Sidebar */}
             {showHelpPanel && (
               <aside className="w-[380px] border-l bg-white hidden 2xl:flex flex-col overflow-y-auto p-12 no-scrollbar">
                  <div className="space-y-12">
                     <section className="space-y-8">
                        <div className="flex items-center justify-between">
                           <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Resources</h3>
                           <HelpCircle className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 relative overflow-hidden group">
                           <div className="relative z-10 space-y-6">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-premium">
                                 <BookOpen className="w-6 h-6 text-slate-900" />
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-bold text-lg tracking-tight text-slate-900">Knowledge Base</h4>
                                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                   Learn how to configure your platform with our step-by-step tutorials.
                                </p>
                              </div>
                              <Button className="w-full h-12 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider">
                                 Read Articles <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-8">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Pro Tips</h3>
                        <div className="bg-primary rounded-[40px] p-10 text-white relative overflow-hidden shadow-luxury">
                           <div className="relative z-10 space-y-6">
                              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                 <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-bold text-xl tracking-tight leading-tight">Master the platform like a pro.</h4>
                                <p className="text-[12px] text-white/80 font-medium">Join our weekly webinars to learn about advanced growth features.</p>
                              </div>
                              <button className="text-[11px] font-bold uppercase text-white tracking-widest border-b-2 border-white/30 pb-1 hover:border-white transition-all w-fit">
                                 Secure your spot
                              </button>
                           </div>
                        </div>
                     </section>
                  </div>
               </aside>
             )}
          </div>
        </div>
      </div>
      <NewInquiryModal 
        open={inquiryModalOpen} 
        onOpenChange={setInquiryModalOpen} 
        onSuccess={() => {
          if (location.pathname === '/admin/inquiries') {
            // Trigger internal refresh logic here
          }
        }}
      />
      <NewBookingModal 
        open={bookingModalOpen} 
        onOpenChange={setBookingModalOpen} 
        onSuccess={() => {
          console.log("📅 Booking created successfully!");
          if (location.pathname === '/admin/bookings') {
             window.location.reload();
          }
        }}
      />
    </SidebarProvider>
  );
}
