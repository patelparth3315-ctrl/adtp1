import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Trip, TripFormData, ItineraryDay, FAQ } from "@/types";
import { Plus, Trash2, CalendarDays, ImagePlus, X, HelpCircle, Star, CheckCircle, XCircle } from "lucide-react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyDay = (day: number): ItineraryDay => ({
  day, title: "", description: "", location: "", activities: [], stay: "", meals: "", photos: [],
});

const emptyFaq = (): FAQ => ({ question: "", answer: "" });

const defaultForm: TripFormData = {
  title: "", slug: "", description: "", heroImage: "", price: 0, location: "",
  duration: "", category: "", images: [], itinerary: [], highlights: [],
  inclusions: [], exclusions: [], faqs: [], availableDates: [], 
  variants: [], travelOptions: [], roomOptions: [], addons: [], status: "draft",
};

const CATEGORIES = ["Beach", "Adventure", "Cultural", "Wildlife", "Luxury", "City", "Backpacking", "Road Trip", "Trekking", "Pilgrimage", "Bike Expedition"];

interface TripFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Trip | null;
  onSave: (data: TripFormData, editingId?: string) => Promise<void>;
}

export default function TripFormModal({ open, onOpenChange, editing, onSave }: TripFormModalProps) {
  const [form, setForm] = useState<TripFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [repeatFreq, setRepeatFreq] = useState("weekly");
  const [repeatCount, setRepeatCount] = useState(4);
  const [repeatStartDate, setRepeatStartDate] = useState("");

  // Sync form when editing changes
  const [lastEditingId, setLastEditingId] = useState<string | null>(null);
  if ((editing?.id ?? null) !== lastEditingId) {
    setLastEditingId(editing?.id ?? null);
    if (editing) {
      setForm({
        title: editing.title, slug: editing.slug, description: editing.description,
        heroImage: editing.heroImage || "", price: editing.price, location: editing.location,
        duration: editing.duration, category: editing.category, images: editing.images,
        itinerary: editing.itinerary || [], highlights: editing.highlights || [],
        inclusions: editing.inclusions || [], exclusions: editing.exclusions || [],
        faqs: editing.faqs || [], availableDates: editing.availableDates || [], 
        variants: editing.variants || [], travelOptions: editing.travelOptions || [], roomOptions: editing.roomOptions || [],
        addons: editing.addons || [],
        status: editing.status,
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

  // List helpers
  const addToList = (field: "highlights" | "inclusions" | "exclusions", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    // Split by newlines or commas for bulk add
    const items = value.split(/[,\n]/).map(s => s.trim().replace(/^[•\-\*]\s*/, "")).filter(Boolean);
    setForm({ ...form, [field]: [...form[field], ...items] });
    setter("");
  };

  const removeFromList = (field: "highlights" | "inclusions" | "exclusions", index: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  // Itinerary helpers
  const addDay = () => {
    setForm({ ...form, itinerary: [...form.itinerary, emptyDay(form.itinerary.length + 1)] });
  };
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

  // FAQ helpers
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
      
      newDates.push({ 
        date: next.toISOString().split('T')[0], 
        capacity: 99, 
        bookedCount: 0 
      });
    }
    
    setForm({ 
      ...form, 
      availableDates: [...new Set([...form.availableDates, ...newDates])]
        .sort((a:any, b:any) => a.date.localeCompare(b.date))
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Trip" : "Create Trip"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-8">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="dates">Dates ({form.availableDates.length})</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="highlights">Items</TabsTrigger>
            <TabsTrigger value="inclexcl">I/E</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          {/* PRICING & VARIANTS TAB */}
          <TabsContent value="pricing">
            <div className="space-y-6 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Location Variants</Label>
                  <Button variant="outline" size="sm" onClick={() => setForm({
                    ...form,
                    variants: [...form.variants, { location: "", duration: "", originalPrice: 0, discountedPrice: 0, image: "" }]
                  })}>
                    <Plus className="h-4 w-4 mr-1" />Add Variant
                  </Button>
                </div>
                {form.variants.map((v, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={v.location} placeholder="Location (e.g. Ahmedabad)" onChange={(e) => {
                        const updated = [...form.variants];
                        updated[i].location = e.target.value;
                        setForm({ ...form, variants: updated });
                      }} />
                      <Input value={v.duration} placeholder="Duration (e.g. 11 Days)" onChange={(e) => {
                        const updated = [...form.variants];
                        updated[i].duration = e.target.value;
                        setForm({ ...form, variants: updated });
                      }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" value={v.originalPrice} placeholder="Original Price" onChange={(e) => {
                        const updated = [...form.variants];
                        updated[i].originalPrice = Number(e.target.value);
                        setForm({ ...form, variants: updated });
                      }} />
                      <Input type="number" value={v.discountedPrice} placeholder="Discounted Price" onChange={(e) => {
                        const updated = [...form.variants];
                        updated[i].discountedPrice = Number(e.target.value);
                        setForm({ ...form, variants: updated });
                      }} />
                    </div>
                    <Input value={v.image} placeholder="Image URL" onChange={(e) => {
                      const updated = [...form.variants];
                      updated[i].image = e.target.value;
                      setForm({ ...form, variants: updated });
                    }} />
                    <Button variant="ghost" size="sm" className="text-destructive w-full" onClick={() => setForm({
                      ...form,
                      variants: form.variants.filter((_, idx) => idx !== i)
                    })}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />Remove Variant
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Travel Options</Label>
                    <Button variant="outline" size="xs" className="h-7 px-2" onClick={() => setForm({
                      ...form,
                      travelOptions: [...form.travelOptions, { label: "", priceDelta: 0 }]
                    })}>
                      <Plus className="h-3 w-3 mr-1" />Add
                    </Button>
                  </div>
                  {form.travelOptions.map((opt, i) => (
                    <div key={i} className="border border-border rounded p-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input className="h-8 text-xs" value={opt.label} placeholder="e.g. AC Train" onChange={(e) => {
                          const updated = [...form.travelOptions];
                          updated[i].label = e.target.value;
                          setForm({ ...form, travelOptions: updated });
                        }} />
                        <Input className="h-8 text-xs w-20" type="number" value={opt.priceDelta} placeholder="+Price" onChange={(e) => {
                          const updated = [...form.travelOptions];
                          updated[i].priceDelta = Number(e.target.value);
                          setForm({ ...form, travelOptions: updated });
                        }} />
                        <button onClick={() => setForm({ ...form, travelOptions: form.travelOptions.filter((_, idx) => idx !== i) })}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <Textarea className="h-12 text-[10px]" value={opt.description} placeholder="Travel description (Sub-package detail)" onChange={(e) => {
                        const updated = [...form.travelOptions];
                        updated[i].description = e.target.value;
                        setForm({ ...form, travelOptions: updated });
                      }} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Room Options</Label>
                    <Button variant="outline" size="xs" className="h-7 px-2" onClick={() => setForm({
                      ...form,
                      roomOptions: [...form.roomOptions, { label: "", priceDelta: 0 }]
                    })}>
                      <Plus className="h-3 w-3 mr-1" />Add
                    </Button>
                  </div>
                  {form.roomOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input className="h-8 text-xs" value={opt.label} placeholder="e.g. Double" onChange={(e) => {
                        const updated = [...form.roomOptions];
                        updated[i].label = e.target.value;
                        setForm({ ...form, roomOptions: updated });
                      }} />
                      <Input className="h-8 text-xs w-20" type="number" value={opt.priceDelta} placeholder="+Price" onChange={(e) => {
                        const updated = [...form.roomOptions];
                        updated[i].priceDelta = Number(e.target.value);
                        setForm({ ...form, roomOptions: updated });
                      }} />
                      <button onClick={() => setForm({ ...form, roomOptions: form.roomOptions.filter((_, idx) => idx !== i) })}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ADD-ONS TAB */}
          <TabsContent value="addons">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Extra Services (Add-ons)</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({
                  ...form,
                  addons: [...form.addons, { name: "", rate: 0, description: "", minQuantity: 1, maxQuantity: 99 }]
                })}>
                  <Plus className="h-4 w-4 mr-1" />Add Add-on
                </Button>
              </div>
              {form.addons.map((addon, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={addon.name} placeholder="Addon Name" onChange={(e) => {
                      const updated = [...form.addons];
                      updated[i].name = e.target.value;
                      setForm({ ...form, addons: updated });
                    }} />
                    <Input type="number" value={addon.rate} placeholder="Rate (₹)" onChange={(e) => {
                      const updated = [...form.addons];
                      updated[i].rate = Number(e.target.value);
                      setForm({ ...form, addons: updated });
                    }} />
                  </div>
                  <Textarea value={addon.description} placeholder="Description (shown in booking)" onChange={(e) => {
                    const updated = [...form.addons];
                    updated[i].description = e.target.value;
                    setForm({ ...form, addons: updated });
                  }} rows={2} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px]">Min</Label>
                      <Input type="number" className="h-8" value={addon.minQuantity} onChange={(e) => {
                        const updated = [...form.addons];
                        updated[i].minQuantity = Number(e.target.value);
                        setForm({ ...form, addons: updated });
                      }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px]">Max</Label>
                      <Input type="number" className="h-8" value={addon.maxQuantity} onChange={(e) => {
                        const updated = [...form.addons];
                        updated[i].maxQuantity = Number(e.target.value);
                        setForm({ ...form, addons: updated });
                      }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive w-full h-8" onClick={() => setForm({
                    ...form,
                    addons: form.addons.filter((_, idx) => idx !== i)
                  })}>
                    <Trash2 className="h-3 w-3 mr-1" />Remove
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="details">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Hero Image URL</Label>
                <Input value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} placeholder="Main banner image URL" />
                {form.heroImage && <img src={form.heroImage} alt="Hero" className="h-32 w-full object-cover rounded-lg border border-border" />}
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 7 Days / 6 Nights" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
          </TabsContent>

          {/* DATES TAB */}
          <TabsContent value="dates">
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label>Single Date Add</Label>
                <div className="flex gap-2">
                  <Input 
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDateObj = { date: e.target.value, capacity: 99, bookedCount: 0 };
                        setForm({ ...form, availableDates: [...form.availableDates, newDateObj].sort((a,b) => (a.date as any).localeCompare(b.date)) });
                        e.target.value = "";
                      }
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                <Label className="text-xs font-bold uppercase text-primary">Date Recurrence (Repeat)</Label>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                     <Label className="text-[10px]">Start Date</Label>
                     <Input type="date" value={repeatStartDate} onChange={(e) => setRepeatStartDate(e.target.value)} className="h-8" />
                   </div>
                   <div className="space-y-1.5">
                     <Label className="text-[10px]">Frequency</Label>
                     <Select value={repeatFreq} onValueChange={setRepeatFreq}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Every Week</SelectItem>
                          <SelectItem value="monthly">Every Month</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                </div>
                <div className="flex items-end gap-3">
                   <div className="flex-1 space-y-1.5">
                     <Label className="text-[10px]">Occurrence Count</Label>
                     <Input type="number" value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))} className="h-8" />
                   </div>
                   <Button variant="secondary" size="sm" className="h-8" onClick={generateRepeatDates}>
                     Generate
                   </Button>
                </div>
              </div>

              {form.availableDates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No departure dates added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.availableDates.map((dObj: any, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted rounded-lg group">
                      <div className="flex-1">
                        <p className="text-xs font-bold">
                          {new Date(dObj.date || dObj).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-muted-foreground italic">Seats:</Label>
                        <Input 
                          type="number" 
                          className="h-8 w-16 text-xs" 
                          value={dObj.capacity || 99} 
                          onChange={(e) => {
                            const updated = [...form.availableDates];
                            (updated[i] as any).capacity = Number(e.target.value);
                            setForm({ ...form, availableDates: updated });
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => setForm({ ...form, availableDates: form.availableDates.filter((_, idx) => idx !== i) })}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ITINERARY TAB */}
          <TabsContent value="itinerary">
            <div className="space-y-4 pt-2">
              {form.itinerary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No itinerary days added yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={addDay}>
                    <Plus className="h-4 w-4 mr-1" />Add Day 1
                  </Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {form.itinerary.map((day, idx) => (
                    <AccordionItem key={idx} value={`day-${idx}`} className="border border-border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{day.day}</span>
                          <span className="font-medium text-sm text-card-foreground">{day.title || `Day ${day.day}`}</span>
                          {day.location && <span className="text-xs text-muted-foreground ml-2">📍 {day.location}</span>}
                          {(day.photos || []).length > 0 && <span className="text-xs text-muted-foreground">📷 {day.photos.length}</span>}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Day Title</Label>
                            <Input value={day.title} onChange={(e) => updateDay(idx, "title", e.target.value)} placeholder="e.g. Arrive in Manali" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Location</Label>
                              <Input value={day.location || ""} onChange={(e) => updateDay(idx, "location", e.target.value)} placeholder="e.g. Manali" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Stay</Label>
                              <Input value={day.stay || ""} onChange={(e) => updateDay(idx, "stay", e.target.value)} placeholder="e.g. Hotel / Camp" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Meals</Label>
                            <Input value={day.meals || ""} onChange={(e) => updateDay(idx, "meals", e.target.value)} placeholder="e.g. Breakfast & Dinner" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Activities (comma-separated)</Label>
                            <Input value={(day.activities || []).join(", ")} onChange={(e) => updateDay(idx, "activities", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="e.g. Trekking, Sightseeing, River Rafting" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Description</Label>
                            <Textarea value={day.description || ""} onChange={(e) => updateDay(idx, "description", e.target.value)} placeholder="What happens on this day..." rows={2} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Photos</Label>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addDayPhoto(idx)}>
                                <ImagePlus className="h-3.5 w-3.5 mr-1" />Add Photo
                              </Button>
                            </div>
                            {(day.photos || []).length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {(day.photos || []).map((photo, pi) => (
                                  <div key={pi} className="relative group">
                                    <img src={photo} alt="" className="h-16 w-20 rounded-lg object-cover border border-border" />
                                    <button onClick={() => removeDayPhoto(idx, pi)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => removeDay(idx)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />Remove Day
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              {form.itinerary.length > 0 && (
                <Button variant="outline" size="sm" onClick={addDay} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />Add Day {form.itinerary.length + 1}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* HIGHLIGHTS TAB */}
          <TabsContent value="highlights">
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Input value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="e.g. Visit Pangong Lake"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("highlights", newHighlight, setNewHighlight))} />
                <Button variant="outline" size="icon" onClick={() => addToList("highlights", newHighlight, setNewHighlight)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.highlights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Star className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No highlights added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                      <Star className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm flex-1">{h}</span>
                      <button onClick={() => removeFromList("highlights", i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* INCLUSIONS / EXCLUSIONS TAB */}
          <TabsContent value="inclexcl">
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Inclusions
                </Label>
                <div className="flex gap-2">
                  <Input value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} placeholder="e.g. Meals included"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("inclusions", newInclusion, setNewInclusion))} />
                  <Button variant="outline" size="icon" onClick={() => addToList("inclusions", newInclusion, setNewInclusion)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.inclusions.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-sm flex-1">{item}</span>
                    <button onClick={() => removeFromList("inclusions", i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <XCircle className="h-4 w-4 text-red-500" /> Exclusions
                </Label>
                <div className="flex gap-2">
                  <Input value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} placeholder="e.g. Flight tickets"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("exclusions", newExclusion, setNewExclusion))} />
                  <Button variant="outline" size="icon" onClick={() => addToList("exclusions", newExclusion, setNewExclusion)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.exclusions.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg">
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-sm flex-1">{item}</span>
                    <button onClick={() => removeFromList("exclusions", i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* FAQS TAB */}
          <TabsContent value="faqs">
            <div className="space-y-4 pt-2">
              {form.faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No FAQs added yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={addFaq}>
                    <Plus className="h-4 w-4 mr-1" />Add FAQ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-primary mt-2.5 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" />
                          <Textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer" rows={2} />
                        </div>
                        <button onClick={() => removeFaq(i)} className="text-muted-foreground hover:text-destructive mt-2.5">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.faqs.length > 0 && (
                <Button variant="outline" size="sm" onClick={addFaq} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />Add FAQ
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
