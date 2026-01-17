import { ImageUpload } from "@/shared/ui/image-upload";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage, FormControl } from "@/shared/ui/form";
import { Control } from "react-hook-form";

export function AssetUploader({ control }: { control: Control<any> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="logo_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium text-sm">
              Logo da Empresa
            </FormLabel>
            <FormControl>
              <ImageUpload
                images={field.value ? [{ url: field.value, filename: 'logo', size: 0, type: 'image' }] : []}
                onImagesChange={(newImages) => {
                  const newUrl = newImages[0]?.url || "";
                  field.onChange(newUrl);
                }}
                multiple={false}
                maxFiles={1}
                placeholder="Adicione o logo"
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-brand-gray-400 text-xs">
              O logo será incorporado automaticamente.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="product_images"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium text-sm">
              Imagens de Referência
            </FormLabel>
            <FormControl>
              <ImageUpload
                images={field.value || []}
                onImagesChange={field.onChange}
                multiple={true}
                maxFiles={5}
                placeholder="Adicione até 5 imagens"
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-brand-gray-400 text-xs">
              Produtos ou referências visuais.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
