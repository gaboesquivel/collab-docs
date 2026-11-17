import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const NotFound = () => (
  <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
    <FileQuestionIcon className="text-muted-foreground size-10" />
    <h1 className="text-xl font-semibold">Document not found</h1>
    <p className="text-muted-foreground max-w-sm text-sm">
      It may have been deleted, or it hasn&apos;t been shared with you. Ask the
      owner to share it with your account.
    </p>
    <Button nativeButton={false} render={<Link href="/" />}>
      Back to documents
    </Button>
  </main>
);

export default NotFound;
