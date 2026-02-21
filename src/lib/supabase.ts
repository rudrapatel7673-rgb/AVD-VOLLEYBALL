import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uliosidiywutsyozwypo.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsaW9zaWRpeXd1dHN5b3p3eXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjY2ODgsImV4cCI6MjA4NzI0MjY4OH0.-SIr6FlRmFWHjY69H7TvSnnm3u1N3OevbtZbUaz7tQ4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
