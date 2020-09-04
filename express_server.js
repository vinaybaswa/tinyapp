const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { urlDatabase, users } = require("./database/database");
const h = require("./helpers");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(':method :status :response-time ms'));
app.use(cookieSession({
  name: 'session',
  keys: ['iamasuperkeyandilikesongs', 'pouet pouet yes spaces are okay why not']
}));

//register
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (h.getUserByEmail(email, users)) {
    return res.status(400).send("User already registered, try to login");
  } else if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email or password Missing");
  }
  const id = h.randomString();
  const password = bcrypt.hashSync(req.body.password, 10);
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect("/urls");
});

// Login-Authentication
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = h.getUserByEmail(email, users);
  if (user !== undefined) {
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = user;
      return res.redirect("/urls");
    } else {
      return res.status(403).send("Wrong Password");
    }
  } else {
    res.status(403).send("User Not Found");
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Home page
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: h.urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

//Get to create new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/urls");
  }
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

//Checkout URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/urls");
  }
  let templateVars = {
    user: users[req.session.user_id],
    userID: urlDatabase[req.params.shortURL].userID,
    urls: h.urlsForUser(req.session.user_id, urlDatabase),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//Create new URL
app.post("/urls", (req, res) => {
  const Id = h.randomString();
  const userID = req.session.user_id;
  if (req.body.longURL.match(/^(https:\/\/|http:\/\/)/)) {
    const longURL = req.body.longURL;
    urlDatabase[Id] = { longURL, userID };
  } else {
    const longURL = "http://" + req.body.longURL;
    urlDatabase[Id] = { longURL, userID };
  }
  res.redirect(`/urls/${Id}`);
});

//Redirects to longURL - login not required
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
  const userid =  users[req.session.user_id].id;
  const userID = urlDatabase[req.params.shortURL].userID;
  if (!userid  || userid !== userID) {
    return res.redirect("/urls");
  }
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});