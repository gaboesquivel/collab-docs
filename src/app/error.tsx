"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <TriangleAlertIcon className="text-destructive size-10" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page couldn&apos;t load. Your saved documents are safe; try again in
        a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
};

export default ErrorPage;
