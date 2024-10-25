// JavaScript for handling job fetching and toggling between sections
document.addEventListener("DOMContentLoaded", () => {
  fetchIssues();

  const showIncompleteButton = document.getElementById("show-incomplete");
  const showCompleteButton = document.getElementById("show-complete");
  const incompleteJobsSection = document.getElementById("incomplete-jobs");
  const completeJobsSection = document.getElementById("complete-jobs");
  const closeDetailButton = document.getElementById("close-detail");

  // Show Incomplete Jobs
  showIncompleteButton.addEventListener("click", () => {
    incompleteJobsSection.classList.remove("hidden");
    completeJobsSection.classList.add("hidden");
    showIncompleteButton.classList.add("active");
    showCompleteButton.classList.remove("active");
  });

  // Show Complete Jobs
  showCompleteButton.addEventListener("click", () => {
    incompleteJobsSection.classList.add("hidden");
    completeJobsSection.classList.remove("hidden");
    showCompleteButton.classList.add("active");
    showIncompleteButton.classList.remove("active");
  });

  // Close Detail View
  closeDetailButton.addEventListener("click", () => {
    const jobDetail = document.getElementById("job-detail");
    jobDetail.classList.add("hidden"); 
    setTimeout(() => {
      window.history.back(); 
  }, 300); 
  });
});

// Fetch issues from API
async function fetchIssues() {
  try {
    const response = await fetch("https://school-web-backend.onrender.com/all-issues", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayIssues(data.data);
    console.log(data);
  } catch (error) {
    console.error("Error fetching issues:", error.message);
  }
}

// Display issues in the lists
function displayIssues(issues) {
  const incompleteList = document.getElementById("incomplete-list");
  const completeList = document.getElementById("complete-list");

  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  issues.forEach((issue) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      issue.status === "completed" ? "complete-job" : "incomplete-job"
    );

    // Create issue title
    const title = document.createElement("span");
    title.textContent = issue.issue_description;
     if(issue.status === 'incomplete'){
      title.onclick = () => showJobDetail(issue); 
     }
    // Show details on click
    title.classList.add("job-title"); // Optional: add a class for styling
    listItem.appendChild(title);

    // Create buttons for completing/undoing jobs
    const actions = document.createElement("div");

    if (issue.status === "incomplete") {
      const completeButton = document.createElement("button");
      completeButton.textContent = "Complete";
      completeButton.onclick = () => completeJob(issue.id);
      actions.appendChild(completeButton);
    } else {
      const undoButton = document.createElement("button");
      undoButton.classList.add("undo-complete");
      undoButton.textContent = "Undo";
      undoButton.onclick = () => undoJob(issue.id);
      actions.appendChild(undoButton);
    }

    listItem.appendChild(actions);
    (issue.status === "complete" ? completeList : incompleteList).appendChild(
      listItem
    );
  });
}

// Close job detail
function closeJobDetail() {
  const jobDetail = document.getElementById("job-detail");
  jobDetail.classList.add("hidden"); // Hide the popup
}

// Function to open the job detail popup
function openJobDetail() {
  const jobDetail = document.getElementById("job-detail");
  jobDetail.classList.remove("hidden"); // Show the popup
}

// Event listener for clicks outside of the popup
document.addEventListener("click", function (event) {
  const jobDetail = document.getElementById("job-detail");
  const jobDetailContent = document.querySelector(".job-detail-content");

  // Check if the click was outside the job detail content
  if (
    jobDetail.classList.contains("hidden") === false &&
    !jobDetailContent.contains(event.target)
  ) {
    closeJobDetail(); // Close the popup
  }
});

// Show job detail
function showJobDetail(issue) {
  const jobDetail = document.getElementById("job-detail");
  const jobInfo = document.getElementById("job-info");

  // Set job details
  jobInfo.innerHTML = `
        <div><i class="fas fa-user"></i> Reporter: ${issue.reporter_name}</div>
        <div><i class="fas fa-envelope"></i> Email: ${issue.email}</div>
        <div><i class="fas fa-map-marker-alt"></i> Location: ${issue.location}</div>
        <div><i class="fas fa-exclamation-circle"></i> Issue Description: ${issue.issue_description}</div>
    `;

  // Show the detail section
  jobDetail.classList.remove("hidden");
  jobDetail.style.display = "flex"; // Use flex to center content
}

// Complete job
async function completeJob(jobId) {
  try {
    const response = await fetch(
      `https://school-web-backend.onrender.com/complete-issue/${jobId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      fetchIssues();
    }
  } catch (error) {
    console.error("Error completing job:", error);
  }
}

// Undo job
async function undoJob(jobId) {
  try {
    const response = await fetch(`https://school-web-backend.onrender.com/undo-issue/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      fetchIssues();
    }
  } catch (error) {
    console.error("Error undoing job:", error);
  }
}
