import { useEffect, useState, useCallback } from "react";
import { inquiriesService } from "@/services/inquiries.service";
import type { Inquiry } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MessageSquare, Eye, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inquiriesService.getAll();
      setInquiries(data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: inquiries.length,
    converted: inquiries.filter(i => i.status === 'converted').length,
    revenue: inquiries.reduce((acc, inq) => acc + (inq.convertedAmount || 0), 0),
    avgResponse: inquiries.filter(i => i.responseTimeMinutes).length 
      ? Math.round(inquiries.reduce((acc, i) => acc + (i.responseTimeMinutes || 0), 0) / inquiries.filter(i => i.responseTimeMinutes).length)
      : 0
  };

  const updateInquiry = async (data: Partial<Inquiry>) => {
    if (!selected) return;
    try {
      await inquiriesService.update(selected.id, data);
      toast.success("CRM updated");
      load();
    } catch (error) {
      toast.error("Failed to update inquiry");
    }
  };

  const handleView = async (inq: Inquiry) => {
    setSelected(inq);
    if (!inq.read) {
      await inquiriesService.markAsRead(inq.id);
      load();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl font-bold text-foreground">Inquiries</h1>
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Sales CRM</h1>
        <div className="flex gap-4">
          <StatCard label="Avg Response" value={`${stats.avgResponse}m`} />
          <StatCard label="Conv Rate" value={`${Math.round((stats.converted / stats.total) * 100 || 0)}%`} />
          <StatCard label="Pipeline Value" value={`₹${stats.revenue.toLocaleString()}`} />
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3" />
          <p>No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className={`rounded-[32px] border bg-card p-8 flex items-start justify-between gap-6 transition-all hover:shadow-xl ${!inq.read ? "border-primary/50 shadow-lg shadow-primary/5 bg-primary/5" : "border-border"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <p className="font-black text-xl text-card-foreground uppercase tracking-tight">{inq.name}</p>
                  {inq.isDuplicate && <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">Duplicate</span>}
                  {!inq.read && <StatusBadge variant="default">New Lead</StatusBadge>}
                </div>
                {inq.tripTitle && <p className="text-sm font-bold text-primary mb-3">Expedition: {inq.tripTitle}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{inq.message || "No message provided."}</p>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {inq.createdAt}</span>
                  {inq.responseTimeMinutes && <span className="text-green-500">Replied in {inq.responseTimeMinutes}m</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => handleView(inq)}>
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{selected.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{selected.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />{selected.createdAt}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.date || 'Not specified'}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Travellers</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.count || '1'}</p>
                </div>
              </div>
              {selected.tripTitle && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Related Trip</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.tripTitle}</p>
                </div>
              )}
              <div className="bg-primary/5 rounded-[32px] p-8 border border-primary/10 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">CRM ACTION PANEL</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Status</label>
                    <select 
                      value={selected.status}
                      onChange={(e) => updateInquiry(selected, { status: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold font-sans"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">In Discussion</option>
                      <option value="converted">Booking Done</option>
                      <option value="closed">Lost/Closed</option>
                    </select>
                  </div>
                  {selected.status === 'converted' && (
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Revenue (₹)</label>
                       <input 
                         type="number"
                         placeholder="Enter Amount"
                         defaultValue={selected.convertedAmount}
                         onBlur={(e) => updateInquiry(selected, { convertedAmount: Number(e.target.value) })}
                         className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold"
                       />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Admin Conversation Notes</label>
                   <textarea 
                     className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-medium min-h-[100px]"
                     defaultValue={selected.adminNotes}
                     placeholder="Notes from call: customer budget, group dates..."
                     onBlur={(e) => updateInquiry(selected, { adminNotes: e.target.value })}
                   />
                </div>
              </div>

              <div className="flex gap-3">
                 <Button className="flex-1 bg-black text-white hover:bg-gray-800 rounded-2xl py-6 font-black uppercase text-xs tracking-widest" onClick={() => { window.open(`tel:${selected.phone}`); updateInquiry(selected, { status: 'contacted' }); }}>
                   <Phone className="h-4 w-4 mr-2" /> Call Now
                 </Button>
                 <Button variant="outline" className="flex-1 border-gray-200 rounded-2xl py-6 font-black uppercase text-xs tracking-widest" onClick={() => { window.open(`mailto:${selected.email}`); }}>
                   <Mail className="h-4 w-4 mr-2" /> Email
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] px-6 py-4 shadow-sm flex flex-col justify-center">
       <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</span>
       <span className="text-xl font-black text-black tracking-tight">{value}</span>
    </div>
  );
}
