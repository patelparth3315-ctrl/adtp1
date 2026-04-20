import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Trip, TripFormData, ItineraryDay, FAQ } from "@/types";
import { Plus, Trash2, CalendarDays, ImagePlus, X, HelpCircle, Star, CheckCircle, XCircle, FileText, Globe, Upload } from "lucide-react";
import { settingsService } from "@/services/settings.service";
import { ImageUpload } from "./ImageUpload";
import api from "@/services/api";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyDay = (day: number): ItineraryDay => ({
  day, title: "", description: "", location: "", activities: [], stay: "", meals: "", photos: [],
});

const emptyFaq = (): FAQ => ({ question: "", answer: "" });

const defaultForm: TripFormData & { customSections?: any[], seo?: any } = {
  title: "", slug: "", description: "", heroImage: "", price: 0, location: "",
  duration: "", category: "", images: [], itinerary: [], highlights: [],
  inclusions: [], exclusions: [], faqs: [], availableDates: [], 
  variants: [], travelOptions: [], roomOptions: [], addons: [], status: "draft",
  maxGroupSize: 20, difficulty: "moderate", departureCity: "", ageLimit: "", bookingUrl: "",
  customSections: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    ogImage: "",
    canonicalUrl: "",
    faqSchema: []
  }
};

const CATEGORIES = ["Himalayan", "Beach", "Adventure", "Cultural", "Wildlife", "Luxury", "City", "Backpacking", "Road Trip", "Trekking", "Pilgrimage", "Bike Expedition", "Workation", "Spiritual"];

const TabBtn = ({ value, label }: { value: string, label: string }) => (
  <TabsTrigger 
    value={value} 
    className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all
               data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
  >
    {label}
  </TabsTrigger>
);

interface TripFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Trip | null;
  onSave: (data: TripFormData, editingId?: string) => Promise<void>;
}

export default function TripFormModal({ open, onOpenChange, editing, onSave }: TripFormModalProps) {
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  
  const [newHighlight, setNewHighlight] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [repeatFreq, setRepeatFreq] = useState("weekly");
  const [repeatCount, setRepeatCount] = useState(4);
  const [repeatStartDate, setRepeatStartDate] = useState("");

  // 1. Fetch Global Custom Field Definitions
  useEffect(() => {
    settingsService.get().then(res => {
      setCustomFields(res.tripCustomFields || []);
    });
  }, []);

  // 2. Sync Form Data when Editing state changes
  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        highlights: editing.highlights || [],
        inclusions: editing.inclusions || [],
        exclusions: editing.exclusions || [],
        faqs: editing.faqs || [],
        availableDates: editing.availableDates || [],
        variants: editing.variants || [],
        addons: editing.addons || [],
        customSections: (editing as any).customSections || [],
        seo: {
          ...defaultForm.seo,
          ...(editing as any).seo
        }
      });
    } else {
      setForm(defaultForm);
    }
  }, [editing, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form, editing?.id);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // List helpers
  const addToList = (field: "highlights" | "inclusions" | "exclusions", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const items = value.split(/[,\n]/).map(s => s.trim().replace(/^[•\-\*]\s*/, "")).filter(Boolean);
    setForm({ ...form, [field]: [...form[field], ...items] });
    setter("");
  };

  const removeFromList = (field: "highlights" | "inclusions" | "exclusions", index: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const addDay = () => setForm({ ...form, itinerary: [...form.itinerary, emptyDay(form.itinerary.length + 1)] });
  const updateDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...form.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, itinerary: updated });
  };
  const removeDay = (index: number) => {
    const updated = form.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }));
    setForm({ ...form, itinerary: updated });
  };
  const addDayPhoto = (index: number) => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    const updated = [...form.itinerary];
    updated[index] = { ...updated[index], photos: [...(updated[index].photos || []), url] };
    setForm({ ...form, itinerary: updated });
  };
  const removeDayPhoto = (dayIndex: number, photoIndex: number) => {
    const updated = [...form.itinerary];
    updated[dayIndex] = { ...updated[dayIndex], photos: (updated[dayIndex].photos || []).filter((_, i) => i !== photoIndex) };
    setForm({ ...form, itinerary: updated });
  };

  const addFaq = () => setForm({ ...form, faqs: [...form.faqs, emptyFaq()] });
  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...form.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, faqs: updated });
  };
  const removeFaq = (index: number) => setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== index) });

  const generateRepeatDates = () => {
    if (!repeatStartDate) return;
    const start = new Date(repeatStartDate);
    const newDates = [{ date: repeatStartDate, capacity: 99, bookedCount: 0 }];
    for (let i = 1; i < repeatCount; i++) {
      const next = new Date(start);
      if (repeatFreq === "weekly") next.setDate(start.getDate() + (i * 7));
      else if (repeatFreq === "monthly") next.setMonth(start.getMonth() + i);
      newDates.push({ date: next.toISOString().split('T')[0], capacity: 99, bookedCount: 0 });
    }
    setForm({ ...form, availableDates: [...new Set([...form.availableDates, ...newDates])].sort((a:any, b:any) => a.date.localeCompare(b.date)) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Trip" : "Create Trip"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1.5 p-1.5 bg-muted rounded-[20px] border">
            <TabBtn value="details" label="Details" />
            <TabBtn value="pricing" label="Pricing" />
            <TabBtn value="addons" label="Add-ons" />
            <TabBtn value="dates" label="Dates" />
            <TabBtn value="itinerary" label="Itinerary" />
            <TabBtn value="highlights" label="Items" />
            <TabBtn value="inclexcl" label="I/E" />
            <TabBtn value="faqs" label="FAQs" />
            <TabBtn value="custom" label="Custom" />
            <TabBtn value="seo" label="SEO" />
            <TabBtn value="advanced" label="Adv" />
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-6 pt-4">
              <ImageUpload 
                label="Main Experience Image"
                value={form.heroImage}
                onUpload={(url) => setForm({ ...form, heroImage: url })}
              />
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest opacity-50">Trip Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} className="rounded-xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Base Price (₹)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50">Location Variants</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, variants: [...form.variants, { location: "", duration: "", originalPrice: 0, discountedPrice: 0, image: "" }] })} className="rounded-xl h-8 text-[10px] font-black uppercase">
                  <Plus className="h-3 w-3 mr-1" />Add Variant
                </Button>
              </div>
              <div className="space-y-4">
                {form.variants?.map((v:any, i:number) => (
                  <div key={i} className="border bg-muted/20 rounded-2xl p-4 space-y-3 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setForm({ ...form, variants: form.variants.filter((_:any, idx:number) => idx !== i) })}><Trash2 className="h-3 w-3" /></Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={v.location} placeholder="Location (e.g. Delhi)" onChange={(e) => { const updated = [...form.variants]; updated[i].location = e.target.value; setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                      <Input value={v.duration} placeholder="Duration (e.g. 5D/4N)" onChange={(e) => { const updated = [...form.variants]; updated[i].duration = e.target.value; setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" value={v.originalPrice} placeholder="Original Price" onChange={(e) => { const updated = [...form.variants]; updated[i].originalPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                      <Input type="number" value={v.discountedPrice} placeholder="Discounted Price" onChange={(e) => { const updated = [...form.variants]; updated[i].discountedPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="addons">
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50">Trip Add-ons</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, addons: [...(form.addons || []), { name: "", rate: 0, description: "", minQuantity: 1, maxQuantity: 99 }] })} className="rounded-xl h-8 text-[10px] font-black uppercase">
                  <Plus className="h-3 w-3 mr-1" />Add Add-on
                </Button>
              </div>
              <div className="space-y-4">
                {form.addons?.map((addon:any, i:number) => (
                  <div key={i} className="border bg-muted/20 rounded-2xl p-4 space-y-3 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setForm({ ...form, addons: form.addons.filter((_:any, idx:number) => idx !== i) })}><Trash2 className="h-3 w-3" /></Button>
                    <Input value={addon.name} placeholder="Add-on Name (e.g. Rafting)" onChange={(e) => { const updated = [...form.addons]; updated[i].name = e.target.value; setForm({ ...form, addons: updated }); }} className="h-9 text-xs font-bold" />
                    <div className="grid grid-cols-3 gap-3">
                      <Input type="number" value={addon.rate} placeholder="Rate" onChange={(e) => { const updated = [...form.addons]; updated[i].rate = Number(e.target.value); setForm({ ...form, addons: updated }); }} className="h-9 text-xs" />
                      <Input type="number" value={addon.minQuantity} placeholder="Min" onChange={(e) => { const updated = [...form.addons]; updated[i].minQuantity = Number(e.target.value); setForm({ ...form, addons: updated }); }} className="h-9 text-xs" />
                      <Input type="number" value={addon.maxQuantity} placeholder="Max" onChange={(e) => { const updated = [...form.addons]; updated[i].maxQuantity = Number(e.target.value); setForm({ ...form, addons: updated }); }} className="h-9 text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dates">
            <div className="space-y-6 pt-4">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Bulk Generate Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black opacity-50">Start Date</Label>
                    <Input type="date" value={repeatStartDate} onChange={(e) => setRepeatStartDate(e.target.value)} className="h-9 text-xs rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black opacity-50">Frequency</Label>
                    <Select value={repeatFreq} onValueChange={setRepeatFreq}>
                      <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[9px] uppercase font-black opacity-50">Repeat Count</Label>
                    <Input type="number" value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))} className="h-9 text-xs rounded-xl" />
                  </div>
                  <Button variant="secondary" className="h-9 text-[10px] font-black uppercase rounded-xl" onClick={generateRepeatDates}>Generate</Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50">Available Departure Dates</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {form.availableDates?.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-xl border text-[10px] font-bold">
                      {typeof d === 'string' ? new Date(d).toLocaleDateString() : new Date(d.date || d).toLocaleDateString()}
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => {
                        const updated = form.availableDates.filter((_:any, idx:number) => idx !== i);
                        setForm({ ...form, availableDates: updated });
                      }}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  {form.availableDates?.length === 0 && <p className="col-span-full text-center py-8 text-[10px] font-medium opacity-50 italic">No dates selected</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary">
            <div className="space-y-4 pt-4">
              {form.itinerary?.map((day:any, idx:number) => (
                <div key={idx} className="border bg-muted/10 p-4 rounded-2xl space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary">Day {day.day}</Label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeDay(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Input value={day.title} placeholder="Title (e.g. Arrival in Manali)" onChange={(e) => updateDay(idx, "title", e.target.value)} className="h-9 text-xs font-bold" />
                  <Input value={day.location} placeholder="Location" onChange={(e) => updateDay(idx, "location", e.target.value)} className="h-9 text-xs" />
                  <Textarea value={day.description} placeholder="What will happen today?" onChange={(e) => updateDay(idx, "description", e.target.value)} className="text-xs min-h-[80px]" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={day.stay} placeholder="Stay (e.g. Luxury Camp)" onChange={(e) => updateDay(idx, "stay", e.target.value)} className="h-8 text-[10px]" />
                    <Input value={day.meals} placeholder="Meals (e.g. B, D)" onChange={(e) => updateDay(idx, "meals", e.target.value)} className="h-8 text-[10px]" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] uppercase opacity-50 font-black tracking-widest">Photos</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="file" 
                          id={`day-photo-${idx}`} 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("image", file);
                            const res = await api.post("/upload/single", formData, { headers: { "Content-Type": "multipart/form-data" } });
                            if (res.data.success) {
                              updateDay(idx, "photos", [...(day.photos || []), res.data.url]);
                            }
                          }}
                        />
                        <Label htmlFor={`day-photo-${idx}`} className="h-6 px-3 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer">
                          <Upload className="w-2.5 h-2.5" /> Upload
                        </Label>
                        <Button variant="outline" size="sm" className="h-6 text-[8px] uppercase font-black rounded-lg" onClick={() => addDayPhoto(idx)}><Plus className="h-3 w-3 mr-1" />Link</Button>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {day.photos?.map((p: string, pIdx: number) => (
                        <div key={pIdx} className="relative group shrink-0">
                          <img src={p} className="h-16 w-16 rounded-lg object-cover border" />
                          <button className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5" onClick={() => removeDayPhoto(idx, pIdx)}><X className="h-2 w-2" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={addDay} className="w-full h-12 border-dashed rounded-2xl" variant="outline"><Plus className="h-4 w-4 mr-2" />Add Day to Itinerary</Button>
            </div>
          </TabsContent>

          <TabsContent value="highlights">
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50">Trip Highlights</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. 5 High Altitude Passes" 
                    value={newHighlight} 
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToList("highlights", newHighlight, setNewHighlight)}
                    className="rounded-xl"
                  />
                  <Button onClick={() => addToList("highlights", newHighlight, setNewHighlight)} className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {form.highlights?.map((h: string, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-xl border text-xs">
                      <span className="font-medium">{h}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromList("highlights", i)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inclexcl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-green-600">Inclusions</Label>
                <div className="flex gap-2">
                  <Input value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToList("inclusions", newInclusion, setNewInclusion)} className="rounded-xl h-9 text-xs" />
                  <Button size="icon" onClick={() => addToList("inclusions", newInclusion, setNewInclusion)} className="rounded-xl h-9 w-9"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {form.inclusions?.map((item: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-green-50/30 rounded-xl border border-green-100 text-[10px]">
                      <span className="font-bold text-green-800">{item}</span>
                      <X className="h-3 w-3 text-green-400 cursor-pointer" onClick={() => removeFromList("inclusions", i)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-red-600">Exclusions</Label>
                <div className="flex gap-2">
                  <Input value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToList("exclusions", newExclusion, setNewExclusion)} className="rounded-xl h-9 text-xs" />
                  <Button size="icon" variant="destructive" onClick={() => addToList("exclusions", newExclusion, setNewExclusion)} className="rounded-xl h-9 w-9"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {form.exclusions?.map((item: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-red-50/30 rounded-xl border border-red-100 text-[10px]">
                      <span className="font-bold text-red-800">{item}</span>
                      <X className="h-3 w-3 text-red-400 cursor-pointer" onClick={() => removeFromList("exclusions", i)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faqs">
            <div className="space-y-4 pt-4">
              {form.faqs?.map((faq:any, i:number) => (
                <div key={i} className="border bg-muted/10 p-4 rounded-2xl space-y-2 relative group">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeFaq(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  <Input value={faq.question} placeholder="Question" onChange={(e) => updateFaq(i, "question", e.target.value)} className="h-9 text-xs font-bold" />
                  <Textarea value={faq.answer} placeholder="Answer" onChange={(e) => updateFaq(i, "answer", e.target.value)} className="text-xs min-h-[60px]" />
                </div>
              ))}
              <Button onClick={addFaq} className="w-full h-12 border-dashed rounded-2xl" variant="outline"><Plus className="h-4 w-4 mr-2" />Add New FAQ</Button>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="space-y-6 pt-4">
               {customFields.length === 0 ? (
                 <div className="text-center py-20 opacity-30 border-2 border-dashed rounded-[32px]">
                   <p className="text-xs font-black uppercase tracking-widest">No custom sections defined</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {customFields.map((field: any, idx: number) => {
                     const existing = (form.customSections || []).find((s:any) => s.label === field.label);
                     return (
                       <div key={idx} className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                           <FileText className="w-3 h-3 text-primary" /> {field.label}
                         </Label>
                         <Textarea 
                           value={existing?.content || ""} 
                           onChange={(e) => {
                             const sections = [...(form.customSections || [])];
                             const sIdx = sections.findIndex((s:any) => s.label === field.label);
                             if (sIdx > -1) sections[sIdx].content = e.target.value;
                             else sections.push({ label: field.label, content: e.target.value });
                             setForm({ ...form, customSections: sections });
                           }}
                           placeholder={`Enter info for ${field.label}...`}
                           className="rounded-2xl text-xs font-medium min-h-[120px]"
                         />
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <div className="space-y-8 pt-6">
               <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Globe className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Search Engine Master</h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Control how this trip appears on Google & Social Media</p>
                  </div>
               </div>

               <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Meta Title</Label>
                    <Input 
                      value={form.seo?.metaTitle || ""} 
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                      className="rounded-2xl font-bold border-2 focus:border-primary h-12" 
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-black text-primary uppercase">{form.seo?.metaTitle?.length || 0}/60 Characters</div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Ideal: 50-60</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Meta Description</Label>
                    <Textarea 
                      value={form.seo?.metaDescription || ""} 
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                      className="rounded-2xl font-medium min-h-[120px] border-2 focus:border-primary text-xs" 
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-black text-primary uppercase">{form.seo?.metaDescription?.length || 0}/160 Characters</div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Ideal: 150-160</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Focus Keyword</Label>
                       <Input value={form.seo?.focusKeyword || ""} onChange={(e) => setForm({ ...form, seo: { ...form.seo, focusKeyword: e.target.value } })} className="rounded-xl border-none bg-muted/50 h-10" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">URL Slug</Label>
                       <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="rounded-xl border-none bg-muted/50 h-10" />
                    </div>
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-widest">JSON-LD FAQ Schema</h5>
                      <p className="text-[9px] text-muted-foreground">Boost CTR with rich search results</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        const schema = [...(form.seo?.faqSchema || []), { question: "", answer: "" }];
                        setForm({ ...form, seo: { ...form.seo, faqSchema: schema } });
                    }} className="rounded-xl h-8 text-[9px] font-black uppercase">Add FAQ Row</Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(form.seo?.faqSchema || []).map((faq:any, idx:number) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-2xl relative group border">
                        <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={() => {
                            const schema = form.seo.faqSchema.filter((_:any, i:number) => i !== idx);
                            setForm({ ...form, seo: { ...form.seo, faqSchema: schema } });
                        }}><X className="w-3 h-3" /></Button>
                        <Input value={faq.question} onChange={(e) => {
                          const schema = [...form.seo.faqSchema]; schema[idx].question = e.target.value; setForm({ ...form, seo: { ...form.seo, faqSchema: schema } });
                        }} placeholder="Question" className="bg-transparent border-none font-bold mb-1 p-0 h-auto focus-visible:ring-0 text-xs" />
                        <Textarea value={faq.answer} onChange={(e) => {
                          const schema = [...form.seo.faqSchema]; schema[idx].answer = e.target.value; setForm({ ...form, seo: { ...form.seo, faqSchema: schema } });
                        }} placeholder="Answer" className="bg-transparent border-none text-[10px] font-medium p-0 h-auto min-h-[40px] focus-visible:ring-0" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </TabsContent>
          <TabsContent value="advanced">
            <div className="space-y-8 pt-4">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Departure City</Label>
                    <Input value={form.departureCity} onChange={(e) => setForm({ ...form, departureCity: e.target.value })} placeholder="e.g. Ahmedabad" className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Age Limit</Label>
                    <Input value={form.ageLimit} onChange={(e) => setForm({ ...form, ageLimit: e.target.value })} placeholder="e.g. 15-35 Years" className="rounded-xl h-10" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Max Group Size</Label>
                    <Input type="number" value={form.maxGroupSize} onChange={(e) => setForm({ ...form, maxGroupSize: Number(e.target.value) })} className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={(v:any) => setForm({ ...form, difficulty: v })}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">External Booking URL</Label>
                  <Input value={form.bookingUrl} onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })} placeholder="https://external-booking.com/..." className="rounded-xl h-10" />
               </div>

               <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Gallery Images</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="file" 
                        id="gallery-upload-v2" 
                        multiple 
                        className="hidden" 
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          const formData = new FormData();
                          for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
                          try {
                            const res = await api.post("/upload/multiple", formData, { headers: { "Content-Type": "multipart/form-data" } });
                            if (res.data.success) {
                              setForm({ ...form, gallery: [...(form.gallery || []), ...res.data.urls] });
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      />
                      <Label htmlFor="gallery-upload-v2" className="h-8 px-4 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer border hover:bg-primary/20 transition-all">
                        <Upload className="w-3 h-3" /> Upload Multiple
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-3 bg-muted/20 rounded-2xl border">
                    {(form.gallery || []).map((url: string, i: number) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} className="w-full h-full object-cover rounded-xl border-2 border-transparent group-hover:border-primary transition-all" alt={`Gallery ${i}`} />
                        <button 
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                          onClick={() => setForm({ ...form, gallery: (form.gallery || []).filter((_:any, idx:number) => idx !== i) })}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {(form.gallery || []).length === 0 && (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-[10px] opacity-30 uppercase font-black tracking-[0.2em]">No Gallery Images Uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Or Paste Image URLs (One per line)</Label>
                    <Textarea 
                      value={form.gallery?.join("\n")} 
                      onChange={(e) => setForm({ ...form, gallery: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                      placeholder="https://image1.jpg&#10;https://image2.jpg"
                      className="rounded-2xl text-[10px] min-h-[100px] font-mono bg-muted/5 border-none focus:bg-muted/10"
                    />
                  </div>
               </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">Discard</Button>
          <Button onClick={async () => {
            const { id, _id, createdAt, updatedAt, __v, ...cleanData } = form;
            setSaving(true);
            try {
              await onSave(cleanData, editing?.id);
              onOpenChange(false);
            } finally {
              setSaving(false);
            }
          }} disabled={saving || !form.title} className="rounded-xl px-8 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20">
            {saving ? "Processing..." : editing ? "Update Trip" : "Launch Trip"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
