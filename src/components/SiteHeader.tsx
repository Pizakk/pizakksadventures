import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12">
      <Link to="/" className="font-display text-2xl tracking-widest text-foreground">
        Pizakks <span className="text-primary">Adventures</span>
      </Link>
      <Link to="/upload" className="letterbox text-xs text-muted-foreground transition-colors hover:text-primary">
        Upload
      </Link>
    </header>
  );
}
