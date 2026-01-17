import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCreativeSchema, defaultCreativeValues, CreateCreativeData } from "@/modules/creative/dto/creative.schema";
import { createCreativeRequest, createCreative, saveDraft } from "@/modules/creative/application/actions";
import { toast } from "sonner";

export function useCreativeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMultiFormat, setIsMultiFormat] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['1:1']);

  const form = useForm<CreateCreativeData>({
    resolver: zodResolver(createCreativeSchema),
    defaultValues: defaultCreativeValues,
    mode: "onChange",
  });

  const onSubmit = async (data: CreateCreativeData) => {
    setIsLoading(true);
    try {
      if (isMultiFormat) {
        await createCreativeRequest({
          ...data,
          requested_formats: selectedFormats as any,
          // map other fields
          quantity: data.quantity || 1,
          enable_variations: data.enable_variations || false,
          variation_style: data.variation_style || 'creative_diversity'
        });
        toast.success("Múltiplos criativos iniciados!");
      } else {
        await createCreative(data);
        toast.success("Criativo iniciado!");
      }
      form.reset(defaultCreativeValues);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    isMultiFormat,
    setIsMultiFormat,
    selectedFormats,
    setSelectedFormats
  };
}
