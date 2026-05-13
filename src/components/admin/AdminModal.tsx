import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function AdminModal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  footer,
  maxWidth = "max-w-2xl"
}: AdminModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, "flex flex-col p-0 gap-0")}>
        <DialogHeader className="px-8 py-6 border-b bg-white shrink-0 items-start text-left space-y-1">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-custom">
          {children}
        </div>

        {footer && (
          <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 shrink-0 flex items-center justify-between sm:justify-between w-full">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
