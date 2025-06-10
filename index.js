const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const compression = require("compression");

const APP = express();
const PORT = 3000;

const converter = new showdown.Converter({ tables: true });

function dateFormatter(date) {
  let d = new Date(date);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

APP.set("view engine", "ejs");
APP.use(compression());

APP.get("/", (req, res) => {
  const users = fs.readdirSync("data/users");

  res.render("index", { users: users });
});

APP.get("/font", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=31557600");
  res.send(fs.readFileSync("./public/font.ttf"));
});

APP.get("/favicon.ico", (req, res) => {
  res.send(fs.readFileSync("./public/icon.ico"));
});

APP.get("/:user", (req, res) => {
  let files = [];

  try {
    files = fs.readdirSync("data/users/" + req.params.user + "/posts");
  } catch {
    res.status(404).render("not_found", { type: "user" });
    return;
  }

  let posts = [];

  files.forEach((file) => {
    const content = fs.readFileSync("data/users/" + req.params.user + "/posts/" + file).toString();

    let opts = {};

    try {
      const optsData = content.split("---")[1].trim();

      optsData.split("\n").forEach((line) => {
        const key = line.split([":"])[0].trim();
        const value = line.split([":"])[1].trim();
        opts[key] = value;
      });
    } catch {
      opts.title = file.split(".")[0];
    }

    posts.push({
      user: req.params.user,
      title: opts.title,
      description: opts.description,
      url: file.split(".")[0],
    });
  });

  res.render("user", { user: req.params.user, posts: posts });
});

APP.get("/:user/:post_id", (req, res) => {
  let content = "";
  let modifyDate;

  try {
    content = fs.readFileSync("data/users/" + req.params.user + "/posts/" + req.params.post_id + ".md").toString();
    modifyDate = fs.statSync("data/users/" + req.params.user + "/posts/" + req.params.post_id + ".md").mtime;
  } catch {
    res.status(404).render("not_found", { type: "post" });
    return;
  }

  let siteData = "";

  let opts = {};

  try {
    const optsData = content.split("---")[1].trim();

    optsData.split("\n").forEach((line) => {
      const key = line.split([":"])[0].trim();
      const value = line.split([":"])[1].trim();
      opts[key] = value;
    });

    let data = content.split("---");
    data.reverse();
    data.pop();
    data.pop();
    data.reverse();

    siteData = data.join("---").trim();
  } catch {
    opts.title = req.params.post_id;
    siteData = content;
  }

  res.render("post", { user: req.params.user, title: opts.title, modify_date: dateFormatter(modifyDate), data: converter.makeHtml(siteData) });
});

APP.listen(PORT, () => {
  console.log(`Blogs listening on port ${PORT}`);
});
