let jobs = [];

// Event listener for file upload
document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const json = JSON.parse(e.target.result);
        jobs = json.map(job => new Job(job));
        populateFilters();
        updateDisplayedJobs(); // Ensure both filters and sorting are applied after loading
      } catch (err) {
        alert('Invalid JSON format');
      }
    };
    reader.readAsText(file);
  }
});

// Job class definition
class Job {
  constructor({ Title, Posted, Type, Level, Skill, Detail }) {
    this.title = Title || 'Untitled Job';
    this.posted = Posted || 'Unknown Time';
    this.type = Type || 'No Data';
    this.level = Level || 'No Data';
    this.skill = Skill || 'No Data';
    this.detail = Detail || 'No Data';
  }

  getDetails() {
    return `
      <strong>Title:</strong> ${this.title}<br>
      <strong>Type:</strong> ${this.type}<br>
      <strong>Level:</strong> ${this.level}<br>
      <strong>Skill:</strong> ${this.skill}<br>
      <strong>Description:</strong> ${this.detail}<br>
      <strong>Posted:</strong> ${this.posted}
    `;
  }

  getFormattedPostedTime() {
    const timeParts = this.posted.split(' ');
    const value = parseInt(timeParts[0]);
    if (timeParts[1].includes('hour')) return value * 60;
    if (timeParts[1].includes('minute')) return value;
    return value * 1440; // Assuming days
  }
}

// Populate filter dropdowns
function populateFilters() {
  const levels = [...new Set(jobs.map(job => job.level))];
  const types = [...new Set(jobs.map(job => job.type))];
  const skills = [...new Set(jobs.map(job => job.skill))];

  populateDropdown('levelFilter', levels);
  populateDropdown('typeFilter', types);
  populateDropdown('skillFilter', skills);
}

function populateDropdown(id, options) {
  const dropdown = document.getElementById(id);

  // Preserve the "All" option
  dropdown.innerHTML = '<option value="all">All</option>';

  // Add new options
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    dropdown.appendChild(opt);
  });
}

// Unified function for filtering and sorting
function updateDisplayedJobs() {
  const level = document.getElementById('levelFilter').value;
  const type = document.getElementById('typeFilter').value;
  const skill = document.getElementById('skillFilter').value;

  // Filter jobs based on selected criteria
  let filteredJobs = jobs.filter(job =>
    (level === 'all' || job.level === level) &&
    (type === 'all' || job.type === type) &&
    (skill === 'all' || job.skill === skill)
  );

  // Sort filtered jobs
  const sortOption = document.getElementById('sortOptions').value;
  if (sortOption === 'title-asc') {
    // Sort titles alphabetically (A-Z), case-insensitive
    filteredJobs.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
  } else if (sortOption === 'title-desc') {
    // Sort titles alphabetically (Z-A), case-insensitive
    filteredJobs.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
  
  } else if (sortOption === 'time-newest') {
    filteredJobs.sort((a, b) => a.getFormattedPostedTime() - b.getFormattedPostedTime());
  } else if (sortOption === 'time-oldest') {
    filteredJobs.sort((a, b) => b.getFormattedPostedTime() - a.getFormattedPostedTime());
  }

  // Display jobs
  displayJobs(filteredJobs);
}

// Attach unified function to filter and sort buttons
document.getElementById('filterButton').addEventListener('click', updateDisplayedJobs);
document.getElementById('sortButton').addEventListener('click', updateDisplayedJobs);

// Display jobs in the job container
function displayJobs(jobs) {
  const jobContainer = document.getElementById('jobs');
  jobContainer.innerHTML = '';

  if (jobs.length === 0) {
    // Display a "No jobs available" message if no jobs match the filter
    const noJobsMessage = document.createElement('div');
    noJobsMessage.textContent = 'No jobs available.';
    noJobsMessage.style.color = 'red';
    noJobsMessage.style.fontWeight = 'bold';
    jobContainer.appendChild(noJobsMessage);
    return;
  }

  jobs.forEach(job => {
    const jobDiv = document.createElement('div');
    jobDiv.classList.add('job');
    jobDiv.textContent = `${job.title} - ${job.type} (${job.level})`;

    jobDiv.addEventListener('click', () => {
      showModal(job);
    });

    jobContainer.appendChild(jobDiv);
  });
}

// Show modal with job details
function showModal(job) {
  const modal = document.getElementById('jobModal');
  const modalDetails = document.getElementById('modalDetails');
  const closeBtn = document.querySelector('.close');

  // Populate modal with job details
  modalDetails.innerHTML = job.getDetails();

  // Display the modal
  modal.style.display = 'block';

  // Close modal on clicking the close button
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  // Close modal when clicking outside the modal content
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}