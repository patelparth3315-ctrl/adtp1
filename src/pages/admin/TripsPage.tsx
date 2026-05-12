import { useEffect, useState, useCallback } from "react";
import { tripsService } from "@/services/trips.service";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge, getTripBadgeVariant } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import TripFormModal from "@/components/admin/TripFormModal";
import TripSortModal from "@/components/admin/TripSortModal";
import type { Trip, TripFormData } from "@/types";
import { Plus, Pencil, Trash2, Map, CalendarDays, Building2, Shuffle, GripVertical } from "lucide-react";
import { toast } from "sonner";
import TripVendorsPanel from "@/components/admin/TripVendorsPanel";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorTrip, setVendorTrip] = useState<Trip | null>(null);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tripsService.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (trips || []).filter((t) => {
    if (!t) return false;
    return statusFilter === "all" || t.status === statusFilter;
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = async (t: Trip) => { 
    if (!t?.id) return;
    try {
      const fullTrip = await tripsService.getById(t.id);
      setEditing(fullTrip || t);
      setModalOpen(true); 
    } catch (error) {
      toast.error("Failed to load full trip details");
      setEditing(t);
      setModalOpen(true);
    }
  };

  const handleSave = async (data: TripFormData, editingId?: string) => {
    const payload = {
      ...data,
      title: data.title || "Untitled Trip",
      location: data.location || "TBD",
      price: data.price || 0,
      duration: data.duration || "TBD",
      description: data.description || "No description provided.",
      status: data.status || "draft",
    };

    try {
      if (editingId) {
        await tripsService.update(editingId, payload);
        toast.success("Trip updated successfully");
      } else {
        await tripsService.create(payload);
        toast.success("New trip created");
      }
      load();
    } catch (error: any) {
      console.error("❌ SAVE ERROR:", error);
      const msg = error.response?.data?.message || "Failed to save trip";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm("Delete this trip?")) return;
    await tripsService.remove(id);
    toast.success("Trip deleted");
    load();
  };

  const toggleStatus = async (t: Trip) => {
    if (!t?.id) return;
    const newStatus = t.status === "published" ? "draft" : "published";
    await tripsService.update(t.id, { status: newStatus });
    toast.success(`Trip ${newStatus}`);
    load();
  };

  const handleShuffle = async () => {
    try {
      await tripsService.shuffle();
      toast.success("Trips shuffled successfully!");
      load();
    } catch (error) {
      toast.error("Failed to shuffle trips");
    }
  };

  const columns = [
    { key: "title", header: "Trip", render: (t: Trip) => {
      if (!t) return null;
      return (
        <div className="flex items-center gap-3">
          {(t.heroImage || t.images?.[0]) && (
            <img 
              src={t.heroImage || t.images?.[0]} 
              alt="" 
              className="h-10 w-14 rounded-lg object-cover" 
            />
          )}
          <div>
            <p className="font-medium text-card-foreground">{t.title || "Untitled"}</p>
            <p className="text-xs text-muted-foreground">{t.location || "No location"}</p>
          </div>
        </div>
      );
    }},
    { key: "tripCode", header: "Trip Code", render: (t: Trip) => {
      if (!t) return null;
      return (
        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {t.id || "N/A"}
        </span>
      );
    }},
    { key: "category", header: "Category", render: (t: Trip) => (
      <span className="capitalize">{t?.category?.replace(/-/g, ' ') || "N/A"}</span>
    )},
    { key: "price", header: "Price", render: (t: Trip) => {
      const price = Number(t?.price);
      return `₹${isNaN(price) ? '0' : price.toLocaleString()}`;
    }},
    { key: "order", header: "Order", render: (t: Trip) => (
      <span className="font-bold text-primary">{t.order || 0}</span>
    )},
    { key: "duration", header: "Duration", render: (t: Trip) => t?.duration || "N/A" },
    { key: "itinerary", header: "Days", render: (t: Trip) => (
      <span className="flex items-center gap-1 text-muted-foreground font-bold">
        <CalendarDays className="h-3.5 w-3.5" />
        {Array.isArray(t?.itinerary) ? t.itinerary.length : "0"}
      </span>
    )},
    { key: "status", header: "Status", render: (t: Trip) => {
      if (!t?.status) return null;
      return (
        <button onClick={() => toggleStatus(t)}>
          <StatusBadge variant={getTripBadgeVariant(t.status)}>{t.status}</StatusBadge>
        </button>
      );
    }},
    { key: "actions", header: "", render: (t: Trip) => {
      if (!t) return null;
      return (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setVendorTrip(t)} title="Manage Vendors">
            <Building2 className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      );
    }},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Trips</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSortModalOpen(true)} className="rounded-xl font-bold border-primary/20 hover:border-primary/40 text-primary">
            <GripVertical className="h-4 w-4 mr-2" />
            Reorder
          </Button>
          <Button variant="outline" onClick={handleShuffle} className="rounded-xl font-bold border-primary/20 hover:border-primary/40 text-primary">
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <Button onClick={openCreate} className="rounded-xl font-bold shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Trip
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchKey="title" searchPlaceholder="Search trips..."
        emptyMessage="No trips yet" emptyIcon={<Map className="h-10 w-10 text-muted-foreground" />}
        filters={[{ key: "status", label: "Status", options: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }] }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />

      <TripFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

      {vendorTrip && (
        <TripVendorsPanel
          tripId={vendorTrip.id}
          tripTitle={vendorTrip.title}
          tripPrice={vendorTrip.price}
          open={!!vendorTrip}
          onOpenChange={(open) => { if (!open) setVendorTrip(null); }}
        />
      )}
      <TripSortModal 
        open={sortModalOpen} 
        onOpenChange={setSortModalOpen} 
        trips={trips} 
        onSaved={load} 
      />
    </div>
  );
}
