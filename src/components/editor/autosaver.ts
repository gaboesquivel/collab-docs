import type { SaveResult } from "@/app/documents/actions";

const DEBOUNCE_MS = 1000;

export type SaveStatus =
  | { kind: "saved"; at: string | null }
  | { kind: "unsaved" }
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "conflict"; editedBy: string | null };

const FAILURE_MESSAGES = {
  invalid: "This change couldn't be saved.",
  "not-found": "You no longer have access to this document.",
  "signed-out": "You've been signed out. Sign in again to keep saving.",
} as const;

interface AutosaverOptions {
  version: number;
  getContent: () => unknown;
  send: (content: unknown, baseVersion: number) => Promise<SaveResult>;
  onStatus: (status: SaveStatus) => void;
  /** Called once when someone else saved first; editing should stop. */
  onConflict: () => void;
}

/**
 * Debounced saving with optimistic concurrency, kept outside React so its
 * timing logic is plain and testable. At most one request is in flight;
 * changes made meanwhile are saved right after it.
 */
export class Autosaver {
  private version: number;
  private dirty = false;
  private inFlight = false;
  private stopped = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly options: AutosaverOptions;

  constructor(options: AutosaverOptions) {
    this.options = options;
    this.version = options.version;
  }

  /** True while there are changes the server doesn't have yet. */
  get hasPendingChanges() {
    return !this.stopped && (this.dirty || this.inFlight);
  }

  /** Record a change and save after a pause in typing. */
  changed() {
    if (this.stopped) {
      return;
    }
    const wasFailing = this.dirty && !this.inFlight && this.timer === null;
    this.dirty = true;
    if (!wasFailing) {
      this.options.onStatus({ kind: "unsaved" });
    }
    this.schedule();
  }

  /** Save now (Cmd+S, tab hidden, Retry). */
  flush = () => {
    this.clearTimer();
    this.run();
  };

  /** Stop saving and forget pending changes (before a deliberate reload). */
  discard() {
    this.stopped = true;
    this.dirty = false;
    this.clearTimer();
  }

  dispose() {
    this.clearTimer();
  }

  private schedule() {
    this.clearTimer();
    this.timer = setTimeout(this.flush, DEBOUNCE_MS);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async run() {
    if (this.stopped || this.inFlight || !this.dirty) {
      return;
    }
    this.dirty = false;
    this.inFlight = true;
    this.options.onStatus({ kind: "saving" });

    let result: SaveResult | null = null;
    try {
      result = await this.options.send(this.options.getContent(), this.version);
    } catch {
      result = null;
    }
    this.inFlight = false;
    this.handle(result);

    // Changes that arrived while the request was in flight.
    if (this.dirty && !this.stopped && this.timer === null) {
      this.schedule();
    }
  }

  private handle(result: SaveResult | null) {
    if (result === null) {
      this.dirty = true;
      this.options.onStatus({
        kind: "error",
        message: "Couldn't reach the server. Your changes are kept here.",
      });
      return;
    }
    if (result.ok) {
      this.version = result.version;
      this.options.onStatus(
        this.dirty ? { kind: "unsaved" } : { at: result.savedAt, kind: "saved" }
      );
      return;
    }
    this.dirty = true;
    if (result.reason === "conflict") {
      // Keep the user's text on screen but never overwrite the other version.
      this.stopped = true;
      this.clearTimer();
      this.options.onConflict();
      this.options.onStatus({ editedBy: result.editedBy, kind: "conflict" });
      return;
    }
    this.options.onStatus({
      kind: "error",
      message: FAILURE_MESSAGES[result.reason],
    });
  }
}
