import { useEffect, useState, useCallback } from "react";
import { tripsService } from "@/services/trips.service";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge, getTripBadgeVariant } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import TripFormModal from "@/components/admin/TripFormModal";
import type { Trip, TripFormData } from "@/types";
import { Plus, Pencil, Trash2, Map, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await tripsService.getAll();
    setTrips(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === "all" ? trips : trips.filter((t) => t.status === statusFilter);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t: Trip) => { setEditing(t); setModalOpen(true); };

  const handleSave = async (data: TripFormData, editingId?: string) => {
    if (editingId) {
      await tripsService.update(editingId, data);
      toast.success("Trip updated");
    } else {
      await tripsService.create(data);
      toast.success("Trip created");
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    await tripsService.remove(id);
    toast.success("Trip deleted");
    load();
  };

  const toggleStatus = async (t: Trip) => {
    const newStatus = t.status === "published" ? "draft" : "published";
    await tripsService.update(t.id, { status: newStatus });
    toast.success(`Trip ${newStatus}`);
    load();
  };

  const columns = [
    { key: "title", header: "Trip", render: (t: Trip) => (
      <div className="flex items-center gap-3">
        {(t.heroImage || t.images[0]) && <img src={t.heroImage || t.images[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />}
        <div>
          <p className="font-medium text-card-foreground">{t.title}</p>
          <p className="text-xs text-muted-foreground">{t.location}</p>
        </div>
      </div>
    )},
    { key: "category", header: "Category" },
    { key: "price", header: "Price", render: (t: Trip) => `₹${t.price.toLocaleString()}` },
    { key: "duration", header: "Duration" },
    { key: "itinerary", header: "Days", render: (t: Trip) => (
      <span className="flex items-center gap-1 text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        {t.itinerary?.length || 0}
      </span>
    )},
    { key: "status", header: "Status", render: (t: Trip) => (
      <button onClick={() => toggleStatus(t)}>
        <StatusBadge variant={getTripBadgeVariant(t.status)}>{t.status}</StatusBadge>
      </button>
    )},
    { key: "actions", header: "", render: (t: Trip) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Trips</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Trip</Button>
      </div>

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchKey="title" searchPlaceholder="Search trips..."
        emptyMessage="No trips yet" emptyIcon={<Map className="h-10 w-10 text-muted-foreground" />}
        filters={[{ key: "status", label: "Status", options: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }] }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />

      <TripFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />
    </div>
  );
}
