import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
  const roomId = rooms[0].id;
  
  const { data: ins, error: e3 } = await supabase.from('bookings').insert([{
     room_id: roomId,
     room_name: 'Test',
     guest_name: 'Test',
     guest_email: 'test@test.com',
     guest_phone: '123',
     check_in: '2026-07-01',
     check_out: '2026-07-02',
     total_nights: 1,
     total_amount: 100,
     number_of_guests: 1,
     status: 'pending'
  }]).select().single();
  console.log('Bookings Insert:', e3 ? e3.message : 'Success');
}
check();
