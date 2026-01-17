import { SupabaseClient } from "@supabase/supabase-js";
import { CreateCreativeData, CreateCreativeRequestData } from "../dto/creative.schema";

export class CreativeRepository {
  constructor(private supabase: SupabaseClient) {}

  async createRequest(data: CreateCreativeRequestData & { user_id: string; status: 'pending'; product_images: string }) {
    const { data: request, error } = await this.supabase
      .from("creative_requests")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create request: ${error.message}`);
    return request;
  }

  async createCreative(data: any) {
    const { data: creative, error } = await this.supabase
      .from("creatives")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create creative: ${error.message}`);
    return creative;
  }

  async createQueueJob(data: { creative_id: string; user_id: string; status: string; priority: number }) {
    const { data: job, error } = await this.supabase
      .from("queue_jobs")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create queue job: ${error.message}`);
    return job;
  }

  async updateRequestStatus(requestId: string, status: string) {
    const { error } = await this.supabase
      .from("creative_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) throw new Error(`Failed to update request status: ${error.message}`);
  }

  async rollbackRequest(requestId: string, creativeIds: string[]) {
    // Delete jobs
    if (creativeIds.length > 0) {
      await this.supabase.from("queue_jobs").delete().in("creative_id", creativeIds);
      // Delete creatives
      await this.supabase.from("creatives").delete().eq("request_id", requestId);
    }
    // Delete request
    await this.supabase.from("creative_requests").delete().eq("id", requestId);
  }

  async getUserSettings(userId: string) {
    const { data, error } = await this.supabase
      .from("user_settings")
      .select("default_quality, default_output_format, default_output_compression, default_background")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}
