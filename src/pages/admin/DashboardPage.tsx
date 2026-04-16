import { useEffect, useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { StatusBadge, getBookingBadgeVariant } from "@/components/admin/StatusBadge";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types";
import { Map, CalendarCheck, DollarSign, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Trips" value={stats?.totalTrips ?? 0} icon={<Map className="h-5 w-5" />} change="+2 this month" loading={loading} />
        <KPICard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<CalendarCheck className="h-5 w-5" />} change="+12% vs last month" loading={loading} />
        <KPICard title="Total Revenue" value={`₹${(Number(stats?.totalRevenue) || 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} change="+8.2% vs last month" loading={loading} />
        <KPICard title="Inquiries" value={stats?.totalInquiries ?? 0} icon={<MessageSquare className="h-5 w-5" />} change="2 unread" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[32px] border-2 border-border bg-card p-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
              <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
              <Tooltip cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '16px', border: '2px solid hsl(var(--border))', fontWeight: 'bold' }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-[32px] border-2 border-border bg-card p-8 flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8">Booking Mix</h3>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.bookingsByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={60} stroke="none" paddingAngle={5}>
                  {stats?.bookingsByStatus?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            {stats?.bookingsByStatus?.map((s, i) => (
              <div key={s.status} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{s.status}</span>
                </div>
                <span className="text-xs font-black">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border-2 border-border bg-card overflow-hidden">
        <div className="p-8 border-b bg-muted/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/5">
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guest</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trip</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {stats?.recentBookings?.map((b) => (
                <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-8 py-5 font-bold uppercase text-xs">{b.userName}</td>
                  <td className="px-8 py-5 text-muted-foreground font-medium">{b.tripTitle}</td>
                  <td className="px-8 py-5 font-black">₹{b.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <StatusBadge variant={getBookingBadgeVariant(b.status)}>{b.status}</StatusBadge>
                  </td>
                </tr>
              ))}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <tr>
                   <td colSpan={4} className="px-8 py-20 text-center italic text-muted-foreground font-medium">No recent bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
