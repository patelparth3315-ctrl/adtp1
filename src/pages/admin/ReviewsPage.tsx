import { useEffect, useState, useCallback } from "react";
import { reviewsService } from "@/services/reviews.service";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    userName: "",
    tripName: "",
    comment: "",
    rating: 5,
    userImage: "",
    isFeatured: true
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsService.getAll();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      userName: "",
      tripName: "",
      comment: "",
      rating: 5,
      userImage: "",
      isFeatured: true
    });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setFormData({
      userName: r.userName,
      tripName: r.tripName || "",
      comment: r.comment,
      rating: r.rating,
      userImage: r.userImage || "",
      isFeatured: r.isFeatured
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await reviewsService.update(editing._id, formData);
        toast.success("Review updated");
      } else {
        await reviewsService.create(formData);
        toast.success("Review added");
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await reviewsService.remove(id);
      toast.success("Review deleted");
      load();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const toggleFeatured = async (r: any) => {
    try {
      await reviewsService.update(r._id, { isFeatured: !r.isFeatured });
      toast.success(r.isFeatured ? "Removed from featured" : "Set as featured");
      load();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    { key: "userName", header: "Customer", render: (r: any) => (
      <div className="flex items-center gap-3">
        {r.userImage ? (
           <img src={r.userImage} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
        ) : (
           <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase">
             {r.userName?.split(' ').map((n: string) => n[0]).join('')}
           </div>
        )}
        <div>
          <p className="font-bold text-card-foreground">{r.userName}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{r.tripName}</p>
        </div>
      </div>
    )},
    { key: "comment", header: "Feedback", render: (r: any) => (
      <p className="text-sm text-muted-foreground max-w-md line-clamp-2 italic">"{r.comment}"</p>
    )},
    { key: "rating", header: "Rating", render: (r: any) => (
      <div className="flex items-center gap-1 text-orange-400">
        <Star className="h-3 w-3 fill-current" />
        <span className="font-bold text-xs">{r.rating}/5</span>
      </div>
    )},
    { key: "isFeatured", header: "Featured", render: (r: any) => (
      <Switch checked={r.isFeatured} onCheckedChange={() => toggleFeatured(r)} />
    )},
    { key: "actions", header: "", render: (r: any) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(r._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight">Customer Reviews</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Manage testimonials shown on the website.</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest"><Plus className="h-4 w-4 mr-2" />Add Review</Button>
      </div>

      <DataTable
        columns={columns} data={reviews} loading={loading}
        searchKey="userName" searchPlaceholder="Search by customer name..."
        emptyMessage="No reviews found" emptyIcon={<MessageSquare className="h-10 w-10 text-muted-foreground" />}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl rounded-[40px] p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">{editing ? 'Edit Review' : 'Add New Review'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-8 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Name</Label>
                 <Input className="rounded-xl h-12" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} placeholder="e.g. Bhumit Rabadiya" />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trip / Location</Label>
                 <Input className="rounded-xl h-12" value={formData.tripName} onChange={(e) => setFormData({...formData, tripName: e.target.value})} placeholder="e.g. Thailand Trip" />
               </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Image URL</Label>
              <Input className="rounded-xl h-12" value={formData.userImage} onChange={(e) => setFormData({...formData, userImage: e.target.value})} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating (1-5)</Label>
              <Input type="number" min="1" max="5" className="rounded-xl h-12 w-24" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comment / Testimonial</Label>
              <Textarea className="rounded-2xl h-32" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} placeholder="What did the traveler say?" />
            </div>

            <div className="flex items-center space-x-2">
               <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(v) => setFormData({...formData, isFeatured: v})} />
               <Label htmlFor="isFeatured" className="text-sm font-bold">Feature this review on Home page</Label>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase text-[10px]">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl h-12 px-8 font-black uppercase text-[10px]">Save Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
