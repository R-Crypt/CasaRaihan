import { supabase } from './supabase';

export const RoomAPI = {
  list: async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (data) => {
    const { data: result, error } = await supabase.from('rooms').insert([data]).select().single();
    if (error) throw error;
    return result;
  },
  update: async (id, data) => {
    const { data: result, error } = await supabase.from('rooms').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },
  delete: async (id) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  filter: async (filters) => {
    let query = supabase.from('rooms').select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

export const BookingAPI = {
  list: async (sort = '-created_at') => {
    const isDesc = sort.startsWith('-');
    const column = isDesc ? sort.substring(1) : sort;
    const { data, error } = await supabase.from('bookings').select('*').order(column, { ascending: !isDesc });
    if (error) throw error;
    return data;
  },
  filter: async (filters) => {
    let query = supabase.from('bookings').select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  create: async (data) => {
    const { data: result, error } = await supabase.from('bookings').insert([data]).select().single();
    if (error) throw error;
    return result;
  },
  update: async (id, data) => {
    const { data: result, error } = await supabase.from('bookings').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  }
};

export const BlockedDateAPI = {
  list: async () => {
    const { data, error } = await supabase.from('blocked_dates').select('*').order('start_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  filter: async (filters) => {
    let query = supabase.from('blocked_dates').select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  create: async (data) => {
    const { data: result, error } = await supabase.from('blocked_dates').insert([data]).select().single();
    if (error) throw error;
    return result;
  },
  delete: async (id) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const SettingsAPI = {
  list: async () => {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return data;
  },
  update: async (id, data) => {
    const { data: result, error } = await supabase.from('settings').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },
  create: async (data) => {
    const { data: result, error } = await supabase.from('settings').insert([data]).select().single();
    if (error) throw error;
    return result;
  }
};