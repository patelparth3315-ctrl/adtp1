import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import type { Trip, BookingFormData } from "@/types";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Calendar, Users, IndianRupee } from "lucide-react";

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function NewBookingModal({ open, onOpenChange, onSuccess }: NewBookingModalProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState<any>({
    fullName: "",
    mobile: "",
    tripId: "",
    age: 20,
    gender: "Male",
    trainClass: "Sleeper",
    ticketStatus: "Not Booked",
    roomType: "Double Sharing",
    totalAmount: 0,
    advancePaid: 0,
    status: "confirmed",
    paymentStatus: "Pending",
    paymentMode: "UPI",
    notes: "",
    email: "",
  });

  useEffect(() => {
    if (open) {
      const loadTrips = async () => {
        setLoadingTrips(true);
        try {
          const data = await bookingsService.getTrips();
          setTrips((data || []) as any);
        } catch (error) {
          toast.error("Failed to load trips");
        } finally {
          setLoadingTrips(false);
        }
      };
      loadTrips();
    }
  }, [open]);

  const handleTripChange = (tripId: string) => {
    const selectedTrip = trips.find((t: any) => t.id === tripId || t.tripCode === tripId);
    setForm(prev => ({
      ...prev,
      tripId,
      totalAmount: (selectedTrip as any)?.price || prev.totalAmount
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields (including aliases for backend consistency)
    const payload = {
      ...form,
      name: form.fullName, // Alias for backend
      phone: form.mobile,   // Alias for backend
      amount: form.totalAmount // Alias for backend
    };

    console.log("📡 Sending booking:", payload);

    if (!payload.name || !payload.phone || !payload.tripId || !payload.email) {
      toast.error("Required fields: Name, Phone, Trip, and Email Address");
      return;
    }

    setSubmitting(true);
    try {
      const response = await bookingsService.create(payload);
      console.log("✅ Booking Success:", response);
      toast.success("Booking created successfully");
      onOpenChange(false);
      onSuccess?.();
      
      setForm({
        fullName: "",
        mobile: "",
        tripId: "",
        age: 20,
        gender: "Male",
        trainClass: "Sleeper",
        ticketStatus: "Not Booked",
        roomType: "Double Sharing",
        totalAmount: 0,
        advancePaid: 0,
        status: "confirmed",
        paymentStatus: "Pending",
        paymentMode: "UPI",
        notes: "",
        email: "",
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create booking";
      console.error("❌ FULL ERROR:", error.response?.data || error);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl flex flex-col h-full bg-white">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10 shrink-0">
            <SheetTitle className="text-xl font-normal text-gray-800">New Booking</SheetTitle>
            <SheetDescription className="sr-only">Create a new booking</SheetDescription>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 px-4 text-xs font-medium text-gray-600 rounded">
              Discard
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-8">
              <div className="text-[11px] text-gray-600 leading-relaxed bg-white">
                <span className="font-bold text-gray-900">ⓘ Note:</span> Complete the booking details below. Fields marked with <span className="text-red-500">*</span> are required.
              </div>

              {/* Customer Section */}
              <section className="space-y-5">
                 <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Customer Details</h3>
               
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                   <Input 
                     value={form.fullName} 
                     onChange={e => setForm({ ...form, fullName: e.target.value })}
                     placeholder="Full name of primary guest" 
                     className="h-9 border-gray-300 text-sm shadow-sm"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Mobile Number <span className="text-red-500">*</span></Label>
                   <div className="flex h-9 rounded-md border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                     <div className="w-12 h-full bg-white border-r border-gray-300 flex items-center justify-center text-xs text-gray-500">
                       +91
                     </div>
                     <Input 
                       value={form.mobile} 
                       onChange={e => setForm({ ...form, mobile: e.target.value })}
                       placeholder="10-digit number" 
                       className="h-full border-none rounded-none text-sm flex-1 focus-visible:ring-0 shadow-none"
                     />
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                   <Input 
                     type="email"
                     value={form.email} 
                     onChange={e => setForm({ ...form, email: e.target.value })}
                     placeholder="customer@example.com" 
                     className="h-9 border-gray-300 text-sm shadow-sm"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Gender</Label>
                   <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                     <SelectTrigger className="h-9 border-gray-300 text-sm shadow-sm">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Male">Male</SelectItem>
                       <SelectItem value="Female">Female</SelectItem>
                       <SelectItem value="Other">Other</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Age</Label>
                   <Input 
                     type="number"
                     value={form.age} 
                     onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                     className="h-9 border-gray-300 text-sm shadow-sm"
                   />
                 </div>
               </div>
            </section>

              {/* Trip Section */}
              <section className="space-y-5">
                 <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Trip Info</h3>

                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Select Trip <span className="text-red-500">*</span></Label>
                   <Select value={form.tripId} onValueChange={handleTripChange}>
                     <SelectTrigger className="h-9 border-gray-300 text-sm shadow-sm">
                       <SelectValue placeholder={loadingTrips ? "Loading trips..." : "Select the expedition"} />
                     </SelectTrigger>
                     <SelectContent>
                       {trips.map(trip => (
                         <SelectItem key={trip.id} value={trip.id} className="text-sm font-medium">
                           {trip.title} (₹{trip.price})
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Room Type</Label>
                   <Input 
                     value={form.roomType} 
                     onChange={e => setForm({ ...form, roomType: e.target.value })}
                     placeholder="Double Sharing, etc." 
                     className="h-9 border-gray-300 text-sm shadow-sm"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Train Class</Label>
                   <Select value={form.trainClass} onValueChange={v => setForm({ ...form, trainClass: v })}>
                     <SelectTrigger className="h-9 border-gray-300 text-sm shadow-sm">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Sleeper">Sleeper</SelectItem>
                       <SelectItem value="3AC">3AC</SelectItem>
                       <SelectItem value="2AC">2AC</SelectItem>
                       <SelectItem value="Flight">Flight</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
            </section>

              {/* Financial Section */}
              <section className="space-y-5">
                 <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Financials</h3>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Total Amount (₹) <span className="text-red-500">*</span></Label>
                   <div className="relative">
                     <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                     <Input 
                       type="number"
                       value={form.totalAmount} 
                       onChange={e => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })}
                       className="h-9 border-gray-300 pl-9 text-sm shadow-sm"
                     />
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[11px] font-bold text-gray-700">Advance Paid (₹)</Label>
                   <div className="relative">
                     <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                     <Input 
                       type="number"
                       value={form.advancePaid} 
                       onChange={e => setForm({ ...form, advancePaid: parseFloat(e.target.value) || 0 })}
                       placeholder="0.00"
                       className="h-9 border-gray-300 pl-9 text-sm shadow-sm"
                     />
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-700">Payment Status</Label>
                    <Select value={form.paymentStatus} onValueChange={(v: any) => setForm({ ...form, paymentStatus: v })}>
                      <SelectTrigger className="h-9 border-gray-300 text-sm shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial Payment</SelectItem>
                        <SelectItem value="Paid">Fully Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-700">Payment Mode</Label>
                    <Select value={form.paymentMode} onValueChange={(v: any) => setForm({ ...form, paymentMode: v })}>
                      <SelectTrigger className="h-9 border-gray-300 text-sm shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </section>

            <section className="space-y-2 pt-2">
              <Label className="text-[11px] font-bold text-gray-700">Notes / Remarks</Label>
              <Textarea 
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special requests or payment details..." 
                className="min-h-[100px] border-gray-300 text-sm resize-none shadow-sm"
              />
            </section>
          </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50/80 shrink-0 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500">Balance</span>
              <span className="text-sm font-bold text-gray-900">₹{(form.totalAmount - (form.advancePaid || 0)).toLocaleString()}</span>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#2b72df] hover:bg-[#205abb] text-white font-medium text-sm h-10 px-6 rounded shadow-sm transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Booking
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
