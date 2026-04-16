import { useState, useEffect } from "react";
import { settingsService } from "@/services/settings.service";
import type { SiteSettings } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Globe, Facebook, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.get()
      .then(setSettings)
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateSocial = (key: keyof SiteSettings["socialLinks"], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [key]: value }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Configuration...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground font-medium">Manage global platform identity and contact information.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-2xl h-12 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? "Publishing..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="rounded-[32px] border-2 border-border bg-card p-10 shadow-sm space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" /> General Configuration
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company Name</Label>
                <Input value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className="rounded-xl border-2 font-bold" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Email</Label>
                <Input type="email" value={settings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="rounded-xl border-2 font-bold" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Phone</Label>
                <Input value={settings.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="rounded-xl border-2 font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Office Address</Label>
                <Input value={settings.address} onChange={(e) => update("address", e.target.value)} className="rounded-xl border-2 font-bold" />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border-2 border-border bg-card p-10 shadow-sm space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">Payment & Currency</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Currency</Label>
                <Select value={settings.currency} onValueChange={(v) => update("currency", v)}>
                  <SelectTrigger className="rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-[10px] text-muted-foreground font-medium italic mt-8">More currencies coming soon.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border-2 border-border bg-card p-10 shadow-sm space-y-8 h-fit">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">Social Identity</h2>
          <p className="text-sm text-muted-foreground font-medium">Links used in website footer and contact sections.</p>
          
          <div className="space-y-6">
            <SocialInput icon={<Facebook className="w-4 h-4" />} label="Facebook" value={settings.socialLinks.facebook} onChange={(v) => updateSocial("facebook", v)} />
            <SocialInput icon={<Instagram className="w-4 h-4" />} label="Instagram" value={settings.socialLinks.instagram} onChange={(v) => updateSocial("instagram", v)} />
            <SocialInput icon={<Youtube className="w-4 h-4" />} label="YouTube" value={settings.socialLinks.youtube} onChange={(v) => updateSocial("youtube", v)} />
            <SocialInput icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" value={settings.socialLinks.linkedin} onChange={(v) => updateSocial("linkedin", v)} />
            <SocialInput icon={<Twitter className="w-4 h-4" />} label="Twitter" value={settings.socialLinks.twitter} onChange={(v) => updateSocial("twitter", v)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialInput({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-muted p-1.5 rounded-lg">{icon}</div>
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`https://${label.toLowerCase()}.com/...`} className="rounded-xl border-2 text-xs font-medium" />
    </div>
  );
}
