import express from "express";
import { WebSocketServer } from "ws";
import { PassThrough } from "stream";
import Docker from "dockerode";
import fs from "fs";

const app = express();
const port = 3001;
const docker = new Docker();

const questions = JSON.parse(fs.readFileSync("./questions.json"));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws) => {
  const ruleSet = questions["q1"];
  const matched = new Set();
  const history = [];
  let commandBuffer = "";

  const container = await docker.createContainer({
    Image: "secure-terminal-image", // build from Dockerfile
    Tty: true,
    OpenStdin: true,
    HostConfig: {
      Memory: 128 * 1024 * 1024, // 128MB
      CpuShares: 256,
      ReadonlyRootfs: true,
      AutoRemove: true,
    },
  });

  await container.start();

  const exec = await container.exec({
    Cmd: ["/bin/bash"],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  const stream = await exec.start({ hijack: true, stdin: true });
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  // Track output
  container.modem.demuxStream(stream, stdout, stderr);

  stdout.on("data", (chunk) => {
    ws.send(JSON.stringify({ type: "output", data: chunk.toString() }));
  });
  stderr.on("data", (chunk) => {
    ws.send(JSON.stringify({ type: "output", data: chunk.toString() }));
  });

  ws.on("message", (msg) => {
    const cmd = JSON.parse(msg.toString().trim());
    history.push(cmd.data);

    if (cmd.data === "\r") {
      if (ruleSet.filter((el) => el === commandBuffer).length !== 0) {
        matched.add(commandBuffer);
      }
      commandBuffer = "";
    } else if (cmd.data === "\u007f") {
      commandBuffer = commandBuffer.slice(0, -1);
    } else {
      commandBuffer += cmd.data;
    }

    // Send progress update
    ws.send(
      JSON.stringify({
        type: "progress",
        matched: [...matched],
        total: ruleSet.length,
        history,
      })
    );

    stream.write(cmd.data);
  });

  ws.on("close", async () => {
    try {
      await container.kill();
    } catch {}
  });
});
