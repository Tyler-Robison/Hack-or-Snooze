"use strict";

/* This is the global list of the stories, an instance of StoryList */
let storyList;

//When start() runs this puts the stories on the page. 
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $("#stories-loading-msg").remove();

  putStoriesOnPage();
}

//Create HTML for new stories
function generateStoryMarkup(story) {

  const hostName = story.getHostName(story);

  return $(`
      <li id="${story.storyId}">
        ${currentUser ? showHeart(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//If click on my stories <li> innerHTML needs to contain bomb span.
function generateUserStoryMarkup(story) {
  const hostName = story.getHostName(story);

  return $(`
      <li id="${story.storyId}">
        ${currentUser ? showHeart(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <span class="bomb"><i class="fas fa-bomb fa-2x"></i></span>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//create HTML for favorite icon
function showHeart(story) {
  const isFav = currentUser.isFavorite(story);
  const heartType = isFav ? "fas" : "far";
  return `
    <span class="heart">
      <i class="${heartType} fa-heart fa-2x"></i>
    </span>`;
}

$('#submissionButton').on('click', submitStory)

//If all fields have data creates newStory and passes it into addStory
//addStory adds story to API then HTML(stories/userStories)
async function submitStory(e) {
  e.preventDefault();
  if ($('#authorField').val() && $('#titleField').val() && $('#URLField').val()) { //check this

    //contains all info needed to make a new story
    const newStory = generateStory();
    const story = await storyList.addStory(newStory)

    const $story = generateStoryMarkup(story);
    $("#all-stories-list").prepend($story);

    $('#authorField').val('');
    $('#titleField').val('');
    $('#URLField').val('');

    hidePageComponents();
    putStoriesOnPage();

  } else {
    alert('Please fill all fields.')
  }
}

function generateStory() {
  return {
    'token': currentUser.loginToken,
    'story': {
      'author': $('#authorField').val(),
      'title': $('#titleField').val(),
      'url': $('#URLField').val()
    }
  }
}

//Gets list of stories from server, generates their HTML, and puts on page.
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $("#all-stories-list").empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $("#all-stories-list").append($story);
  }

  $("#all-stories-list").show();
}

//Gets list of currentUser.favorites from server, generates their HTML, and puts on page.
function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");

  $("#fav-stories-list").empty();

  if (currentUser.favorites.length === 0) {
    $("#fav-stories-list").append(`<p id="favePara">You haven't favorited any stories</p>`);
  }

  else {
    for (let story of currentUser.favorites) {
      $("#fav-stories-list").append(generateStoryMarkup(story));
    }
  }

  $("#fav-stories-list").show();
}

//When click on heart have to change heart type and add or remove favorite from list.
async function handleFaveClick(e) {
  console.debug("toggleStoryFavorite");

  const clickedID = e.target.parentElement.parentElement.id

  //searches storyList array for story with storyId that matches ID of clicked icon
  const story = storyList.stories.find(function (element) {
    return element.storyId === clickedID;
  });

  // see if the item is already favorited (checking by presence of heart)
  if (e.target.classList.contains("far")) {
    // story isn't a favorite, add to user fave list and change heart type
    await currentUser.addFavorite(story);
    e.target.classList.toggle("fas");
    e.target.classList.toggle("far");

    // story is a favorite, remove from user fave list and change heart type
  } else {
    await currentUser.removeFavorite(story);
    e.target.classList.toggle("fas");
    e.target.classList.toggle("far");
  }
}

$(".stories-list").on("click", ".heart", handleFaveClick);

//Display stories from user.stories
function putUserStoriesOnPage() {

  $("#my-stories-list").empty();

  if (currentUser.ownStories.length === 0) {
    $("#my-stories-list").append(`<p id="storyPara">Submitted stories go here</p>`);
  }

  else {
    for (let story of currentUser.ownStories) {
      $("#my-stories-list").append(generateUserStoryMarkup(story));
    }
  }
  $("#my-stories-list").show();
}

// Handle clicking on bomb (delete story).
async function handleClickOnBomb(e) {
  console.debug("clickOnDeleteStory");

  //gets id of the "grandparent <LI>"
  const clickedID = e.target.parentElement.parentElement.id

  await storyList.removeStory(clickedID);
  putUserStoriesOnPage();
}

$("#my-stories-list").on("click", ".bomb", handleClickOnBomb);