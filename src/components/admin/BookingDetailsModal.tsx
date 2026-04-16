import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";
import { StatusBadge, getBookingBadgeVariant } from "./StatusBadge";
import { Calendar, User, Phone, Mail, MapPin, Users, CreditCard, Tag, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export default function BookingDetailsModal({ open, onOpenChange, booking }: BookingDetailsModalProps) {
  if (!booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const balance = (booking.amount || 0) - (booking.paidAmount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Booking Details
            <StatusBadge variant={getBookingBadgeVariant(booking.status)}>{booking.status}</StatusBadge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Header Summary */}
          <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Paid / Booking</p>
              <p className="text-lg font-black text-green-600">₹{booking.paidAmount?.toLocaleString()}</p>
            </div>
            <div className="text-center space-y-1 border-x border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Amount</p>
              <p className="text-lg font-black text-foreground">₹{booking.amount?.toLocaleString()}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Balance Due</p>
              <p className={cn("text-lg font-black", balance > 0 ? "text-destructive" : "text-green-600")}>
                ₹{balance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" /> Customer Info
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{booking.userName}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {booking.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" /> {booking.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Trip Info
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{booking.tripTitle || "Unknown Trip"}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDate(booking.travelDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Users className="h-3 w-3" /> {booking.travelers || 1} Person(s)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-border">
             {/* Payment Details */}
             <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> Payment Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn("font-bold capitalize", 
                    booking.paymentStatus === 'paid' ? 'text-green-600' : 
                    booking.paymentStatus === 'partial' ? 'text-amber-600' : 'text-destructive'
                  )}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">{booking.id.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Booking Stats */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" /> Booking Timing
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Booked On:</span>
                  <span className="text-muted-foreground">{formatDate(booking.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(booking.updatedAt || booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(booking.notes || booking.adminNotes) && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" /> Additional Notes
              </h4>
              <div className="space-y-4">
                {booking.notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-[10px] font-bold text-muted-foreground mb-1">CUSTOMER NOTES</p>
                    <p className="text-sm italic text-foreground/80">"{booking.notes}"</p>
                  </div>
                )}
                {booking.adminNotes && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <p className="text-[10px] font-bold text-primary/60 mb-1">ADMIN INTERNAL NOTES</p>
                    <p className="text-sm text-foreground/80">{booking.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="w-full">
            Close View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
