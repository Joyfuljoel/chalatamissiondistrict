import { db, ref, push, update, onValue, remove } from './firebase-config.js'; // Import Firebase functions

// Admin flag (this should be set when the admin logs in)
let isAdmin = false; 

// Admin login functionality
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const cancelAdminLogin = document.getElementById('cancelAdminLogin');
const adminLoginForm = document.getElementById('adminLoginForm');

adminLoginBtn.addEventListener('click', () => {
    if (isAdmin) {
        // Logout
        isAdmin = false;
        adminLoginBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Admin';
        document.querySelectorAll('.admin-controls').forEach(control => {
            control.style.display = 'none';
        });
    } else {
        // Show login modal
        adminLoginModal.classList.remove('hidden');
    }
});

cancelAdminLogin.addEventListener('click', () => {
    adminLoginModal.classList.add('hidden');
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    // In a real app, you would verify credentials with a server
    // For demo purposes, we'll use simple credentials
    if (username === 'admin' && password === '2026') {
        isAdmin = true;
        adminLoginBtn.innerHTML = '<i class="fas fa-unlock mr-2"></i>Admin';
        adminLoginModal.classList.add('hidden');
        adminLoginForm.reset();

        // Show all delete buttons
        document.querySelectorAll('.admin-controls').forEach(control => {
            control.style.display = 'block';
        });

        // Add delete functionality to existing prayer cards
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const prayerCard = this.closest('.prayer-card');
                if (confirm('Are you sure you want to delete this prayer?')) {
                    prayerCard.remove();
                }
            });
        });
    } else {
        alert('Invalid credentials!');
    }
});

// Prayer form submission logic
const submitPrayerForm = document.getElementById('submitPrayerForm');
submitPrayerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    const title = document.getElementById('prayerTitle').value;  // Get title
    const content = document.getElementById('prayerContent').value;  // Get content

    const newPrayer = {
        title: title,
        content: content,
        prayedCount: 0,  // Initially, no one has prayed for this
        datePosted: new Date().toISOString()
    };

    // Push the prayer data to Firebase Realtime Database under the "prayers" node
    push(ref(db, 'prayers'), newPrayer)
        .then(() => {
            // Reset form after submission
            submitPrayerForm.reset();
            alert('Prayer submitted!');
        })
        .catch((error) => {
            console.error('Error submitting prayer:', error);
        });
});

// Fetch prayers from Firebase and listen for changes
const prayerWall = document.getElementById('prayerWall');
onValue(ref(db, 'prayers'), (snapshot) => {
    prayerWall.innerHTML = '';  // Clear current prayers

    snapshot.forEach((childSnapshot) => {
        const prayer = childSnapshot.val();
        const prayerId = childSnapshot.key;

        const newPrayerCard = document.createElement('div');
        newPrayerCard.className = 'prayer-card bg-white rounded-lg shadow-md overflow-hidden';
        newPrayerCard.dataset.id = prayerId;

        // Only show the delete button if isAdmin is true
        newPrayerCard.innerHTML = `
            ${isAdmin ? '<div class="admin-controls"><div class="delete-btn" title="Delete Prayer"><i class="fas fa-trash text-xs"></i></div></div>' : ''}
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-semibold text-gray-800">${prayer.title}</h3>
                    <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">General</span>
                </div>
                <p class="text-gray-600 mb-4">${prayer.content}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center text-gray-500">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span>You</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-sm text-gray-500 mr-2">${prayer.prayedCount} prayed</span>
                        <button class="prayed-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-sm transition-colors">
                            <i class="fas fa-hands-praying mr-1"></i>I Prayed
                        </button>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                <i class="far fa-clock mr-1"></i>${new Date(prayer.datePosted).toLocaleString()}
            </div>
        `;

         // Handle delete button functionality for admins
        if (isAdmin) {
            const deleteBtn = newPrayerCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function () {
                    if (confirm('Are you sure you want to delete this prayer?')) {
                        remove(ref(db, `prayers/${prayerId}`))
                            .then(() => newPrayerCard.remove())
                            .catch(err => console.error('Error deleting prayer:', err));
                    }
                });
            }
        }

        // Add to the beginning of the prayer wall
        prayerWall.prepend(newPrayerCard);

        // Handle "I Prayed" functionality
        const prayedBtn = newPrayerCard.querySelector('.prayed-btn');
        prayedBtn.addEventListener('click', function () {
            const prayerRef = ref(db, `prayers/${prayerId}`);
            const countElement = this.previousElementSibling;
            const count = parseInt(countElement.textContent);
            update(prayerRef, { prayedCount: count + 1 });

            countElement.textContent = (count + 1) + ' prayed';
            this.innerHTML = '<i class="fas fa-check mr-1"></i>Prayed';
            this.classList.remove('bg-green-600', 'hover:bg-green-700');
            this.classList.add('bg-gray-400', 'hover:bg-gray-500');
            this.disabled = true;
        });

       
    });
});
