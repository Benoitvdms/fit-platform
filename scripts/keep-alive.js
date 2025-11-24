// Simple script to keep Supabase active
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.log('Supabase not configured, skipping keep-alive');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
  try {
    // Simple query to keep connection active
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Keep-alive ping successful (even with error - connection made)');
    } else {
      console.log('Keep-alive ping successful');
    }
  } catch (error) {
    console.log('Keep-alive ping completed:', error.message);
  }
}

keepAlive();