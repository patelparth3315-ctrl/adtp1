import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { settingsService } from "@/services/settings.service";
import { SiteSettings } from "@/types";
import { toast } from "sonner";
import { 
  Building2, Mail, Phone, MapPin, Globe, Palette, 
  Layout, Share2, Server, Save, ChevronRight, FileText, Plus, Trash, Pencil,
  Percent, Receipt, HelpCircle, AlertCircle, Calendar, CheckCircle2, XCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

type Category = 'SUPPORT' | 'BRANDING' | 'SMTP' | 'SOCIAL' | 'LAYOUT' | 'CUSTOM_FORM' | 'TAXES';

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('SUPPORT');
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, watch, setValue } = useForm<SiteSettings>();

  const customFields = watch('tripCustomFields') || [];
  const taxes = watch('taxes') || [];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.get();
        reset(data);
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SiteSettings) => {
    try {
      await settingsService.update(data);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Loading System Config...</p>
       </div>
    </div>
  );

  const categories = [
    { id: 'SUPPORT' as Category, label: 'Support Details', icon: Building2 },
    { id: 'BRANDING' as Category, label: 'Branding & Identity', icon: Palette },
    { id: 'TAXES' as Category, label: 'Taxes and Fees', icon: Percent },
    { id: 'CUSTOM_FORM' as Category, label: 'Trip Custom Sections', icon: FileText },
    { id: 'SMTP' as Category, label: 'Email & SMS', icon: Server },
    { id: 'SOCIAL' as Category, label: 'Social & Links', icon: Share2 },
    { id: 'LAYOUT' as Category, label: 'Global Layout', icon: Layout },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 overflow-hidden bg-[#fafafa]">
      {/* ── HEADER ── */}
      <div className="h-16 border-b flex items-center justify-between px-10 bg-white shrink-0 shadow-sm z-10">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">System<span className="text-primary">Settings</span></h2>
            <div className="w-px h-6 bg-border mx-2"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Configuration Engine v4.0</p>
         </div>
         <Button onClick={handleSubmit(onSubmit)} className="bg-black hover:bg-black/90 text-white rounded-2xl h-11 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-black/20 transition-all hover:scale-[1.05]">
           <Save className="w-4 h-4 mr-2" /> Save Global Configuration
         </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <div className="w-80 border-r bg-white h-full p-6 flex flex-col gap-2 overflow-y-auto">
           {categories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`flex items-center justify-between p-5 rounded-[24px] text-left transition-all duration-300 relative group
                 ${activeCategory === cat.id 
                   ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-[1.02]' 
                   : 'hover:bg-muted text-muted-foreground font-bold hover:pl-7'}`}
             >
               <div className="flex items-center gap-4">
                 <cat.icon className={`w-5 h-5 transition-colors ${activeCategory === cat.id ? 'text-black' : 'text-gray-400 group-hover:text-primary'}`} />
                 <span className={`text-[11px] font-black uppercase tracking-tight ${activeCategory === cat.id ? 'text-black' : ''}`}>
                   {cat.label}
                 </span>
               </div>
               {activeCategory === cat.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-black rounded-r-full shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
               )}
             </button>
           ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#fafafa]">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
               
               {/* ── SUPPORT DETAILS ── */}
               {activeCategory === 'SUPPORT' && (
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Support Details</h3>
                       <p className="text-muted-foreground text-sm font-medium italic">Your organization's identity and primary contact nodes.</p>
                    </div>

                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardHeader className="bg-muted/30 pb-6 pt-8 px-10">
                          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-primary" /> Core Business Identity
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-10 space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Legal Organization Name</Label>
                             <Input {...register("organization.name")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Official Website URL</Label>
                             <Input {...register("organization.website")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Master Brand Logo URL</Label>
                            <div className="flex gap-4">
                               <Input {...register("organization.logo")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6 flex-1" />
                               {watch('organization.logo') && (
                                  <div className="w-14 h-14 rounded-2xl bg-muted p-2 flex items-center justify-center border-2 overflow-hidden shadow-inner">
                                     <img src={watch('organization.logo')} className="max-w-full max-h-full object-contain" />
                                  </div>
                               )}
                            </div>
                         </div>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardHeader className="bg-muted/30 pb-6 pt-8 px-10">
                          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary" /> Support Communication Channels
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-10 space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Primary Support Email</Label>
                             <Input {...register("organization.supportEmail")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Helpline Phone Number</Label>
                             <Input {...register("organization.supportPhone")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Main Mailing Address</Label>
                            <Textarea {...register("organization.mailingAddress")} className="rounded-3xl font-bold border-2 focus:border-primary p-6 h-32 leading-relaxed" />
                         </div>
                       </CardContent>
                    </Card>
                 </div>
               )}

               {/* ── TAXES & FEES ── */}
               {activeCategory === 'TAXES' && (
                 <div className="space-y-10">
                    <div className="flex justify-between items-end">
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black uppercase tracking-tighter">Taxes & Fees</h3>
                          <p className="text-muted-foreground text-sm font-medium italic">Configure GST, service charges, and automated fee calculations.</p>
                       </div>
                       <Button onClick={() => {
                          setValue('taxes', [...taxes, { name: 'New Tax', amount: 5, amountType: 'percentage', leviedOn: 'all', isEnabled: true }]);
                       }} className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                          <Plus className="w-4 h-4 mr-2" /> Add New Tax/Fee
                       </Button>
                    </div>

                    <div className="grid gap-6">
                       {taxes.map((tax: any, idx: number) => (
                         <Card key={idx} className="rounded-[32px] border-2 border-border/50 shadow-sm hover:border-primary transition-all group bg-white overflow-hidden">
                            <div className="p-8 space-y-8">
                               <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-6">
                                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Receipt className="w-7 h-7 text-primary" />
                                     </div>
                                     <div className="space-y-1">
                                        <Input 
                                          value={tax.name} 
                                          onChange={(e) => {
                                            const updated = [...taxes];
                                            updated[idx].name = e.target.value;
                                            setValue('taxes', updated);
                                          }}
                                          className="border-none p-0 h-auto font-black text-xl focus-visible:ring-0 bg-transparent w-64" 
                                        />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                           <AlertCircle className="w-3 h-3" /> Registration: 
                                           <input 
                                              value={tax.registrationNumber || ''} 
                                              onChange={(e) => {
                                                const updated = [...taxes];
                                                updated[idx].registrationNumber = e.target.value;
                                                setValue('taxes', updated);
                                              }}
                                              placeholder="Optional ID"
                                              className="bg-transparent border-none p-0 focus:outline-none w-32"
                                           />
                                        </p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <Switch 
                                        checked={tax.isEnabled} 
                                        onCheckedChange={(v) => {
                                           const updated = [...taxes];
                                           updated[idx].isEnabled = v;
                                           setValue('taxes', updated);
                                        }}
                                     />
                                     <Button variant="ghost" size="icon" onClick={() => {
                                        setValue('taxes', taxes.filter((_:any, i:number) => i !== idx));
                                     }} className="text-destructive rounded-xl hover:bg-destructive/10">
                                        <Trash className="w-4 h-4" />
                                     </Button>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-t pt-8 border-dashed">
                                  <div className="md:col-span-3 space-y-3">
                                     <Label className="text-[9px] font-black uppercase tracking-widest opacity-50">Amount</Label>
                                     <div className="flex items-center gap-3">
                                        <Input 
                                          type="number" 
                                          value={tax.amount} 
                                          onChange={(e) => {
                                            const updated = [...taxes];
                                            updated[idx].amount = Number(e.target.value);
                                            setValue('taxes', updated);
                                          }}
                                          className="h-12 rounded-xl font-black text-lg border-2" 
                                        />
                                        <select 
                                          value={tax.amountType} 
                                          onChange={(e) => {
                                            const updated = [...taxes];
                                            updated[idx].amountType = e.target.value;
                                            setValue('taxes', updated);
                                          }}
                                          className="h-12 px-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest"
                                        >
                                           <option value="percentage">%</option>
                                           <option value="fixed">Fixed</option>
                                        </select>
                                     </div>
                                  </div>

                                  <div className="md:col-span-5 space-y-3">
                                     <Label className="text-[9px] font-black uppercase tracking-widest opacity-50">Applicable Dates</Label>
                                     <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                           <Calendar className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                           <input 
                                              type="date"
                                              className="w-full h-12 rounded-xl border-2 pl-8 pr-2 font-bold text-[10px]"
                                           />
                                        </div>
                                        <span className="text-muted-foreground font-black">→</span>
                                        <div className="flex-1 relative">
                                           <Calendar className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                           <input 
                                              type="date"
                                              className="w-full h-12 rounded-xl border-2 pl-8 pr-2 font-bold text-[10px]"
                                           />
                                        </div>
                                     </div>
                                  </div>

                                  <div className="md:col-span-4 space-y-3">
                                     <Label className="text-[9px] font-black uppercase tracking-widest opacity-50">Levied On</Label>
                                     <div className="grid grid-cols-2 gap-2">
                                        {['all', 'specific'].map((type) => (
                                           <button
                                              key={type}
                                              type="button"
                                              onClick={() => {
                                                 const updated = [...taxes];
                                                 updated[idx].leviedOn = type;
                                                 setValue('taxes', updated);
                                              }}
                                              className={`h-12 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${tax.leviedOn === type ? 'bg-primary border-primary text-black' : 'hover:border-primary/50 text-muted-foreground'}`}
                                           >
                                              {type}
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </Card>
                       ))}

                       {taxes.length === 0 && (
                          <div className="py-20 text-center border-4 border-dashed rounded-[40px] border-muted bg-white/50 opacity-40">
                             <Receipt className="w-12 h-12 mx-auto mb-4" />
                             <p className="font-black uppercase tracking-widest text-xs">No active taxes or fees defined</p>
                          </div>
                       )}
                    </div>
                 </div>
               )}

               {/* ── CUSTOM FORM ── */}
               {activeCategory === 'CUSTOM_FORM' && (
                 <div className="space-y-10">
                    <div className="flex justify-between items-end">
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black uppercase tracking-tighter">Trip Custom Sections</h3>
                          <p className="text-muted-foreground text-sm font-medium italic">Define supplemental fields (Things to Carry, FAQ, etc) for your trip blueprints.</p>
                       </div>
                       <Button onClick={() => {
                          setValue('tripCustomFields', [...customFields, { label: 'New Section', type: 'rich-text', helpText: '', isRequired: false }]);
                       }} className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                          <Plus className="w-4 h-4 mr-2" /> Add Master Field
                       </Button>
                    </div>

                    <div className="grid gap-4">
                       {customFields.map((field: any, idx: number) => (
                         <Card key={idx} className="rounded-[32px] border-2 border-border/50 shadow-sm hover:border-primary transition-all bg-white overflow-hidden group">
                            <div className="p-8 flex items-start gap-8">
                               <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                  <FileText className="w-6 h-6 group-hover:text-black transition-colors" />
                               </div>
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-start justify-between">
                                     <div className="space-y-1 flex-1 max-w-lg">
                                        <Input 
                                          value={field.label} 
                                          onChange={(e) => {
                                            const updated = [...customFields];
                                            updated[idx].label = e.target.value;
                                            setValue('tripCustomFields', updated);
                                          }}
                                          className="border-none p-0 h-auto font-black text-xl focus-visible:ring-0 bg-transparent" 
                                        />
                                        <Input 
                                          value={field.helpText || ''} 
                                          onChange={(e) => {
                                            const updated = [...customFields];
                                            updated[idx].helpText = e.target.value;
                                            setValue('tripCustomFields', updated);
                                          }}
                                          placeholder="Help text for admins (optional)"
                                          className="border-none p-0 h-auto font-medium text-xs text-muted-foreground focus-visible:ring-0 bg-transparent italic" 
                                        />
                                     </div>
                                     <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                           <Switch 
                                              checked={field.isRequired} 
                                              onCheckedChange={(v) => {
                                                 const updated = [...customFields];
                                                 updated[idx].isRequired = v;
                                                 setValue('tripCustomFields', updated);
                                              }} 
                                           />
                                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Required</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                           setValue('tripCustomFields', customFields.filter((_:any, i:number) => i !== idx));
                                        }} className="text-destructive rounded-xl">
                                           <Trash className="w-4 h-4" />
                                        </Button>
                                     </div>
                                  </div>

                                  <div className="flex gap-3">
                                     {['rich-text', 'html', 'video', 'text'].map((type) => (
                                        <button
                                           key={type}
                                           type="button"
                                           onClick={() => {
                                              const updated = [...customFields];
                                              updated[idx].type = type;
                                              setValue('tripCustomFields', updated);
                                           }}
                                           className={`px-4 py-2 rounded-xl border-2 font-black text-[9px] uppercase tracking-[0.2em] transition-all ${field.type === type ? 'bg-black text-white border-black' : 'text-muted-foreground hover:border-gray-300'}`}
                                        >
                                           {type.replace('-', ' ')}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </Card>
                       ))}

                       {customFields.length === 0 && (
                         <div className="text-center py-20 border-4 border-dashed rounded-[40px] opacity-20">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="font-black uppercase tracking-widest text-xs">No custom blueprint fields defined</p>
                         </div>
                       )}
                    </div>
                 </div>
               )}

               {/* ── BRANDING ── */}
               {activeCategory === 'BRANDING' && (
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Branding & Identity</h3>
                       <p className="text-muted-foreground text-sm font-medium italic">Control the visual DNA and aesthetic signature of your platform.</p>
                    </div>

                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardContent className="p-10 space-y-12">
                         <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                 <Palette className="w-3 h-3 text-primary" /> Primary Brand Signature
                               </Label>
                               <div className="flex gap-4 items-center">
                                  <input type="color" {...register("theme.primaryColor")} className="w-16 h-16 rounded-[24px] border-none cursor-pointer overflow-hidden shadow-xl" />
                                  <Input {...register("theme.primaryColor")} className="rounded-2xl h-14 font-black text-center border-2 uppercase tracking-widest" />
                               </div>
                            </div>
                            <div className="space-y-4">
                               <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                 <Palette className="w-3 h-3 text-cyan" /> Accent / Call-to-Action
                               </Label>
                               <div className="flex gap-4 items-center">
                                  <input type="color" {...register("theme.accentColor")} className="w-16 h-16 rounded-[24px] border-none cursor-pointer overflow-hidden shadow-xl" />
                                  <Input {...register("theme.accentColor")} className="rounded-2xl h-14 font-black text-center border-2 uppercase tracking-widest" />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Typography Stack</Label>
                            <div className="grid grid-cols-2 gap-8">
                               <div className="space-y-3">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Foundation Typeface</Label>
                                  <select {...register("theme.primaryFont")} className="w-full h-14 rounded-2xl px-6 bg-[#f5f5f5] border-none font-black text-sm outline-none focus:ring-2 ring-primary/20">
                                     <option value="Montserrat">Montserrat (Standard)</option>
                                     <option value="Poppins">Poppins (Modern)</option>
                                     <option value="Inter">Inter (Clean)</option>
                                     <option value="Outfit">Outfit (Premium)</option>
                                  </select>
                               </div>
                               <div className="space-y-3">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Editorial Accent</Label>
                                  <select {...register("theme.handwritingFont")} className="w-full h-14 rounded-2xl px-6 bg-[#f5f5f5] border-none font-black text-sm outline-none focus:ring-2 ring-primary/20">
                                     <option value="Dancing Script">Dancing Script</option>
                                     <option value="Pacifico">Pacifico</option>
                                     <option value="Caveat">Caveat</option>
                                  </select>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Navigation Header Title</Label>
                             <Input {...register("theme.headerTitle")} className="rounded-2xl h-16 font-black text-2xl bg-[#f5f5f5] border-none px-8" placeholder="e.g. YouthCamping" />
                         </div>
                       </CardContent>
                    </Card>
                 </div>
               )}

               {/* ── SMTP SETTINGS ── */}
               {activeCategory === 'SMTP' && (
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Email & SMS</h3>
                       <p className="text-muted-foreground text-sm font-medium italic">Configure delivery gateways for automated booking confirmations and inquiry alerts.</p>
                    </div>

                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-8 px-10">
                          <div className="space-y-1">
                             <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Master SMTP Gateway</CardTitle>
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${watch('smtp.isEnabled') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{watch('smtp.isEnabled') ? 'Engine Active' : 'Offline'}</span>
                             </div>
                          </div>
                          <Switch 
                            checked={watch('smtp.isEnabled')} 
                            onCheckedChange={(v) => setValue('smtp.isEnabled', v)} 
                          />
                       </CardHeader>
                       <CardContent className="p-10 space-y-8">
                         <div className="grid grid-cols-4 gap-8">
                           <div className="col-span-3 space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Host Endpoint</Label>
                             <Input {...register("smtp.host")} placeholder="smtp.gmail.com" className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Port</Label>
                             <Input type="number" {...register("smtp.port")} placeholder="587" className="rounded-2xl h-14 font-black border-2 focus:border-primary text-center" />
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Authentication Username</Label>
                             <Input {...register("smtp.user")} className="rounded-2xl h-14 font-black border-2 focus:border-primary pl-6" />
                           </div>
                           <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Security Credentials</Label>
                             <Input type="password" {...register("smtp.pass")} className="rounded-2xl h-14 font-black border-2 focus:border-primary px-6" />
                           </div>
                         </div>
                       </CardContent>
                    </Card>
                 </div>
               )}

               {/* ── SOCIAL LINKS ── */}
               {activeCategory === 'SOCIAL' && (
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Social & Links</h3>
                       <p className="text-muted-foreground text-sm font-medium italic">Map your digital footprint across external platforms.</p>
                    </div>
                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardContent className="p-10 space-y-8">
                          {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin'].map(social => (
                             <div key={social} className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1 capitalize">{social} URL</Label>
                                <Input {...register(`socialLinks.${social as any}` as any)} className="rounded-2xl h-14 font-bold border-2 focus:border-primary pl-6" />
                             </div>
                          ))}
                       </CardContent>
                    </Card>
                 </div>
               )}

               {/* ── LAYOUT SETTINGS ── */}
               {activeCategory === 'LAYOUT' && (
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Global Layout</h3>
                       <p className="text-muted-foreground text-sm font-medium italic">Adjust the spatial architecture of your frontend templates.</p>
                    </div>
                    <Card className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                       <CardContent className="p-10 space-y-10">
                          <div className="grid grid-cols-3 gap-10">
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Hero Viewport (px)</Label>
                                <Input type="number" {...register("dimensions.heroHeight")} className="rounded-2xl h-16 font-black text-xl text-center bg-[#f5f5f5] border-none" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Max Container</Label>
                                <Input type="number" {...register("dimensions.containerWidth")} className="rounded-2xl h-16 font-black text-xl text-center bg-[#f5f5f5] border-none" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Section Gap</Label>
                                <Input type="number" {...register("dimensions.sectionSpacing")} className="rounded-2xl h-16 font-black text-xl text-center bg-[#f5f5f5] border-none" />
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
               )}

            </div>
        </div>
      </div>
    </div>
  );
}
