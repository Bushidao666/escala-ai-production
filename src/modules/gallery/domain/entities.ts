export type GalleryItem = {
  id: string;
  title: string;
  prompt: string;
  status: 'completed' | 'processing' | 'failed' | 'draft' | 'queued';
  style: string;
  format: string;
  result_url: string | null;
  created_at: string;
  error_message: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  product_images: string[] | null;
  type?: 'creative' | 'request';
};
