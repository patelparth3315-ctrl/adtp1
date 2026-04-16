import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Save, RefreshCw, Check, Type, Palette, Layout, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings.service';

export default function ThemePage() {
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#fbbf24');
  const [borderRadius, setBorderRadius] = useState([20]);
  const [primaryFont, setPrimaryFont] = useState('Inter');
  const [heroHeight, setHeroHeight] = useState(650);
  const [containerWidth, setContainerWidth] = useState(1280);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.get().then(data => {
      if (data?.theme) {
        setPrimaryColor(data.theme.primaryColor || '#000000');
        setAccentColor(data.theme.accentColor || '#fbbf24');
        setBorderRadius([data.theme.borderRadius || 20]);
        setPrimaryFont(data.theme.primaryFont || 'Inter');
      }
      if (data?.dimensions) {
        setHeroHeight(data.dimensions.heroHeight || 650);
        setContainerWidth(data.dimensions.containerWidth || 1280);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await settingsService.update({
        theme: {
          primaryColor,
          accentColor,
          borderRadius: borderRadius[0],
          primaryFont
        },
        dimensions: {
          heroHeight,
          containerWidth
        }
      });
      toast.success("Design System updated and saved successfully");
    } catch (err) {
      toast.error("Failed to save theme settings");
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">Design System</h1>
            <p className="text-muted-foreground font-medium">Full control over the website's visual DNA.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl h-12">
               <RefreshCw className="w-4 h-4 mr-2" />
               Reset
            </Button>
            <Button onClick={handleSave} className="rounded-2xl h-12 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
               <Save className="w-4 h-4 mr-2" />
               Publish Changes
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-[40px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Colors */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Color Palette</h2>
             </div>
             <div className="grid grid-cols-2 gap-6 bg-card p-8 rounded-[32px] border-2 border-border shadow-sm">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Brand Color</Label>
                   <div className="flex gap-3">
                      <Input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent border-none"
                      />
                      <Input 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="font-black uppercase text-xs tracking-widest rounded-xl border-2"
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accent / Action Color</Label>
                   <div className="flex gap-3">
                      <Input 
                        type="color" 
                        value={accentColor} 
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent border-none"
                      />
                      <Input 
                        value={accentColor} 
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="font-black uppercase text-xs tracking-widest rounded-xl border-2"
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Layout & Dimensions */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Layout & Dimensions</h2>
             </div>
             <div className="bg-card p-10 rounded-[32px] border-2 border-border space-y-8 shadow-sm">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Hero Height: {heroHeight}px</Label>
                   </div>
                   <Slider value={[heroHeight]} onValueChange={(v) => setHeroHeight(v[0])} min={400} max={900} step={10} />
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Container Max Width: {containerWidth}px</Label>
                   </div>
                   <Slider value={[containerWidth]} onValueChange={(v) => setContainerWidth(v[0])} min={1000} max={1600} step={20} />
                </div>
             </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-primary" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Typography</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Outfit', 'Space Grotesk'].map(font => (
                  <div 
                    key={font}
                    onClick={() => setPrimaryFont(font)}
                    className={`
                      p-6 rounded-2xl border-2 transition-all cursor-pointer bg-card
                      ${primaryFont === font ? 'border-primary shadow-lg' : 'border-border hover:border-gray-300'}
                    `}
                    style={{ fontFamily: font }}
                  >
                     <p className="text-2xl font-black mb-1">Aa</p>
                     <p className="text-[10px] font-black uppercase tracking-widest">{font}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Border Radius */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Global Radius: {borderRadius}px</h2>
             </div>
             <div className="bg-card p-10 rounded-[32px] border-2 border-border space-y-8">
                <Slider 
                  value={borderRadius} 
                  onValueChange={setBorderRadius} 
                  max={50} 
                  step={2} 
                  className="py-4"
                />
                <div className="flex gap-4">
                   <div className="w-20 h-20 bg-muted border-2 border-border" style={{ borderRadius: `${borderRadius}px` }} />
                   <div className="w-40 h-20 bg-primary/10 border-2 border-primary" style={{ borderRadius: `${borderRadius}px` }}>
                      <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-primary">SAMPLE CARD</div>
                   </div>
                </div>
             </div>
          </section>

        </div>

        {/* Right Column: Mini Preview */}
        <div className="lg:col-span-5 relative">
           <div className="sticky top-10 space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Instant Preview</h2>
              <div 
                className="bg-white rounded-[40px] shadow-2xl border-2 border-gray-100 overflow-hidden flex flex-col h-[700px]"
                style={{ fontFamily: primaryFont }}
              >
                  {/* Mock Navbar */}
                  <div className="p-6 border-b flex items-center justify-between">
                     <div className="font-black text-xl italic tracking-tighter" style={{ color: primaryColor }}>YouthCamping</div>
                     <div className="flex gap-4">
                        <div className="w-6 h-1 bg-gray-200" />
                        <div className="w-6 h-1 bg-gray-200" />
                     </div>
                  </div>

                  {/* Mock Hero */}
                  <div className="flex-1 p-8 space-y-6 flex flex-col justify-center text-center">
                      <h3 className="text-4xl font-black leading-tight uppercase tracking-tighter" style={{ color: primaryColor }}>
                        One Trip at a time
                      </h3>
                      <p className="text-gray-500 font-medium">Explore the wilderness with high-end luxury.</p>
                      <button 
                        className={`font-black uppercase text-xs tracking-widest py-4 px-8 self-center transition-all`}
                        style={{ 
                          backgroundColor: accentColor, 
                          color: '#000',
                          borderRadius: `${borderRadius}px`,
                          boxShadow: `0 20px 40px ${accentColor}33`
                        }}
                      >
                        Book Adventure
                      </button>
                  </div>

                  {/* Mock Cards */}
                  <div className="p-8 grid grid-cols-2 gap-4 bg-gray-50">
                     {[...Array(2)].map((_, i) => (
                       <div key={i} className="bg-white p-4 shadow-sm border border-gray-100" style={{ borderRadius: `${borderRadius}px` }}>
                          <div className="aspect-square bg-gray-100 mb-3 rounded-xl" />
                          <div className="h-2 w-full bg-gray-200 rounded-full" />
                       </div>
                     ))}
                  </div>
              </div>
              <div className="flex justify-center gap-4">
                 <Monitor className="w-5 h-5 text-primary" />
                 <Smartphone className="w-5 h-5 text-gray-300" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
