/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wrhkzsonzptsobelulyl.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bZtQKTE60659PneEs-Gs0Q_oOmNc1jU';

export const supabase = createClient(supabaseUrl, supabaseKey);
