// Array to store all events
let events = [];

// Variable to track if we're editing an event
let editingEventIndex = null;

// Category color mapping
const categoryColors = {
  'academic': '#FFE6E6',      // Light red
  'work': '#E6F3FF',          // Light blue
  'personal': '#FFF6E6',      // Light orange
  'social': '#F0E6FF',        // Light purple
  'fitness': '#E6FFE6',       // Light green
  'other': '#F5F5F5'          // Light gray
};

/**
 * Open modal for creating a new event
 */
function openCreateModal() {
  editingEventIndex = null;
  document.getElementById('eventModalLabel').innerText = 'Create Event';
  document.getElementById('event_form').reset();
  updateLocationOptions('in-person');
}

/**
 * Toggle between Location and Remote URL fields based on event modality
 * @param {string} modality - The selected modality value ('in-person' or 'remote')
 */
function updateLocationOptions(modality) {
  const locationField = document.getElementById('location_field');
  const remoteUrlField = document.getElementById('remote_url_field');
  const locationInput = document.getElementById('event_location');
  const remoteUrlInput = document.getElementById('event_remote_url');
  
  if (modality === 'in-person') {
    // Show location field, hide remote URL field
    locationField.style.display = 'block';
    remoteUrlField.style.display = 'none';
    
    // Make location required, remote URL not required
    locationInput.required = true;
    remoteUrlInput.required = false;
  } else if (modality === 'remote') {
    // Hide location field, show remote URL field
    locationField.style.display = 'none';
    remoteUrlField.style.display = 'block';
    
    // Make remote URL required, location not required
    locationInput.required = false;
    remoteUrlInput.required = true;
  }
}

/**
 * Save event from the modal form
 */
function saveEvent() {
  // Get form values
  const name = document.getElementById('event_name').value;
  const category = document.getElementById('event_category').value;
  const weekday = document.getElementById('event_weekday').value;
  const time = document.getElementById('event_time').value;
  const modality = document.getElementById('event_modality').value;
  const attendees = document.getElementById('event_attendees').value;
  
  let location = null;
  let remote_url = null;
  
  // Get location or remote URL based on modality
  if (modality === 'in-person') {
    location = document.getElementById('event_location').value;
  } else if (modality === 'remote') {
    remote_url = document.getElementById('event_remote_url').value;
  }
  
  // Create event details object
  const eventDetails = {
    name: name,
    category: category,
    weekday: weekday,
    time: time,
    modality: modality,
    location: location,
    remote_url: remote_url,
    attendees: attendees
  };
  
  if (editingEventIndex !== null) {
    // Update existing event
    const oldEvent = events[editingEventIndex];
    events[editingEventIndex] = eventDetails;
    
    // Remove old event card from UI
    const oldDayDiv = document.getElementById(oldEvent.weekday);
    const eventCards = oldDayDiv.querySelectorAll('.event');
    eventCards.forEach((card, index) => {
      // Find the matching event card and remove it
      if (card.dataset.eventIndex == editingEventIndex) {
        card.remove();
      }
    });
    
    // Add updated event to UI
    addEventToCalendarUI(eventDetails, editingEventIndex);
    
    editingEventIndex = null;
  } else {
    // Add new event to events array
    events.push(eventDetails);
    
    // Add event to calendar UI
    addEventToCalendarUI(eventDetails, events.length - 1);
  }
  
  // Log events array for debugging
  console.log(events);
  
  // Reset the form
  document.getElementById('event_form').reset();
  
  // Reset location fields visibility
  updateLocationOptions('in-person');
  
  // Close the modal
  const myModalElement = document.getElementById('event_modal');
  const myModal = bootstrap.Modal.getOrCreateInstance(myModalElement);
  myModal.hide();
}

/**
 * Open modal to edit an existing event
 * @param {number} eventIndex - Index of the event in the events array
 */
function editEvent(eventIndex) {
  editingEventIndex = eventIndex;
  const event = events[eventIndex];
  
  // Update modal title
  document.getElementById('eventModalLabel').innerText = 'Update Event';
  
  // Pre-fill form fields
  document.getElementById('event_name').value = event.name;
  document.getElementById('event_category').value = event.category;
  document.getElementById('event_weekday').value = event.weekday;
  document.getElementById('event_time').value = event.time;
  document.getElementById('event_modality').value = event.modality;
  document.getElementById('event_attendees').value = event.attendees;
  
  // Update location fields based on modality
  updateLocationOptions(event.modality);
  
  if (event.modality === 'in-person') {
    document.getElementById('event_location').value = event.location;
  } else if (event.modality === 'remote') {
    document.getElementById('event_remote_url').value = event.remote_url;
  }
  
  // Open the modal
  const myModalElement = document.getElementById('event_modal');
  const myModal = new bootstrap.Modal(myModalElement);
  myModal.show();
}

/**
 * Create an event card HTML element
 * @param {Object} eventDetails - The event details object
 * @param {number} eventIndex - Index of the event in the events array
 * @returns {HTMLElement} - The created event card element
 */
function createEventCard(eventDetails, eventIndex) {
  // Create main event div
  let event_element = document.createElement('div');
  event_element.classList = 'event row border rounded m-1 py-1';
  event_element.dataset.eventIndex = eventIndex;
  
  // Set background color based on category
  event_element.style.backgroundColor = categoryColors[eventDetails.category] || categoryColors['other'];
  
  // Add click event to edit
  event_element.onclick = function() {
    editEvent(eventIndex);
  };
  
  // Create info div
  let info = document.createElement('div');
  
  // Build event card HTML with event details
  let locationInfo = '';
  if (eventDetails.modality === 'in-person') {
    locationInfo = `<strong>Location:</strong> ${eventDetails.location}`;
  } else if (eventDetails.modality === 'remote') {
    locationInfo = `<strong>Remote URL:</strong> <a href="${eventDetails.remote_url}" target="_blank" onclick="event.stopPropagation();">${eventDetails.remote_url}</a>`;
  }
  
  info.innerHTML = `
    <div><strong>${eventDetails.name}</strong></div>
    <div><strong>Category:</strong> ${eventDetails.category.charAt(0).toUpperCase() + eventDetails.category.slice(1)}</div>
    <div><strong>Time:</strong> ${eventDetails.time}</div>
    <div><strong>Modality:</strong> ${eventDetails.modality === 'in-person' ? 'In Person' : 'Remote'}</div>
    <div>${locationInfo}</div>
    <div><strong>Attendees:</strong> ${eventDetails.attendees}</div>
  `;
  
  // Append info to event element
  event_element.appendChild(info);
  
  return event_element;
}

/**
 * Add event to the calendar UI
 * @param {Object} eventInfo - The event information object
 * @param {number} eventIndex - Index of the event in the events array
 */
function addEventToCalendarUI(eventInfo, eventIndex) {
  // Create event card
  let event_card = createEventCard(eventInfo, eventIndex);
  
  // Get the correct day div based on weekday
  const dayDiv = document.getElementById(eventInfo.weekday);
  
  // Append event card to the day div
  dayDiv.appendChild(event_card);
}