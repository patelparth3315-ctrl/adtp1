import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Booking, BookingFormData, Trip } from "@/types";
import { tripsService } from "@/services/trips.service";
import { Loader2 } from "lucide-react";

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Booking | null;
  onSave: (data: BookingFormData, editingId?: string) => Promise<void>;
}

const defaultForm: BookingFormData = {
  userName: "",
  email: "",
  phone: "",
  tripId: "",
  travelers: 1,
  travelDate: "",
  amount: 0,
  status: "pending",
  paymentStatus: "unpaid",
  notes: "",
  adminNotes: "",
};

export default function BookingFormModal({ open, onOpenChange, editing, onSave }: BookingFormModalProps) {
  const [form, setForm] = useState<BookingFormData>(defaultForm);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    const loadTrips = async () => {
      setLoadingTrips(true);
      const data = await tripsService.getAll();
      setTrips(data);
      setLoadingTrips(false);
    };
    if (open) loadTrips();
  }, [open]);

  useEffect(() => {
    if (editing) {
      setForm({
        userName: editing.userName,
        email: editing.email,
        phone: editing.phone,
        tripId: editing.tripId,
        travelers: editing.travelers || 1,
        travelDate: editing.travelDate ? new Date(editing.travelDate).toISOString().split('T')[0] : "",
        amount: editing.amount,
        status: editing.status,
        paymentStatus: editing.paymentStatus || "unpaid",
        notes: editing.notes || "",
        adminNotes: editing.adminNotes || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editing, open]);

  const handleTripChange = (tripId: string) => {
    const selectedTrip = trips.find(t => t.id === tripId);
    if (selectedTrip) {
      setForm(prev => ({
        ...prev,
        tripId,
        amount: selectedTrip.price * prev.travelers
      }));
    } else {
      setForm(prev => ({ ...prev, tripId }));
    }
  };

  const handleTravelersChange = (val: string) => {
    const travelers = parseInt(val) || 1;
    setForm(prev => {
      const selectedTrip = trips.find(t => t.id === prev.tripId);
      return {
        ...prev,
        travelers,
        amount: selectedTrip ? selectedTrip.price * travelers : prev.amount
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form, editing?.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Booking" : "Add New Booking"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Guest Name</Label>
              <Input id="userName" value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trip Selection</Label>
              <Select value={form.tripId} onValueChange={handleTripChange}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTrips ? "Loading..." : "Select Trip"} />
                </SelectTrigger>
                <SelectContent>
                  {trips.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelDate">Travel Date</Label>
              <Input id="travelDate" type="date" value={form.travelDate} onChange={e => setForm({...form, travelDate: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelers">Travelers</Label>
            <Input id="travelers" type="number" min="1" value={form.travelers} onChange={e => handleTravelersChange(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (₹)</Label>
              <Input id="amount" type="number" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
              <Input id="paidAmount" type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: parseFloat(e.target.value)})} placeholder="Advance paid" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Booking Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({...form, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={form.paymentStatus} onValueChange={(v: any) => setForm({...form, paymentStatus: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Internal Admin Notes</Label>
            <Textarea id="adminNotes" value={form.adminNotes} onChange={e => setForm({...form, adminNotes: e.target.value})} placeholder="Payment details, special requests, etc." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.userName || !form.tripId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Update Booking" : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
