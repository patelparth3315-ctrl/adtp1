import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/admin/KPICard";
import { StatusBadge, getBookingBadgeVariant } from "@/components/admin/StatusBadge";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types";
import { Map, CalendarCheck, DollarSign, MessageSquare, TrendingUp, AlertTriangle, Building2, Banknote, Star } from "lucide-react";
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
    <div className="space-y-12 pb-24">
      {/* ─── Page Title ─── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Business Insights & Analytics</p>
      </div>

      {/* ─── Primary KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Revenue" value={`₹${(Number(stats?.totalRevenue) || 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} change="Total" loading={loading} />
        <KPICard title="Pending Payments" value={`₹${(Number(stats?.pendingPayments) || 0).toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" />} change="Alert" loading={loading} />
        <KPICard title="Total Profit" value={`₹${profit.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} change={`${profitMargin}% margin`} loading={loading} />
        <KPICard title="Bookings" value={stats?.totalBookings ?? 0} icon={<CalendarCheck className="h-5 w-5" />} change="Completed" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 modern-card p-10">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Revenue Stream</h3>
              <p className="text-lg font-bold text-slate-900">Monthly Performance</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
               <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                fontSize={10} 
                fontWeight="700" 
                tick={{fill: '#94A3B8'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={10} 
                fontWeight="700" 
                tick={{fill: '#94A3B8'}}
                dx={-10}
              />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}} 
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  padding: '15px 20px'
                }} 
              />
              <Bar dataKey="revenue" fill="#FF5400" radius={[12, 12, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Leaderboard */}
        <div className="modern-card p-10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Leaderboard</h3>
              <p className="text-lg font-bold text-slate-900">Top Agents</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
               <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
            {stats?.leaderboard?.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    0{i + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.conversion}% Conversion</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-slate-900">₹{s.revenue.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{s.accepted}/{s.total} Trx</p>
                </div>
              </div>
            ))}
            {(!stats?.leaderboard || stats.leaderboard.length === 0) && (
              <div className="text-center py-20 text-slate-300 text-xs font-medium italic">No sales activity yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Profit Summary ─── */}
      <div className="modern-card p-10">
        <div className="flex items-center gap-3 mb-10">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Financial Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-[32px] space-y-4 border border-transparent hover:border-slate-100 transition-all">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Gross Revenue</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">₹{(Number(stats?.totalRevenue) || 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>
          <div className="p-8 bg-slate-50 rounded-[32px] space-y-4 border border-transparent hover:border-slate-100 transition-all">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Operating Costs</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">₹{(Number(stats?.totalVendorCost) || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="p-8 bg-primary rounded-[32px] space-y-4 shadow-luxury relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 -mr-8 -mt-8 w-32 h-32 bg-white rounded-full group-hover:scale-150 transition-transform duration-1000" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Net Profit</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-3xl font-bold text-white">₹{profit.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">{profitMargin}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Activity Table ─── */}
      <div className="modern-card p-0 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Transaction History</h3>
            <p className="text-lg font-bold text-slate-900">Recent Bookings</p>
          </div>
          <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary">View All</Button>
        </div>
        <div className="responsive-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Guest Name</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expedition</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Value</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.recentBookings?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        {b.userName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{b.userName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-sm font-medium text-slate-500">{b.tripTitle}</td>
                  <td className="px-10 py-7 font-bold text-slate-900 text-sm">₹{b.amount.toLocaleString()}</td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${(b.paidAmount || 0) >= b.amount ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       <span className="text-sm font-bold text-slate-900">₹{(b.paidAmount || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <StatusBadge variant={getBookingBadgeVariant(b.status)} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">{b.status}</StatusBadge>
                  </td>
                </tr>
              ))}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <tr>
                   <td colSpan={5} className="px-10 py-24 text-center">
                     <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                           <CalendarCheck className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-medium text-slate-300 italic">No recent transactions found</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
