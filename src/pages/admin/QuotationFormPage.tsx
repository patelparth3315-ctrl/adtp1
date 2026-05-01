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
    ChevronLeft,
    Hotel as HotelIcon,
    Calendar,
    Users,
    FileText,
    MessageCircle as WhatsAppIcon,
    MapPin,
    Clock,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { quotationsService } from "@/services/quotations.service";
import { Quotation, QuotationHotel, QuotationDay, QuotationCustomSection } from "@/types";

export default function QuotationFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = id !== "new";
    
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const totalSteps = 6;

    const [formData, setFormData] = useState<Partial<Quotation>>({
        id: uuidv4(),
        status: "Draft",
        pax: 2,
        lowLevelPrice: 19999,
        highLevelPrice: 24999,
        travelDates: { from: "", to: "" },
        duration: "",
        clientName: "",
        destination: "",
        data: {
            lowLevelHotels: [],
            highLevelHotels: [],
            itinerary: [],
            customSections: [],
            experiencePhotos: [],
            expert: { name: "", whatsapp: "", designation: "" }
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
        } else if (!isEdit) {
            const pending = localStorage.getItem("pending_ai_quotation");
            if (pending) {
                try {
                    const data = JSON.parse(pending);
                    setFormData(prev => ({ ...prev, ...data, id: uuidv4() }));
                    toast.success("AI Itinerary loaded!");
                    localStorage.removeItem("pending_ai_quotation");
                } catch (e) {}
            }
        }
    }, [id, isEdit, navigate]);

    useEffect(() => {
        if (formData.travelDates?.from && formData.travelDates?.to) {
            const start = new Date(formData.travelDates.from);
            const end = new Date(formData.travelDates.to);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diff > 0) {
                setFormData(prev => ({ ...prev, duration: `${diff} Nights / ${diff + 1} Days` }));
            }
        }
    }, [formData.travelDates?.from, formData.travelDates?.to]);

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        try {
            if (!formData.clientName || !formData.destination) {
                toast.error("Please fill in basic details");
                setStep(1);
                return;
            }

            const payload = {
                ...formData,
                slug: formData.slug || formData.destination.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + formData.id?.substring(0, 5)
            };

            await quotationsService.save(payload);
            toast.success(isEdit ? "Quotation updated" : "Quotation created");
            if (!isEdit) navigate("/admin/quotations");
        } catch (error: any) {
            toast.error(error.message || "Failed to save quotation");
        } finally {
            setIsSaving(false);
        }
    };

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "quotation_upload");
        const res = await fetch(`https://api.cloudinary.com/v1_1/dltxunwku/image/upload`, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.secure_url;
    };

    if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

    return (
        <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <Button type="button" variant="ghost" onClick={() => navigate("/admin/quotations")} className="text-muted-foreground font-bold">
                    <ArrowLeft size={18} className="mr-2" /> BACK TO LIST
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1 mr-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`w-6 h-1 rounded-full transition-all ${i + 1 <= step ? 'bg-primary' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    <Button type="submit" disabled={isSaving} className="rounded-xl shadow-lg shadow-primary/20">
                        {isSaving ? "SAVING..." : <><Save size={18} className="mr-2" /> {isEdit ? "UPDATE PROPOSAL" : "SAVE PROPOSAL"}</>}
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <GlassCard className="p-8 lg:p-12 mb-6">
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase">Basic Details</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Proposal Foundation</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Client Name</Label>
                                        <Input value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} placeholder="e.g. Rahul Sharma" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Destination / Trip Title</Label>
                                        <Input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} placeholder="e.g. Manali Luxury Retreat" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Standard Price (₹)</Label>
                                        <Input type="number" value={formData.lowLevelPrice} onChange={e => setFormData({ ...formData, lowLevelPrice: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Luxury Price (₹)</Label>
                                        <Input type="number" value={formData.highLevelPrice} onChange={e => setFormData({ ...formData, highLevelPrice: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Travel Date From</Label>
                                        <Input type="date" value={formData.travelDates?.from} onChange={e => setFormData({ ...formData, travelDates: { ...formData.travelDates!, from: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Travel Date To</Label>
                                        <Input type="date" value={formData.travelDates?.to} onChange={e => setFormData({ ...formData, travelDates: { ...formData.travelDates!, to: e.target.value } })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <HotelIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase">Hotel Selection</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Standard vs Luxury Stays</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="font-bold text-sm uppercase">Standard Hotels</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => {
                                            const h = { id: uuidv4(), name: "", location: "", rating: 3, description: "", roomType: "", photos: [] };
                                            setFormData({ ...formData, data: { ...formData.data, lowLevelHotels: [...(formData.data.lowLevelHotels || []), h] } });
                                        }}>+ ADD HOTEL</Button>
                                    </div>
                                    {formData.data?.lowLevelHotels?.map((hotel: any, index: number) => (
                                        <div key={hotel.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl relative">
                                            <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => {
                                                const newList = [...formData.data.lowLevelHotels];
                                                newList.splice(index, 1);
                                                setFormData({ ...formData, data: { ...formData.data, lowLevelHotels: newList } });
                                            }}><Trash2 size={14} /></Button>
                                            <Input placeholder="Hotel Name" value={hotel.name} onChange={e => {
                                                const newList = [...formData.data.lowLevelHotels];
                                                newList[index].name = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, lowLevelHotels: newList } });
                                            }} />
                                            <Input placeholder="Location" value={hotel.location} onChange={e => {
                                                const newList = [...formData.data.lowLevelHotels];
                                                newList[index].location = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, lowLevelHotels: newList } });
                                            }} />
                                            <Input placeholder="Room Type" value={hotel.roomType} onChange={e => {
                                                const newList = [...formData.data.lowLevelHotels];
                                                newList[index].roomType = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, lowLevelHotels: newList } });
                                            }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="font-bold text-sm uppercase">Luxury Hotels</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => {
                                            const h = { id: uuidv4(), name: "", location: "", rating: 5, description: "", roomType: "", photos: [] };
                                            setFormData({ ...formData, data: { ...formData.data, highLevelHotels: [...(formData.data.highLevelHotels || []), h] } });
                                        }}>+ ADD HOTEL</Button>
                                    </div>
                                    {formData.data?.highLevelHotels?.map((hotel: any, index: number) => (
                                        <div key={hotel.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-xl relative">
                                             <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => {
                                                const newList = [...formData.data.highLevelHotels];
                                                newList.splice(index, 1);
                                                setFormData({ ...formData, data: { ...formData.data, highLevelHotels: newList } });
                                            }}><Trash2 size={14} /></Button>
                                            <Input placeholder="Hotel Name" value={hotel.name} onChange={e => {
                                                const newList = [...formData.data.highLevelHotels];
                                                newList[index].name = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, highLevelHotels: newList } });
                                            }} />
                                            <Input placeholder="Location" value={hotel.location} onChange={e => {
                                                const newList = [...formData.data.highLevelHotels];
                                                newList[index].location = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, highLevelHotels: newList } });
                                            }} />
                                            <Input placeholder="Room Type" value={hotel.roomType} onChange={e => {
                                                const newList = [...formData.data.highLevelHotels];
                                                newList[index].roomType = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, highLevelHotels: newList } });
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase">Itinerary</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Day-wise Experience</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {formData.data?.itinerary?.map((day: any, index: number) => (
                                        <div key={day.id} className="p-6 bg-muted/20 rounded-2xl border border-border/50 space-y-4 relative">
                                             <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive" onClick={() => {
                                                const newList = [...formData.data.itinerary];
                                                newList.splice(index, 1);
                                                setFormData({ ...formData, data: { ...formData.data, itinerary: newList } });
                                            }}><Trash2 size={16} /></Button>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary text-black rounded-lg flex items-center justify-center font-black">
                                                    {index + 1}
                                                </div>
                                                <Input className="font-bold" placeholder="Day Title (e.g. Arrival & Local Sightseeing)" value={day.title} onChange={e => {
                                                    const newList = [...formData.data.itinerary];
                                                    newList[index].title = e.target.value;
                                                    setFormData({ ...formData, data: { ...formData.data, itinerary: newList } });
                                                }} />
                                            </div>
                                            <Textarea placeholder="Description of the day..." value={day.description} onChange={e => {
                                                const newList = [...formData.data.itinerary];
                                                newList[index].description = e.target.value;
                                                setFormData({ ...formData, data: { ...formData.data, itinerary: newList } });
                                            }} />
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="w-full border-dashed h-16 rounded-2xl" onClick={() => {
                                        const d = { id: uuidv4(), day: (formData.data.itinerary?.length || 0) + 1, title: "", description: "", activities: [], photos: [] };
                                        setFormData({ ...formData, data: { ...formData.data, itinerary: [...(formData.data.itinerary || []), d] } });
                                    }}>+ ADD ANOTHER DAY</Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <ImageIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase">Media & Branding</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Visual Appeal</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label>Hero Image URL</Label>
                                        <Input placeholder="Paste image URL here" value={formData.data?.heroImage || ""} onChange={e => setFormData({ ...formData, data: { ...formData.data, heroImage: e.target.value } })} />
                                        {formData.data?.heroImage && <img src={formData.data.heroImage} className="w-full aspect-video object-cover rounded-2xl border" />}
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Expert Photo URL</Label>
                                        <Input placeholder="Expert image URL" value={formData.data?.expert?.photo || ""} onChange={e => setFormData({ ...formData, data: { ...formData.data, expert: { ...formData.data.expert, photo: e.target.value } } })} />
                                        {formData.data?.expert?.photo && <img src={formData.data.expert.photo} className="w-20 h-20 rounded-full border object-cover" />}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <WhatsAppIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase">Expert Details</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Personal Touch</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Expert Name</Label>
                                        <Input value={formData.data?.expert?.name} onChange={e => setFormData({ ...formData, data: { ...formData.data, expert: { ...formData.data.expert, name: e.target.value } } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expert Title</Label>
                                        <Input value={formData.data?.expert?.designation} onChange={e => setFormData({ ...formData, data: { ...formData.data, expert: { ...formData.data.expert, designation: e.target.value } } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>WhatsApp Number</Label>
                                        <Input value={formData.data?.expert?.whatsapp} onChange={e => setFormData({ ...formData, data: { ...formData.data, expert: { ...formData.data.expert, whatsapp: e.target.value } } })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-8 text-center py-10">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic">Ready to go!</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">Review your details and save the proposal. You can share the link with the client immediately after.</p>
                                
                                <div className="flex justify-center gap-4 pt-6">
                                    <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setStep(1)}>REVIEW ALL</Button>
                                    <Button type="submit" disabled={isSaving} className="h-14 px-10 rounded-2xl font-black shadow-xl shadow-primary/30">
                                        {isSaving ? "SAVING..." : "FINISH & SAVE"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" disabled={step === 1} onClick={prevStep} className="rounded-xl h-12 font-bold">
                    <ChevronLeft size={18} className="mr-2" /> PREVIOUS STEP
                </Button>
                {step < totalSteps && (
                    <Button type="button" onClick={nextStep} className="rounded-xl h-12 px-8 font-black shadow-lg">
                        NEXT STEP <ChevronRight size={18} className="ml-2" />
                    </Button>
                )}
            </div>
        </form>
    );
}
