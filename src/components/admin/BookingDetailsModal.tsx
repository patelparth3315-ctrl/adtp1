import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Booking, Payment, PaymentSummary } from "@/types";
import { StatusBadge, getBookingBadgeVariant } from "./StatusBadge";
import { paymentsService } from "@/services/payments.service";
import {
  Calendar, User, Phone, Mail, MapPin, Users, CreditCard, Tag, FileText,
  Clock, Train, Download, Plus, Trash2, Banknote, ArrowDownRight, CheckCircle2,
  AlertTriangle, IndianRupee, RefreshCcw, Send, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onPaymentAdded?: () => void;
}

export default function BookingDetailsModal({ open, onOpenChange, booking, onPaymentAdded }: BookingDetailsModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMode: "UPI",
    paymentDate: new Date().toISOString().split('T')[0],
    reference: "",
    notes: ""
  });

  const loadPayments = useCallback(async () => {
    if (!booking?.id) return;
    setLoadingPayments(true);
    try {
      const result = await paymentsService.getByBooking(booking.id);
      setPayments(result.payments);
      setSummary(result.summary);
    } catch {
      // Silently fail — payments module may not have data yet
    } finally {
      setLoadingPayments(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    if (open && booking?.id) {
      loadPayments();
      setShowAddPayment(false);
      setPaymentForm({
        amount: "",
        paymentMode: "UPI",
        paymentDate: new Date().toISOString().split('T')[0],
        reference: "",
        notes: ""
      });
    }
  }, [open, booking?.id, loadPayments]);

  if (!booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalAmount = summary?.totalAmount ?? booking.amount ?? 0;
  const totalPaid = summary?.totalPaid ?? booking.paidAmount ?? 0;
  const balance = totalAmount - totalPaid;
  const paymentPercent = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  const handleAddPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await paymentsService.add({
        bookingId: booking.id,
        amount: Number(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        paymentDate: paymentForm.paymentDate,
        reference: paymentForm.reference,
        notes: paymentForm.notes
      });
      toast.success("Payment recorded successfully");
      setShowAddPayment(false);
      setPaymentForm({ amount: "", paymentMode: "UPI", paymentDate: new Date().toISOString().split('T')[0], reference: "", notes: "" });
      await loadPayments();
      onPaymentAdded?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Delete this payment record? The booking will be resynchronized.")) return;
    try {
      await paymentsService.remove(paymentId);
      toast.success("Payment deleted");
      await loadPayments();
      onPaymentAdded?.();
    } catch {
      toast.error("Failed to delete payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto p-0">
        {/* Status Header */}
        <div className={cn(
          "px-8 py-6 border-b",
          booking.status === 'confirmed' ? "bg-emerald-50" :
          booking.status === 'cancelled' ? "bg-red-50" : "bg-amber-50"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black uppercase tracking-tight">Booking #{booking.id.slice(-6)}</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                    booking.syncStatus === 'synced' ? "bg-emerald-100 text-emerald-700" :
                    booking.syncStatus === 'failed' ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-500"
                  )}>
                    {booking.syncStatus === 'synced' ? "Cloud Synced" : booking.syncStatus === 'failed' ? "Sync Failed" : "Sync Pending"}
                  </div>
                </div>
                {booking.bookingId && <span className="text-[10px] font-mono text-muted-foreground">{booking.bookingId}</span>}
              </div>
              <div className="flex gap-2 items-center">
                {booking.syncStatus === 'failed' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[9px] font-bold border-red-200 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      const { bookingsService } = await import("@/services/bookings.service");
                      await bookingsService.retrySync(booking.id);
                      toast.success("Sync retried successfully");
                      onPaymentAdded?.();
                    }}
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" /> Retry Sync
                  </Button>
                )}
                <StatusBadge variant={getBookingBadgeVariant(booking.status)}>{booking.status}</StatusBadge>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {booking.status === 'pending' && (
          <div className="px-8 pt-6 pb-2">
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs gap-2 rounded-2xl shadow-lg shadow-emerald-200"
              onClick={async () => {
                try {
                  const { bookingsService } = await import("@/services/bookings.service");
                  await bookingsService.updateStatus(booking.id, "accepted");
                  toast.success("Booking Accepted & Synced to Google Sheets!");
                  onPaymentAdded?.(); // Refresh
                } catch (err) {
                  toast.error("Failed to accept booking");
                }
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Accept & Sync to Google Sheets
            </Button>
          </div>
        )}

        <div className="px-8 pb-8 space-y-6">
          {/* ─── Payment Progress Bar ─── */}
          <div className="bg-white border-2 border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-3.5 w-3.5" /> Payment Progress
              </h4>
              <div className="flex gap-2">
                <span className={cn(
                  "text-xs font-black uppercase px-3 py-1 rounded-full",
                  paymentPercent >= 100 ? "bg-emerald-100 text-emerald-700" :
                  paymentPercent > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                )}>
                  {paymentPercent >= 100 ? "Fully Paid" : paymentPercent > 0 ? "Partial" : "Unpaid"}
                </span>
                {paymentPercent < 100 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50"
                    onClick={async () => {
                      const { bookingsService } = await import("@/services/bookings.service");
                      await bookingsService.markAsFullyPaid(booking.id);
                      toast.success("Marked as Fully Paid");
                      onPaymentAdded?.();
                    }}
                  >
                    Mark as Fully Paid
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-700",
                  paymentPercent >= 100 ? "bg-emerald-500" :
                  paymentPercent > 0 ? "bg-amber-500" : "bg-red-400"
                )}
                style={{ width: `${paymentPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total</p>
                <p className="text-lg font-black text-foreground">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold">Paid</p>
                <p className="text-lg font-black text-emerald-700">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-[9px] uppercase tracking-wider text-red-600 font-bold">Balance</p>
                <p className={cn("text-lg font-black", balance > 0 ? "text-red-600" : "text-emerald-600")}>
                  ₹{Math.max(0, balance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Customer & Trip Info ─── */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" /> Customer
              </h4>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold">{booking.userName}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> {booking.email}
                </div>
                <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> {booking.phone}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg"
                      onClick={() => {
                        const msg = encodeURIComponent(`*YouthCamping Booking Received* 🏕️\n\nHello ${booking.userName},\n\nWe have received your booking request for *${booking.tripTitle}*. Our team is reviewing the availability and will confirm shortly.\n\n*Reference:* ${booking.bookingId || booking.id.slice(-6)}\n\nSee you soon!`);
                        window.open(`https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" /> Recv
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg"
                      onClick={() => {
                        const msg = encodeURIComponent(`*YouthCamping Booking Confirmed* 🏕️\n\nHello ${booking.userName},\n\nYour adventure to *${booking.tripTitle}* is now *CONFIRMED*!\n\n*Booking ID:* ${booking.bookingId || booking.id.slice(-6)}\n*Travel Date:* ${formatDate(booking.travelDate)}\n\nGet ready for the wild! 🏔️`);
                        window.open(`https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Conf
                    </Button>
                    {balance > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[9px] font-bold text-red-600 hover:bg-red-50 px-2 rounded-lg"
                        onClick={() => {
                          const msg = encodeURIComponent(`*YouthCamping Payment Reminder* 🏕️\n\nHi ${booking.userName},\n\nJust a quick reminder regarding your booking for *${booking.tripTitle}*.\n\n*Remaining Balance:* ₹${balance.toLocaleString()}\n\nPlease clear the balance to confirm your final arrangements.\n\nTeam YouthCamping`);
                          window.open(`https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                        }}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" /> Remind
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Trip Details
              </h4>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold">{booking.tripTitle || "Unknown Trip"}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {formatDate(booking.travelDate)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {booking.travelers || 1} Traveler(s)
                </div>
                {booking.pickupCity && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Pickup: {booking.pickupCity}
                  </div>
                )}
                {booking.salesPersonName && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <User className="h-3 w-3" /> Sales: {booking.salesPersonName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Payment History ─── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" /> Payment History ({payments.length})
              </h4>
              {balance > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowAddPayment(!showAddPayment)}
                  className="h-8 text-[10px] font-black uppercase tracking-wider gap-1.5 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showAddPayment ? "Cancel" : "Add Payment"}
                </Button>
              )}
            </div>

            {/* Add Payment Form */}
            {showAddPayment && (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4" /> Record New Payment
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Amount (₹) *</label>
                    <Input
                      type="number"
                      placeholder={`Max ₹${balance.toLocaleString()}`}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="h-10 rounded-xl text-sm font-bold"
                      max={balance}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Mode *</label>
                    <Select value={paymentForm.paymentMode} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMode: v })}>
                      <SelectTrigger className="h-10 rounded-xl text-sm font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                    <Input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                      className="h-10 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Reference / UTR</label>
                    <Input
                      placeholder="Transaction ID..."
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <Input
                    placeholder="Optional notes..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <Button
                  onClick={handleAddPayment}
                  disabled={submitting}
                  className="w-full h-11 rounded-xl font-black uppercase text-xs tracking-widest"
                >
                  {submitting ? "Recording..." : `Record ₹${Number(paymentForm.amount || 0).toLocaleString()} Payment`}
                </Button>
              </div>
            )}

            {/* Payment List */}
            {loadingPayments ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-2xl">
                <Banknote className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No payments recorded yet</p>
                {balance > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPayment(true)}
                    className="mt-3 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Record First Payment
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground">Mode</th>
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground">Ref</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-700">
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-lg uppercase">
                            {p.paymentMode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                          {p.reference || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePayment(p.id || p._id!)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── Booking Meta ─── */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center justify-between text-sm p-3 bg-muted/20 rounded-xl">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Booked On
              </span>
              <span className="text-xs font-medium">{formatDate(booking.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm p-3 bg-muted/20 rounded-xl">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Last Updated
              </span>
              <span className="text-xs font-medium">
                {new Date(booking.updatedAt || booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>

          {/* ─── Notes ─── */}
          {(booking.notes || booking.adminNotes) && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" /> Notes
              </h4>
              {booking.notes && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-muted-foreground mb-1">CUSTOMER NOTES</p>
                  <p className="text-sm italic text-foreground/80">"{booking.notes}"</p>
                </div>
              )}
              {booking.specialRequests && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 mb-1">SPECIAL REQUESTS</p>
                  <p className="text-sm text-foreground/80 font-medium">{booking.specialRequests}</p>
                </div>
              )}
              {booking.adminNotes && (
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <p className="text-[10px] font-bold text-primary/60 mb-1">ADMIN INTERNAL NOTES</p>
                  <p className="text-sm text-foreground/80">{booking.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Train Tickets (preserved from original) ─── */}
          {booking.trainTickets && booking.trainTickets.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Train className="h-3 w-3" /> Train Tickets
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {booking.trainTickets.map((ticket, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PNR: {ticket.pnr || "N/A"}</p>
                        <p className="text-sm font-black">{ticket.trainNo} {ticket.trainName}</p>
                      </div>
                      <StatusBadge variant={ticket.status === 'Confirmed' ? 'success' : ticket.status === 'Cancelled' ? 'destructive' : 'warning'}>
                        {ticket.status}
                      </StatusBadge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Journey</p>
                        <p className="font-semibold">{ticket.from} ➜ {ticket.to}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Departure</p>
                        <p className="font-semibold">{ticket.departureDate ? new Date(ticket.departureDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Coach / Seat</p>
                        <p className="font-semibold">{ticket.coach} / {ticket.seat}</p>
                      </div>
                    </div>
                    {ticket.ticketUrl && (
                      <div className="pt-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-[10px] gap-1"
                          onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8888"}${ticket.ticketUrl}`, "_blank")}
                        >
                          <Download className="h-3 w-3" /> Download Ticket PDF
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
