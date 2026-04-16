import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Blog, BlogFormData } from "@/types";

const defaultForm: BlogFormData = {
  title: "",
  author: "Expedition Team",
  content: "",
  image: "",
  readTime: "5 MIN READ",
  hasVideo: false,
  status: "draft"
};

interface BlogFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Blog | null;
  onSave: (data: BlogFormData, editingId?: string) => Promise<void>;
}

export default function BlogFormModal({ open, onOpenChange, editing, onSave }: BlogFormModalProps) {
  const [form, setForm] = useState<BlogFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync form when editing changes
  const [lastEditingId, setLastEditingId] = useState<string | null>(null);
  if ((editing?.id ?? null) !== lastEditingId) {
    setLastEditingId(editing?.id ?? null);
    if (editing) {
      setForm({
        title: editing.title,
        author: editing.author,
        content: editing.content,
        image: editing.image,
        readTime: editing.readTime,
        hasVideo: editing.hasVideo,
        status: editing.status
      });
    } else {
      setForm(defaultForm);
    }
  }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Blog" : "Create Blog"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Featured Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Main blog image URL" />
            {form.image && <img src={form.image} alt="Preview" className="h-40 w-full object-cover rounded-lg border border-border" />}
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter blog title" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Read Time</Label>
              <Input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown or HTML)</Label>
            <Textarea 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} 
              rows={12} 
              placeholder="Write your blog content here..."
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div className="space-y-0.5">
              <Label>Video Content</Label>
              <p className="text-xs text-muted-foreground">Show play icon overlay on thumbnail</p>
            </div>
            <Switch 
              checked={form.hasVideo} 
              onCheckedChange={(v) => setForm({ ...form, hasVideo: v })} 
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: "draft" | "published") => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title || !form.content}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
