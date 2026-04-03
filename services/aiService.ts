import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { GeneratePhotoParams } from './imageService';

export interface GeneratePhotoResult {
  image: string;
  description: string;
}

export const generateIDPhoto = async (
  params: GeneratePhotoParams
): Promise<{ data: GeneratePhotoResult | null; error: string | null }> => {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.functions.invoke('generate-id-photo', {
      body: params,
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
        } catch {
          errorMessage = `${error.message || 'Failed to read response'}`;
        }
      }
      return { data: null, error: errorMessage };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || 'Failed to generate photo' };
  }
};
