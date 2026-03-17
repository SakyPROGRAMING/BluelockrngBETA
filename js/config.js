import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://eythfwahgboeldtyghgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dGhmd2FoZ2JvZWxkdHlnaGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTE2MTMsImV4cCI6MjA4OTI4NzYxM30.6OuuPCc5_iup1VgWlmDcd3HIAtWKJzGNAuWGWOfzzh4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);