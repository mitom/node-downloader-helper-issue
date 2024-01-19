import fs from 'fs'
import Koa from 'koa'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = new Koa();
let lastResult = true
app.use(async ctx => {
  if (lastResult) {
    console.log("sending error")
    ctx.status = 502
  } else {
    console.log("sending file")
    ctx.attachment("test.file")
    ctx.set("content-length", "10485760") // 10MB
    ctx.body = fs.createReadStream(__dirname + '/test.file');
  }

  lastResult = !lastResult
});
['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {
    /** do your logic */
    process.exit();
  }));

app.listen(3001, () => console.log("started"));