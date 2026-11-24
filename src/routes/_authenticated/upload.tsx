import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { videosQuery } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Upload footage — Pizakks Adventures" },
      { name: "description", content: "Add new drone footage to Pizakks Adventures." },
      { property: "og:title", content: "Upload footage — Pizakks Adventures" },
      { property: "og:description", content: "Add new drone footage to Pizakks Adventures." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Upload,
});

function Upload() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });
  const { data: videos = [] } = useQuery(videosQuery());
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "mp4";
    const path = `${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("footage").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); { toast.error(up.error.message); return; } }
    const { error } = await supabase.from("videos").insert({ title, location: location || null, description: description || null, video_path: path });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Footage uploaded");
    setFile(null); setTitle(""); setLocation(""); setDescription("");
    (e.target as HTMLFormElement).reset();
    qc.invalidateQueries({ queryKey: ["videos"] });
  }

  async function remove(id: string, path: string) {
    if (!confirm("Delete this clip?")) return;
    await supabase.storage.from("footage").remove([path]);
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["videos"] });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <main className="px-6 pb-24 pt-32 md:px-12">
      <SiteHeader />
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between border-b pb-6">
          <h1 className="font-display text-6xl">Upload footage</h1>
          <button onClick={signOut} className="letterbox text-xs text-muted-foreground hover:text-primary">Sign out</button>
        </div>
        {isLoading ? null : !isAdmin ? (
          <p className="mt-8 text-muted-foreground">Only the site owner can upload footage.</p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-10 space-y-4">
              <Input type="file" accept="video/*" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Input placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload"}</Button>
              <p className="text-xs text-muted-foreground">Max 500 MB per video.</p>
            </form>
            <h2 className="mt-16 font-display text-3xl">Your clips</h2>
            <ul className="mt-4 divide-y border-y">
              {videos.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-3">
                  <span>{v.title}</span>
                  <button aria-label="Delete" onClick={() => remove(v.id, v.video_path)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
