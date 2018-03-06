// Saves options to chrome.storage
function save_options() {
  var athlete_number = document.getElementById('athlete_number').value;
  var home_parkrun = document.getElementById('home_parkrun').value;
  var is_pedant = document.getElementById('is_pedant').checked;
  chrome.storage.sync.set({
    athlete_number: athlete_number,
    home_parkrun: home_parkrun,
    is_pedant: is_pedant
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    athlete_number: '',
    home_parkrun: '',
    is_pedant: false
  }, function(items) {
    document.getElementById('athlete_number').value = items.athlete_number;
    document.getElementById('home_parkrun').value = items.home_parkrun;
    document.getElementById('is_pedant').checked = items.is_pedant;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
