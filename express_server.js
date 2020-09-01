const express = require("express");
const morgan = require('morgan')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(morgan(':method :status :response-time ms'));

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  //console.log(urlDatabase)
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
  //console.log("url database", urlDatabase)
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL
  // console.log("shortURL", shortURL)
  // console.log("NewLongURL", newLongURL)
  urlDatabase[shortURL] = newLongURL;
  //console.log(urlDatabase)
  res.redirect("/urls");
});

 



app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});