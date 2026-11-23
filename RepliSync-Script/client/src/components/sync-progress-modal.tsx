import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ReplitProject } from "@shared/schema";

interface SyncProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ReplitProject[];
  isPending: boolean;
  isComplete: boolean;
}

export function SyncProgressModal({ open, onOpenChange, projects, isPending, isComplete }: SyncProgressModalProps) {
  const syncedCount = projects.filter(p => p.syncStatus === "synced").length;
  const errorCount = projects.filter(p => p.syncStatus === "error").length;
  const progress = isComplete ? 100 : (isPending ? 50 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-sync-progress">
        <DialogHeader>
          <DialogTitle>
            {isComplete ? "Sync Complete" : "Syncing to GitHub"}
          </DialogTitle>
          <DialogDescription>
            {isPending
              ? "Your projects are being synced to GitHub..."
              : isComplete
              ? `Successfully synced ${syncedCount} of ${projects.length} project${projects.length !== 1 ? "s" : ""} to GitHub.`
              : "Preparing to sync..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" data-testid="progress-sync" />

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                data-testid={`sync-item-${project.id}`}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                ) : isComplete && project.syncStatus === "synced" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : isComplete && project.syncStatus === "error" ? (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                ) : (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                )}
                <span className="text-sm truncate flex-1">{project.name}</span>
                {isComplete && (
                  <span className={`text-xs ${project.syncStatus === "synced" ? "text-green-600" : project.syncStatus === "error" ? "text-red-600" : "text-muted-foreground"}`}>
                    {project.syncStatus === "synced" ? "Synced" : project.syncStatus === "error" ? "Failed" : "Pending"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isComplete && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} data-testid="button-close-modal">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
