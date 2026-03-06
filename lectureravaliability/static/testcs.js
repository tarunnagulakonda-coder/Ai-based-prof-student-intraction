let lecturers = [];
let currentUser = null;

// Navigation Logic
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${viewId}-view`).classList.remove('hidden');
    if (viewId === 'student') {
        fetchLecturers();
    }
}

// Fetch from API
async function fetchLecturers() {
    try {
        const response = await fetch('/api/lecturers/');
        const data = await response.json();
        lecturers = data;

        // Only re-render if we are on the student view or initial load
        if (!document.getElementById('student-view').classList.contains('hidden')) {
            renderStudentList();
        }
    } catch (error) {
        console.error('Error fetching lecturers:', error);
    }
}

// Render Student View
function renderStudentList() {
    const listContainer = document.getElementById('lecturer-list');

    if (lecturers.length === 0) {
        listContainer.innerHTML = '<p>No lecturers found in database.</p>';
        return;
    }

    listContainer.innerHTML = lecturers.map(lec => {
        const statusClass = lec.status ? lec.status.replace(/\s+/g, '-').toLowerCase() : 'unknown';
        return `
        <div class="card">
            <h3>${lec.name}</h3>
            <p><strong>Location:</strong> ${lec.cabin}</p>
            <span class="status-pill status-${statusClass}">
                ${lec.status || 'Unknown'}
            </span>
        </div>
        `;
    }).join('');
}

// Lecturer Login
async function handleLogin() {
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value; // Get the password!

    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userIn,
                password: passIn
            })
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
        console.error('Login error:', error);
    }
}

// Dashboard Logic
function showLecturerDashboard() {
    showView('lecturer');
    document.getElementById('prof-name').innerText = currentUser.name;

    // Attempt to match the status ignoring case
    const select = document.getElementById('status-select');
    const options = Array.from(select.options);
    const match = options.find(o => o.value.toLowerCase() === currentUser.status.toLowerCase());

    if (match) {
        select.value = match.value;
    } else {
        // If not found in standard options, we could add it dynamically, but for now we leave it
    }

    document.getElementById('cabin-input').value = currentUser.cabin;
}

function updateLecturerData() {
    alert("To update the status or location, please modify the record in the Django Admin interface.");
    showView('student');
}

function logout() {
    currentUser = null;
    showView('login');
}

// Initial Load
fetchLecturers();