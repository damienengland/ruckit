"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { FormationPositionInput } from "@/lib/formations";

type Formation = {
  id: string;
  name: string;
  created_at: string;
};

type FormationsDialogProps = {
  currentPositions?: FormationPositionInput[];
  onLoadFormation?: (
    positions: FormationPositionInput[],
    formation: Formation,
  ) => void;
  buttonClassName?: string;
};

export function FormationsDialog({
  currentPositions = [],
  onLoadFormation,
  buttonClassName,
}: FormationsDialogProps) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadFormations = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from("formations")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setIsLoading(false);
      return;
    }

    setFormations(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    loadFormations();
  }, [open]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Add a formation name before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data: formation, error: saveError } = await supabase
      .from("formations")
      .insert({ name: trimmedName })
      .select("id, name, created_at")
      .single();

    if (saveError || !formation) {
      setError(saveError?.message ?? "Could not save formation.");
      setIsSaving(false);
      return;
    }

    if (currentPositions.length > 0) {
      const { error: positionsError } = await supabase
        .from("formation_positions")
        .insert(
          currentPositions.map((position) => ({
            formation_id: formation.id,
            jersey_number: position.jerseyNumber,
            x: position.x,
            y: position.y,
          })),
        );

      if (positionsError) {
        setError(positionsError.message);
        setIsSaving(false);
        return;
      }
    }

    setName("");
    setFormations((prev) => [formation, ...prev]);
    setIsSaving(false);
  };

  const handleLoad = async (formation: Formation) => {
    setError(null);
    const { data, error: loadError } = await supabase
      .from("formation_positions")
      .select("jersey_number, x, y")
      .eq("formation_id", formation.id);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    const positions = (data ?? []).map((position) => ({
      jerseyNumber: position.jersey_number,
      x: position.x,
      y: position.y,
    }));

    onLoadFormation?.(positions, formation);
    toast.success(`Formation "${formation.name}" loaded`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-10 rounded-full border-2 shadow-md active:scale-[0.97]",
            "focus:outline-none focus:ring-0 focus-visible:ring-0",
            "active:outline-none active:ring-0",
            buttonClassName,
          )}
          title="Formations"
        >
          <Map className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Formations</DialogTitle>
          <DialogDescription>
            Save the current layout or load a stored formation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Saved formations</div>
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading formations
                </div>
              ) : formations.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No formations saved yet.
                </div>
              ) : (
                formations.map((formation) => (
                  <div
                    key={formation.id}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {formation.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(formation.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLoad(formation)}
                    >
                      Load
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Save current formation</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Formation name"
              />
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
            {currentPositions.length === 0 && (
              <div className="text-xs text-muted-foreground">
                No position data was provided for this save.
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
