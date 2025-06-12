const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const compression = require("compression");
const path = require("path");
const StatManager = require("./stats_manager.js").StatManager;

// Statistics Manager
const StatMan = new StatManager("./data/stats.json");

const APP = express();
const PORT = 3000;

// Markdown to HTML converter
const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  simpleLineBreaks: true,
  ghMentions: true,
  ghMentionsLink: "/{u}",
  openLinksInNewWindow: true,
  emoji: true,
  metadata: true,
});

// Date formatting function
function dateFormatter(date) {
  let d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

// Set EmbeddedJS as view engine
APP.set("view engine", "ejs");

// Use compression
APP.use(compression());

// Disable X-Powered-By header
APP.set("x-powered-by", false);

// Stat saver (also saves server resources :3)
let oldStats = StatMan.stats.global_visits;
setInterval(() => {
  if (StatMan.stats.global_visits != oldStats) {
    console.log(`[STATMAN] [${dateFormatter(new Date())}] Saved stats to disk.`);
    StatMan.writeStatsToDisk();
    oldStats = StatMan.stats.global_visits;
  }
}, 1000);

// ----------------------------------------------

// Static files

let fontData = fs.readFileSync(__dirname + "/public/font.ttf");
console.log("[LOAD] Loaded font file to memory.");

APP.get("/font.ttf", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=31557600");
  res.send(fontData);
});

let faviconData = fs.readFileSync(__dirname + "/public/icon.ico");
console.log("[LOAD] Loaded favicon file to memory.");

APP.get("/favicon.ico", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=31557600");
  res.send(faviconData);
});

let bgData = fs.readFileSync(__dirname + "/public/bg.png");
console.log("[LOAD] Loaded background image file to memory.");

APP.get("/bg.png", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=31557600");
  res.send(bgData);
});

// ----------------------------------------------

APP.get("/", (req, res) => {
  const users = fs.readdirSync(path.resolve(__dirname, "data", "users"));

  StatMan.incrementGlobalVisits();

  res.render("index", { users: users });
});

APP.get("/:user", (req, res) => {
  let files = [];
  let about;

  try {
    files = fs.readdirSync(path.resolve(__dirname, "data", "users", req.params.user, "posts"));
  } catch {
    res.status(404).render("not_found", { type: "user" });
    return;
  }

  StatMan.incrementUser(req.params.user);
  StatMan.incrementGlobalVisits();

  try {
    let d = fs.readFileSync(path.resolve(__dirname, "data", "users", req.params.user, "about.md")).toString();
    about = converter.makeHtml(d);
  } catch {}

  let posts = [];

  files.forEach((file) => {
    const content = fs.readFileSync(path.resolve(__dirname, "data", "users", req.params.user, "posts", file)).toString();

    converter.makeHtml(content);

    let opts = converter.getMetadata();

    posts.push({
      user: req.params.user,
      title: opts.title || file.split(".")[0],
      description: opts.description,
      url: file.split(".")[0],
    });
  });

  res.render("user", { user: req.params.user, posts: posts, about: converter.makeHtml(about) });
});

APP.get("/:user/:post_id", (req, res) => {
  if ((!/^[A-Za-z0-9]+$/.test(req.params.user), !/^[A-Za-z0-9]+$/.test(req.params.post_id))) {
    res.status(404).render("not_found", { type: "user" });
    return;
  }

  let content = "";
  let modifyDate;

  try {
    content = fs.readFileSync(path.resolve(__dirname, "data", "users", req.params.user, "posts", req.params.post_id + ".md")).toString();
    modifyDate = fs.statSync(path.resolve(__dirname, "data", "users", req.params.user, "posts", req.params.post_id + ".md")).mtime;
  } catch {
    res.status(404).render("not_found", { type: "post" });
    return;
  }

  StatMan.incrementPost(req.params.user, req.params.post_id);
  StatMan.incrementGlobalVisits();

  let convertedData = converter.makeHtml(content);

  let opts = converter.getMetadata();

  res.render("post", { user: req.params.user, title: opts.title || req.params.post_id, modify_date: dateFormatter(modifyDate), data: convertedData });
});

APP.listen(PORT, () => {
  console.log(`\n[SYS] Blogs listening on port ${PORT}\n`);
});
