import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { tripsService } from "@/services/trips.service";
import { Loader2, Plus, Trash2, FileUp, ExternalLink } from "lucide-react";
import type { Booking, BookingFormData, Trip, TrainTicket } from "@/types";
import api from "@/services/api"; // Added api for upload

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
  trainTickets: [],
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
        trainTickets: editing.trainTickets || [],
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
  
  const addTicket = () => {
    setForm(prev => ({
      ...prev,
      trainTickets: [...(prev.trainTickets || []), { pnr: "", trainNo: "", trainName: "", from: "", to: "", departureDate: "", arrivalDate: "", coach: "", seat: "", status: "Confirmed" }]
    }));
  };

  const updateTicket = (index: number, field: keyof TrainTicket, value: string) => {
    setForm(prev => {
      const tickets = [...(prev.trainTickets || [])];
      tickets[index] = { ...tickets[index], [field]: value };
      return { ...prev, trainTickets: tickets };
    });
  };

  const removeTicket = (index: number) => {
    setForm(prev => ({
      ...prev,
      trainTickets: prev.trainTickets?.filter((_, i) => i !== index)
    }));
  };

  const handleTicketUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("ticket", file);

    try {
      const res = await api.post("/upload/ticket", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        updateTicket(index, "ticketUrl" as any, res.data.url);
      }
    } catch (error) {
      console.error("Upload failed", error);
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

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Train Tickets</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTicket}><Plus className="h-3 w-3 mr-1" />Add Ticket</Button>
            </div>

            {form.trainTickets && form.trainTickets.length > 0 ? (
              <div className="space-y-4">
                {form.trainTickets.map((ticket, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-muted/30 relative space-y-3">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeTicket(idx)}><Trash2 className="h-4 w-4" /></Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">PNR Number</Label>
                        <Input className="h-8" value={ticket.pnr} onChange={e => updateTicket(idx, "pnr", e.target.value)} placeholder="PNR" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Train No/Name</Label>
                        <Input className="h-8" value={ticket.trainNo} onChange={e => updateTicket(idx, "trainNo", e.target.value)} placeholder="12903 / Golden Temple" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">From</Label>
                        <Input className="h-8" value={ticket.from} onChange={e => updateTicket(idx, "from", e.target.value)} placeholder="ADI" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">To</Label>
                        <Input className="h-8" value={ticket.to} onChange={e => updateTicket(idx, "to", e.target.value)} placeholder="BCT" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Departure Date/Time</Label>
                        <Input className="h-8" type="datetime-local" value={ticket.departureDate ? new Date(ticket.departureDate).toISOString().slice(0, 16) : ""} onChange={e => updateTicket(idx, "departureDate", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={ticket.status} onValueChange={v => updateTicket(idx, "status", v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="RAC">RAC</SelectItem>
                            <SelectItem value="WL">WL</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Coach</Label>
                        <Input className="h-8" value={ticket.coach} onChange={e => updateTicket(idx, "coach", e.target.value)} placeholder="B1" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Seat/Berth</Label>
                        <Input className="h-8" value={ticket.seat} onChange={e => updateTicket(idx, "seat", e.target.value)} placeholder="24" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-xs">Ticket Document (PDF/Image)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="h-9 text-xs" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleTicketUpload(idx, file);
                          }}
                        />
                        {ticket.ticketUrl && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 shrink-0"
                            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8888"}${ticket.ticketUrl}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {ticket.ticketUrl && (
                        <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                          <FileUp className="h-3 w-3" /> Ticket uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-2">No train tickets added yet.</p>
            )}
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
