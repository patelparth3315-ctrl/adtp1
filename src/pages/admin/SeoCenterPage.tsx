import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, Globe, ChevronRight, Search, 
  Settings, ShieldCheck, RefreshCw,
  Loader2, HelpCircle, Trash2, Plus,
  FileText, Link2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings.service';
import { pagesService } from '@/services/pages.service';

export default function SeoCenterPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [settings, setSettings] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect form state
  const [newRedirect, setNewRedirect] = useState({ from: '', to: '', type: '301' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [sData, pData] = await Promise.all([
        settingsService.get(),
        pagesService.getAll()
      ]);
      setSettings(sData || {});
      setPages(pData.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success("SEO configurations synchronized");
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Initializing Engine...</p>
        </div>
      </div>
    );
  }

  const seoSettings = settings?.seo || { 
    metaTitle: "", 
    metaDescription: "", 
    ogImage: "",
    googleAnalyticsId: "",
    googleSearchConsoleId: "",
    schemaEnabled: true, 
    robotsTxt: "",
    redirects: []
  };

  const updateSeo = (key: string, value: any) => {
    setSettings({
      ...settings,
      seo: {
        ...seoSettings,
        [key]: value
      }
    });
  };

  const addRedirect = () => {
    if (!newRedirect.from || !newRedirect.to) {
      toast.error("Please fill both paths");
      return;
    }
    const redirects = [...(seoSettings.redirects || []), newRedirect];
    updateSeo('redirects', redirects);
    setNewRedirect({ from: '', to: '', type: '301' });
    toast.success("Redirect added to stack");
  };

  const removeRedirect = (index: number) => {
    const redirects = seoSettings.redirects.filter((_: any, i: number) => i !== index);
    updateSeo('redirects', redirects);
  };

  const sections = [
    { id: 'org', title: 'Organization', desc: 'Auto-generated from your business profile' },
    { id: 'web', title: 'WebSite', desc: 'Auto-generated from your business name and domain' },
    { id: 'local', title: 'Local Business', desc: 'Auto-generated from your office address sections' },
    { id: 'bread', title: 'Breadcrumbs', desc: 'Navigation breadcrumbs and BreadcrumbList schema' },
  ];

  const tabs = [
    { id: 'global', name: 'Global Settings', icon: Settings },
    { id: 'pages', name: 'Pages SEO', icon: FileText },
    { id: 'redirects', name: 'Redirects', icon: RefreshCw },
    { id: 'console', name: 'Search Console', icon: Search },
  ];

  return (
    <div className="flex gap-10 animate-fade-in">
      {/* Sidebar Nav */}
      <div className="w-64 space-y-2">
         <div className="px-6 py-8">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">SEO<br/><span className="text-primary">CENTER</span></h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Live Synchronization</p>
            </div>
         </div>
         <div className="space-y-1">
           {tabs.map(tab => (
             <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 group ${activeTab === tab.id ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted'}`}
             >
                <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-black' : 'text-primary'}`} />
                {tab.name}
             </button>
           ))}
         </div>
      </div>

      <div className="flex-1 space-y-8 pb-20">
        <div className="bg-card border-2 border-border rounded-[48px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all">
           <div className="p-10 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex flex-col">
                 <h2 className="font-black uppercase tracking-tighter text-2xl">
                   {tabs.find(t => t.id === activeTab)?.name}
                 </h2>
                 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">Precision Control • Site Performance • Search Dominance</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-transform">
                {saving ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Save className="w-4 h-4 mr-3" />}
                {saving ? "Synchronizing..." : "Push Changes"}
              </Button>
           </div>

           <div className="p-10 space-y-12">
              {activeTab === 'global' && (
                <>
                  <section className="space-y-8">
                     <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" /> General Metadata
                     </h3>
                     <div className="grid gap-8">
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Global Site Title</Label>
                           <Input 
                              value={seoSettings.metaTitle} 
                              onChange={(e) => updateSeo('metaTitle', e.target.value)}
                              className="rounded-[20px] h-14 border-2 font-black text-lg focus:border-primary pl-6 shadow-sm"
                              placeholder="e.g. YouthCamping | Adventure Awaits"
                           />
                           <div className="flex justify-between px-2">
                              <p className="text-[9px] font-black text-primary uppercase">{seoSettings.metaTitle?.length || 0} / 60 CHARS</p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">Ideal for Google Search</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Global Meta Description</Label>
                           <Textarea 
                              value={seoSettings.metaDescription} 
                              onChange={(e) => updateSeo('metaDescription', e.target.value)}
                              className="rounded-[24px] min-h-[140px] border-2 font-medium focus:border-primary p-6 text-sm leading-relaxed shadow-sm"
                              placeholder="Describe your mission and services..."
                           />
                           <div className="flex justify-between px-2">
                              <p className="text-[9px] font-black text-primary uppercase">{seoSettings.metaDescription?.length || 0} / 160 CHARS</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Master OG Image (1200x630)</Label>
                           <div className="flex gap-6">
                              <Input 
                                 value={seoSettings.ogImage} 
                                 onChange={(e) => updateSeo('ogImage', e.target.value)}
                                 className="rounded-[20px] h-14 border-2 font-medium focus:border-primary flex-1 pl-6 shadow-sm"
                                 placeholder="https://assets.youthcamping.in/social-banner.jpg"
                              />
                              {seoSettings.ogImage && (
                                 <div className="h-14 w-24 rounded-2xl overflow-hidden border-2 bg-muted shadow-lg">
                                    <img src={seoSettings.ogImage} className="w-full h-full object-cover" />
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-8 pt-12 border-t-2 border-dashed border-muted/50">
                     <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Technical Core
                     </h3>
                     <div className="flex items-center space-x-6 p-8 bg-primary/5 rounded-[32px] border-2 border-primary/10 transition-all">
                        <Switch 
                          checked={seoSettings.schemaEnabled} 
                          onCheckedChange={(v) => updateSeo('schemaEnabled', v)} 
                        />
                        <div className="flex flex-col">
                           <Label className="font-black text-sm uppercase tracking-tight cursor-pointer">JSON-LD Structured Data</Label>
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">Enabled: Rich results active on SERP</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.map(s => (
                          <div key={s.id} className="p-6 border-2 border-border/50 rounded-3xl flex items-center justify-between group hover:border-primary/50 hover:bg-muted/30 transition-all cursor-default">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/20 transition-colors">
                                   <Globe className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                   <p className="font-black uppercase tracking-tight text-sm">{s.title}</p>
                                   <p className="text-[10px] text-muted-foreground font-medium italic">{s.desc}</p>
                                </div>
                             </div>
                             <div className="px-4 py-1.5 bg-green-500/10 text-green-600 text-[8px] font-black uppercase rounded-full shadow-sm">Active</div>
                          </div>
                        ))}
                     </div>
                  </section>
                </>
              )}

              {activeTab === 'pages' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                         <FileText className="w-5 h-5 text-primary" /> Page Visibility Index
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{pages.length} Pages Tracked</span>
                   </div>
                   <div className="grid gap-4">
                      {pages.map((page: any) => (
                        <div key={page.id} className="p-6 border-2 border-border/50 rounded-[32px] flex items-center justify-between group hover:border-primary/50 transition-all bg-muted/5">
                           <div className="flex items-center gap-6">
                              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-black transition-colors uppercase">
                                {page.slug === 'home' || page.slug === '/' ? 'HP' : page.slug.substring(0, 2)}
                              </div>
                              <div>
                                 <h4 className="font-black uppercase text-sm tracking-tight">{page.title}</h4>
                                 <p className="text-[10px] text-muted-foreground font-mono mt-1">/{page.slug}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-10">
                              <div className="flex flex-col text-right">
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40">SEO Title</span>
                                 <span className={`text-[11px] font-bold ${page.seo?.title ? 'text-green-500' : 'text-red-500 italic'}`}>
                                   {page.seo?.title ? 'OPTIMIZED' : 'MISSING'}
                                 </span>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => window.open(`/admin/pages/${page._id}`, '_blank')} className="rounded-xl h-10 px-6 text-[10px] font-black uppercase border-2">
                                Edit Meta <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'redirects' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                   <div className="bg-primary/5 p-10 rounded-[40px] border-2 border-primary/10 space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Add Intelligent Redirect</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Handle 404s and legacy URL migrations</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                         <div className="md:col-span-4 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Source Path (From)</Label>
                            <Input 
                              value={newRedirect.from} 
                              onChange={(e) => setNewRedirect({...newRedirect, from: e.target.value})}
                              placeholder="/old-path" 
                              className="h-14 rounded-2xl border-2 font-mono text-sm bg-white" 
                            />
                         </div>
                         <div className="md:col-span-1 flex items-center justify-center pb-4 text-primary">
                            <ChevronRight className="w-6 h-6" />
                         </div>
                         <div className="md:col-span-4 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Destination (To)</Label>
                            <Input 
                              value={newRedirect.to} 
                              onChange={(e) => setNewRedirect({...newRedirect, to: e.target.value})}
                              placeholder="/new-path" 
                              className="h-14 rounded-2xl border-2 font-mono text-sm bg-white" 
                            />
                         </div>
                         <div className="md:col-span-3">
                            <Button onClick={addRedirect} className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                              <Plus className="w-4 h-4 mr-2" /> Inject
                            </Button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-6">
                        <h3 className="text-sm font-black uppercase tracking-widest">Active Redirect Registry</h3>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{seoSettings.redirects?.length || 0} Routes</span>
                      </div>
                      <div className="grid gap-3">
                         {seoSettings.redirects?.map((r: any, idx: number) => (
                           <div key={idx} className="p-6 border-2 border-border/50 rounded-[32px] flex items-center justify-between group hover:bg-muted/10 transition-all bg-card">
                              <div className="flex items-center gap-6">
                                 <div className="p-3 bg-muted rounded-2xl font-black text-[10px] text-primary">301</div>
                                 <div className="flex items-center gap-4">
                                    <code className="text-xs font-bold bg-muted/50 px-3 py-1 rounded-lg text-muted-foreground">{r.from}</code>
                                    <ChevronRight className="w-4 h-4 opacity-30" />
                                    <code className="text-xs font-black px-3 py-1 rounded-lg text-primary">{r.to}</code>
                                 </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeRedirect(idx)} className="text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                         ))}
                         {(!seoSettings.redirects || seoSettings.redirects.length === 0) && (
                           <div className="py-20 text-center border-2 border-dashed rounded-[40px] opacity-20">
                              <p className="text-xs font-black uppercase tracking-[0.3em]">Registry Empty</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'console' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                               <Search className="w-5 h-5 text-primary" /> Google Console
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Verification and sitemap management</p>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">HTML Meta Tag Verification</Label>
                            <Input 
                              value={seoSettings.googleSearchConsoleId} 
                              onChange={(e) => updateSeo('googleSearchConsoleId', e.target.value)}
                              className="h-14 rounded-2xl border-2 font-mono text-xs focus:border-primary pl-6 shadow-sm" 
                              placeholder="e.g. string from google-site-verification content" 
                            />
                            <p className="text-[9px] text-muted-foreground px-2">Copy only the content within the double quotes of your meta tag.</p>
                         </div>
                         <div className="p-6 bg-blue-500/5 border-2 border-blue-500/10 rounded-3xl flex items-start gap-4">
                            <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                               Claim your domain on <a href="https://search.google.com/search-console" target="_blank" className="font-black underline">Search Console</a> to monitor indexing, keyword rankings, and technical errors.
                            </p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                               <Link2 className="w-5 h-5 text-primary" /> Tracking IDs
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Visitor analytics and conversions</p>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Google Analytics ID (G-XXXXX)</Label>
                            <Input 
                              value={seoSettings.googleAnalyticsId} 
                              onChange={(e) => updateSeo('googleAnalyticsId', e.target.value)}
                              className="h-14 rounded-2xl border-2 font-black text-lg focus:border-primary pl-6 shadow-sm" 
                              placeholder="G-IDXXXXXXXX" 
                            />
                         </div>
                      </div>
                   </div>

                   <section className="space-y-6 pt-12 border-t-2 border-dashed border-muted/50">
                      <div className="space-y-1">
                         <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 text-primary" /> Crawl Engine Rules
                         </h3>
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Append custom instructions for search bots</p>
                      </div>
                      <div className="relative group">
                         <Textarea 
                           value={seoSettings.robotsTxt}
                           onChange={(e) => updateSeo('robotsTxt', e.target.value)}
                           className="h-64 rounded-[40px] border-2 border-border font-mono text-xs p-10 bg-muted/5 focus:bg-white transition-all shadow-inner leading-relaxed"
                           placeholder="# Custom Crawl Rules&#10;User-agent: *&#10;Disallow: /admin/"
                        />
                        <div className="absolute top-6 right-6 p-3 bg-muted rounded-2xl opacity-40">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                   </section>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
