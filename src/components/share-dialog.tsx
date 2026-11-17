"use client";

import { Loader2Icon, UserPlusIcon, UsersIcon, XIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { shareDocument, unshareDocument } from "@/app/documents/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Person } from "@/lib/documents";

const initials = (name: string) => name.slice(0, 1).toUpperCase();

const Avatar = ({ name }: { name: string }) => (
  <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
    {initials(name)}
  </span>
);

/** Owner-only dialog to give other demo users edit access. */
export const ShareDialog = ({
  documentId,
  owner,
  initialPeople,
  suggestions,
}: {
  documentId: string;
  owner: Person;
  initialPeople: Person[];
  /** Other accounts, offered as autocomplete. */
  suggestions: Person[];
}) => {
  const [people, setPeople] = useState(initialPeople);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const share = () => {
    setError(null);
    startTransition(async () => {
      const result = await shareDocument(documentId, email).catch(() => null);
      if (!result) {
        setError("Couldn't reach the server. Try again.");
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPeople((current) => [...current, result.person]);
      setEmail("");
      toast.success(`Shared with ${result.person.name}`);
    });
  };

  const remove = (person: Person) => {
    startTransition(async () => {
      const result = await unshareDocument(documentId, person.id).catch(
        () => null
      );
      if (!result?.ok) {
        toast.error(result?.error ?? "Couldn't remove access. Try again.");
        return;
      }
      setPeople((current) => current.filter((p) => p.id !== person.id));
      toast.success(`${person.name} no longer has access`);
    });
  };

  const available = suggestions.filter(
    (s) => !people.some((p) => p.id === s.id)
  );

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <UsersIcon />
        Share
        {people.length > 0 ? (
          <span className="text-muted-foreground tabular-nums">
            {people.length}
          </span>
        ) : null}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            People you share with can open and edit this document. It appears
            under “Shared with me” for them.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            share();
          }}
        >
          <Label htmlFor="share-email">Email</Label>
          <div className="flex gap-2">
            <Input
              aria-describedby={error ? "share-error" : undefined}
              aria-invalid={Boolean(error)}
              autoComplete="off"
              id="share-email"
              list="share-suggestions"
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder="bob@demo.test"
              type="email"
              value={email}
            />
            <datalist id="share-suggestions">
              {available.map((s) => (
                <option key={s.id} value={s.email}>
                  {s.name}
                </option>
              ))}
            </datalist>
            <Button disabled={pending || !email.trim()} type="submit">
              {pending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UserPlusIcon />
              )}
              Share
            </Button>
          </div>
          {error ? (
            <p
              className="text-destructive text-sm"
              id="share-error"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>

        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">
            People with access
          </p>
          <ul className="flex flex-col">
            <li className="flex items-center gap-3 py-2">
              <Avatar name={owner.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {owner.name} (you)
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {owner.email}
                </p>
              </div>
              <span className="text-muted-foreground text-xs">Owner</span>
            </li>
            {people.map((person) => (
              <li className="flex items-center gap-3 py-2" key={person.id}>
                <Avatar name={person.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {person.email}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">Can edit</span>
                <Button
                  aria-label={`Remove ${person.name}`}
                  disabled={pending}
                  onClick={() => remove(person)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
