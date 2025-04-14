/**
 * Music Player Application - Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Music Player Application Initialized');

  // Initialize tooltips and popovers if Bootstrap is loaded
  if (typeof bootstrap !== 'undefined') {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  // Flash message handling
  const flashMessages = document.querySelectorAll('.alert-dismissible');
  flashMessages.forEach(message => {
    // Auto dismiss flash messages after 5 seconds
    setTimeout(() => {
      const alert = new bootstrap.Alert(message);
      alert.close();
    }, 5000);
  });

  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Search form functionality
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      const searchInput = document.getElementById('searchInput');
      if (searchInput.value.trim() === '') {
        e.preventDefault();
        searchInput.classList.add('is-invalid');
      }
    });
  }

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Handle playlist form submission
  const playlistForm = document.getElementById('playlistForm');
  if (playlistForm) {
    playlistForm.addEventListener('submit', function(e) {
      const playlistName = document.getElementById('playlistName');
      if (playlistName.value.trim() === '') {
        e.preventDefault();
        playlistName.classList.add('is-invalid');
      }
    });
  }

  // Add song to playlist functionality
  const addToPlaylistButtons = document.querySelectorAll('.add-to-playlist');
  addToPlaylistButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const songId = this.dataset.songId;
      const playlistId = this.dataset.playlistId;

      try {
        // This is a placeholder for real API call
        // In a real app, make a fetch request to your API endpoint
        console.log(`Adding song ${songId} to playlist ${playlistId}`);

        // Show success message
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = 1050;
        toast.innerHTML = `
          <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                Song added to playlist successfully!
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>
        `;
        document.body.appendChild(toast);
        const toastEl = new bootstrap.Toast(toast.querySelector('.toast'));
        toastEl.show();

        // Remove the toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
          document.body.removeChild(toast);
        });
      } catch (error) {
        console.error('Error adding song to playlist:', error);
      }
    });
  });
});
