import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { GlassCard } from "@/components/admin/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    MessageCircle as WhatsAppIcon,
    Copy,
    ExternalLink,
    Send,
    Loader2,
    Calendar,
    Users,
    MapPin,
    CheckCircle2,
    XCircle,
    BadgePercent,
    Clock,
    Hotel as HotelIcon,
    Sparkles,
    Train,
    Car,
    Plane,
    Ship,
    MapPin as PickupIcon,
    Bus
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { quotationsService } from "@/services/quotations.service";
import { Quotation } from "@/types";
import api from "@/services/api";

const formatUrl = (url: string | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const apiBase = api.defaults.baseURL || "http://localhost:8888/api";
    const serverBase = apiBase.replace('/api', '');
    return `${serverBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function QuotationFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = id !== "new";
    
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    const [formData, setFormData] = useState<Partial<Quotation>>({
        id: uuidv4(),
        status: "Draft",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        tripTitle: "",
        destination: "",
        duration: "",
        travelDates: { from: "", to: "" },
        pax: 2,
        totalPrice: 0,
        discount: 0,
        finalPrice: 0,
        overview: "",
        itinerary: [],
        inclusions: [],
        exclusions: [],
        coverImage: "",
        heroImages: [],
        experiencePhotos: [],
        staySummary: [],
        roomsInfo: "",
        mealsInfo: "",
        travelling: [],
        expiryHours: 48, // Default 48h
        expert: {
            name: "Bhautik Bhut",
            whatsapp: "919000000000",
            designation: "YOUTHCAMPING Destination Expert"
        }
    });

    useEffect(() => {
        if (isEdit && id) {
            quotationsService.getById(id).then(data => {
                setFormData(data);
                setLoading(false);
            }).catch(() => {
                toast.error("Failed to load quotation");
                navigate("/admin/quotations");
            });
        }
    }, [id, isEdit, navigate]);

    // Auto-calculate final price
    useEffect(() => {
        const total = Number(formData.totalPrice) || 0;
        const discount = Number(formData.discount) || 0;
        setFormData(prev => ({ ...prev, finalPrice: total - discount }));
    }, [formData.totalPrice, formData.discount]);

    const handleExtend = async () => {
        try {
            const res = await quotationsService.extend(formData.id!, 48);
            setFormData(prev => ({ ...prev, expiresAt: res.expiresAt }));
            toast.success("Validity extended by 48 hours");
        } catch (error) {
            toast.error("Failed to extend validity");
        }
    };

    const handleSave = async (status: 'Draft' | 'Published' = 'Draft') => {
        setIsSaving(true);
        try {
            if (!formData.customerName || !formData.tripTitle) {
                toast.error("Please fill in basic details");
                return;
            }

            const payload = {
                ...formData,
                status,
                slug: formData.slug || formData.tripTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substring(2, 7)
            };

            const saved = await quotationsService.save(payload);
            setFormData(saved);
            toast.success(status === 'Published' ? "Quotation Published!" : "Draft Saved");
            if (!isEdit) navigate(`/admin/quotations/${saved.id}`);
        } catch (error: any) {
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const copyLink = () => {
        const url = `${import.meta.env.VITE_FRONTEND_URL}/quote/${formData.slug || formData.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const sendWhatsApp = () => {
        const quoteLink = `${import.meta.env.VITE_FRONTEND_URL}/quote/${formData.slug || formData.id}`;
        const message = `Hi ${formData.customerName},

Greetings from YOUTHCAMPING Experiences.

As per our recent conversation, we've prepared a customized quotation for you.

View your quotation here:
${quoteLink}

${formData.expert?.name}
${formData.expert?.designation}`;

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${formData.customerPhone}?text=${encoded}`, '_blank');
    };

    const addItineraryDay = () => {
        const newDay = {
            id: uuidv4(),
            day: (formData.itinerary?.length || 0) + 1,
            title: "",
            description: "",
            photos: []
        };
        setFormData({ ...formData, itinerary: [...(formData.itinerary || []), newDay as any] });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Proposal...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-32 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/quotations")} className="rounded-xl">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
                            {isEdit ? "Edit Quotation" : "Create New Quotation"}
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Premium Proposal Builder</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 px-6">
                        <Save size={16} className="mr-2" /> Save Draft
                    </Button>
                    <Button onClick={() => handleSave('Published')} disabled={isSaving} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-primary/20">
                        <CheckCircle2 size={16} className="mr-2" /> Publish Quote
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer Info */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                <Users size={18} />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest">Customer Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Customer Name</Label>
                                <Input value={formData.customerName || ""} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="Full Name" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Mobile Number</Label>
                                <Input value={formData.customerPhone || ""} onChange={e => setFormData({...formData, customerPhone: e.target.value})} placeholder="e.g. 919876543210" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Email Address (Optional)</Label>
                                <Input value={formData.customerEmail || ""} onChange={e => setFormData({...formData, customerEmail: e.target.value})} placeholder="customer@example.com" className="rounded-xl h-12 font-medium" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Trip Info */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                                <MapPin size={18} />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest">Trip Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Trip Title</Label>
                                <Input value={formData.tripTitle || ""} onChange={e => setFormData({...formData, tripTitle: e.target.value})} placeholder="e.g. Luxury Manali Retreat" className="rounded-xl h-12 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Destination</Label>
                                <Input value={formData.destination || ""} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="e.g. Manali, Himachal" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Duration</Label>
                                <Input value={formData.duration || ""} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 5D/4N" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Travel Date (From)</Label>
                                <Input type="date" value={formData.travelDates?.from || ""} onChange={e => setFormData({...formData, travelDates: {...formData.travelDates!, from: e.target.value}})} className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Travel Date (To)</Label>
                                <Input type="date" value={formData.travelDates?.to || ""} onChange={e => setFormData({...formData, travelDates: {...formData.travelDates!, to: e.target.value}})} className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Number of People</Label>
                                <Input type="number" value={formData.pax} onChange={e => setFormData({...formData, pax: parseInt(e.target.value)})} className="rounded-xl h-12" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Pricing */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                <BadgePercent size={18} />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest">Pricing Strategy</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Standard Tier Pricing</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase opacity-60">Base Price (Standard)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                            <Input type="number" value={formData.lowLevelPrice || 0} onChange={e => setFormData({...formData, lowLevelPrice: parseInt(e.target.value)})} className="rounded-xl h-12 pl-8 font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 p-6 bg-cyan-50/30 rounded-3xl border border-cyan-100">
                                <Label className="text-xs font-black uppercase tracking-widest text-cyan-600">Luxury Tier Pricing</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase opacity-60">Base Price (Luxury)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                            <Input type="number" value={formData.highLevelPrice || 0} onChange={e => setFormData({...formData, highLevelPrice: parseInt(e.target.value)})} className="rounded-xl h-12 pl-8 font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60 text-emerald-600">Universal Discount (Optional)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                    <Input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: parseInt(e.target.value)})} className="rounded-xl h-12 pl-8 font-medium text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed pt-6">
                                Standard Price: ₹ {((formData.lowLevelPrice || 0) - (formData.discount || 0)).toLocaleString()} | 
                                Luxury Price: ₹ {((formData.highLevelPrice || 0) - (formData.discount || 0)).toLocaleString()}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Content Sections */}
                    <GlassCard className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-sm font-black uppercase tracking-widest">Trip Overview</Label>
                            <Textarea 
                                value={formData.overview} 
                                onChange={e => setFormData({...formData, overview: e.target.value})} 
                                placeholder="Describe the trip experience..." 
                                className="min-h-[150px] rounded-[24px] p-6 text-sm leading-relaxed"
                            />
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black uppercase tracking-widest">Day-wise Itinerary</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addItineraryDay} className="rounded-xl border-dashed">
                                    <Plus size={16} className="mr-2" /> Add Day
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {formData.itinerary?.map((day: any, idx: number) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={day.id || idx} 
                                        className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group"
                                    >
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newList = [...formData.itinerary!];
                                                newList.splice(idx, 1);
                                                setFormData({...formData, itinerary: newList});
                                            }}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                D{idx + 1}
                                            </div>
                                            <Input 
                                                value={day.title} 
                                                onChange={e => {
                                                    const newList = [...formData.itinerary!];
                                                    newList[idx].title = e.target.value;
                                                    setFormData({...formData, itinerary: newList});
                                                }}
                                                placeholder="Day Title (e.g. Arrival & Local Sightseeing)" 
                                                className="bg-transparent border-none p-0 h-auto font-black text-lg focus-visible:ring-0 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <Textarea 
                                            value={day.description} 
                                            onChange={e => {
                                                const newList = [...formData.itinerary!];
                                                newList[idx].description = e.target.value;
                                                setFormData({...formData, itinerary: newList});
                                            }}
                                            placeholder="What happens on this day?" 
                                            className="bg-white rounded-2xl p-4 text-xs min-h-[100px] border-slate-100"
                                        />

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Day Sightseeing Photos</Label>
                                            <div className="flex flex-wrap gap-3">
                                                {(day.photos || []).map((photoUrl: string, pIdx: number) => (
                                                    <div key={pIdx} className="relative w-24 h-24 rounded-xl overflow-hidden group/thumb border shadow-sm">
                                                        <img src={formatUrl(photoUrl)} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const newItinerary = [...formData.itinerary!];
                                                                newItinerary[idx].photos = newItinerary[idx].photos.filter((_: any, i: number) => i !== pIdx);
                                                                setFormData({...formData, itinerary: newItinerary});
                                                            }}
                                                            className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <ImageUpload 
                                                    compact
                                                    multiple={true}
                                                    className="w-24"
                                                    onUpload={(url) => {
                                                        setFormData(prev => {
                                                            const newItinerary = [...(prev.itinerary || [])];
                                                            if (!newItinerary[idx].photos) newItinerary[idx].photos = [];
                                                            if (!newItinerary[idx].photos.includes(url)) {
                                                                newItinerary[idx].photos.push(url);
                                                            }
                                                            return { ...prev, itinerary: newItinerary };
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Inclusions</Label>
                                    <button type="button" onClick={() => setFormData({...formData, inclusions: [...(formData.inclusions || []), ""]})} className="text-[10px] font-bold underline">Add Item</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.inclusions?.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mt-2 flex-shrink-0">
                                                <Plus size={12} />
                                            </div>
                                            <Input 
                                                value={item} 
                                                onChange={e => {
                                                    const newList = [...formData.inclusions!];
                                                    newList[i] = e.target.value;
                                                    setFormData({...formData, inclusions: newList});
                                                }}
                                                className="rounded-xl text-xs h-10" 
                                            />
                                            <button type="button" onClick={() => {
                                                const newList = [...formData.inclusions!];
                                                newList.splice(i, 1);
                                                setFormData({...formData, inclusions: newList});
                                            }} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-rose-500">Exclusions</Label>
                                    <button type="button" onClick={() => setFormData({...formData, exclusions: [...(formData.exclusions || []), ""]})} className="text-[10px] font-bold underline">Add Item</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.exclusions?.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mt-2 flex-shrink-0">
                                                <XCircle size={12} />
                                            </div>
                                            <Input 
                                                value={item} 
                                                onChange={e => {
                                                    const newList = [...formData.exclusions!];
                                                    newList[i] = e.target.value;
                                                    setFormData({...formData, exclusions: newList});
                                                }}
                                                className="rounded-xl text-xs h-10" 
                                            />
                                            <button type="button" onClick={() => {
                                                const newList = [...formData.exclusions!];
                                                newList.splice(i, 1);
                                                setFormData({...formData, exclusions: newList});
                                            }} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Tiered Hotel Options */}
                    <GlassCard className="p-8 space-y-8">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center">
                                <Plus size={18} />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest">Tiered Accommodation</h3>
                        </div>

                        {/* Standard Tier (Low Level) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black uppercase tracking-widest text-slate-500">Standard Tier Hotels</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, lowLevelHotels: [...(formData.lowLevelHotels || []), { name: "", location: "", stars: 4, image: "", description: "" }]})} className="rounded-xl border-dashed">
                                    <Plus size={16} className="mr-2" /> Add Hotel
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {formData.lowLevelHotels?.map((hotel, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newList = [...formData.lowLevelHotels!];
                                                newList.splice(idx, 1);
                                                setFormData({...formData, lowLevelHotels: newList});
                                            }}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="md:col-span-1">
                                            <Label className="text-[10px] font-black uppercase opacity-50 mb-2 block">Hotel Image</Label>
                                            <ImageUpload 
                                                compact
                                                value={hotel.image} 
                                                onUpload={(url) => {
                                                    const newList = [...formData.lowLevelHotels!];
                                                    newList[idx].image = url;
                                                    setFormData({...formData, lowLevelHotels: newList});
                                                }} 
                                            />
                                        </div>
                                        <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Hotel Name</Label>
                                                <Input value={hotel.name} onChange={e => {
                                                    const newList = [...formData.lowLevelHotels!];
                                                    newList[idx].name = e.target.value;
                                                    setFormData({...formData, lowLevelHotels: newList});
                                                }} className="rounded-xl h-10 text-xs font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Location</Label>
                                                <Input value={hotel.location} onChange={e => {
                                                    const newList = [...formData.lowLevelHotels!];
                                                    newList[idx].location = e.target.value;
                                                    setFormData({...formData, lowLevelHotels: newList});
                                                }} className="rounded-xl h-10 text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Star Rating</Label>
                                                <select 
                                                    value={hotel.stars} 
                                                    onChange={e => {
                                                        const newList = [...formData.lowLevelHotels!];
                                                        newList[idx].stars = parseInt(e.target.value);
                                                        setFormData({...formData, lowLevelHotels: newList});
                                                    }}
                                                    className="w-full bg-white border border-slate-200 rounded-xl h-10 px-3 text-xs"
                                                >
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Room Type/Meals</Label>
                                                <Input value={hotel.roomType || ""} onChange={e => {
                                                    const newList = [...formData.lowLevelHotels!];
                                                    newList[idx].roomType = e.target.value;
                                                    setFormData({...formData, lowLevelHotels: newList});
                                                }} placeholder="e.g. Superior / Breakfast" className="rounded-xl h-10 text-xs" />
                                            </div>
                                            <div className="col-span-2 space-y-3 pt-2 border-t border-slate-50">
                                                <Label className="text-[10px] font-black uppercase opacity-40">Hotel Gallery</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {(hotel.photos || []).map((url, pIdx) => (
                                                        <div key={pIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group/hotelimg">
                                                            <img src={formatUrl(url)} className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newList = [...formData.lowLevelHotels!];
                                                                    newList[idx].photos = newList[idx].photos!.filter((_, i) => i !== pIdx);
                                                                    setFormData({...formData, lowLevelHotels: newList});
                                                                }}
                                                                className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover/hotelimg:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <ImageUpload 
                                                        compact
                                                        multiple
                                                        className="w-20"
                                                        onUpload={(url) => {
                                                            const newList = [...formData.lowLevelHotels!];
                                                            if (!newList[idx].photos) newList[idx].photos = [];
                                                            newList[idx].photos!.push(url);
                                                            setFormData({...formData, lowLevelHotels: newList});
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Luxury Tier (High Level) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black uppercase tracking-widest text-purple-600">Luxury Tier Hotels</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, highLevelHotels: [...(formData.highLevelHotels || []), { name: "", location: "", stars: 5, image: "", description: "" }]})} className="rounded-xl border-dashed border-purple-200 text-purple-600">
                                    <Plus size={16} className="mr-2" /> Add Luxury Hotel
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {formData.highLevelHotels?.map((hotel, idx) => (
                                    <div key={idx} className="p-6 bg-purple-50/30 rounded-3xl border border-purple-100 grid grid-cols-1 md:grid-cols-4 gap-6 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newList = [...formData.highLevelHotels!];
                                                newList.splice(idx, 1);
                                                setFormData({...formData, highLevelHotels: newList});
                                            }}
                                            className="absolute top-4 right-4 text-purple-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="md:col-span-1">
                                            <Label className="text-[10px] font-black uppercase opacity-50 mb-2 block">Hotel Image</Label>
                                            <ImageUpload 
                                                compact
                                                value={hotel.image} 
                                                onUpload={(url) => {
                                                    const newList = [...formData.highLevelHotels!];
                                                    newList[idx].image = url;
                                                    setFormData({...formData, highLevelHotels: newList});
                                                }} 
                                            />
                                        </div>
                                        <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Hotel Name</Label>
                                                <Input value={hotel.name} onChange={e => {
                                                    const newList = [...formData.highLevelHotels!];
                                                    newList[idx].name = e.target.value;
                                                    setFormData({...formData, highLevelHotels: newList});
                                                }} className="rounded-xl h-10 text-xs font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Location</Label>
                                                <Input value={hotel.location} onChange={e => {
                                                    const newList = [...formData.highLevelHotels!];
                                                    newList[idx].location = e.target.value;
                                                    setFormData({...formData, highLevelHotels: newList});
                                                }} className="rounded-xl h-10 text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Star Rating</Label>
                                                <select 
                                                    value={hotel.stars} 
                                                    onChange={e => {
                                                        const newList = [...formData.highLevelHotels!];
                                                        newList[idx].stars = parseInt(e.target.value);
                                                        setFormData({...formData, highLevelHotels: newList});
                                                    }}
                                                    className="w-full bg-white border border-slate-200 rounded-xl h-10 px-3 text-xs"
                                                >
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Room Type/Meals</Label>
                                                <Input value={hotel.roomType || ""} onChange={e => {
                                                    const newList = [...formData.highLevelHotels!];
                                                    newList[idx].roomType = e.target.value;
                                                    setFormData({...formData, highLevelHotels: newList});
                                                }} placeholder="e.g. Deluxe Sea View / Breakfast" className="rounded-xl h-10 text-xs" />
                                            </div>
                                            <div className="col-span-2 space-y-3 pt-2 border-t border-slate-50">
                                                <Label className="text-[10px] font-black uppercase opacity-40">Hotel Gallery</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {(hotel.photos || []).map((url, pIdx) => (
                                                        <div key={pIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group/hotelimg">
                                                            <img src={formatUrl(url)} className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newList = [...formData.highLevelHotels!];
                                                                    newList[idx].photos = newList[idx].photos!.filter((_, i) => i !== pIdx);
                                                                    setFormData({...formData, highLevelHotels: newList});
                                                                }}
                                                                className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover/hotelimg:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <ImageUpload 
                                                        compact
                                                        multiple
                                                        className="w-20"
                                                        onUpload={(url) => {
                                                            const newList = [...formData.highLevelHotels!];
                                                            if (!newList[idx].photos) newList[idx].photos = [];
                                                            newList[idx].photos!.push(url);
                                                            setFormData({...formData, highLevelHotels: newList});
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Places & Activities */}
                    <GlassCard className="p-8 space-y-8">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                <ImageIcon size={18} />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest">Places & Activities</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Sightseeing Places Count</Label>
                                <Input 
                                    type="number" 
                                    value={formData.sightseeingCount || 0} 
                                    onChange={e => setFormData({...formData, sightseeingCount: parseInt(e.target.value)})} 
                                    className="rounded-xl h-12 font-bold"
                                    placeholder="e.g. 9"
                                />
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">This number appears in the green badge on the UI.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Hero Slider & Experience Gallery</Label>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {(formData.experiencePhotos || []).map((photoUrl: string, pIdx: number) => (
                                    <div key={pIdx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group/thumb border-2 border-white shadow-sm">
                                        <img src={formatUrl(photoUrl)} className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newList = (formData.experiencePhotos || []).filter((_: any, i: number) => i !== pIdx);
                                                setFormData({...formData, experiencePhotos: newList});
                                            }}
                                            className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <div className="aspect-[3/4]">
                                    <ImageUpload 
                                        multiple={true}
                                        onUpload={(url) => {
                                            setFormData(prev => {
                                                const experiencePhotos = [...(prev.experiencePhotos || [])];
                                                if (!experiencePhotos.includes(url)) {
                                                    experiencePhotos.push(url);
                                                }
                                                return { ...prev, experiencePhotos };
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Traveller Reviews */}
                    <GlassCard className="p-8 space-y-8">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                                    <Sparkles size={18} />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest">Traveller Reviews</h3>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, reviews: [...(formData.reviews || []), { id: uuidv4(), name: "", rating: 5, comment: "" }]})} className="rounded-xl border-dashed">
                                <Plus size={16} className="mr-2" /> Add Review
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(formData.reviews || []).map((review, idx) => (
                                <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const newList = [...formData.reviews!];
                                            newList.splice(idx, 1);
                                            setFormData({...formData, reviews: newList});
                                        }}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold uppercase opacity-60">Traveller Name</Label>
                                                    <Input value={review.name} onChange={e => {
                                                        const newList = [...formData.reviews!];
                                                        newList[idx].name = e.target.value;
                                                        setFormData({...formData, reviews: newList});
                                                    }} className="rounded-xl h-10 text-xs font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold uppercase opacity-60">Rating (1-5)</Label>
                                                    <select 
                                                        value={review.rating} 
                                                        onChange={e => {
                                                            const newList = [...formData.reviews!];
                                                            newList[idx].rating = parseInt(e.target.value);
                                                            setFormData({...formData, reviews: newList});
                                                        }}
                                                        className="w-full bg-white border border-slate-200 rounded-xl h-10 px-3 text-xs"
                                                    >
                                                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase opacity-60">Review Comment</Label>
                                                <Textarea 
                                                    value={review.comment} 
                                                    onChange={e => {
                                                        const newList = [...formData.reviews!];
                                                        newList[idx].comment = e.target.value;
                                                        setFormData({...formData, reviews: newList});
                                                    }} 
                                                    className="rounded-xl text-xs min-h-[80px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Hero & Experience Slider */}
                    <GlassCard className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={14} /> Hero Gallery
                            </Label>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Primary Cover (Main)</Label>
                                <ImageUpload 
                                    value={formData.coverImage} 
                                    onUpload={(url) => setFormData({...formData, coverImage: url})} 
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Hero Slider Gallery (Additional Photos)</Label>
                                <div className="flex flex-wrap gap-3">
                                    {(formData.heroImages || []).map((url, idx) => (
                                        <div key={idx} className="relative w-32 h-20 rounded-xl overflow-hidden border shadow-sm group/item">
                                            <img src={formatUrl(url)} className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const newList = (formData.heroImages || []).filter((_, i) => i !== idx);
                                                    setFormData({...formData, heroImages: newList});
                                                }}
                                                className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <ImageUpload 
                                        compact
                                        multiple
                                        className="w-32"
                                        onUpload={(url) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                heroImages: [...(prev.heroImages || []), url]
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground italic leading-relaxed uppercase tracking-widest font-black opacity-40">
                            The main background images for the quotation hero section.
                        </p>
                    </GlassCard>

                    {/* Quote Validity */}
                    <GlassCard className="p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest border-b pb-3 mb-2 flex items-center gap-2">
                            <Clock size={14} /> Quote Validity
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Duration (Hours)</Label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-xl h-10 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.expiryHours || ""}
                                    onChange={e => setFormData({...formData, expiryHours: e.target.value ? parseInt(e.target.value) : null})}
                                >
                                    <option value="">No Expiry</option>
                                    <option value="24">24 Hours</option>
                                    <option value="48">48 Hours</option>
                                    <option value="72">72 Hours</option>
                                    <option value="168">7 Days</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            {formData.expiryHours === -1 || (formData.expiryHours && ![24, 48, 72, 168].includes(formData.expiryHours)) && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Custom Hours</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.expiryHours || ""} 
                                        onChange={e => setFormData({...formData, expiryHours: parseInt(e.target.value)})} 
                                        className="rounded-xl h-10 text-xs font-bold"
                                    />
                                </div>
                            )}
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                Validity starts from the moment you click "Publish".
                            </p>
                        </div>
                    </GlassCard>

                    {/* Actions */}
                    <GlassCard className="p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest border-b pb-3 mb-4">Quick Actions</h3>
                        
                        {formData.slug && (
                            <div className="space-y-3">
                                <Button variant="outline" onClick={copyLink} className="w-full justify-start rounded-xl text-xs font-bold">
                                    <Copy size={16} className="mr-3" /> Copy Unique Link
                                </Button>
                                <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_FRONTEND_URL}/quote/${formData.slug}?isAdmin=true`, '_blank')} className="w-full justify-start rounded-xl text-xs font-bold">
                                    <ExternalLink size={16} className="mr-3" /> Preview Quotation
                                </Button>
                                <Button onClick={sendWhatsApp} className="w-full justify-start rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#128C7E] text-white">
                                    <WhatsAppIcon size={16} className="mr-3" /> Send via WhatsApp
                                </Button>
                            </div>
                        )}

                        {!formData.slug && (
                            <div className="p-4 bg-slate-50 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Save the proposal first to enable sharing options.</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Expert Meta */}
                    <GlassCard className="p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest border-b pb-3 mb-4 flex items-center gap-2">
                            <Users size={14} /> Expert Details
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Expert Photo</Label>
                                <ImageUpload 
                                    value={formData.expert?.photo} 
                                    onUpload={(url) => setFormData({...formData, expert: {...formData.expert!, photo: url}})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Agent Name</Label>
                                    <Input value={formData.expert?.name} onChange={e => setFormData({...formData, expert: {...formData.expert!, name: e.target.value}})} className="rounded-xl h-10 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Agent Title</Label>
                                    <Input value={formData.expert?.designation} onChange={e => setFormData({...formData, expert: {...formData.expert!, designation: e.target.value}})} className="rounded-xl h-10 text-xs" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">WhatsApp No</Label>
                                    <Input value={formData.expert?.whatsapp} onChange={e => setFormData({...formData, expert: {...formData.expert!, whatsapp: e.target.value}})} className="rounded-xl h-10 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Phone No</Label>
                                    <Input value={formData.expert?.phone} onChange={e => setFormData({...formData, expert: {...formData.expert!, phone: e.target.value}})} className="rounded-xl h-10 text-xs" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Expert Bio</Label>
                                <Textarea 
                                    value={formData.expert?.description} 
                                    onChange={e => setFormData({...formData, expert: {...formData.expert!, description: e.target.value}})} 
                                    className="rounded-xl text-xs min-h-[80px]"
                                    placeholder="Write a short bio for the expert..."
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Stats (if exists) */}
                    {isEdit && (
                        <GlassCard className="p-6 bg-slate-900 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Proposal Insights</p>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-3xl font-black">{formData.viewCount || 0}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Total Views</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                    <Calendar size={12} />
                                    Created on {new Date(formData.createdAt!).toLocaleDateString()}
                                </div>
                                {formData.expiresAt && (
                                    <div className="space-y-3 pt-2 border-t border-white/10">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                            <span className="text-slate-400">Expires On</span>
                                            <span className={new Date() > new Date(formData.expiresAt) ? "text-rose-400" : "text-emerald-400"}>
                                                {new Date(formData.expiresAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={handleExtend}
                                            className="w-full rounded-lg font-black uppercase text-[10px] h-8 bg-white/10 hover:bg-white/20 text-white border-none"
                                        >
                                            Extend by 48h
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    )}

                    {/* Summary & Logistics Configuration */}
                        <GlassCard className="p-6 space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <Label className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                                    <Sparkles size={16} /> Summary & Logistics
                                </Label>
                            </div>

                            {/* Stay & Meals Manual Override */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Stay Summary (Nights Breakdown)</Label>
                                <div className="space-y-3">
                                    {(formData.staySummary || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-end">
                                            <div className="w-20">
                                                <Label className="text-[9px] uppercase opacity-50">Nights</Label>
                                                <Input 
                                                    type="number"
                                                    value={item.nights}
                                                    onChange={(e) => {
                                                        const newList = [...formData.staySummary!];
                                                        newList[idx].nights = parseInt(e.target.value) || 1;
                                                        setFormData({...formData, staySummary: newList});
                                                    }}
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <Label className="text-[9px] uppercase opacity-50">Location</Label>
                                                <Input 
                                                    value={item.location}
                                                    onChange={(e) => {
                                                        const newList = [...formData.staySummary!];
                                                        newList[idx].location = e.target.value;
                                                        setFormData({...formData, staySummary: newList});
                                                    }}
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 text-rose-500 hover:bg-rose-50"
                                                onClick={() => {
                                                    const newList = formData.staySummary!.filter((_, i) => i !== idx);
                                                    setFormData({...formData, staySummary: newList});
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full h-9 border-dashed text-primary font-bold text-[10px] uppercase"
                                        onClick={() => setFormData({...formData, staySummary: [...(formData.staySummary || []), { nights: 1, location: "" }]})}
                                    >
                                        <Plus size={14} className="mr-2" /> Add Stay Point
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Rooms Info</Label>
                                    <Input 
                                        value={formData.roomsInfo || ""}
                                        onChange={(e) => setFormData({...formData, roomsInfo: e.target.value})}
                                        placeholder="e.g. 1 Rooms at all location"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Meals Info</Label>
                                    <Input 
                                        value={formData.mealsInfo || ""}
                                        onChange={(e) => setFormData({...formData, mealsInfo: e.target.value})}
                                        placeholder="e.g. Breakfast at Property"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Travelling Flow Manual Override */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Travelling Flow (Icons & Text)</Label>
                                <div className="space-y-4">
                                    {(formData.travelling || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="space-y-2 shrink-0">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Pick Icon</Label>
                                                <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    {[
                                                        { id: "plane", icon: Plane },
                                                        { id: "train", icon: Train },
                                                        { id: "car", icon: Car },
                                                        { id: "bus", icon: Bus },
                                                        { id: "ship", icon: Ship },
                                                        { id: "pickup", icon: PickupIcon },
                                                        { id: "hotel", icon: HotelIcon },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const newList = [...formData.travelling!];
                                                                newList[idx].icon = opt.id;
                                                                setFormData({...formData, travelling: newList});
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${item.icon === opt.id ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                                                        >
                                                            <opt.icon size={14} />
                                                        </button>
                                                    ))}
                                                    <div className="col-span-4 h-px bg-slate-200 my-1" />
                                                    <div className="col-span-4">
                                                        <Input 
                                                            value={item.icon.length > 10 ? "" : item.icon}
                                                            onChange={(e) => {
                                                                const newList = [...formData.travelling!];
                                                                newList[idx].icon = e.target.value;
                                                                setFormData({...formData, travelling: newList});
                                                            }}
                                                            placeholder="Emoji"
                                                            className="h-8 text-[10px] text-center rounded-lg bg-white border-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Step Description</Label>
                                                <Input 
                                                    value={item.label}
                                                    onChange={(e) => {
                                                        const newList = [...formData.travelling!];
                                                        newList[idx].label = e.target.value;
                                                        setFormData({...formData, travelling: newList});
                                                    }}
                                                    placeholder="e.g. Airport Pickup"
                                                    className="h-10 text-xs rounded-xl font-bold border-slate-200"
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 text-rose-500 hover:bg-rose-50"
                                                onClick={() => {
                                                    const newList = formData.travelling!.filter((_, i) => i !== idx);
                                                    setFormData({...formData, travelling: newList});
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full h-9 border-dashed text-primary font-bold text-[10px] uppercase"
                                        onClick={() => setFormData({...formData, travelling: [...(formData.travelling || []), { icon: "🚗", label: "" }]})}
                                    >
                                        <Plus size={14} className="mr-2" /> Add Travel Step
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                </div>
            </div>
        </div>
    );
}
