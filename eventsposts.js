// Import necessary Firebase functions
import { db, ref, push, update, remove, onValue } from './firebase-config.js';

// Add Event
export function addEvent() {
  const name = document.getElementById('eventName').value;
  const date = document.getElementById('eventDate').value;
  const description = document.getElementById('eventDescription').value;

  if (!name || !date) {
    showNotification("Name and date are required.");
    return;
  }

  const newRef = push(ref(db, 'events'));
  update(newRef, {
    name,
    date,
    description
  }).then(() => {
    showNotification("Event added successfully!");
    closeAddModal();
  }).catch(err => {
    console.error(err);
    showNotification("Error adding event.");
  });
}

// Remove Event
export function removeEvent() {
  const eventId = document.getElementById('eventToRemove').value;

  if (!eventId) {
    showNotification("Select an event to remove.");
    return;
  }

  remove(ref(db, 'events/' + eventId)).then(() => {
    showNotification("Event removed successfully!");
    closeRemoveModal();
  }).catch(err => {
    console.error(err);
    showNotification("Error removing event.");
  });
}

// Fetch and Display Events
function fetchEvents() {
  const eventsRef = ref(db, 'events');
  onValue(eventsRef, snapshot => {
    const data = snapshot.val();
    const grid = document.querySelector('.grid');
    const select = document.getElementById('eventToRemove');

    grid.innerHTML = '';
    select.innerHTML = '<option value="">Select an event...</option>';

    if (data) {
      for (const id in data) {
        const event = data[id];

        // Card UI
        const card = document.createElement('div');
        card.className = 'event-card bg-white p-4 rounded-lg shadow-md';
        card.innerHTML = `
          <h3 class="text-lg font-medium text-gray-700">${event.name}</h3>
          <p class="text-sm text-gray-500">${event.date}</p>
          <p class="text-sm text-gray-400">${event.description || 'No description.'}</p>
     
        `;
        grid.appendChild(card);

        // Dropdown
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${event.name} - ${event.date}`;
        select.appendChild(option);
      }
    }
  });
}

// Modal Control
export function openAddModal() {
  const modal = document.getElementById('addModal');
  modal.classList.remove('invisible', 'opacity-0');
  modal.classList.add('opacity-100');
}
export function closeAddModal() {
  const modal = document.getElementById('addModal');
  modal.classList.add('invisible', 'opacity-0');
  modal.classList.remove('opacity-100');
}
export function openRemoveModal() {
  const modal = document.getElementById('removeModal');
  modal.classList.remove('invisible', 'opacity-0');
  modal.classList.add('opacity-100');
}
export function closeRemoveModal() {
  const modal = document.getElementById('removeModal');
  modal.classList.add('invisible', 'opacity-0');
  modal.classList.remove('opacity-100');
}

// Notification
function showNotification(msg) {
  const toast = document.getElementById('notification');
  const text = document.getElementById('notificationMessage');
  text.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Initialize
window.addEventListener('load', fetchEvents);
