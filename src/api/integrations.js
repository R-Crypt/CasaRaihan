import { supabase } from './supabase';

export const CoreAPI = {
  SendEmail: async (params) => {
    try {
      // Determine which edge function to call
      const { _edge_function, ...body } = params;
      const fnName = _edge_function || 'send-email';
      const { data, error } = await supabase.functions.invoke(fnName, { body });
      if (error) {
        console.warn(`Edge function '${fnName}' not configured or failed:`, error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Edge function call failed:', e);
      return null;
    }
  },
  
  UploadFile: async ({ file }) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return {
      file_url: data.publicUrl,
      url: data.publicUrl,
    };
  }
};

export const SendEmail = CoreAPI.SendEmail;
export const UploadFile = CoreAPI.UploadFile;
