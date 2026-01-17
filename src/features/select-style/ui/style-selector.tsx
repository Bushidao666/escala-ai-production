import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { CREATIVE_STYLES } from "@/modules/creative/dto/creative.schema";
import { Control } from "react-hook-form";

export function StyleSelector({ control }: { control: Control<any> }) {
  return (
    <FormField
      control={control}
      name="style"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white font-medium text-sm">
            Estilo do Criativo
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="input-glass h-10">
                <SelectValue placeholder="Selecione um estilo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
              {CREATIVE_STYLES.map((style) => (
                <SelectItem
                  key={style}
                  value={style}
                  className="text-white hover:bg-brand-gray-700"
                >
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
