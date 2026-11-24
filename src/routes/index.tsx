import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import hero from "@/assets/hero-aerial.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { videosQuery, type Video } from "@/lib/videos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pizakks Adventures — Drone Footage" },
      { name: "description", content: "Cinematic aerial drone footage from the adventures of Pizakks." },
      { property: "og:title", content: "Pizakks Adventures — Drone Footage" },
      { property: "og:description", content: "Cinematic aerial drone footage from the adventures of Pizakks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(videosQuery()),
  component: Index,
});

function Index() {
  const { data: videos } = useSuspenseQuery(videosQuery());
  const [open, setOpen] = useState<Video | null>(null);
  const featured = videos[0];

  return (
    <main>
      <SiteHeader />
      <section className="grain relative h-screen min-h-[600px] overflow-hidden">
        {featured ? (
          <video src={featured.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <img src={hero} alt="Aerial view of misty mountains and a river" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="hero-fade absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 md:px-12">
          <p className="letterbox fade-up text-xs text-primary">Aerial films</p>
          <h1 className="fade-up font-display text-7xl leading-none md:text-[10rem]">
            The world<br />from above
          </h1>
          {featured && (
            <button onClick={() => setOpen(featured)} className="letterbox fade-up mt-8 w-fit border-b border-primary pb-1 text-xs text-foreground hover:text-primary">
              Watch “{featured.title}”
            </button>
          )}
        </div>
      </section>

      <section className="px-6 py-24 md:px-12">
        <div className="mb-12 flex items-end justify-between border-b pb-6">
          <h2 className="font-display text-5xl">Flights</h2>
          <span className="letterbox text-xs text-muted-foreground">{videos.length} clips</span>
        </div>
        {videos.length === 0 ? (
          <p className="text-muted-foreground">No footage yet — the first flight is coming soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <button key={v.id} onClick={() => setOpen(v)} className="group text-left">
                <div className="relative aspect-video overflow-hidden bg-card">
                  <video
                    src={v.url}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-display text-2xl tracking-wide group-hover:text-primary">{v.title}</h3>
                {v.location && <p className="letterbox text-[10px] text-muted-foreground">{v.location}</p>}
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t px-6 py-10 text-center md:px-12">
        <p className="letterbox text-[10px] text-muted-foreground">© Pizakks Adventures</p>
      </footer>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/95 p-4" onClick={() => setOpen(null)}>
          <button aria-label="Close" className="absolute right-6 top-6 text-foreground hover:text-primary"><X /></button>
          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <video src={open.url} controls autoPlay className="aspect-video w-full bg-overlay" />
            <h3 className="mt-4 font-display text-4xl">{open.title}</h3>
            {open.location && <p className="letterbox text-xs text-primary">{open.location}</p>}
            {open.description && <p className="mt-2 max-w-2xl text-muted-foreground">{open.description}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
