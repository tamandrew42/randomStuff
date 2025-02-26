// public/app.js
document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements
  const recordsList = document.getElementById('records-list');
  const personForm = document.getElementById('person-form');
  const nameInput = document.getElementById('name');
  const birthDateInput = document.getElementById('birthDate');
  const birthPlaceInput = document.getElementById('birthPlace');

  // Fetch and display people records
  function fetchPeople() {
    fetch('/api/people')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(people => {
        displayPeople(people);
      })
      .catch(error => {
        console.error('Error fetching people:', error);
        recordsList.innerHTML = '<p class="no-records">Failed to load records. Please try again later.</p>';
      });
  }

  // Display people in the UI
  function displayPeople(people) {
    if (people.length === 0) {
      recordsList.innerHTML = '<p class="no-records">No records found.</p>';
      return;
    }

    const html = people.map(person => `
      <div class="record">
        <h3>${escapeHtml(person.name)}</h3>
        <p><strong>Birth Date:</strong> ${formatDate(person.birthDate)}</p>
        <p><strong>Birth Place:</strong> ${escapeHtml(person.birthPlace || 'Unknown')}</p>
      </div>
    `).join('');

    recordsList.innerHTML = html;
  }

  // Handle form submission
  personForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const personData = {
      name: nameInput.value,
      birthDate: birthDateInput.value,
      birthPlace: birthPlaceInput.value
    };

    fetch('/api/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(personData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(newPerson => {
      // Clear form
      personForm.reset();
      
      // Refresh the list
      fetchPeople();
    })
    .catch(error => {
      console.error('Error saving person:', error);
      alert('Failed to save the record. Please try again.');
    });
  });

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString();
  }

  // Helper function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial fetch
  fetchPeople();
});
