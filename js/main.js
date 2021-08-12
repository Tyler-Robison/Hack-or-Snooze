"use strict";

//Hides all componests. Individual components can be displayed afterwards.
function hidePageComponents() {
  const components = [
    $("#all-stories-list"),
    $("#login-form"),
    $("#signup-form"),
    $("#submission-form"),
    $("#fav-stories-list"),
    $("#my-stories-list"),
  ];
  components.forEach(c => c.hide());
}

//Starts app, only function invoked upon refresh.
async function start() {
  console.debug("start");

  // If username and token are in local storage, login user.
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // Update UI if logged in.
  if (currentUser) updateUIOnUserLogin();
}

$(start);