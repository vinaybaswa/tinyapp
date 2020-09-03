const morgan = require('morgan');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(':method :status :response-time ms'));
app.use(cookieSession({
  name: 'session',
  keys: ['iamasuperkeyandilikesongs', 'pouet pouet yes spaces are okay why not']
}));

const PORT = 8080; // default port 8080

// Data
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//Helpers

//To generate random user_id
const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// To check if user already exist
const checkIfUserExist = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

//register
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  if (checkIfUserExist(req.body.email, users)) {
    return res.status(400).send("User already registered, try to login");
  }
  const id = randomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = { id, email, password };
  res.cookie("user_id", id).redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

// Login-Authentication
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userid = "";
  for (const user in users) {
    if (users[user].email === email) {
      userid = users[user].id;
      if (users[userid].password === password) {
        return res.cookie("user_id", userid).redirect("/urls");
      } else {
        return res.status(403).send("Wrong Password");
      }
    }
  }
  res.status(403).send("User Not Found");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urls: urlsForUser(req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/urls");
  }
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/urls");
  }
  let templateVars = {
    user: users[req.cookies.user_id],
    userID: urlDatabase[req.params.shortURL].userID,
    urls: urlsForUser(req.cookies.user_id),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  // console.log(templateVars.user.id)
  // console.log(templateVars.userID)
  //console.log(urlDatabase[req.params.shortURL].userID)
  res.render("urls_show", templateVars);
});


//Add new URL
app.post("/urls", (req, res) => {
  const Id = randomString();
  if (req.body.longURL.match(/^(https:\/\/|http:\/\/)/)) {
    urlDatabase[Id] = req.body.longURL;
  } else {
    urlDatabase[Id] = "http://" + req.body.longURL;
  }
  res.redirect(`/urls/${Id}`);
});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (Object.keys(urlDatabase).includes(shortURL)) {
    res.redirect(longURL);
  } else {
    res.redirect("urls_index", { urls: urlDatabase });
  }
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userid =  users[req.cookies.user_id].id;
  const userID = urlDatabase[req.params.shortURL].userID;
  if (!userid  || userid !== userID) {
    return res.redirect("/urls");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

//console.log(urlDatabase)