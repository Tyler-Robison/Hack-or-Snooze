"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/**************************************************************************************
  Story object represent a single story with its associated properties.
*/

class Story {

  //Make instance of Story from data object
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  //returns URL of the story
  getHostName(story) {
    return `${story.url}`;
  }
}

/**************************************************************************************
  Array of stories (each one a Story object): Used to present stories as HTML to users.
*/

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  //Generates a new storylist, used when user logs in or clicks nav element.
  static async getStories() {

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(function (story) {
      return new Story(story);
    });

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  // get story info from submitStory, add to API then add stories/ownStories
  async addStory(newStory) {

    //API
    const response = await axios.post(`${BASE_URL}/stories`, newStory)

    //HTML - we submitted so must go in ownStories in addition to stories.
    const story = new Story(response.data.story)
    currentUser.ownStories.unshift(story)
    this.stories.unshift(story)

    return story;
  }


  // removes story from HTML then API. 
  async removeStory(storyId) {

    //HTML - have to remove from storylist, favorites and ownStories.
    this.stories = this.stories.filter(function (element) {
      return element.storyId !== storyId;
    });

    //ownStories and favorites are inside User object not StoryList.
    currentUser.ownStories = currentUser.ownStories.filter(function (element) {
      return element.storyId !== storyId;
    })

    currentUser.favorites = currentUser.favorites.filter(function (element) {
      return element.storyId !== storyId;
    })

    //API
    const token = currentUser.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token }
    });
  }
}

/************************************************************************************
  Object that stores all properties specific to the currently logged in user.
*/

class User {

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));
    this.loginToken = token;
  }

  //Register new user in API, make User instance & return it.
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  //Login in user with API, return instance of User object.
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  //Automatically login with stored user/pass.
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // Add faves to HTML then API
  async addFavorite(story) {
    //HTML
    this.favorites.push(story);

    //API
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: 'POST',
      data: { token }
    })
  }

  //remove favorite from HTML then API
  async removeFavorite(story) {
    //HTML
    console.log(this.favorites)
    //returns all elements with ID that doesn't match ID of clicked element.
    this.favorites = this.favorites.filter(function (element) {
      return element.storyId !== story.storyId;
    });

    //API
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: 'DELETE',
      data: { token }
    })
  }

  // checks if story is a user favorite
  isFavorite(story) {
    return this.favorites.some(function (element) {
      return element.storyId === story.storyId;
    });
  }
}