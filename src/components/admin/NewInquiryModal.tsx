import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { tripsService } from "@/services/trips.service";
import { inquiriesService } from "@/services/inquiries.service";
import type { Trip } from "@/types";
import { toast } from "sonner";
import { Loader2, X, Calendar } from "lucide-react";

interface NewInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function NewInquiryModal({ open, onOpenChange, onSuccess }: NewInquiryModalProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [tripSelection, setTripSelection] = useState<"none" | "select">("none");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    tripId: "",
    date: "",
    message: "",
    sendEmail: false
  });

  useEffect(() => {
    if (open) {
      const loadTrips = async () => {
        setLoadingTrips(true);
        try {
          const data = await tripsService.getAll();
          setTrips(data);
        } catch (error) {
          toast.error("Failed to load trips");
        } finally {
          setLoadingTrips(false);
        }
      };
      loadTrips();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const selectedTrip = trips.find(t => t.id === form.tripId);
      await inquiriesService.create({
        ...form,
        tripTitle: selectedTrip?.title || undefined,
        source: 'backoffice',
        status: 'new'
      });
      toast.success("Inquiry created successfully");
      onOpenChange(false);
      onSuccess?.();
      setForm({ name: "", phone: "", email: "", tripId: "", date: "", message: "", sendEmail: false });
    } catch (error) {
      toast.error("Failed to create inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden border-none shadow-2xl flex flex-col h-full bg-white">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10 shrink-0">
            <SheetTitle className="text-xl font-normal text-gray-800">New Inquiry</SheetTitle>
            <SheetDescription className="sr-only">Create a new inquiry</SheetDescription>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 px-4 text-xs font-medium text-gray-600 rounded">
              Discard
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-8">
              <div className="text-[11px] text-gray-600 leading-relaxed bg-white">
                <span className="font-bold text-gray-900">ⓘ Note:</span> Fields marked with <span className="text-red-500">*</span> are recommended but not required. You can create an inquiry with partial information and update it later.
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Trip Selection</h3>
                <RadioGroup value={tripSelection} onValueChange={(v: any) => setTripSelection(v)} className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="no-trip" className="w-3.5 h-3.5 border-gray-400" />
                    <Label htmlFor="no-trip" className="text-xs text-gray-700 cursor-pointer font-normal">No trip (general inquiry)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="select" id="select-trip" className="w-3.5 h-3.5 border-gray-400" />
                    <Label htmlFor="select-trip" className="text-xs text-gray-700 cursor-pointer font-normal">Select a trip</Label>
                  </div>
                </RadioGroup>

                {tripSelection === "select" && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Select value={form.tripId} onValueChange={(v) => setForm({ ...form, tripId: v })}>
                      <SelectTrigger className="w-full h-9 border-gray-300 text-xs shadow-sm">
                        <SelectValue placeholder={loadingTrips ? "Loading trips..." : "Pick a trip"} />
                      </SelectTrigger>
                      <SelectContent>
                        {trips.map(trip => (
                          <SelectItem key={trip.id} value={trip.id} className="text-xs font-medium">
                            <span className="font-bold text-red-700 mr-2">{trip.slug?.toUpperCase() || trip.id.substring(0, 5).toUpperCase()}</span>
                            {trip.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </section>

              <section className="space-y-5">
                <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Inquiry Details</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-700">Full name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name" 
                    className="h-9 border-gray-300 text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-700">Phone number <span className="text-red-500">*</span></Label>
                  <div className="flex h-9 rounded-md border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                    <div className="w-12 h-full bg-white border-r border-gray-300 flex items-center justify-center text-xs text-gray-500">
                      +91
                    </div>
                    <Input 
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone number" 
                      className="h-full border-none rounded-none text-sm flex-1 focus-visible:ring-0 shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-700">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Email" 
                    className="h-9 border-gray-300 text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-700">Preferred travel date</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 pointer-events-none" />
                    <Input 
                      type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="h-9 border-gray-300 text-sm shadow-sm text-gray-600 pr-10 appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-[11px] font-bold text-gray-700">Additional comments / message</Label>
                  <Textarea 
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Additional comments / message" 
                    className="min-h-[120px] border-gray-300 text-sm resize-none shadow-sm"
                  />
                </div>
              </section>

              <section className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-800 pb-2 border-b">Email Options</h3>
                <div className="flex items-center space-x-3 mt-4">
                  <Checkbox 
                    id="send-email" 
                    checked={form.sendEmail}
                    onCheckedChange={(v: boolean) => setForm({ ...form, sendEmail: v })}
                    className="border-gray-400 w-3.5 h-3.5 rounded-sm data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="send-email" className="text-[11px] text-gray-700 cursor-pointer font-normal">
                    Send acknowledgement email to customer
                  </Label>
                </div>
              </section>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50/80 shrink-0">
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#2b72df] hover:bg-[#205abb] text-white font-medium text-sm h-10 px-6 rounded shadow-sm transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Inquiry
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
