import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = 'https://nlebxviivoqbunkkejlc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWJ4dmlpdm9xYnVua2tlamxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODMwMzYsImV4cCI6MjA5Mjk1OTAzNn0.E3OUvhjw2_LIIIq-oaak8kgDzR1JXpKwedUD4SvEwMM';

export const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ESTADO GLOBAL =====
// Un único objeto de estado exportado — todos los módulos lo importan
export const state = {
  user:     null,
  clientes: [],
  activo:   null,
  META:     10,      // cortes necesarios para ganar un premio
};
