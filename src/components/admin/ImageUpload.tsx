import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import api from "@/services/api";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  value?: string;
}

export function ImageUpload({ onUpload, label, value }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onUpload(res.data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">{label}</Label>}
      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            id={`file-upload-${label || 'img'}`} 
            disabled={uploading}
          />
          <Label 
            htmlFor={`file-upload-${label || 'img'}`}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border-2 border-primary/10 bg-primary/5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {uploading ? "Uploading..." : "Choose Image"}
          </Label>
          <div className="flex gap-2">
            <Input 
              value={value || ""} 
              onChange={(e) => onUpload(e.target.value)}
              placeholder="Or paste URL here..."
              className="h-8 text-[10px] rounded-lg border-none bg-muted/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
