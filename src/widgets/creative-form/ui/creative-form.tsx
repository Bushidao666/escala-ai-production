"use client";

import { useCreativeForm } from "../model/use-creative-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { StyleSelector } from "@/features/select-style/ui/style-selector";
import { AssetUploader } from "@/features/upload-assets/ui/asset-uploader";
import { Sparkles, ImageIcon, Palette, Send, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function CreativeFormWidget() {
  const { form, onSubmit, isLoading } = useCreativeForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 mb-6">
            <TabsTrigger value="basic" className="data-[state=active]:bg-brand-neon-green/10 data-[state=active]:text-brand-neon-green">
              <Sparkles className="w-4 h-4 mr-2" /> Básico
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-brand-neon-green/10 data-[state=active]:text-brand-neon-green">
              <ImageIcon className="w-4 h-4 mr-2" /> Mídia
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-brand-neon-green/10 data-[state=active]:text-brand-neon-green">
              <Palette className="w-4 h-4 mr-2" /> Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="card-glass-intense p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Título</FormLabel>
                      <FormControl>
                        <Input {...field} className="input-glass" placeholder="Ex: Campanha Verão" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <StyleSelector control={form.control} />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Descrição (Prompt)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="input-glass min-h-[100px]" placeholder="Descreva o criativo..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card className="card-glass-intense p-6">
              <AssetUploader control={form.control} />
            </Card>
          </TabsContent>

          {/* Outras tabs simplificadas para o exemplo */}
        </Tabs>

        <Button type="submit" disabled={isLoading} className="w-full btn-neon h-12">
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
          Gerar Criativo
        </Button>
      </form>
    </Form>
  );
}
