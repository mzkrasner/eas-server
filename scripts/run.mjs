import ora from 'ora'

import { spawn } from "child_process"
import { EventEmitter } from 'events'

const events = new EventEmitter()
const spinner = ora();

const ceramic = spawn("npm", ["run", "ceramic"]);
ceramic.stdout.on("data", (buffer) => {
  console.log('[Ceramic]', buffer.toString())
  if (buffer.toString().includes("0.0.0.0:7007")) {
    events.emit("ceramic", true);
    spinner.succeed("ceramic node started");
  }
})

ceramic.stderr.on('data', (err) => {
  console.log(err.toString())
})


const graphiql = async () => {
  spinner.info("[GraphiQL] starting graphiql");
  const graphiql = spawn('node', ['./scripts/graphiql.mjs'])
  spinner.succeed("[GraphiQL] graphiql started");
  graphiql.stdout.on('data', (buffer) => {
    console.log('[GraphiqQL]',buffer.toString())
  })
}

const next = async () => {
  const next = spawn('npm', ['run', 'nextDev'])
  spinner.info("[NextJS] starting nextjs app");
  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const compile = async () => {
  spawn('npm', ['run', 'compile'])
  console.log('Creating composite')
}

const graph = async () => {
  spawn('npm', ['run', 'graph']);
  console.log('Launching GraphiQL')
}

const start = async () => {
  try {
    spinner.start('[Ceramic] Starting Ceramic node\n')
    events.on('ceramic', async (isRunning) => {
      if (isRunning) {
        // await bootstrap()
        // await graphiql()
        await next()
      }
      if(isRunning === false) {
        ceramic.kill()
        process.exit()
      }
    })
  } catch (err) {
    ceramic.kill()
    spinner.fail(err)
  }
}

start()

process.on("SIGTERM", () => {
  ceramic.kill();
});
process.on("beforeExit", () => {
  ceramic.kill();
});
