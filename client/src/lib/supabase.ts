import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pshmizivmvzjvwxouygj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaG1peml2bXZ6anZ3eG91eWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDE5NTUsImV4cCI6MjA3MzE3Nzk1NX0.kToicwD1vKUTe9mPE1JFbV_PdtRmMJ5PpXYFJvMN3GM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);