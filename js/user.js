"use strict";

/*****************************************************************
  User login/signup
*/

// Allows properties of currently logged in user to be accessed from inside all functions.
let currentUser;

//Handle submission of login form
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // Retrieves user info from API and returns instance of User class  
  currentUser = await User.login(username, password);
  $("#login-form").trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$("#login-form").on("submit", login);

//Handle signup form submission
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $("#signup-form").trigger("reset");
}

$("#signup-form").on("submit", signup);

//Handle click of logout button
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$("#nav-logout").on("click", logout);

//Checks if local storage contains token and username for current user.
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // currentUser will be null if data not found in local storage.
  currentUser = await User.loginViaStoredCredentials(token, username);
}

//token and username put in local storage as part of signup
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

//Show stories on login
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();
  putStoriesOnPage();
  updateNavOnLogin();
}