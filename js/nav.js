"use strict";

/*******************************************************************************
  Handling navbar clicks and updating navbar
*/

//Show all stories when user clicks 
function navAllStories() {
  hidePageComponents();
  putStoriesOnPage();
}

$('#nav-all').on('click', navAllStories)

//Show login and signup form when user clicks login
function navLoginClick() {
  hidePageComponents();
  $("#login-form").show();
  $("#signup-form").show();
}

$("#nav-login").on("click", navLoginClick);

//Updates navbar on user login
function updateNavOnLogin() {
  $(".main-nav-links").show();
  $("#nav-login").hide();
  $("#nav-logout").show();
  $("#nav-user-profile").text(`${currentUser.username}`).show(); 
}

//Show stories and submission form when user clicks submit
function navSubmitClick(){
  hidePageComponents();
  $("#submission-form").show();
  putStoriesOnPage();
}

$('#nav-submit-story').on('click', navSubmitClick)

//Show user favorites upon clicking favorites
function navUserFavoriteStories(){
  hidePageComponents();
  putFavStoriesOnPage();
}

$('#nav-my-favorites').on('click', navUserFavoriteStories)

//Show user submitted stories upon clicking my stories.
function navUserStories(){
  hidePageComponents();
  putUserStoriesOnPage();
}

$('#nav-my-stories').on('click', navUserStories)