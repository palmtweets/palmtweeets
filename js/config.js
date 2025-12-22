// Supabase Configuration
// BADILISHA HIZI NA ZA KWAKO KUTOKA SUPABASE DASHBOARD
const SUPABASE_URL = 'https://kszlwvapzsqwxylpeelt.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzemx3dmFwenNxd3h5bHBlZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODA0MDUsImV4cCI6MjA4MTk1NjQwNX0.qx6zB3KUcg1ZbJOJ6eoPh4XWDrvpaNFdsA-WT72niPs';

// Initialize Supabase Client
const supabase = supabase.createClient(https://kszlwvapzsqwxylpeelt.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzemx3dmFwenNxd3h5bHBlZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODA0MDUsImV4cCI6MjA4MTk1NjQwNX0.qx6zB3KUcg1ZbJOJ6eoPh4XWDrvpaNFdsA-WT72niPs);

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
    "Tumaini University"
];

// Global State
let currentUser = null;

