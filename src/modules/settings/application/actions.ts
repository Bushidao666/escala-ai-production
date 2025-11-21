"use server";

import { createClient } from "@/shared/infra/supabase/server";
import { revalidatePath } from "next/cache";
import OpenAI from 'openai';
import { settingsSchema, type SettingsFormData, defaultSettings } from "@/modules/settings/dto/settings.schema";

export async function getUserSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("getUserSettings: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("getUserSettings: Error fetching settings:", error);
    throw new Error("Não foi possível carregar as configurações.");
  }

  return data;
}

export async function saveSettings(settingsData: SettingsFormData) {
  console.log("\n--- [ACTION START: saveSettings] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("saveSettings: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }
  
  console.log(`User ID: ${user.id}`);

  const validationResult = settingsSchema.safeParse(settingsData);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
    console.error("saveSettings: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  const finalSettingsData = { ...validationResult.data, updated_at: new Date().toISOString() };
  
  console.log("Data to be saved (validated):", JSON.stringify(finalSettingsData, null, 2));

  const { data: existingSettings, error: selectError } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("saveSettings: DB Error - checking for existing settings failed:", selectError);
    throw new Error("Erro ao verificar configurações existentes.");
  }

  let dbError;
  if (existingSettings) {
    console.log("DB Operation: Found existing settings. Attempting UPDATE.");
    const { error: updateError } = await supabase
      .from("user_settings")
      .update(finalSettingsData)
      .eq("user_id", user.id);
    dbError = updateError;
  } else {
    console.log("DB Operation: No existing settings. Attempting INSERT.");
    const { error: insertError } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id, ...finalSettingsData });
    dbError = insertError;
  }

  if (dbError) {
    console.error("saveSettings: DATABASE OPERATION FAILED:", dbError);
    throw new Error("Não foi possível salvar as configurações.");
  }
  
  console.log("DB Operation: Success.");
  console.log("Revalidating path: /settings");
  revalidatePath("/settings");
  console.log("--- [ACTION END: saveSettings] ---\n");
  return { success: true };
}

export async function restoreDefaults() {
  console.log("\n--- [ACTION START: restoreDefaults] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("restoreDefaults: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }
  
  console.log(`User ID: ${user.id}`);

  const settingsToRestore = {
    ...defaultSettings,
    openai_api_key: "", // Keep empty instead of null to satisfy schema
    updated_at: new Date().toISOString(),
  };
  
  console.log("Data to be restored:", JSON.stringify(settingsToRestore, null, 2));
  
  const { data: existingSettings, error: selectError } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("restoreDefaults: DB Error - checking for existing settings failed:", selectError);
    throw new Error("Não foi possível restaurar as configurações.");
  }

  let dbError;
  if (existingSettings) {
    console.log("DB Operation: Found existing settings. Attempting UPDATE with defaults.");
    const { error: updateError } = await supabase
      .from("user_settings")
      .update(settingsToRestore)
      .eq("user_id", user.id);
    dbError = updateError;
  } else {
    console.log("DB Operation: No existing settings. Attempting INSERT with defaults.");
    const { error: insertError } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id, ...settingsToRestore });
    dbError = insertError;
  }

  if (dbError) {
    console.error("restoreDefaults: DATABASE OPERATION FAILED:", dbError);
    throw new Error("Não foi possível restaurar as configurações.");
  }

  console.log("DB Operation: Success.");
  console.log("Revalidating path: /settings");
  revalidatePath("/settings");
  console.log("--- [ACTION END: restoreDefaults] ---\n");
  return { success: true };
}

export async function testOpenAiConnection(apiKey: string) {
  console.log("\n--- [ACTION START: testOpenAiConnection] ---");
  if (!apiKey) {
    console.error("Test Connection: No API key provided.");
    return { success: false, error: "Nenhuma chave de API fornecida." };
  }

  console.log("Attempting to connect to OpenAI...");

  try {
    const openai = new OpenAI({ apiKey });

    // A simple, low-cost call to verify the key is valid
    await openai.models.list();

    console.log("Test Connection: Success.");
    console.log("--- [ACTION END: testOpenAiConnection] ---\n");
    return { success: true };
  } catch (error: any) {
    console.error("Test Connection: FAILED.", error.message);
    const errorMessage = error.message.includes("Incorrect API key")
      ? "Chave da API incorreta."
      : "Falha na conexão. Verifique o console para detalhes.";
    
    console.log("--- [ACTION END: testOpenAiConnection] ---\n");
    return { success: false, error: errorMessage };
  }
} 