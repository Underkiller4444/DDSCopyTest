const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 80;

// Load common passwords list
const commonPasswords = new Set(
  fs.readFileSync("./xato-net-10-million-passwords-1000.txt", "utf-8").split("\n").map(p => p.trim())
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/login", (req, res) => {
  const password = req.body.password;

  if (!isValidPassword(password)) {
    return res.redirect("/");
  }

  // If valid, show welcome page with password
  res.send(`
    <html><body>
      <h1>Welcome!</h1>
      <p>Your password is: <strong>${password}</strong></p>
      <form action="/" method="get">
        <button type="submit">Logout</button>
      </form>
    </body></html>
  `);
});

function isValidPassword(pwd) {
  return (
    pwd.length >= 8 &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd) &&
    !commonPasswords.has(pwd)
  );
}

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
