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
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => { setTrips(await bookingsService.getTrips()); };
  useEffect(() => { if (open) load(); }, [open]);

  const handleSave = async () => {
    if (!code || !name) return toast.error("Both fields required");
    setLoading(true);
    try {
      if (editId) {
        await bookingsService.updateTrip(editId, { tripCode: code.toUpperCase(), tripName: name, price: parseFloat(price) || 0 });
        toast.success("Trip updated!");
      } else {
        await bookingsService.createTrip({ tripCode: code.toUpperCase(), tripName: name, price: parseFloat(price) || 0 });
        toast.success("Trip created!");
      }
      setCode(""); setName(""); setPrice(""); setEditId(null);
      load(); onRefresh();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    setLoading(false);
  };

  const startEdit = (t: BookingTrip) => {
    setEditId(t.id);
    setCode(t.tripCode);
    setName(t.tripName);
    setPrice(t.price?.toString() || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setCode("");
    setName("");
    setPrice("");
  };

  const copyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Form link copied!");
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 border-none rounded-2xl overflow-hidden">
        <DialogHeader className="bg-slate-900 px-6 py-4 text-white">
          <DialogTitle className="text-lg font-black uppercase tracking-widest">Trip Manager</DialogTitle>
          <DialogDescription className="sr-only">Manage available trips.</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <Input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} className="w-28 uppercase font-bold" />
            <Input placeholder="Trip Name" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            <Input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="w-24" />
            {editId ? (
              <div className="flex gap-1">
                <Button onClick={handleSave} disabled={loading} size="sm" className="bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-lg">Update</Button>
                <Button onClick={cancelEdit} variant="ghost" size="sm" className="text-gray-400 rounded-lg"><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <Button onClick={handleSave} disabled={loading} size="sm" className="bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-lg px-6">Add</Button>
            )}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {trips.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                <div>
                  <span className="font-black text-primary text-[10px] mr-2">{t.tripCode}</span>
                  <span className="font-bold text-gray-700 text-sm">{t.tripName}</span>
                  <span className="ml-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">₹{t.price?.toLocaleString() || 0}</span>
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
function ConfirmModal({ booking, trips, onClose, onDone }: { booking: Booking | null; trips: BookingTrip[]; onClose: () => void; onDone: () => void }) {
  const [total, setTotal] = useState("");
  const [advance, setAdvance] = useState("");
  const [mode, setMode] = useState("UPI");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setEmail(booking.email || "");
      // Auto-feed total amount from trip price if available
      const trip = trips.find(t => t.tripCode === booking.tripId);
      if (trip && trip.price) {
        setTotal(trip.price.toString());
      } else {
        setTotal("");
      }
    }
  }, [booking, trips]);

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
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [depStart, setDepStart] = useState("");
  const [depEnd, setDepEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    // 1. High-level Tab Filter (Status)
    if (b.status !== tab) return false;
    
    // 2. Trip Filter
    if (filterTrip !== 'all' && b.tripId !== filterTrip) return false;
    
    // 3. Payment/Status Dropdown Filter
    if (statusFilter !== 'all' && b.paymentStatus?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (tab === 'confirmed' && filterPayment !== 'all' && b.paymentStatus?.toLowerCase() !== filterPayment) return false;
    
    // 4. Search Filter
    if (search) {
      const s = search.toLowerCase();
      const match = b.fullName?.toLowerCase().includes(s) || 
                    b.mobile?.includes(s) || 
                    b.bookingId?.toLowerCase().includes(s) ||
                    b.email?.toLowerCase().includes(s);
      if (!match) return false;
    }

    // 5. Booking Date Range (createdAt)
    if (bookingStart || bookingEnd) {
      const bDate = new Date(b.createdAt);
      if (bookingStart && bDate < new Date(bookingStart)) return false;
      if (bookingEnd) {
        const end = new Date(bookingEnd);
        end.setHours(23, 59, 59, 999);
        if (bDate > end) return false;
      }
    }

    // 6. Departure Date Range (departureDate)
    if (depStart || depEnd) {
      if (!b.departureDate) return false;
      const dDate = new Date(b.departureDate);
      if (depStart && dDate < new Date(depStart)) return false;
      if (depEnd) {
        const end = new Date(depEnd);
        end.setHours(23, 59, 59, 999);
        if (dDate > end) return false;
      }
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
      notes: b.notes || '',
      departureDate: b.departureDate || ''
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

  const clearFilters = () => {
    setSearch("");
    setFilterTrip("all");
    setFilterPayment("all");
    setBookingStart("");
    setBookingEnd("");
    setDepStart("");
    setDepEnd("");
    setStatusFilter("all");
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
          <Button onClick={clearFilters} variant="ghost" className="text-xs font-bold uppercase text-gray-400">
            Clear Filters
          </Button>
          <Button onClick={() => setShowTrips(true)} variant="outline" className="font-bold text-xs uppercase tracking-widest bg-white">
            <Link2 className="w-4 h-4 mr-2" /> Manage Trips
          </Button>
        </div>
      </div>

      {/* Main Grid for Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tabs - Moved inside sidebar for compactness if needed, or kept above */}
          <div className="flex flex-col gap-2">
            <button onClick={() => setTab('pending')} className={cn("flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", tab === 'pending' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-gray-500 border border-slate-100 hover:bg-slate-50")}>
              <span><Clock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Pending</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full">{pendingCount}</span>
            </button>
            <button onClick={() => setTab('confirmed')} className={cn("flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", tab === 'confirmed' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white text-gray-500 border border-slate-100 hover:bg-slate-50")}>
              <span><CheckCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Confirmed</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{confirmedCount}</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Search For A Booking
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="booking ID, name, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl bg-slate-50 border-none text-sm" />
              </div>
            </div>

            {/* Booking Dates */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Booking Dates
              </label>
              <div className="space-y-2">
                <Input type="date" value={bookingStart} onChange={e => setBookingStart(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
                <Input type="date" value={bookingEnd} onChange={e => setBookingEnd(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
              </div>
            </div>

            {/* Departure Dates */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Departure Dates
              </label>
              <div className="space-y-2">
                <Input type="date" value={depStart} onChange={e => setDepStart(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
                <Input type="date" value={depEnd} onChange={e => setDepEnd(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
              </div>
            </div>

            {/* Trips */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Trips
              </label>
              <select value={filterTrip} onChange={e => setFilterTrip(e.target.value)} className="w-full h-11 px-3 border-none rounded-xl text-sm font-bold bg-slate-50">
                <option value="all">Pick a trip</option>
                {trips.map(t => <option key={t.id} value={t.tripCode}>{t.tripCode} — {t.tripName}</option>)}
              </select>
            </div>

            {/* Booking Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Booking Status
              </label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-11 px-3 border-none rounded-xl text-sm font-bold bg-slate-50">
                <option value="all">Filter by Booking status</option>
                <option value="pending">Pending Payment</option>
                <option value="partial">Partial Payment</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side - Table */}
        <div className="lg:col-span-3">
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
                <tr key={b.id} className="hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => setDetailsTarget(b)}>
                  <td className="px-4 py-3"><span className="font-mono text-[11px] font-black text-primary bg-primary/5 px-2 py-1 rounded">{b.bookingId}</span></td>
                  <td className="px-4 py-3 font-bold text-sm text-slate-700">{b.fullName}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-medium">{b.mobile}</td>
                  <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black">{b.tripId}</span></td>
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
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 px-3 font-black uppercase tracking-widest hover:text-primary hover:bg-primary/5" onClick={() => openEdit(b)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-rose-500 text-[10px] h-7 px-2 hover:bg-rose-50" onClick={() => handleDelete(b.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>

    {/* Trip Manager */}
      <TripManager open={showTrips} onClose={() => setShowTrips(false)} onRefresh={fetchAll} />

      {/* Confirm Modal */}
      <ConfirmModal booking={confirmTarget} trips={trips} onClose={() => setConfirmTarget(null)} onDone={() => { setConfirmTarget(null); fetchAll(); }} />

      {/* Edit Modal */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-2xl overflow-hidden">
            <DialogHeader className="bg-slate-900 px-6 py-4 text-white">
              <DialogTitle className="font-black uppercase tracking-[0.2em] text-xs">Edit: {editTarget.bookingId}</DialogTitle>
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
              <Button onClick={saveEdit} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20">Save Changes</Button>
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
