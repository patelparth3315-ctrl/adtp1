import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, HelpCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function InquiryFormPage() {
  const [triggerPopup, setTriggerPopup] = useState('yes');
  const [delay, setDelay] = useState(15);
  const [cooldown, setCooldown] = useState(900);

  const handleSave = () => {
    toast.success("Inquiry Form settings updated");
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight">Inquiry Form</h1>
            <p className="text-muted-foreground font-medium text-sm">Configure automated lead generation and popup triggers.</p>
         </div>
         <Button onClick={handleSave} className="rounded-xl h-11 px-6 font-black uppercase text-xs">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
         </Button>
      </div>

      <div className="bg-card border-2 border-border rounded-[32px] overflow-hidden">
         <div className="p-8 border-b bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <MessageSquare className="w-5 h-5 text-primary" />
               <h2 className="font-bold text-lg uppercase tracking-tight">Trigger Settings</h2>
            </div>
            <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full">NEW</span>
         </div>
         
         <div className="p-10 space-y-10">
            {/* Trigger Popup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
               <div className="space-y-1">
                  <Label className="text-sm font-bold">Trigger popup automatically?</Label>
                  <p className="text-xs text-muted-foreground">Decide if the form should open without user interaction.</p>
               </div>
               <div className="md:col-span-2">
                  <RadioGroup value={triggerPopup} onValueChange={setTriggerPopup} className="flex flex-col gap-3">
                     <div className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${triggerPopup === 'no' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setTriggerPopup('no')}>
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="font-bold cursor-pointer">No, don't trigger the inquiry-form automatically</Label>
                     </div>
                     <div className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${triggerPopup === 'yes' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setTriggerPopup('yes')}>
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="font-bold cursor-pointer">Yes, trigger the inquiry-form automatically after a short delay</Label>
                     </div>
                  </RadioGroup>
               </div>
            </div>

            {/* Delay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-t pt-10">
               <div className="space-y-1">
                  <Label className="text-sm font-bold">Trigger delay</Label>
                  <p className="text-xs text-muted-foreground">Seconds to wait after page load.</p>
               </div>
               <div className="md:col-span-2 flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={delay} 
                    onChange={(e) => setDelay(parseInt(e.target.value))}
                    className="w-24 h-12 rounded-xl border-2 font-bold"
                  />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">seconds</span>
               </div>
            </div>

            {/* Cooldown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-t pt-10">
               <div className="space-y-1">
                  <Label className="text-sm font-bold">Trigger cooldown period</Label>
                  <p className="text-xs text-muted-foreground">Avoid re-triggering for this amount of time.</p>
               </div>
               <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-4">
                     <Input 
                        type="number" 
                        value={cooldown} 
                        onChange={(e) => setCooldown(parseInt(e.target.value))}
                        className="w-24 h-12 rounded-xl border-2 font-bold"
                     />
                     <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">seconds</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                     <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                     <p className="text-xs text-blue-700 leading-relaxed">
                        Once an inquiry form/popup has been automatically triggered, it won't be triggered again for these many seconds. <strong>Highly recommended</strong> to keep a reasonably large value (e.g. 600+) so as not to irritate users with frequent popups.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
