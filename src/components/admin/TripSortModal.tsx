import React, { useState, useEffect } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GripVertical, MapPin, Loader2, Save } from "lucide-react";
import type { Trip } from "@/types";
import { tripsService } from "@/services/trips.service";
import { toast } from "sonner";

interface TripSortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trips: Trip[];
  onSaved: () => void;
}

export default function TripSortModal({ open, onOpenChange, trips, onSaved }: TripSortModalProps) {
  const [items, setItems] = useState<Trip[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Sort initial items by current order
      setItems([...trips].sort((a, b) => (a.order || 999) - (b.order || 999)));
    }
  }, [open, trips]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const orderMap: Record<string, number> = {};
      items.forEach((trip, index) => {
        orderMap[trip.id] = index + 1; // 1-based ordering
      });
      
      await tripsService.bulkUpdateOrder(orderMap);
      toast.success("Trips sequence saved successfully");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save trips sequence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Arrange Trips Manually</DialogTitle>
          <DialogDescription>
            Drag and drop trips to change their display order on the website.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="trips-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2 max-h-[60vh] overflow-y-auto px-1"
                >
                  {items.map((trip, index) => (
                    <Draggable key={trip.id} draggableId={trip.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-3 bg-card border rounded-xl shadow-sm transition-shadow ${
                            snapshot.isDragging ? "shadow-lg border-primary ring-1 ring-primary/20 bg-accent" : "hover:border-primary/30"
                          }`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 flex items-center gap-3">
                            {trip.heroImage && (
                              <img 
                                src={trip.heroImage} 
                                alt="" 
                                className="h-10 w-14 rounded-lg object-cover bg-muted" 
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate text-foreground">
                                {trip.title}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{trip.location}</span>
                                <span className="mx-1">•</span>
                                <span className="text-primary font-bold">{trip.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20">
                            <span className="text-xs font-black text-primary">{index + 1}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Sequence
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
