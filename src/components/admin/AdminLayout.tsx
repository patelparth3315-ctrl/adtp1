import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
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
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  Loader2,
  Plane,
  BookOpen,
  FileText,
  Paintbrush,
  Star,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const productItems = [
  { title: "Trips", url: "/admin/trips", icon: Map },
  { title: "Collections", url: "/admin/collections", icon: LayoutDashboard },
  { title: "Promotions", url: "/admin/promotions", icon: Star },
];

const websiteItems = [
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Website Theme", url: "/admin/theme", icon: Paintbrush },
  { title: "Pages & Navigation", url: "/admin/pages", icon: FileText },
  { title: "Blog", url: "/admin/blogs", icon: BookOpen },
  { title: "Inquiry Form", url: "/admin/inquiry-form", icon: MessageSquare },
  { title: "Media", url: "/admin/media", icon: Image },
];

const seoItems = [
  { title: "SEO Center", url: "/admin/seo", icon: Globe },
];

const bookingItems = [
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
  { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <div className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Plane className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-sidebar-primary-foreground text-lg">YouthCamping</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-2">Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bookingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all h-11"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-2 mt-4">Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all h-11"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-2 mt-4">Website</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {websiteItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all h-11"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-2 mt-4">Search & SEO</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {seoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all h-11"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          {!collapsed && admin && (
            <div className="mb-3">
              <p className="text-sm font-medium text-sidebar-primary-foreground">{admin.name}</p>
              <p className="text-xs text-sidebar-muted">{admin.email}</p>
            </div>
          )}
          <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={handleLogout}
            className="w-full text-sidebar-muted hover:text-sidebar-primary-foreground hover:bg-sidebar-accent justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { 
    // checkAuth(); // Disabled for local bypass
  }, [checkAuth]);
  
  useEffect(() => {
    // if (!isLoading && !isAuthenticated && location.pathname !== "/admin/login") {
    //   navigate("/admin/login");
    // }
  }, [isLoading, isAuthenticated, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // if (!isAuthenticated) return null; // Disabled for local bypass

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card shrink-0">
            <SidebarTrigger className="mr-4" />
            <h2 className="font-semibold text-card-foreground capitalize truncate flex items-center gap-2">
              {location.pathname === "/admin" || location.pathname === "/" ? "Dashboard" : location.pathname.split("/").pop()?.replace(/-/g, " ")}
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black tracking-tighter">v2.0.4</span>
            </h2>
          </header>
          <main className="flex-1 overflow-auto p-1 lg:p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
