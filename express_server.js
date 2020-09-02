const express = require("express");
const morgan = require('morgan');
var cookieParser = require('cookie-parser');
const app = express();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan(':method :status :response-time ms'));

const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Login
app.post("/login", (req, res) =>{
  const username = req.body.username;
  res.cookie("username", username).redirect("/urls");
});

//Logout
app.post("/logout", (req, res) =>{
  res.clearCookie("username").redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
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

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});