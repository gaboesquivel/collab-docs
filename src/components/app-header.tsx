import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/auth";

export const AppHeader = ({
  user,
  children,
}: {
  user: CurrentUser;
  children?: ReactNode;
}) => (
  <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
    <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
      <Link className="flex items-center gap-2 font-semibold" href="/">
        <FileTextIcon className="size-5" />
        Docs
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      <span className="text-muted-foreground hidden text-sm sm:inline">
        {user.name}
      </span>
      <form action={signOut}>
        <Button size="sm" type="submit" variant="ghost">
          Sign out
        </Button>
      </form>
    </div>
  </header>
);
