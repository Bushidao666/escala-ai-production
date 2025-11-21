import { QueueRepository } from "../../infra/supabase-queue.repository";

export class GetQueueJobsUseCase {
  constructor(private repository: QueueRepository) {}

  async execute(userId: string) {
    return await this.repository.getJobs(userId);
  }
}
