import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Pizakks Adventures" },
      { name: "description", content: "Owner sign-in for Pizakks Adventures." },
      { property: "og:title", content: "Sign in — Pizakks Adventures" },
      { property: "og:description", content: "Owner sign-in for Pizakks Adventures." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/upload" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/upload" } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Check your email to confirm your account.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <SiteHeader />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-5xl">{mode === "in" ? "Pilot sign in" : "Create account"}</h1>
        <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={busy} className="w-full">{mode === "in" ? "Sign in" : "Sign up"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-sm text-muted-foreground hover:text-primary">
          {mode === "in" ? "First time? Create the owner account" : "Have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
