import { supabase } from './supabase';

export const CoreAPI = {
  SendEmail: async (params) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params
      });
      if (error) {
        console.warn("Email edge function not configured or failed:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Email edge function not configured:", e);
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
