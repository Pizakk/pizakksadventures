import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Video = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  video_path: string;
  created_at: string;
  url: string;
};

export const videosQuery = () =>
  queryOptions({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select("id,title,description,location,video_path,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data.length) return [];
      const { data: signed } = await supabase.storage
        .from("footage")
        .createSignedUrls(data.map((v) => v.video_path), 60 * 60 * 24);
      return data.map((v, i) => ({ ...v, url: signed?.[i]?.signedUrl ?? "" }));
    },
  });
