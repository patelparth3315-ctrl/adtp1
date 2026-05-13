import { useEffect, useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { StatusBadge, getBookingBadgeVariant } from "@/components/admin/StatusBadge";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types";
import { Map, CalendarCheck, DollarSign, MessageSquare, TrendingUp, AlertTriangle, Building2, Banknote } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(220, 70%, 50%)"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const profit = stats?.totalProfit ?? 0;
  const profitMargin = stats?.totalRevenue && stats.totalRevenue > 0
    ? Math.round((profit / stats.totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* ─── Primary KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`₹${(Number(stats?.totalRevenue) || 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} change="from all payments" loading={loading} />
        <KPICard title="Pending Payments" value={`₹${(Number(stats?.pendingPayments) || 0).toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" />} change="yet to collect" loading={loading} />
        <KPICard title="Total Profit" value={`₹${profit.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} change={`${profitMargin}% margin`} loading={loading} />
        <KPICard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<CalendarCheck className="h-5 w-5" />} change={`${stats?.totalInquiries ?? 0} inquiries`} loading={loading} />
      </div>

      {/* ─── Secondary KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Trips" value={stats?.totalTrips ?? 0} icon={<Map className="h-5 w-5" />} change="active expeditions" loading={loading} />
        <KPICard title="Vendor Costs" value={`₹${(Number(stats?.totalVendorCost) || 0).toLocaleString()}`} icon={<Building2 className="h-5 w-5" />} change={`₹${(Number(stats?.pendingVendorPayments) || 0).toLocaleString()} pending`} loading={loading} />
        <KPICard title="Inquiries" value={stats?.totalInquiries ?? 0} icon={<MessageSquare className="h-5 w-5" />} change="total leads" loading={loading} />
        <KPICard title="Vendor Payments" value={`₹${(Number(stats?.totalVendorPaid) || 0).toLocaleString()}`} icon={<Banknote className="h-5 w-5" />} change="paid to vendors" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
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

        {/* Sales Leaderboard */}
        <div className="rounded-[32px] border-2 border-border bg-card p-8 flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Sales Performance
          </h3>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
            {stats?.leaderboard?.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{s.conversion}% conversion</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black">₹{s.revenue.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black">{s.accepted}/{s.total} Bookings</p>
                </div>
              </div>
            ))}
            {(!stats?.leaderboard || stats.leaderboard.length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-xs italic">No sales data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Profit Summary Card ─── */}
      <div className="rounded-[24px] md:rounded-[32px] border-2 border-border bg-card p-5 md:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Profit Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-4 md:p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Customer Revenue</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-700">₹{(Number(stats?.totalRevenue) || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 md:p-6 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Vendor Costs</p>
            <p className="text-2xl md:text-3xl font-black text-red-700">₹{(Number(stats?.totalVendorCost) || 0).toLocaleString()}</p>
          </div>
          <div className={`text-center p-4 md:p-6 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net Profit</p>
            <p className={`text-2xl md:text-3xl font-black ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              ₹{profit.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mt-1">{profitMargin}% margin</p>
          </div>
        </div>
      </div>

      {/* ─── Recent Activity ─── */}
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
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paid</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {stats?.recentBookings?.map((b) => (
                <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 md:px-8 py-5 font-bold uppercase text-[10px] md:text-xs whitespace-nowrap">{b.userName}</td>
                  <td className="px-4 md:px-8 py-5 text-muted-foreground font-medium text-xs md:text-sm whitespace-nowrap">{b.tripTitle}</td>
                  <td className="px-4 md:px-8 py-5 font-black text-xs md:text-sm">₹{b.amount.toLocaleString()}</td>
                  <td className="px-4 md:px-8 py-5">
                    <span className={`font-bold text-xs md:text-sm ${(b.paidAmount || 0) >= b.amount ? 'text-emerald-600' : (b.paidAmount || 0) > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                      ₹{(b.paidAmount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-5">
                    <StatusBadge variant={getBookingBadgeVariant(b.status)} className="text-[9px] md:text-[10px] px-2">{b.status}</StatusBadge>
                  </td>
                </tr>
              ))}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center italic text-muted-foreground font-medium">No recent bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
