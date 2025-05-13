// downloads.js
import { db, ref, push, update, remove, onValue } from './firebase-config.js';

// Example Firebase code using db
const downloadForm = document.getElementById('downloadForm');
const downloadModal = document.getElementById('downloadModal');
const confirmModal = document.getElementById('confirmModal');
const downloadContainer = document.getElementById('downloadsContainer');

let currentEditId = null;
let currentDeleteId = null;

// Render downloads and interact with the database
onValue(ref(db, 'resources'), renderDownloads); // You need to use `db` here
// Your existing download logic...

function createDownloadCard(id, download) {
    const card = document.createElement('div');
    card.className = 'download-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-200';
    card.dataset.id = id;

    const categoryColors = {
        'Documents': 'bg-blue-100 text-blue-800',
        'Software': 'bg-green-100 text-green-800',
        'Media': 'bg-purple-100 text-purple-800',
        'Other': 'bg-gray-100 text-gray-800'
    };

    card.innerHTML = `
        <div class="p-5">
            <div class="flex justify-between items-start">
                <div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[download.category] || categoryColors['Other']}">
                        ${download.category}
                    </span>
                </div>
                <div class="admin-actions ${isAdminMode ? '' : 'hidden'} flex space-x-2">
                    <button class="edit-btn text-indigo-600 hover:text-indigo-800" data-id="${id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h3 class="mt-2 text-lg font-semibold text-gray-800">${download.title}</h3>
            <p class="mt-2 text-gray-600">${download.description}</p>
            <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-gray-500">${download.date}</span>
                <a href="${download.driveLink}" target="_blank" class="inline-flex items-center px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                    <i class="fas fa-download mr-2"></i> Download
                </a>
            </div>
        </div>
    `;

    return card;
}

function renderDownloads(snapshot) {
    downloadContainer.innerHTML = '';
    snapshot.forEach(child => {
        const id = child.key;
        const data = child.val();
        const card = createDownloadCard(id, data);
        downloadContainer.appendChild(card);
    });
}

onValue(ref(db, 'resources'), renderDownloads);

// Add/Edit download
downloadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const driveLink = document.getElementById('driveLink').value;
    const category = document.getElementById('category').value;
    const date = new Date().toISOString().split('T')[0];

    const resourceData = { title, description, driveLink, category, date };

    if (currentEditId) {
        update(ref(db, 'resources/' + currentEditId), resourceData);
        currentEditId = null;
    } else {
        push(ref(db, 'resources'), resourceData);
    }

    downloadModal.classList.add('hidden');
    downloadForm.reset();
});

// Open edit modal
document.addEventListener('click', (e) => {
    if (e.target.closest('.edit-btn')) {
        const id = e.target.closest('.edit-btn').dataset.id;
        currentEditId = id;
        const card = e.target.closest('.download-card');
        document.getElementById('title').value = card.querySelector('h3').textContent;
        document.getElementById('description').value = card.querySelector('p').textContent;
        document.getElementById('driveLink').value = card.querySelector('a').href;
        document.getElementById('category').value = card.querySelector('span').textContent;
        downloadModal.classList.remove('hidden');
    }

    if (e.target.closest('.delete-btn')) {
        currentDeleteId = e.target.closest('.delete-btn').dataset.id;
        confirmModal.classList.remove('hidden');
    }
});

// Delete confirmed
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (currentDeleteId) {
        remove(ref(db, 'resources/' + currentDeleteId));
        currentDeleteId = null;
    }
    confirmModal.classList.add('hidden');
});
