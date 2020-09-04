//To generate random user_id
const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// To check if user already exist
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

//Filter URLs and return specified user's URLs only
const urlsForUser = (id, database) => {
  const UrlsOfUser = {};
  for (const url in database) {
    if (database[url].userID === id) {
      UrlsOfUser[url] = database[url];
    }
  }
  return UrlsOfUser;
};

module.exports = {
  randomString,
  getUserByEmail,
  urlsForUser
}