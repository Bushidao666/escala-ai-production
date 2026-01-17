export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QueueJob {
  id: string;
  creative_id: string;
  user_id: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  error_message?: string;
  created_at: string;
}
