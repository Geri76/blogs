const { Worker } = require("worker_threads");
var readline = require("readline");
const { parseColorPlaceholders, log, dateFormatter } = require("./utilities");
const { StatManager } = require("./stats_manager");

const mainServerWorker = new Worker("./server.js");

const CONSOLE_PROMPT = "%c> %y";
let PROMPT_ACTIVE = true;

mainServerWorker.on("message", (msg) => {
  switch (msg) {
    case "SUB_LOG":
      if (PROMPT_ACTIVE) {
        console.log();
        PROMPT_ACTIVE = false;
      }
      break;
    case "SERVER_STARTED":
      handleConsole();
      break;
    default:
      break;
  }
});

function handleConsole() {
  const noOutput = new require("stream").Writable({
    write: function (chunk, encoding, callback) {
      callback();
    },
  });

  var rl = readline.createInterface({
    input: process.stdin,
    output: noOutput,
    terminal: true,
  });

  process.stdout.write(parseColorPlaceholders(`%a[%cTERM%a] %t${dateFormatter(new Date()).split(" ")[1]} ${CONSOLE_PROMPT}`));

  rl.on("line", (line) => {
    PROMPT_ACTIVE = true;

    const l = String(line);
    const lineParts = l.split(" ");

    const cmd = lineParts[0].trim();

    const args = lineParts.splice(1);

    if (cmd.length > 0) {
      switch (cmd) {
        case "stop":
          log("%aShutting down...");
          rl.close();
          break;
        case "help":
          HelpCommand();
          break;
        case "stats":
          StatsCommand();
          break;
        default:
          log(`%cCommand %y${cmd}%c does not exist.`);
          break;
      }

      console.log("");
    }

    process.stdout.write(parseColorPlaceholders(`%a[%cTERM%a] %t${dateFormatter(new Date()).split(" ")[1]} ${CONSOLE_PROMPT}`));
  }).on("close", () => {
    process.exit(0);
  });
}

function HelpCommand() {
  log("%aAvailable commands:");

  [
    // List the available commands
    "help: %bDisplay this help message",
    "stats: %bGet statistics",
    "stop: %bStop the service",
  ].forEach((cmd) => {
    log(`%l - %d${cmd}`);
  });
}

function StatsCommand(args) {
  const stats = new StatManager("./data/stats.json").stats;

  log(`%aGlobal visits: %d${stats.global_visits}`);

  if (stats.users.length > 0) {
    log(`%aUsers (%d${stats.users.length}%a):`);

    stats.users.forEach((user) => {
      log(`%l - %a${user.name} (%d${user.visits} visits%a):`);

      if (user.posts.length > 0) {
        log("%a   └Top 3 Posts:");

        user.posts.sort((a, b) => b.visits - a.visits);
        user.posts.splice(3);

        user.posts.forEach((post) => {
          log(`%l     - %a${post.id} (%d${post.visits} visits%a)`);
        });
      }
    });
  }
}
