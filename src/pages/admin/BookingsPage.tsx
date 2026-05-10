import { useState, useEffect } from "react";
import { Plus, Search, Copy, Trash2, CheckCircle, Clock, Filter, X, Link2, Users, ChevronDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingsService } from "@/services/bookings.service";
import BookingDetailsModal from "@/components/admin/BookingDetailsModal";
import type { Booking, BookingTrip } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── TRIP MANAGER MODAL ──
function TripManager({ open, onClose, onRefresh }: { open: boolean; onClose: () => void; onRefresh: () => void }) {
  const [trips, setTrips] = useState<BookingTrip[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => { setTrips(await bookingsService.getTrips()); };
  useEffect(() => { if (open) load(); }, [open]);

  const handleSave = async () => {
    if (!code || !name) return toast.error("Both fields required");
    setLoading(true);
    try {
      if (editId) {
        await bookingsService.updateTrip(editId, { tripCode: code.toUpperCase(), tripName: name });
        toast.success("Trip updated!");
      } else {
        await bookingsService.createTrip({ tripCode: code.toUpperCase(), tripName: name });
        toast.success("Trip created!");
      }
      setCode(""); setName(""); setEditId(null);
      load(); onRefresh();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    setLoading(false);
  };

  const startEdit = (t: BookingTrip) => {
    setEditId(t.id);
    setCode(t.tripCode);
    setName(t.tripName);
  };

  const cancelEdit = () => {
    setEditId(null);
    setCode("");
    setName("");
  };

  const copyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Form link copied!");
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 border-none rounded-2xl overflow-hidden">
        <DialogHeader className="bg-[#1e293b] px-6 py-4 text-white">
          <DialogTitle className="text-lg font-bold uppercase tracking-widest">Trip Manager</DialogTitle>
          <DialogDescription className="sr-only">Manage available trips.</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <Input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} className="w-28 uppercase font-bold" />
            <Input placeholder="Trip Name" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            {editId ? (
              <div className="flex gap-1">
                <Button onClick={handleSave} disabled={loading} size="sm" className="bg-emerald-600 text-white font-bold">Update</Button>
                <Button onClick={cancelEdit} variant="ghost" size="sm" className="text-gray-400"><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <Button onClick={handleSave} disabled={loading} size="sm" className="bg-blue-600 text-white font-bold">Add</Button>
            )}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {trips.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                <div>
                  <span className="font-black text-blue-600 text-xs mr-2">{t.tripCode}</span>
                  <span className="font-bold text-gray-700 text-sm">{t.tripName}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-blue-500" onClick={() => startEdit(t)} title="Edit trip">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyLink(t.formLink)} title="Copy form link">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { 
                    if(confirm("Delete trip?")) {
                      await bookingsService.deleteTrip(t.id); load(); onRefresh(); 
                    }
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {trips.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No trips yet. Create one above.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── CONFIRM BOOKING MODAL ──
function ConfirmModal({ booking, onClose, onDone }: { booking: Booking | null; onClose: () => void; onDone: () => void }) {
  const [total, setTotal] = useState("");
  const [advance, setAdvance] = useState("");
  const [mode, setMode] = useState("UPI");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setEmail(booking.email || "");
    }
  }, [booking]);

  if (!booking) return null;

  const handleConfirm = async () => {
    if (!total || parseFloat(total) <= 0) return toast.error("Enter valid total amount");
    setSaving(true);
    try {
      await bookingsService.confirm(booking.id, {
        totalAmount: parseFloat(total),
        advancePaid: parseFloat(advance) || 0,
        paymentMode: mode,
        paymentStatus: parseFloat(advance) >= parseFloat(total) ? 'Paid' : parseFloat(advance) > 0 ? 'Partial' : 'Pending',
        email
      });
      toast.success("Booking confirmed!");
      // Automatically send confirmation email
      try {
        await bookingsService.sendEmail(booking.id, 'confirmation');
        toast.success("Confirmation email sent!");
      } catch (e) {
        console.error("Failed to send automatic confirmation email", e);
        toast.error("Booking confirmed but email failed to send");
      }
      onDone();
    } catch { toast.error("Failed to confirm"); }
    setSaving(false);
  };

  const rem = (parseFloat(total) || 0) - (parseFloat(advance) || 0);

  return (
    <Dialog open={!!booking} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 border-none rounded-2xl overflow-hidden">
        <DialogHeader className="bg-emerald-600 px-6 py-4 text-white">
          <DialogTitle className="font-bold uppercase tracking-widest">Confirm Booking</DialogTitle>
          <DialogDescription className="sr-only">Confirm the booking details and payments.</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-black text-gray-900">{booking?.fullName || "No Name"}</p>
            <p className="text-xs text-gray-400">{booking?.bookingId} · {booking?.tripId} · {booking?.mobile} · {booking?.email || "No Email"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400">Total Amount *</label>
              <Input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="₹" className="font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400">Advance Paid</label>
              <Input type="number" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="₹" className="font-bold text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl">
            <span className="text-xs font-bold text-gray-500">Remaining</span>
            <span className="font-black text-red-600">₹{rem.toLocaleString()}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400">Payment Mode</label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400">Customer Email (For confirmation)</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@example.com" />
          </div>
          <Button onClick={handleConfirm} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest h-12 rounded-xl">
            {saving ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── MAIN PAGE ──
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<BookingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'confirmed'>('pending');
  const [search, setSearch] = useState("");
  const [filterTrip, setFilterTrip] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [showTrips, setShowTrips] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
  const [editTarget, setEditTarget] = useState<Booking | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([
        bookingsService.getAll().catch(err => { console.error("Bookings failed", err); return []; }),
        bookingsService.getTrips().catch(err => { console.error("Trips failed", err); return []; })
      ]);
      setBookings(Array.isArray(b) ? b : []); 
      setTrips(Array.isArray(t) ? t : []);
    } catch (err) {
      console.error("🔥 Critical fetch error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  const filtered = bookings.filter(b => {
    if (b.status !== tab) return false;
    if (filterTrip !== 'all' && b.tripId !== filterTrip) return false;
    if (tab === 'confirmed' && filterPayment !== 'all' && b.paymentStatus?.toLowerCase() !== filterPayment) return false;
    if (search) {
      const s = search.toLowerCase();
      return b.fullName?.toLowerCase().includes(s) || b.mobile?.includes(s) || b.bookingId?.toLowerCase().includes(s);
    }
    return true;
  });

  const openEdit = (b: Booking) => {
    setEditTarget(b);
    setEditForm({ 
      fullName: b.fullName, 
      mobile: b.mobile, 
      email: b.email || '', 
      age: b.age, 
      gender: b.gender, 
      tripId: b.tripId,
      trainClass: b.trainClass, 
      ticketStatus: b.ticketStatus, 
      roomType: b.roomType, 
      totalAmount: b.totalAmount, 
      advancePaid: b.advancePaid, 
      paymentMode: b.paymentMode, 
      paymentStatus: b.paymentStatus, 
      notes: b.notes || '' 
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    try {
      await bookingsService.update(editTarget.id, editForm);
      toast.success("Booking updated!"); setEditTarget(null); fetchAll();
    } catch { toast.error("Update failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try { await bookingsService.delete(id); toast.success("Deleted"); fetchAll(); } catch { toast.error("Failed"); }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Booking System</h1>
          <p className="text-sm text-gray-500 mt-1">Sales → Form → Client → Confirm → Track</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTrips(true)} variant="outline" className="font-bold text-xs uppercase tracking-widest">
            <Link2 className="w-4 h-4 mr-2" /> Manage Trips
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === 'pending' ? "bg-amber-500 text-white shadow-lg" : "bg-white text-gray-500 border hover:bg-gray-50")}>
          <Clock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Pending ({pendingCount})
        </button>
        <button onClick={() => setTab('confirmed')} className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === 'confirmed' ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-gray-500 border hover:bg-gray-50")}>
          <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Confirmed ({confirmedCount})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name, mobile, ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl" />
        </div>
        <select value={filterTrip} onChange={e => setFilterTrip(e.target.value)} className="h-10 px-3 border rounded-xl text-xs font-bold bg-white">
          <option value="all">All Trips</option>
          {trips.map(t => <option key={t.id} value={t.tripCode}>{t.tripCode} — {t.tripName}</option>)}
        </select>
        {tab === 'confirmed' && (
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="h-10 px-3 border rounded-xl text-xs font-bold bg-white">
            <option value="all">All Payment</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Booking ID</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trip</th>
                {tab === 'confirmed' && <>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Advance</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Remaining</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </>}
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400 animate-pulse font-bold">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400 font-bold">No {tab} bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setDetailsTarget(b)}>
                  <td className="px-4 py-3"><span className="font-mono text-[11px] font-bold text-blue-600">{b.bookingId}</span></td>
                  <td className="px-4 py-3 font-bold text-sm text-gray-900">{b.fullName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{b.mobile}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black">{b.tripId}</span></td>
                  {tab === 'confirmed' && <>
                    <td className="px-4 py-3 font-bold text-sm">₹{Number(b.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-sm text-emerald-600">₹{Number(b.advancePaid || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-black text-sm text-red-600">₹{Number(b.remainingAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                        b.paymentStatus === 'Paid' ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                        b.paymentStatus === 'Partial' ? "text-amber-600 bg-amber-50 border-amber-200" :
                        "text-red-600 bg-red-50 border-red-200"
                      )}>{b.paymentStatus || 'Pending'}</span>
                    </td>
                  </>}
                  <td className="px-4 py-3 text-[10px] text-gray-400">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {tab === 'pending' && (
                        <Button size="sm" className="bg-emerald-600 text-white text-[10px] font-bold h-7 px-3" onClick={() => setConfirmTarget(b)}>Confirm</Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2" onClick={() => openEdit(b)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-500 text-[10px] h-7 px-2" onClick={() => handleDelete(b.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trip Manager */}
      <TripManager open={showTrips} onClose={() => setShowTrips(false)} onRefresh={fetchAll} />

      {/* Confirm Modal */}
      <ConfirmModal booking={confirmTarget} onClose={() => setConfirmTarget(null)} onDone={() => { setConfirmTarget(null); fetchAll(); }} />

      {/* Edit Modal */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-2xl overflow-hidden">
            <DialogHeader className="bg-[#1e293b] px-6 py-4 text-white">
              <DialogTitle className="font-bold uppercase tracking-widest text-sm">Edit: {editTarget.bookingId}</DialogTitle>
              <DialogDescription className="sr-only">Edit this booking details directly.</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Full Name</label><Input value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Mobile</label><Input value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Age</label><Input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Gender</label>
                  <Select value={editForm.gender} onValueChange={v => setEditForm({...editForm, gender: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
                </div>
                <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-gray-400">Email Address</label><Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="customer@example.com" /></div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Assigned Trip</label>
                  <Select value={editForm.tripId} onValueChange={v => setEditForm({...editForm, tripId: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {trips.map(t => (
                        <SelectItem key={t.id} value={t.tripCode}>{t.tripCode} — {t.tripName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Room Type</label><Input value={editForm.roomType} onChange={e => setEditForm({...editForm, roomType: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-400">Train Class</label>
                  <Select value={editForm.trainClass} onValueChange={v => setEditForm({...editForm, trainClass: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sleeper">Sleeper</SelectItem><SelectItem value="3AC">3AC</SelectItem><SelectItem value="2AC">2AC</SelectItem><SelectItem value="Flight">Flight</SelectItem></SelectContent></Select>
                </div>
                {editTarget.status === 'confirmed' && <>
                  <div><label className="text-[10px] font-bold uppercase text-gray-400">Total</label><Input type="number" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold uppercase text-gray-400">Advance</label><Input type="number" value={editForm.advancePaid} onChange={e => setEditForm({...editForm, advancePaid: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold uppercase text-gray-400">Payment Status</label>
                    <Select value={editForm.paymentStatus} onValueChange={v => setEditForm({...editForm, paymentStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Partial">Partial</SelectItem><SelectItem value="Paid">Paid</SelectItem></SelectContent></Select>
                  </div>
                </>}
              </div>
              <div><label className="text-[10px] font-bold uppercase text-gray-400">Notes</label><textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full border rounded-xl p-3 text-sm min-h-[60px]" /></div>
              <Button onClick={saveEdit} className="w-full bg-blue-600 text-white font-black uppercase h-11 rounded-xl">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Modal */}
      <BookingDetailsModal 
        open={!!detailsTarget} 
        onOpenChange={v => !v && setDetailsTarget(null)} 
        booking={detailsTarget} 
        onEdit={(b) => { setDetailsTarget(null); openEdit(b); }} 
      />
    </div>
  );
}
