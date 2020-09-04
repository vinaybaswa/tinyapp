//URLs Data
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

//Users Data
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$6GlcO8yQEKA.hj0DG3HR2eq5WNdEa0W.5hh4dg7ejxM.fCXSUXuh2"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$6GlcO8yQEKA.hj0DG3HR2ewSror3RLBBYg4THuTJGBlGahXPQdOtm"
  }
};

module.exports = {
  urlDatabase,
  users
};