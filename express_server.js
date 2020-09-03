const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan(':method :status :response-time ms'));
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 8080; // default port 8080

// Data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//To generate random user_id
const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

//register
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

// To check if user already exist
const checkIfUserExist = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

app.post("/register", (req, res) => {

  if (checkIfUserExist(req.body.email, users)) {
    res.status(400).end();
  } else {
    const id = randomString();
    const email = req.body.email;
    const password = req.body.password;
    users[id] = { id, email, password };

    res.cookie("user_id", id).redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

// Login-Authentication
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let id = "";
  for (const user in users) {
    if (users[user].email === email) {
      id = users[user].id;
      if (users[id].password === password) {
        return res.cookie("user_id", id).redirect("/urls");
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
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
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
  const longURL = urlDatabase[req.params.shortURL];
  const shortURL = req.params.shortURL;
  if (Object.keys(urlDatabase).includes(shortURL)) {
    res.redirect(longURL);
  } else {
    res.redirect("urls_index", { urls: urlDatabase });
  }
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
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