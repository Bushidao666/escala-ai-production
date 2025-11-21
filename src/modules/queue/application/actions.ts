"use server";

import { createClient } from "@/shared/infra/supabase/server";
import { QueueRepository } from "../infra/supabase-queue.repository";
import { GetQueueJobsUseCase } from "./use-cases/get-queue-jobs.usecase";

export async function getQueueJobs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const repository = new QueueRepository(supabase);
  const useCase = new GetQueueJobsUseCase(repository);

  return await useCase.execute(user.id);
}
