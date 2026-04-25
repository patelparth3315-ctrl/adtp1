import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import api from "@/services/api";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  value?: string;
  multiple?: boolean;
}

export function ImageUpload({ onUpload, label, value, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [id] = useState(() => Math.random().toString(36).substring(7));

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (multiple) {
       const formData = new FormData();
       for (let i = 0; i < files.length; i++) {
         if (files[i].size > 5 * 1024 * 1024) {
           alert(`File ${files[i].name} exceeds 5MB limit`);
           continue;
         }
         formData.append("images", files[i]);
       }
       
       setUploading(true);
       try {
          const res = await api.post("/upload/multiple", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
            }
          });
          if (res.data.success) {
            res.data.urls.forEach((url: string) => onUpload(url));
          }
       } catch (err) {
         console.error("Upload failed:", err);
         alert("Upload failed. Please try again.");
       } finally {
         setUploading(false);
         setProgress(0);
       }
    } else {
       const file = files[0];
       if (file.size > 5 * 1024 * 1024) {
         alert("File size exceeds 5MB limit");
         return;
       }
       const formData = new FormData();
       formData.append("image", file);
       
       setUploading(true);
       try {
         const res = await api.post("/upload/single", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
            }
         });
         if (res.data.success) {
           onUpload(res.data.url);
         }
       } catch (err) {
         console.error("Upload failed:", err);
         alert("Upload failed. Please try again.");
       } finally {
         setUploading(false);
         setProgress(0);
       }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [multiple]);

  const formatUrl = (url: string | undefined) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const apiBase = api.defaults.baseURL || "http://localhost:8888/api";
    const serverBase = apiBase.split('/api')[0];
    return `${serverBase}${url}`;
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">{label}</Label>}
      
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed transition-all ${
          isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-primary/20 bg-muted/50 hover:bg-muted"
        }`}
      >
        {value && !multiple ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5">
            <img src={formatUrl(value)} className="w-full h-full object-contain" alt="Uploaded preview" />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onUpload("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Drag & drop your {multiple ? 'images' : 'image'} here</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                JPG, PNG, WEBP • Max 5MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 p-6">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <div className="w-full max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2">{progress}% Uploaded</p>
          </div>
        )}

        <div className="flex w-full gap-2 items-center justify-center mt-2">
          <Input 
            type="file" 
            accept="image/png, image/jpeg, image/webp" 
            multiple={multiple}
            onChange={handleFileChange} 
            className="hidden" 
            id={`file-upload-${id}`} 
            disabled={uploading}
          />
          <Label 
            htmlFor={`file-upload-${id}`}
            className="flex items-center justify-center px-6 h-10 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
          >
            Browse Files
          </Label>
        </div>
      </div>
      
    </div>
  );
}
