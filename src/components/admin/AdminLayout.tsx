import { useEffect, useState } from "react";
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, admin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-none bg-[#0f172a] text-white">
      <SidebarContent className="bg-[#0f172a] text-white scrollbar-hide">
        <div className="p-6 mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <Plane className="h-6 w-6 text-black" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-white text-xl tracking-tighter leading-none">Youth<span className="text-primary">Camping</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 mt-0.5">Admin Suite v4.0</span>
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
            <SidebarGroup key={gIdx} className="px-3">
              {group.label && !collapsed && (
                <SidebarGroupLabel className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 px-3 mt-4">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-12 rounded-xl transition-all duration-300">
                        <NavLink
                          to={item.url}
                          className="flex items-center text-gray-400 hover:text-white hover:bg-white/5 px-4"
                          activeClassName="bg-primary text-black font-black shadow-lg shadow-primary/10"
                        >
                          <item.icon className={cn("h-5 w-5 shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                          {!collapsed && <span className="text-[11px] font-black uppercase tracking-tight flex-1 truncate">{item.title}</span>}
                          {!collapsed && item.badge && (
                            <span className="bg-primary text-black text-[8px] font-black px-1.5 py-0.5 rounded-full ml-auto animate-pulse">
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

        <div className="mt-auto p-4 border-t border-white/5 space-y-4">
          <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={handleLogout}
            className="w-full text-gray-500 hover:text-white hover:bg-white/5 justify-start h-12 rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && <span className="text-[11px] font-black uppercase tracking-tight">Logout System</span>}
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
      <div className="min-h-screen flex w-full bg-[#f8fafc] font-['Inter']">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Navbar */}
          <header className="h-16 flex items-center justify-between border-b bg-white px-8 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
               <SidebarTrigger className="text-gray-500 hover:text-black hover:bg-gray-100 h-10 w-10 rounded-xl" />
               <div className="flex items-center gap-3">
                  <h2 className="font-black text-gray-900 uppercase tracking-tighter text-lg leading-none">
                    {location.pathname === "/admin" || location.pathname === "/" ? "Dashboard" : location.pathname.split("/").pop()?.replace(/-/g, " ")}
                  </h2>
               </div>
            </div>

            <div className="flex items-center gap-4">
               {/* New Action Buttons (VacationLabs Style) */}
               <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setInquiryModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md h-9 px-4 font-bold text-[11px] flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> New inquiry
                  </Button>
                  <Button 
                    onClick={() => setBookingModalOpen(true)}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-md h-9 px-4 font-bold text-[11px] flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> New booking
                  </Button>
               </div>

               <div className="w-px h-6 bg-gray-200 mx-2" />

               <div className="relative hidden xl:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search anything..." 
                    className="h-10 w-48 bg-gray-50 border-none rounded-xl text-[10px] font-bold focus-visible:ring-primary"
                  />
               </div>
               <div className="flex items-center gap-3">
                  <button title="Notifications" className="relative p-2 text-gray-400 hover:text-black transition-colors">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  <div className="flex items-center gap-3 cursor-pointer group">
                     <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-gray-100 group-hover:border-primary transition-all overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" />
                     </div>
                  </div>
               </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Main Content Area */}
             <main className="flex-1 overflow-y-auto p-1 lg:p-10 scrollbar-hide">
                <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                   {children}
                </div>
             </main>

             {/* VacationLabs Help Sidebar */}
             {showHelpPanel && (
               <aside className="w-[340px] border-l bg-white hidden xl:flex flex-col overflow-y-auto p-8 scrollbar-hide animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-10">
                     <section className="space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Need Help?</h3>
                           <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-primary/5 rounded-[32px] p-6 border-2 border-primary/10 relative overflow-hidden group">
                           <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                           <div className="relative z-10 space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                                 <BookOpen className="w-6 h-6 text-primary" />
                              </div>
                              <h4 className="font-black text-sm uppercase tracking-tight">Knowledge Base</h4>
                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                                 Self-help tutorial with answers to commonly asked questions about system configuration.
                              </p>
                              <Button className="w-full h-11 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                 View Articles <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Admin Companion</h3>
                        <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                           <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 transition-transform group-hover:scale-110">
                              <Plane className="w-40 h-40" />
                           </div>
                           <div className="relative z-10 space-y-4">
                              <div className="flex gap-1 text-primary">
                                 <Star className="w-3 h-3 fill-primary" />
                                 <Star className="w-3 h-3 fill-primary" />
                                 <Star className="w-3 h-3 fill-primary" />
                                 <Star className="w-3 h-3 fill-primary" />
                                 <Star className="w-3 h-3 fill-primary" />
                              </div>
                              <h4 className="font-black text-lg leading-tight">Master the platform like a pro.</h4>
                              <p className="text-[11px] text-gray-400 font-medium">Join our weekly webinars to learn about advanced growth features.</p>
                              <button className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-primary pb-1 hover:text-white hover:border-white transition-all">
                                 Secure your spot
                              </button>
                           </div>
                        </div>
                     </section>

                     <div className="pt-20 text-center space-y-4">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                          alt="Google Play" 
                          className="h-12 mx-auto cursor-pointer hover:scale-105 transition-transform"
                        />
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Manage on the move</p>
                     </div>
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
