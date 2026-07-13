const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iiykoruwgdjdltwnvacr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a_5SXj1BPlbtO6zfuDtQLw_o2OZxqSs'; // From earlier tests
const supabase = createClient(supabaseUrl, supabaseAnonKey);
(async () => {
  const { data, error } = await supabase.from('rooms').select('*');
  if (error) console.error(error);
  console.log("Rooms count:", data?.length);
  const nullNames = data?.filter(r => !r.name);
  if (nullNames?.length > 0) {
    console.log("Found rooms with null names!");
  } else {
    console.log("All rooms have names.");
  }
})();
