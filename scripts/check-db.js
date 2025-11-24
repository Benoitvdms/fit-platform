// Check database connection and existing tables
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.log('❌ Supabase not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Test basic connection
    const { data: test, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      console.log('📝 This likely means migrations need to be run');
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Check tables exist
    const tables = ['users', 'videos', 'video_likes', 'video_comments', 'user_follows', 'video_views'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table '${table}' not found or accessible`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (e) {
        console.log(`❌ Table '${table}' error:`, e.message);
      }
    }
    
    // Check storage buckets
    console.log('\n🗂️  Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Could not list buckets:', bucketsError.message);
    } else {
      console.log('📦 Storage buckets:', buckets.map(b => b.name).join(', ') || 'None');
      
      // Check for required buckets
      const requiredBuckets = ['videos', 'thumbnails', 'avatars'];
      const existingBuckets = buckets.map(b => b.name);
      
      requiredBuckets.forEach(bucket => {
        if (existingBuckets.includes(bucket)) {
          console.log(`✅ Bucket '${bucket}' exists`);
        } else {
          console.log(`❌ Bucket '${bucket}' missing`);
        }
      });
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
    return false;
  }
}

checkDatabase();