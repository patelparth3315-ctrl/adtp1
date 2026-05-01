import { useEffect, useState, useCallback } from "react";
import { bookingsService } from "@/services/bookings.service";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge, getBookingBadgeVariant } from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BookingFormModal from "@/components/admin/BookingFormModal";
import BookingDetailsModal from "@/components/admin/BookingDetailsModal";
import type { Booking, BookingFormData } from "@/types";
import { CalendarCheck, Plus, Pencil, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getAll();
      setBookings(data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (b: Booking) => { setEditing(b); setModalOpen(true); };
  const openView = (b: Booking) => { setSelected(b); setViewOpen(true); };

  const handleSave = async (data: BookingFormData, editingId?: string) => {
    if (editingId) {
      await bookingsService.update(editingId, data);
      toast.success("Booking updated");
    } else {
      await bookingsService.create(data);
      toast.success("Booking created");
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await bookingsService.remove(id);
    toast.success("Booking removed");
    load();
  };

  const updateStatus = async (id: string, status: Booking["status"]) => {
    await bookingsService.updateStatus(id, status);
    toast.success("Status updated");
    load();
  };

  const handleExport = () => {
    if (filtered.length === 0) return toast.error("No data to export");
    
    const headers = ["ID", "Guest", "Email", "Phone", "Trip", "Pax", "Amount", "Paid", "Status", "Date"];
    const rows = filtered.map(b => [
      b.bookingId || b.id,
      b.userName,
      b.email,
      b.phone,
      b.tripTitle,
      b.travelers,
      b.amount,
      b.paidAmount,
      b.status,
      new Date(b.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export started");
  };

  const columns = [
    { key: "userName", header: "Guest", render: (b: Booking) => (
      <div>
        <p className="font-medium text-card-foreground flex items-center gap-2">
          {b.userName} 
          {b.bookingId && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">{b.bookingId}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{b.email}</p>
      </div>
    )},
    { key: "tripTitle", header: "Trip" },
    { key: "phone", header: "Phone" },
    { key: "travelers", header: "Pax", render: (b: Booking) => b.travelers || 1 },
    { key: "amount", header: "Full Amount", render: (b: Booking) => (
      <div className="flex flex-col">
        <span className="font-bold">₹{b.amount?.toLocaleString() || 0}</span>
        <span className="text-[10px] text-muted-foreground">Paid: ₹{b.paidAmount?.toLocaleString() || 0}</span>
      </div>
    )},
    { key: "status", header: "Status", render: (b: Booking) => (
      <Select value={b.status} onValueChange={(v: Booking["status"]) => updateStatus(b.id, v)}>
        <SelectTrigger className="w-[130px] h-8">
          <StatusBadge variant={getBookingBadgeVariant(b.status)}>{b.status}</StatusBadge>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="accepted">Accepted (Sync)</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    )},
    { key: "actions", header: "", render: (b: Booking) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openView(b)} className="text-primary"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Bookings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Booking</Button>
        </div>
      </div>

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchKey="userName" searchPlaceholder="Search bookings..."
        emptyMessage="No bookings yet" emptyIcon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />}
        filters={[{ key: "status", label: "Status", options: [{ label: "Pending", value: "pending" }, { label: "Accepted", value: "accepted" }, { label: "Confirmed", value: "confirmed" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }, { label: "Rejected", value: "rejected" }] }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />

      <BookingFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />
      <BookingDetailsModal open={viewOpen} onOpenChange={setViewOpen} booking={selected} onPaymentAdded={load} />
    </div>
  );
}
