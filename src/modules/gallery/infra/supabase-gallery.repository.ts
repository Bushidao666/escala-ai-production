import { SupabaseClient } from "@supabase/supabase-js";

export class GalleryRepository {
  constructor(private supabase: SupabaseClient) {}

  async getItems(userId: string) {
    const { data, error } = await this.supabase
      .from("creatives")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
