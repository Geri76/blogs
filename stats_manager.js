const fs = require("fs");

class StatManager {
  statFile;

  constructor(file) {
    let defaultData = {
      global_visits: 0,
      users: [],
    };

    this.statFile = file;

    try {
      let data = fs.readFileSync(file);
      this.stats = JSON.parse(data);
    } catch {
      fs.writeFileSync(file, JSON.stringify(defaultData));
      this.stats = defaultData;
    }
  }

  writeStatsToDisk() {
    fs.writeFileSync(this.statFile, JSON.stringify(this.stats));
  }

  incrementGlobalVisits() {
    this.stats.global_visits++;
  }

  incrementUser(user) {
    let u = this.stats.users.find((x) => x.name == user);

    if (u == undefined) {
      this.stats.users.push({
        name: user,
        visits: 1,
        posts: [],
      });
    } else {
      u.visits++;
    }
  }

  incrementPost(user, postId) {
    this.incrementUser(user);

    let u = this.stats.users.find((x) => x.name == user);
    let p = this.stats.users.find((x) => x.name == user && x.posts.find((x) => x.id == postId));

    if (p == undefined) {
      u.posts.push({
        id: postId,
        visits: 1,
      });
    }
  }
}

exports.StatManager = StatManager;
