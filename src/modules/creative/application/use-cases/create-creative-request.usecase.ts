import { CreateCreativeRequestData } from "../../dto/creative.schema";
import { CreativeRepository } from "../../infra/supabase-creative.repository";
import { applyVariationToPrompt, getRandomStyleForVariation } from "../../domain/variation.service";

export class CreateCreativeRequestUseCase {
  constructor(private repository: CreativeRepository) {}

  async execute(userId: string, input: CreateCreativeRequestData) {
    // 1. Get User Defaults
    const settings = await this.repository.getUserSettings(userId);
    const defaults = {
        quality: settings?.default_quality || 'auto',
        output_format: settings?.default_output_format || 'png',
        output_compression: settings?.default_output_format === 'png' ? 100 : (settings?.default_output_compression || 90),
        background: settings?.default_background || 'auto'
    };

    // 2. Create Request
    const request = await this.repository.createRequest({
      ...input,
      user_id: userId,
      status: 'pending',
      product_images: JSON.stringify(input.product_images || [])
    });

    const createdCreatives = [];
    const quantity = input.quantity || 1;
    const enableVariations = input.enable_variations || false;
    const variationStyle = input.variation_style || 'creative_diversity';

    try {
      // 3. Loop Formats & Quantity
      for (const format of input.requested_formats) {
        for (let i = 1; i <= quantity; i++) {
          let title = `${input.title} - ${format}`;
          let prompt = input.prompt;
          let style = input.style || "Moderno";

          if (quantity > 1) {
            title += ` (${i}/${quantity})`;
            if (enableVariations) {
              prompt = applyVariationToPrompt(input.prompt, variationStyle, i, quantity);
              if (variationStyle === 'style_variations') {
                style = getRandomStyleForVariation(input.style || "Moderno", i, true);
              }
            }
          }

          const creative = await this.repository.createCreative({
            title,
            description: input.description,
            prompt,
            style,
            primary_color: input.primary_color,
            secondary_color: input.secondary_color,
            headline: input.headline,
            sub_headline: input.sub_headline,
            cta_text: input.cta_text,
            logo_url: input.logo_url,
            product_images: input.product_images,
            format,
            quality: defaults.quality,
            output_format: defaults.output_format,
            output_compression: defaults.output_compression,
            background: defaults.background,
            user_id: userId,
            request_id: request.id,
            status: 'queued',
            quantity: 1,
            enable_variations: false
          });

          createdCreatives.push(creative);

          await this.repository.createQueueJob({
            creative_id: creative.id,
            user_id: userId,
            status: 'pending',
            priority: 5
          });
        }
      }

      await this.repository.updateRequestStatus(request.id, 'processing');

      return {
        success: true,
        request_id: request.id,
        creatives_count: createdCreatives.length
      };

    } catch (error) {
      // Rollback
      await this.repository.rollbackRequest(request.id, createdCreatives.map(c => c.id));
      throw error;
    }
  }
}
