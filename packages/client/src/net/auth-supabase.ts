import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export class AuthSupabase {

    private supabase: any;

    private session?: any;

    constructor() {
        this.supabase = createClient('https://xftoctezupftnpoqcyzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdG9jdGV6dXBmdG5wb3FjeXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI4MjQzNzMsImV4cCI6MTk4ODQwMDM3M30.KQ84kjy1JpbE6BY-wGS1ierZZdYjKBXayZdsh5_fuWk');

        this.session = this.supabase.auth.session();

    }


    public async signInWithEmail() {
        const { data, error } = await this.supabase.auth.signInWithOtp({
            email: 'example@email.com',
            options: {
                emailRedirectTo: 'https://example.com/welcome',
            },
        })
    }


}