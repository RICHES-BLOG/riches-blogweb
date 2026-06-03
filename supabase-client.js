// Supabase client for frontend pages
const SUPABASE_URL = 'https://kshqtnqtyeqczswxtgdj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BiZTbcIXG58BMRoQskCqmg_9zfrVrIs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch music from Supabase
async function fetchMusic() {
    const { data, error } = await supabase
        .from('music')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching music:', error);
        return [];
    }
    return data;
}

// Fetch movies from Supabase
async function fetchMovies() {
    const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
    return data;
}

// Fetch blog posts from Supabase
async function fetchBlogPosts() {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_date', { ascending: false });
    
    if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
    return data;
}

// Submit contact form
async function submitContact(name, email, subject, message) {
    const { data, error } = await supabase
        .from('contacts')
        .insert([{ name, email, subject, message, status: 'unread' }]);
    
    if (error) {
        console.error('Error submitting contact:', error);
        return false;
    }
    return true;
}

// Subscribe to newsletter
async function subscribeNewsletter(email) {
    const { data, error } = await supabase
        .from('subscribers')
        .upsert([{ email, status: 'active' }], { onConflict: 'email' });
    
    if (error) {
        console.error('Error subscribing:', error);
        return false;
    }
    return true;
}

// Update play count for music
async function incrementPlayCount(musicId) {
    const { data } = await supabase
        .from('music')
        .select('play_count')
        .eq('id', musicId)
        .single();
    
    if (data) {
        await supabase
            .from('music')
            .update({ play_count: (data.play_count || 0) + 1 })
            .eq('id', musicId);
    }
}

// Export for use
window.supabaseClient = { fetchMusic, fetchMovies, fetchBlogPosts, submitContact, subscribeNewsletter, incrementPlayCount };