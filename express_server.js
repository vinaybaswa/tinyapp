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
}



//Fuctions
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

//register
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

const duplicateCheck = (email, users) => {
  console.log("email", email)
  for (const user in users) {
    console.log("user email", users[user].email)
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

app.post("/register", (req, res) => {

  if (duplicateCheck(req.body.email, users)) {
    console.log('hello')
    res.status(400).end();
  } else {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    users[id] = { id, email, password };

    // console.log(users[id].email)
    res.cookie("user_id", id).redirect("/urls");
  }

  console.log(users)

});

console.log(users)

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

// Login / Authentication
app.post("/login", (req, res) => {
  console.log("users[req.cookies.user_id", users[req.cookies.user_id]);
  let templateVars = { user: users[req.cookies.user_id] };
  res.cookie("user_id", templateVars).redirect("/urls");
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
  const shortURL = req.params.shortURL;
  let templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


//Add new URL 
app.post("/urls", (req, res) => {
  const Id = generateRandomString();
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
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => { console.log(`TinyApp listening on port ${PORT}!`) });