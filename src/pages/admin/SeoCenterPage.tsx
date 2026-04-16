import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, Globe, ChevronRight, Search, 
  BarChart3, Settings, ShieldCheck, 
  ChevronDown, ChevronUp, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export default function SeoCenterPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [schemaEnabled, setSchemaEnabled] = useState(true);

  const handleSave = () => {
    toast.success("SEO settings published");
  };

  const sections = [
    { id: 'org', title: 'Organization', desc: 'Auto-generated from your business profile' },
    { id: 'web', title: 'WebSite', desc: 'Auto-generated from your business name and domain' },
    { id: 'local', title: 'Local Business', desc: 'Auto-generated from your office address sections' },
    { id: 'bread', title: 'Breadcrumbs', desc: 'Navigation breadcrumbs and BreadcrumbList schema' },
  ];

  const tabs = [
    { id: 'global', name: 'Global Settings', icon: Settings },
    { id: 'pages', name: 'Pages', icon: Globe },
    { id: 'redirects', name: 'Redirects', icon: RefreshCw },
    { id: 'console', name: 'Search Console', icon: Search },
  ];

  return (
    <div className="flex gap-10">
      {/* Sidebar Nav for SEO Center */}
      <div className="w-64 space-y-1">
         {tabs.map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
           >
              <tab.icon className="w-4 h-4" />
              {tab.name}
           </button>
         ))}
      </div>

      <div className="flex-1 space-y-8 pb-20">
        <div className="bg-card border-2 border-border rounded-[40px] overflow-hidden shadow-sm">
           <div className="p-8 border-b bg-muted/10 flex items-center justify-between">
              <div className="flex flex-col">
                 <h2 className="font-black uppercase tracking-tight text-xl">SEO Center &gt; Global Settings</h2>
                 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Configure site-wide metadata and search engine optimization.</p>
              </div>
              <Button onClick={handleSave} className="rounded-2xl h-11 px-8 font-black uppercase text-xs">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
           </div>

           <div className="p-10 space-y-12">
              {/* Schema Markup */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        Schema Markup <span className="text-[10px] font-medium text-muted-foreground normal-case font-sans">Enable structured data (schema.org) across your website</span>
                      </h3>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                    <Switch checked={schemaEnabled} onCheckedChange={setSchemaEnabled} />
                    <Label className="font-bold cursor-pointer">Enable schema markup</Label>
                 </div>

                 <div className="space-y-3">
                    {sections.map(s => (
                      <div key={s.id} className="p-6 border-b flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors">
                         <div className="flex items-center gap-4">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            <div className="space-y-0.5">
                               <p className="font-black uppercase tracking-tight text-base">{s.title}</p>
                               <p className="text-xs text-muted-foreground italic font-medium">{s.desc}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* robots.txt */}
              <section className="space-y-4 pt-8 border-t">
                 <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">robots.txt</h3>
                    <p className="text-xs text-muted-foreground">Additional content appended to the auto-generated robots.txt</p>
                 </div>
                 <Textarea 
                   className="h-48 rounded-2xl border-2 border-border font-mono text-sm p-6 bg-muted/5 focus:bg-white transition-colors"
                   placeholder="# Add your custom robots rules here..."
                 />
                 <p className="text-[10px] text-muted-foreground font-medium italic">The default robots.txt content required for the website platform cannot be removed. Any content you add here will be appended to it.</p>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}
