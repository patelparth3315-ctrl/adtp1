import { useState, useEffect } from "react";
import { Plus, Search, Copy, Trash2, CheckCircle, Clock, Filter, X, Link2, Users, ChevronDown, Edit, Pencil } from "lucide-react";
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
    if (b.status !== tab) return false;
    if (filterTrip !== 'all' && b.tripId !== filterTrip) return false;
    if (statusFilter !== 'all' && b.paymentStatus?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (tab === 'confirmed' && filterPayment !== 'all' && b.paymentStatus?.toLowerCase() !== filterPayment) return false;
    if (search) {
      const s = search.toLowerCase();
      const match = b.fullName?.toLowerCase().includes(s) || 
                    b.mobile?.includes(s) || 
                    b.bookingId?.toLowerCase().includes(s) ||
                    b.email?.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (bookingStart || bookingEnd) {
      const bDate = new Date(b.createdAt);
      if (bookingStart && bDate < new Date(bookingStart)) return false;
      if (bookingEnd) {
        const end = new Date(bookingEnd);
        end.setHours(23, 59, 59, 999);
        if (bDate > end) return false;
      }
    }
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
    <div className="space-y-10 pb-24">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reservations</h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Manage Guest Bookings & Trips</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowTrips(true)} variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50">
            <Link2 className="w-4 h-4 mr-2" /> Manage Trips
          </Button>
          <Button onClick={clearFilters} variant="ghost" className="h-12 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900">
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* ─── Sidebar Filters ─── */}
        <div className="lg:col-span-1 space-y-8">
          {/* Tab Selection */}
          <div className="p-2 bg-slate-100 rounded-[24px] flex flex-col gap-1">
            <button 
              onClick={() => setTab('pending')} 
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300", 
                tab === 'pending' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Pending</span>
              </div>
              <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px]", tab === 'pending' ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400")}>
                {pendingCount}
              </span>
            </button>
            <button 
              onClick={() => setTab('confirmed')} 
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300", 
                tab === 'confirmed' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                <span>Confirmed</span>
              </div>
              <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px]", tab === 'confirmed' ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400")}>
                {confirmedCount}
              </span>
            </button>
          </div>

          <div className="modern-card p-8 space-y-8">
            {/* Search */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="ID, Name, Email..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-none text-sm font-medium" 
                />
              </div>
            </div>

            <div className="h-px bg-slate-50" />

            {/* Filter Group: Dates */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking Range</label>
              <div className="grid grid-cols-1 gap-2">
                <Input type="date" value={bookingStart} onChange={e => setBookingStart(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
                <Input type="date" value={bookingEnd} onChange={e => setBookingEnd(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expedition Trip</label>
              <Select value={filterTrip} onValueChange={setFilterTrip}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-[11px] uppercase">
                  <SelectValue placeholder="All Expeditions" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-luxury">
                  <SelectItem value="all" className="font-bold text-[10px] uppercase">All Trips</SelectItem>
                  {trips.map(t => (
                    <SelectItem key={t.id} value={t.tripCode} className="font-bold text-[10px] uppercase">
                      {t.tripCode} — {t.tripName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-[11px] uppercase">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-luxury">
                  <SelectItem value="all" className="font-bold text-[10px] uppercase">All Status</SelectItem>
                  <option value="pending">Pending Payment</option>
                  <option value="partial">Partial Payment</option>
                  <option value="paid">Paid</option>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ─── Bookings Table ─── */}
        <div className="lg:col-span-3">
          <div className="modern-card p-0 overflow-hidden shadow-premium">
            <div className="responsive-table">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Guest</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expedition</th>
                    {tab === 'confirmed' && (
                      <>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Balance</th>
                      </>
                    )}
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-8 py-6">
                          <div className="h-4 bg-slate-50 animate-pulse rounded-lg w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                             <Users className="w-8 h-8" />
                          </div>
                          <p className="text-xs font-medium text-slate-300 italic">No {tab} reservations found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(b => (
                    <tr 
                      key={b.id} 
                      className="hover:bg-slate-50/50 transition-all cursor-pointer group" 
                      onClick={() => setDetailsTarget(b)}
                    >
                      <td className="px-8 py-6">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">
                          {b.bookingId}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[13px] font-bold text-slate-900">{b.fullName}</p>
                          <p className="text-[10px] font-medium text-slate-400 tracking-tight">{b.mobile}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{b.tripId}</span>
                      </td>
                      {tab === 'confirmed' && (
                        <>
                          <td className="px-8 py-6">
                            <p className="text-[13px] font-bold text-slate-900">₹{Number(b.totalAmount || 0).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="space-y-1">
                                <p className={cn("text-[13px] font-bold", (b.remainingAmount || 0) > 0 ? "text-rose-500" : "text-emerald-500")}>
                                  ₹{Number(b.remainingAmount || 0).toLocaleString()}
                                </p>
                                <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg", 
                                  b.paymentStatus === 'Paid' ? "bg-emerald-50 text-emerald-600" : 
                                  b.paymentStatus === 'Partial' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-500"
                                )}>
                                  {b.paymentStatus}
                                </span>
                             </div>
                          </td>
                        </>
                      )}
                      <td className="px-8 py-6">
                        <p className="text-[11px] font-bold text-slate-400">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {tab === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => setConfirmTarget(b)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold h-9 px-4 rounded-xl"
                            >
                              Confirm
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEdit(b)}
                            className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(b.id)}
                            className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* ─── Modals ─── */}
      <TripManager open={showTrips} onClose={() => setShowTrips(false)} onRefresh={fetchAll} />
      <ConfirmModal booking={confirmTarget} trips={trips} onClose={() => setConfirmTarget(null)} onDone={() => { setConfirmTarget(null); fetchAll(); }} />
      
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
          <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-[32px] overflow-hidden shadow-luxury">
            <div className="p-10 space-y-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Edit Reservation</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref: {editTarget.bookingId}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                  <Input value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mobile</label>
                  <Input value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Age</label>
                  <Input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender</label>
                  <Select value={editForm.gender} onValueChange={v => setEditForm({...editForm, gender: v})}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                   <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
              </div>

              <div className="space-y-4">
                <Button onClick={saveEdit} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200">
                  Update Reservation
                </Button>
                <Button variant="ghost" onClick={() => setEditTarget(null)} className="w-full h-12 rounded-2xl font-bold text-xs text-slate-400 hover:text-slate-900">
                  Discard Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BookingDetailsModal 
        open={!!detailsTarget} 
        onOpenChange={v => !v && setDetailsTarget(null)} 
        booking={detailsTarget} 
        onEdit={(b) => { setDetailsTarget(null); openEdit(b); }} 
      />
    </div>
  );
}
