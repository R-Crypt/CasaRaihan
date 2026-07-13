import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.functions.invoke('send-email', { body: { test: true } });
  console.log('Send-Email Edge Function:', error ? error.message : 'Success');
  
  const { data: d2, error: e2 } = await supabase.functions.invoke('notify-booking', { body: { test: true } });
  console.log('Notify-Booking Edge Function:', e2 ? e2.message : 'Success');
}
check();
