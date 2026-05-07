import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, Phone, MapPin, CreditCard, 
  FileText, Calendar, Trash2, X,
  CheckCircle2, AlertCircle, Clock,
  ArrowRight, Pencil, Plus, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Booking } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onEdit?: (booking: Booking) => void; // New prop
}

export default function BookingDetailsModal({ open, onOpenChange, booking, onEdit }: BookingDetailsModalProps) {
  const [showAddPassenger, setShowAddPassenger] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [newPassenger, setNewPassenger] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    age: "",
    phone: "",
    email: ""
  });

  // Initialize passengers with booking owner or from DB
  useEffect(() => {
    if (booking && open) {
      if (booking.passengers && Array.isArray(booking.passengers) && booking.passengers.length > 0) {
        setPassengers(booking.passengers);
      } else {
        setPassengers([{
          id: 'main',
          name: booking.fullName,
          phone: booking.mobile,
          email: "Not specified",
          gender: booking.gender,
          age: booking.age,
          type: `${booking.trainClass} Train`,
          status: 'Form complete'
        }]);
      }
    }
  }, [booking, open]);

  if (!booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'partial': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'pending': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const handleEditPassenger = (p: any) => {
    const names = p.name.split(' ');
    setEditingPassenger(p);
    setNewPassenger({
      firstName: names[0] || "",
      lastName: names.slice(1).join(' ') || "",
      gender: p.gender || "Male",
      age: p.age?.toString() || "",
      phone: p.phone || "",
      email: p.email !== "Not specified" ? p.email : ""
    });
    setShowAddPassenger(true);
  };

  const handleSavePassenger = async (keepOpen = false) => {
    if (!newPassenger.firstName) {
      toast.error("Please enter at least a first name");
      return;
    }

    let updatedPassengers = [];

    if (editingPassenger) {
      // Update existing
      updatedPassengers = passengers.map(p => p.id === editingPassenger.id ? {
        ...p,
        name: `${newPassenger.firstName} ${newPassenger.lastName}`,
        phone: newPassenger.phone || "N/A",
        email: newPassenger.email || "N/A",
        gender: newPassenger.gender,
        age: newPassenger.age || "N/A",
      } : p);
      toast.success("Passenger updated");
    } else {
      // Add new
      const passenger = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${newPassenger.firstName} ${newPassenger.lastName}`,
        phone: newPassenger.phone || "N/A",
        email: newPassenger.email || "N/A",
        gender: newPassenger.gender,
        age: newPassenger.age || "N/A",
        type: `${booking?.trainClass} Train`,
        status: 'Pending'
      };
      updatedPassengers = [...passengers, passenger];
      toast.success(`${newPassenger.firstName} added to booking`);
    }
    
    setPassengers(updatedPassengers);
    
    try {
      if (booking) {
        await bookingsService.update(booking.id, { passengers: updatedPassengers });
      }
    } catch (e) {
      toast.error("Failed to save to server, but updated locally");
    }

    setNewPassenger({ firstName: "", lastName: "", gender: "Male", age: "", phone: "", email: "" });
    setEditingPassenger(null);
    
    if (!keepOpen) {
      setShowAddPassenger(false);
    }
  };

  const handleDownloadInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${booking.bookingId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
            .invoice-details { text-align: right; }
            .invoice-details p { margin: 2px 0; font-size: 12px; color: #64748b; font-weight: 600; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 1px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
            .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #f1f5f9; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
            .total-section { margin-top: 40px; float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .total-row.grand-total { border-bottom: none; margin-top: 10px; padding-top: 15px; border-top: 2px solid #1e293b; }
            .total-row.grand-total .label { font-size: 14px; font-weight: 900; }
            .total-row.grand-total .value { font-size: 18px; font-weight: 900; color: #1e293b; }
            .footer { margin-top: 100px; font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.5; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">YOUTHCAMPING.</div>
            <div class="invoice-details">
              <p>INVOICE NO: ${booking.bookingId}</p>
              <p>DATE: ${new Date().toLocaleDateString('en-IN')}</p>
              <p>STATUS: ${booking.paymentStatus.toUpperCase()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Guest Details</div>
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${booking.fullName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Mobile Number</div>
                <div class="info-value">+91 ${booking.mobile}</div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Travel Details</div>
              <div class="info-item">
                <div class="info-label">Train Class / Transport</div>
                <div class="info-value">${booking.trainClass} (${booking.ticketStatus})</div>
              </div>
              <div class="info-item">
                <div class="info-label">Room Type</div>
                <div class="info-value">${booking.roomType}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Booking Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th style="text-align: right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Trip Package - ${booking.trainClass}</td>
                  <td>1 Adult</td>
                  <td style="text-align: right">₹${booking.totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span class="label">Total Amount</span>
              <span class="value">₹${booking.totalAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="label">Advance Paid</span>
              <span class="value" style="color: #059669">-₹${booking.advancePaid.toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span class="label">Balance Due</span>
              <span class="value">₹${booking.remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style="clear: both"></div>

          <div class="footer">
            <p>Thank you for booking with YouthCamping!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For support, please contact us at support@youthcamping.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    toast.success("Generating invoice...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Booking Details - {booking.bookingId}</DialogTitle>
          <DialogDescription>Detailed view of the booking including passenger and payment information.</DialogDescription>
        </DialogHeader>
        {/* Header */}
        <div className="bg-[#1e293b] px-8 py-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight leading-none uppercase">Booking Details</h2>
                <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{booking.bookingId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => booking && onEdit?.(booking)}
                className="text-white bg-white/10 border-white/20 hover:bg-white/20 hover:text-white"
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Booking
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-white/60 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusColor(booking.paymentStatus))}>
              Payment: {booking.paymentStatus}
            </div>
            <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/80 border border-white/5">
              {booking.trainClass} — {booking.ticketStatus}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto font-sans">
          {/* Guest Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Guest Information</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div>
                <Label text="Full Name" />
                <p className="text-sm font-black text-gray-900 uppercase">{booking.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Age" />
                  <p className="text-sm font-bold text-gray-700">{booking.age} Years</p>
                </div>
                <div>
                  <Label text="Gender" />
                  <p className="text-sm font-bold text-gray-700">{booking.gender}</p>
                </div>
              </div>
              <div>
                <Label text="Mobile Number" />
                <p className="text-sm font-black text-blue-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> +91 {booking.mobile}
                </p>
              </div>
            </div>
          </section>

          {/* Travel Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Travel & Stay</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Train Class" />
                  <p className="text-sm font-bold text-gray-700">{booking.trainClass}</p>
                </div>
                <div>
                  <Label text="Ticket Status" />
                  <p className="text-sm font-bold text-emerald-600">{booking.ticketStatus}</p>
                </div>
              </div>
              <div>
                <Label text="Room Type" />
                <p className="text-sm font-bold text-gray-700">{booking.roomType}</p>
              </div>
              <div>
                <Label text="Departure" />
                <p className="text-sm font-medium text-gray-500">{formatDate(booking.createdAt)}</p>
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Payment Breakdown</h3>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <Label text="Base Price" />
                <p className="text-xl font-bold text-gray-700">₹{(booking.basePrice || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <Label text="GST (5%)" />
                <p className="text-xl font-bold text-gray-400">₹{(booking.gstAmount || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <Label text="Total Amount" />
                <p className="text-2xl font-black text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl space-y-1 border border-emerald-100">
                <Label text="Advance Paid" />
                <p className="text-2xl font-black text-emerald-600">₹{booking.advancePaid.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">via {booking.paymentMode}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl space-y-1 border border-red-100 md:col-span-2 lg:col-span-1">
                <Label text="Remaining Balance" />
                <p className="text-2xl font-black text-red-600">₹{booking.remainingAmount.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Notes */}
          {booking.notes && (
            <section className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                <FileText className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Special Notes</h3>
              </div>
              <div className="bg-gray-100/50 p-6 rounded-2xl border border-dashed border-gray-300">
                <p className="text-sm text-gray-600 italic leading-relaxed">"{booking.notes}"</p>
              </div>
            </section>
          )}

          {/* Passengers Section (From Reference Image) */}
          <section className="space-y-4 md:col-span-2 mt-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Passengers</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditingPassenger(null);
                  setNewPassenger({ firstName: "", lastName: "", gender: "Male", age: "", phone: "", email: "" });
                  setShowAddPassenger(true);
                }}
                className="h-8 text-[10px] font-black uppercase tracking-tight bg-white border shadow-sm flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add passengers
              </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-[11px] min-w-[1000px]">
                <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left w-24">Action</th>
                    <th className="px-6 py-4 text-left">Form Status</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Trip Info / Category</th>
                    <th className="px-6 py-4 text-left">Title first name and last name</th>
                    <th className="px-6 py-4 text-left">Gender</th>
                    <th className="px-6 py-4 text-left">Age</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Country code and phone number</th>
                    <th className="px-6 py-4 text-left">E-mail</th>
                    <th className="px-6 py-4 text-left">Newsletter signup</th>
                    <th className="px-6 py-4 text-left">Status/Ac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {passengers.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center border rounded overflow-hidden w-fit shadow-sm bg-white">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-[10px] font-black border-r rounded-none hover:bg-gray-50 flex items-center gap-1"
                            onClick={() => handleEditPassenger(p)}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 rounded-none hover:bg-red-50 hover:text-red-500"
                            onClick={async () => { 
                              const updated = passengers.filter(x => x.id !== p.id);
                              setPassengers(updated);
                              if (booking) {
                                try { await bookingsService.update(booking.id, { passengers: updated }); } 
                                catch (e) { toast.error("Failed to save deletion"); }
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight", p.status === 'Form complete' ? "bg-[#22c55e]" : "bg-amber-500")}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-400 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight">{p.type}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700 uppercase whitespace-nowrap">{p.name}</td>
                      <td className="px-6 py-4 text-gray-500">{p.gender}</td>
                      <td className="px-6 py-4 text-gray-500">{p.age}</td>
                      <td className="px-6 py-4 font-bold text-gray-600 whitespace-nowrap">+91-{p.phone}</td>
                      <td className="px-6 py-4 text-gray-400 italic">{p.email}</td>
                      <td className="px-6 py-4 text-center text-gray-400">-</td>
                      <td className="px-6 py-4 text-center text-gray-400">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-8 border-t bg-white flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Booked on {formatDate(booking.createdAt)}</span>
          </div>
          <Button 
            onClick={handleDownloadInvoice}
            variant="outline" 
            className="px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest border-2 hover:bg-gray-50"
          >
            Download Invoice
          </Button>
        </div>
      </DialogContent>

      {/* Add/Edit Passenger Modal */}
      <Dialog open={showAddPassenger} onOpenChange={(o) => { setShowAddPassenger(o); if(!o) setEditingPassenger(null); }}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="p-8 space-y-6 bg-white">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
              {editingPassenger ? "Edit Passenger" : "Add New Passenger"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label text="First Name" />
                <Input value={newPassenger.firstName} onChange={e => setNewPassenger({...newPassenger, firstName: e.target.value})} placeholder="First Name" />
              </div>
              <div className="space-y-1.5">
                <Label text="Last Name" />
                <Input value={newPassenger.lastName} onChange={e => setNewPassenger({...newPassenger, lastName: e.target.value})} placeholder="Last Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label text="Gender" />
                  <Select value={newPassenger.gender} onValueChange={v => setNewPassenger({...newPassenger, gender: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label text="Age" />
                  <Input type="number" value={newPassenger.age} onChange={e => setNewPassenger({...newPassenger, age: e.target.value})} placeholder="Age" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label text="Mobile Number" />
                <Input value={newPassenger.phone} onChange={e => setNewPassenger({...newPassenger, phone: e.target.value})} placeholder="10 Digit Number" />
              </div>
              <div className="space-y-1.5">
                <Label text="Email" />
                <Input value={newPassenger.email} onChange={e => setNewPassenger({...newPassenger, email: e.target.value})} placeholder="Email Address" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-5 flex justify-end gap-3 border-t">
            <Button variant="ghost" onClick={() => { setShowAddPassenger(false); setEditingPassenger(null); }} className="text-xs font-bold uppercase tracking-widest">Cancel</Button>
            {!editingPassenger && (
              <Button onClick={() => handleSavePassenger(true)} className="bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-6 h-10 rounded-lg">Save & Add Another</Button>
            )}
            <Button onClick={() => handleSavePassenger(false)} className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-6 h-10 rounded-lg">
              {editingPassenger ? "Update Details" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function Label({ text }: { text: string }) {
  return <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{text}</p>;
}
