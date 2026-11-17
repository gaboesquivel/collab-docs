"use client";

import { CheckIcon, CloudOffIcon, Loader2Icon } from "lucide-react";

import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";

import type { SaveStatus as Status } from "./use-autosave";

export const SaveStatus = ({
  status,
  onRetry,
}: {
  status: Status;
  onRetry: () => void;
}) => {
  switch (status.kind) {
    case "saving": {
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2Icon className="size-3.5 animate-spin" />
          Saving…
        </span>
      );
    }
    case "unsaved": {
      return <span className="text-muted-foreground text-sm">Edited</span>;
    }
    case "error": {
      return (
        <span className="text-destructive flex items-center gap-2 text-sm">
          <CloudOffIcon className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">{status.message}</span>
          <span className="sm:hidden">Not saved</span>
          <Button onClick={onRetry} size="xs" variant="outline">
            Retry
          </Button>
        </span>
      );
    }
    case "conflict": {
      return <span className="text-destructive text-sm">Not saved</span>;
    }
    default: {
      return (
        <span
          aria-live="polite"
          className="text-muted-foreground flex items-center gap-1.5 text-sm"
        >
          <CheckIcon className="size-3.5" />
          {status.at ? (
            <span>
              Saved <LocalTime date={status.at} />
            </span>
          ) : (
            "Saved"
          )}
        </span>
      );
    }
  }
};
