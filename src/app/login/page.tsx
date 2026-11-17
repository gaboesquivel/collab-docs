import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const LoginPage = async () => {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to Docs</CardTitle>
          <CardDescription>
            Sign in with any email ending in{" "}
            <span className="text-foreground font-medium">@demo.test</span>. The
            first time, any password creates the account; after that, use the
            same password. Ready-made accounts: alice, bob and carol, with
            password{" "}
            <span className="text-foreground font-medium">demo1234</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <Link
        className="text-muted-foreground text-sm underline underline-offset-4"
        href="/submission"
      >
        About this project: submission notes and how it was built
      </Link>
    </main>
  );
};

export default LoginPage;
