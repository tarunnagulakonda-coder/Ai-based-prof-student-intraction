let lecturers = [];
let currentUser = null;

// --- Scrollytelling Canvas Logic ---
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const scrollyWrapper = document.getElementById('scrolly-wrapper');
// Total frames in sequence
const frameCount = 120;
const images = [];
let imagesLoaded = 0;

// Hardcoded path for the sequence images user mentioned (assume they place it here)
const currentSequencePath = '/static/sequence';

// Preload images
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = `${currentSequencePath}/${i}.webp`;
    images.push(img);
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 1) {
            // Draw first frame ASAP
            drawFrame(0);
        }
    };
    img.onerror = () => {
        // Fallback for missing images so it doesn't break
        console.warn(`Missing sequence image: ${img.src}`);
    };
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(lastFrameIndex);
}

let lastFrameIndex = 0;
function drawFrame(index) {
    if (images[index] && images[index].complete && images[index].naturalWidth !== 0) {
        lastFrameIndex = index;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate "contain" aspect ratio
        const hRatio = canvas.width / images[index].width;
        const vRatio = canvas.height / images[index].height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (canvas.width - images[index].width * ratio) / 2;
        const centerShift_y = (canvas.height - images[index].height * ratio) / 2;

        context.drawImage(images[index], 0, 0, images[index].width, images[index].height,
            centerShift_x, centerShift_y, images[index].width * ratio, images[index].height * ratio);
    } else {
        // If image missing, just fill with a gradient or placeholder color to keep it premium
        context.fillStyle = 'rgba(15, 23, 42, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Handle Scroll for Canvas
window.addEventListener('scroll', () => {
    // Canvas Frame Calculation
    const scrollTop = document.documentElement.scrollTop;
    const maxScroll = scrollyWrapper.scrollHeight - window.innerHeight;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    requestAnimationFrame(() => drawFrame(frameIndex));

    // Text Overlay Animation Logic
    const overlays = document.querySelectorAll('.text-overlay');

    // Calculate which overlay to show based on scroll fraction
    // If we have 3 overlays:
    // 0.0 - 0.2: Overlay 1
    // 0.4 - 0.6: Overlay 2
    // 0.8 - 1.0: Overlay 3
    overlays.forEach((overlay, idx) => {
        const threshold = (1 / overlays.length) * idx;
        const endThreshold = threshold + (1 / overlays.length);

        // Active if scroll is within this range + 0.1 padding to fade out early
        if (scrollFraction >= threshold && scrollFraction < maxScroll && scrollFraction < endThreshold - 0.05) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    });

    // Navbar visual change
    const nav = document.querySelector('.navbar');
    if (scrollTop > 50) {
        nav.classList.add('blur-nav');
    } else {
        nav.classList.remove('blur-nav');
    }
});


// --- Layout & View Logic ---
function showView(viewId) {
    // Hide scrolling exp if navigating away from home
    if (viewId !== 'home') {
        scrollyWrapper.classList.add('hidden');
    } else {
        scrollyWrapper.classList.remove('hidden');
    }

    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    if (viewId === 'student' || viewId === 'login' || viewId === 'lecturer') {
        document.getElementById(`${viewId}-view`).classList.remove('hidden');
        document.getElementById('ai-board').classList.add('hidden'); // Optional: hide board outside Home/Directory
    } else {
        // Home view
        document.getElementById('ai-board').classList.remove('hidden');
    }

    if (viewId === 'student') {
        fetchLecturers();
    }

    window.scrollTo({ top: scrollyWrapper.scrollHeight + 100, behavior: 'smooth' });
}

function scrollToTop() {
    scrollyWrapper.classList.remove('hidden');
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('ai-board').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- API Logic ---
async function fetchLecturers() {
    try {
        const response = await fetch('/api/lecturers/');
        const data = await response.json();
        lecturers = data;

        if (!document.getElementById('student-view').classList.contains('hidden')) {
            renderStudentList();
        }
    } catch (error) {
        console.error('Error fetching lecturers:', error);
    }
}

function renderStudentList() {
    const listContainer = document.getElementById('lecturer-list');

    if (lecturers.length === 0) {
        listContainer.innerHTML = '<p>No lecturers found in database.</p>';
        return;
    }

    listContainer.innerHTML = lecturers.map(lec => {
        const statusClass = lec.status ? lec.status.replace(/\s+/g, '-').toLowerCase() : 'unknown';
        return `
        <div class="card glassmorphism">
            <h3>${lec.name}</h3>
            <p><strong>Location:</strong> ${lec.cabin}</p>
            <span class="status-pill status-${statusClass}">
                ${lec.status || 'Unknown'}
            </span>
        </div>
        `;
    }).join('');
}

// AI Suggestions Fetch
async function fetchAISuggestions() {
    const listContainer = document.getElementById('ai-suggestions-list');
    try {
        const response = await fetch('/api/suggestions/');
        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
            listContainer.innerHTML = data.suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
        } else {
            listContainer.innerHTML = '<p>No predictive insights available yet.</p>';
        }
    } catch (e) {
        listContainer.innerHTML = '<p class="error">Failed to load AI suggestions.</p>';
    }
}
// Fetch initially
fetchAISuggestions();
// Refresh suggestions every minute
setInterval(fetchAISuggestions, 60000);


// Lecturer Logic
async function handleLogin() {
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userIn, password: passIn })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentUser = data.user;
            showLecturerDashboard();
            document.getElementById('login-error').innerText = "";
        } else {
            document.getElementById('login-error').innerText = data.error || "Invalid credentials!";
        }
    } catch (error) {
        document.getElementById('login-error').innerText = "Failed to connect to server.";
    }
}

function showLecturerDashboard() {
    showView('lecturer');
    document.getElementById('prof-name').innerText = currentUser.name;

    const select = document.getElementById('status-select');
    const options = Array.from(select.options);
    const match = options.find(o => o.value.toLowerCase() === currentUser.status.toLowerCase());

    if (match) {
        select.value = match.value;
    }
    document.getElementById('cabin-input').value = currentUser.cabin;
}

async function updateLecturerData() {
    const newStatus = document.getElementById('status-select').value;
    const newCabin = document.getElementById('cabin-input').value;

    try {
        const response = await fetch('/api/update_status/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUser.id, status: newStatus, cabin: newCabin })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentUser.status = newStatus;
            currentUser.cabin = newCabin;
            alert('Status updated dynamically! Check AI Board for instant insight updates.');
            fetchAISuggestions(); // Force refresh the suggestions
        } else {
            alert('Error updating status: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to connect to server.');
    }
}

function logout() {
    currentUser = null;
    showView('login');
}