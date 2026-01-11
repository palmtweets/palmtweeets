// Supabase Configuration - KEYS ZAKO ZIKO HAPA
const SUPABASE_URL = 'https://kszlwvapzsqwxylpeelt.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzemx3dmFwenNxd3h5bHBlZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODA0MDUsImV4cCI6MjA4MTk1NjQwNX0.qx6zB3KUcg1ZbJOJ6eoPh4XWDrvpaNFdsA-WT72niPs';

// Initialize Supabase Client
// MUHIMU: Tunatumia 'sb' badala ya 'supabase' kuzuia mgongano
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Constants
const universities = [
    "University of Dar es Salaam (UDSM)", 
    "University of Dodoma (UDOM)", 
    "IFM", 
    "Ardhi University", 
    "Mzumbe", 
    "SUA", 
    "DIT", 
    "St. Joseph", 
    "Mbeya University of Science and Technology (MUST)"
];

// Global State
let currentUser = null;

