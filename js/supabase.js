const SUPABASE_URL = 'https://nlebxviivoqbunkkejlc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWJ4dmlpdm9xYnVua2tlamxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODMwMzYsImV4cCI6MjA5Mjk1OTAzNn0.E3OUvhjw2_LIIIq-oaak8kgDzR1JXpKwedUD4SvEwMM';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let clienteActivo = null;
