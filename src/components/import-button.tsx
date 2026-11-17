"use client";

import { FileUpIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { importDocument } from "@/app/documents/actions";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = ".docx,.md,.markdown,.txt";

export const ImportButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onFile = (file: File) => {
    // Checked again on the server; this just saves a pointless upload.
    if (file.size > MAX_BYTES) {
      toast.error("That file is larger than 4 MB.");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await importDocument(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.removed.length > 0) {
        toast.warning(`Imported “${result.title}”`, {
          description: `${result.removed.join(". ")}. The editor only keeps headings, bold, italic, underline and lists.`,
          duration: 10_000,
        });
      } else {
        toast.success(`Imported “${result.title}”`);
      }
      router.push(`/d/${result.id}`);
    });
  };

  return (
    <>
      <input
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onFile(file);
          }
        }}
        ref={inputRef}
        type="file"
      />
      <Button
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        variant="outline"
      >
        {pending ? <Loader2Icon className="animate-spin" /> : <FileUpIcon />}
        {pending ? "Importing…" : "Import file"}
      </Button>
    </>
  );
};
