import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zrpyjlvqlqnvhewjhser.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Jp2enUGBE1pHVqiDlLCo5g_3tM6KmQ6';

export const supabase = createClient(supabaseUrl, supabaseKey);