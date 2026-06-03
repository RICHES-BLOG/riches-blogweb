// Supabase configuration
const SUPABASE_URL = 'https://kshqtnqtyeqczswxtgdj.supabase.co'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'sb_publishable_BiZTbcIXG58BMRoQskCqmg_9zfrVrIs'; // Replace with your actual key

let supabase = null;
let currentUser = null;
let currentTable = null;
let editingItem = null;

// Initialize Supabase
async function initSupabase() {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        const { createClient } = supabaseJs;
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Redirect to login or show login modal
        showLoginModal();
    } else {
        currentUser = session.user;
        document.getElementById('userEmail').innerText = currentUser.email;
        loadDashboard();
        loadMusic();
        loadMovies();
        loadBlog();
        loadContacts();
        loadSubscribers();
        loadSettings();
    }
}

// Show login modal
function showLoginModal() {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter password:');
    if (email && password) {
        supabase.auth.signInWithPassword({ email, password })
            .then(({ data, error }) => {
                if (error) throw error;
                location.reload();
            })
            .catch(err => {
                alert('Login failed: ' + err.message);
                showLoginModal();
            });
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
});

// Tab navigation
document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
        document.querySelectorAll('[data-tab]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.getElementById('pageTitle').innerText = link.innerText.trim();
    });
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Load dashboard stats
async function loadDashboard() {
    try {
        const [musicCount, moviesCount, blogCount, contactsCount, subscribersCount] = await Promise.all([
            supabase.from('music').select('*', { count: 'exact', head: true }),
            supabase.from('movies').select('*', { count: 'exact', head: true }),
            supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
            supabase.from('contacts').select('*', { count: 'exact', head: true }),
            supabase.from('subscribers').select('*', { count: 'exact', head: true })
        ]);
        
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><i class="fas fa-music"></i><h3>${musicCount.count || 0}</h3><p>Songs</p></div>
            <div class="stat-card"><i class="fas fa-film"></i><h3>${moviesCount.count || 0}</h3><p>Movies</p></div>
            <div class="stat-card"><i class="fas fa-blog"></i><h3>${blogCount.count || 0}</h3><p>Blog Posts</p></div>
            <div class="stat-card"><i class="fas fa-envelope"></i><h3>${contactsCount.count || 0}</h3><p>Messages</p></div>
            <div class="stat-card"><i class="fas fa-users"></i><h3>${subscribersCount.count || 0}</h3><p>Subscribers</p></div>
        `;
        
        // Recent activity
        const { data: recentContacts } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        document.getElementById('recentActivity').innerHTML = `
            <h4>Recent Contact Messages</h4>
            ${recentContacts?.map(c => `
                <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong>${c.name}</strong> (${c.email}): ${c.message.substring(0, 100)}...
                    <span style="float:right; font-size:0.8rem;">${new Date(c.created_at).toLocaleDateString()}</span>
                </div>
            `).join('') || '<p>No messages yet</p>'}
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load music
async function loadMusic() {
    const { data } = await supabase.from('music').select('*').order('id', { ascending: false });
    document.getElementById('musicTableBody').innerHTML = data?.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.artist}</td>
            <td>${item.genre}</td>
            <td>${item.play_count || 0}</td>
            <td>
                <button class="btn btn-primary" onclick="editItem('music', ${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteItem('music', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6">No music found</td></tr>';
}

// Load movies
async function loadMovies() {
    const { data } = await supabase.from('movies').select('*').order('id', { ascending: false });
    document.getElementById('moviesTableBody').innerHTML = data?.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.genre}</td>
            <td>${item.year}</td>
            <td>
                <button class="btn btn-primary" onclick="editItem('movies', ${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteItem('movies', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5">No movies found</td></tr>';
}

// Load blog posts
async function loadBlog() {
    const { data } = await supabase.from('blog_posts').select('*').order('id', { ascending: false });
    document.getElementById('blogTableBody').innerHTML = data?.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${item.published ? '✅ Yes' : '❌ No'}</td>
            <td>
                <button class="btn btn-primary" onclick="editItem('blog', ${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteItem('blog', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5">No blog posts found</td></tr>';
}

// Load contacts
async function loadContacts() {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    document.getElementById('contactsTableBody').innerHTML = data?.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.email}</td>
            <td>${item.message.substring(0, 50)}...</td>
            <td><span style="background:${item.status === 'unread' ? '#dc3545' : '#28a745'}; padding:3px 8px; border-radius:12px;">${item.status}</span></td>
            <td>
                <button class="btn" onclick="markContactRead(${item.id})">Mark Read</button>
                <button class="btn btn-danger" onclick="deleteItem('contacts', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6">No messages</td></tr>';
}

// Load subscribers
async function loadSubscribers() {
    const { data } = await supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false });
    document.getElementById('subscribersTableBody').innerHTML = data?.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.email}</td>
            <td>${new Date(item.subscribed_at).toLocaleDateString()}</td>
            <td><button class="btn btn-danger" onclick="deleteItem('subscribers', ${item.id})">Delete</button></td>
        </tr>
    `).join('') || '<tr><td colspan="4">No subscribers</td></tr>';
}

// Load settings
async function loadSettings() {
    const { data } = await supabase.from('settings').select('*');
    document.getElementById('settingsForm').innerHTML = data?.map(setting => `
        <div style="margin-bottom: 15px;">
            <label>${setting.key.replace('_', ' ').toUpperCase()}</label>
            <input type="text" id="setting_${setting.key}" value="${setting.value}" style="width:100%;">
            <small>${setting.description || ''}</small>
        </div>
    `).join('');
}

// Save settings
async function saveSettings() {
    const { data } = await supabase.from('settings').select('*');
    for (const setting of data) {
        const newValue = document.getElementById(`setting_${setting.key}`).value;
        await supabase.from('settings').update({ value: newValue, updated_at: new Date() }).eq('key', setting.key);
    }
    showNotification('Settings saved!', 'success');
}

// Open add modal
function openAddModal(table) {
    currentTable = table;
    editingItem = null;
    document.getElementById('modalTitle').innerText = `Add ${table.toUpperCase()}`;
    
    let formHtml = '';
    if (table === 'music') {
        formHtml = `
            <input type="text" id="title" placeholder="Title" required>
            <input type="text" id="artist" placeholder="Artist" required>
            <input type="text" id="genre" placeholder="Genre">
            <input type="text" id="category" placeholder="Category">
            <input type="number" id="year" placeholder="Year">
            <input type="url" id="fileUrl" placeholder="Audio URL" required>
            <input type="url" id="coverImage" placeholder="Cover Image URL">
            <textarea id="description" placeholder="Description"></textarea>
            <select id="country"><option value="Ghana">Ghana</option><option value="Nigeria">Nigeria</option></select>
        `;
    } else if (table === 'movies') {
        formHtml = `
            <input type="text" id="title" placeholder="Title" required>
            <input type="text" id="genre" placeholder="Genre">
            <input type="text" id="category" placeholder="Category">
            <input type="number" id="year" placeholder="Year">
            <input type="text" id="rating" placeholder="Rating (PG, R, etc)">
            <textarea id="description" placeholder="Description"></textarea>
            <input type="url" id="coverImage" placeholder="Cover Image URL">
            <input type="url" id="trailerUrl" placeholder="Trailer URL">
        `;
    } else if (table === 'blog') {
        formHtml = `
            <input type="text" id="title" placeholder="Title" required>
            <input type="text" id="slug" placeholder="URL Slug">
            <textarea id="content" placeholder="Content" rows="5" required></textarea>
            <input type="text" id="category" placeholder="Category">
            <input type="url" id="coverImage" placeholder="Cover Image URL">
            <label><input type="checkbox" id="published"> Published</label>
        `;
    }
    
    document.getElementById('modalForm').innerHTML = formHtml;
    document.getElementById('itemModal').style.display = 'flex';
}

// Edit item
async function editItem(table, id) {
    currentTable = table;
    editingItem = id;
    document.getElementById('modalTitle').innerText = `Edit ${table.toUpperCase()}`;
    
    const { data } = await supabase.from(table).select('*').eq('id', id).single();
    
    let formHtml = '';
    if (table === 'music') {
        formHtml = `
            <input type="text" id="title" value="${data.title || ''}" placeholder="Title" required>
            <input type="text" id="artist" value="${data.artist || ''}" placeholder="Artist" required>
            <input type="text" id="genre" value="${data.genre || ''}" placeholder="Genre">
            <input type="text" id="category" value="${data.category || ''}" placeholder="Category">
            <input type="number" id="year" value="${data.year || ''}" placeholder="Year">
            <input type="url" id="fileUrl" value="${data.file_url || ''}" placeholder="Audio URL" required>
            <input type="url" id="coverImage" value="${data.cover_image || ''}" placeholder="Cover Image URL">
            <textarea id="description" placeholder="Description">${data.description || ''}</textarea>
            <select id="country"><option value="Ghana" ${data.country === 'Ghana' ? 'selected' : ''}>Ghana</option><option value="Nigeria" ${data.country === 'Nigeria' ? 'selected' : ''}>Nigeria</option></select>
        `;
    } else if (table === 'movies') {
        formHtml = `
            <input type="text" id="title" value="${data.title || ''}" placeholder="Title" required>
            <input type="text" id="genre" value="${data.genre || ''}" placeholder="Genre">
            <input type="text" id="category" value="${data.category || ''}" placeholder="Category">
            <input type="number" id="year" value="${data.year || ''}" placeholder="Year">
            <input type="text" id="rating" value="${data.rating || ''}" placeholder="Rating">
            <textarea id="description" placeholder="Description">${data.description || ''}</textarea>
            <input type="url" id="coverImage" value="${data.cover_image || ''}" placeholder="Cover Image URL">
            <input type="url" id="trailerUrl" value="${data.trailer_url || ''}" placeholder="Trailer URL">
        `;
    } else if (table === 'blog') {
        formHtml = `
            <input type="text" id="title" value="${data.title || ''}" placeholder="Title" required>
            <input type="text" id="slug" value="${data.slug || ''}" placeholder="URL Slug">
            <textarea id="content" placeholder="Content" rows="5" required>${data.content || ''}</textarea>
            <input type="text" id="category" value="${data.category || ''}" placeholder="Category">
            <input type="url" id="coverImage" value="${data.cover_image || ''}" placeholder="Cover Image URL">
            <label><input type="checkbox" id="published" ${data.published ? 'checked' : ''}> Published</label>
        `;
    }
    
    document.getElementById('modalForm').innerHTML = formHtml;
    document.getElementById('itemModal').style.display = 'flex';
}

// Save item
async function saveItem() {
    const formData = {};
    const inputs = document.querySelectorAll('#modalForm input, #modalForm textarea, #modalForm select');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value;
        }
    });
    
    // Map field names to database columns
    const dbFields = {
        title: 'title', artist: 'artist', genre: 'genre', category: 'category',
        year: 'year', fileUrl: 'file_url', coverImage: 'cover_image', description: 'description',
        country: 'country', rating: 'rating', trailerUrl: 'trailer_url', content: 'content',
        slug: 'slug', published: 'published'
    };
    
    const dbData = {};
    for (const [key, value] of Object.entries(formData)) {
        const dbKey = dbFields[key] || key;
        dbData[dbKey] = value;
    }
    
    if (editingItem) {
        await supabase.from(currentTable).update(dbData).eq('id', editingItem);
        showNotification('Item updated!', 'success');
    } else {
        await supabase.from(currentTable).insert([dbData]);
        showNotification('Item added!', 'success');
    }
    
    closeModal();
    // Reload the appropriate table
    if (currentTable === 'music') loadMusic();
    else if (currentTable === 'movies') loadMovies();
    else if (currentTable === 'blog') loadBlog();
}

// Delete item
async function deleteItem(table, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        await supabase.from(table).delete().eq('id', id);
        showNotification('Item deleted!', 'success');
        if (table === 'music') loadMusic();
        else if (table === 'movies') loadMovies();
        else if (table === 'blog') loadBlog();
        else if (table === 'contacts') loadContacts();
        else if (table === 'subscribers') loadSubscribers();
    }
}

// Mark contact as read
async function markContactRead(id) {
    await supabase.from('contacts').update({ status: 'read' }).eq('id', id);
    loadContacts();
    showNotification('Marked as read', 'success');
}

// Import JSON data
async function importJSON() {
    const fileInput = document.getElementById('jsonFile');
    const importType = document.getElementById('importType').value;
    
    if (!fileInput.files[0]) {
        showNotification('Please select a JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            let table;
            if (importType === 'music') table = 'music';
            else if (importType === 'movies') table = 'movies';
            else table = 'blog_posts';
            
            // Insert data (handle array or single object)
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
                await supabase.from(table).insert([item]);
            }
            showNotification(`Imported ${items.length} items!`, 'success');
            document.getElementById('importStatus').innerHTML = `<p style="color: #4CAF50;">✅ Successfully imported ${items.length} ${importType} items</p>`;
            
            // Reload tables
            if (importType === 'music') loadMusic();
            else if (importType === 'movies') loadMovies();
            else loadBlog();
        } catch (error) {
            showNotification('Error parsing JSON: ' + error.message, 'error');
        }
    };
    reader.readAsText(fileInput.files[0]);
}

// Load sample data
async function loadSampleData() {
    const sampleMusic = [
        { title: "Sample Song 1", artist: "Sample Artist", genre: "Afrobeats", file_url: "https://example.com/sample.mp3", country: "Ghana" },
        { title: "Sample Song 2", artist: "Another Artist", genre: "Hip-Hop", file_url: "https://example.com/sample2.mp3", country: "Nigeria" }
    ];
    
    for (const item of sampleMusic) {
        await supabase.from('music').insert([item]);
    }
    loadMusic();
    showNotification('Sample data loaded!', 'success');
}

function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
}

// Initialize
initSupabase();