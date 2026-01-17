import { SupabaseClient } from "@supabase/supabase-js";

export class QueueRepository {
  constructor(private supabase: SupabaseClient) {}

  async getJobs(userId: string) {
    const { data, error } = await this.supabase
      .from("queue_jobs")
      .select(`*, creatives(*)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
