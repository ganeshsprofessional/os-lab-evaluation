import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { PassThrough } from "stream";
import Docker from "dockerode";
import fs from "fs";
import url from "node:url";

const app = express();
const port = 3001;
const docker = new Docker();

app.use(cors());

const questions = JSON.parse(fs.readFileSync("./questions.json"));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/questions", (req, res) => {
  res.json(Object.keys(questions["q1"]));
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  const ruleSet = Object.values(questions["q1"]);
  const questionsSet = Object.keys(questions["q1"]);
  const matched = new Set();
  const history = [];
  let commandBuffer = "";

  const parameters = url.parse(req.url, true).query;
  const userId = parameters.userId;

  // const userId = "user123"; // or use session/user ID from your auth
  const volumeName = `volume_user_${userId}`;
  console.log(userId);

  async function getOrCreateContainer(userId) {
    const containerName = `terminal_user_${userId}`;

    const containers = await docker.listContainers({ all: true });
    const existing = containers.find((c) =>
      c.Names.includes("/" + containerName)
    );

    let container;

    if (existing) {
      container = docker.getContainer(existing.Id);
      const info = await container.inspect();

      // Optionally, restart if it's stopped
      if (info.State.Status !== "running") {
        await container.start();
      }

      console.log(`Reusing existing container: ${containerName}`);
    } else {
      container = await docker.createContainer({
        name: `terminal_user_${userId}`,
        Image: "secure-terminal-image",
        Tty: true,
        OpenStdin: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        HostConfig: {
          Memory: 256 * 1024 * 1024, // 256MB per user (tune based on server capacity)
          CpuShares: 256, // Fair CPU time
          Binds: [`${volumeName}:/home/student`], // Mount persistent volume
          AutoRemove: true, // Remove container after it stops
          CapDrop: ["ALL"], // Drop all Linux capabilities for security
          CapAdd: ["CHOWN", "SETUID"], // Add back only what's needed
          NetworkMode: "none", // Optional: isolate network
        },
      });

      await container.start();
      console.log(`Created and started new container: ${containerName}`);
    }

    return container;
  }

  const container = await getOrCreateContainer(userId);

  // const container = await docker.createContainer({
  //   name: `terminal_user_${userId}`,
  //   Image: "secure-terminal-image",
  //   Tty: true,
  //   OpenStdin: true,
  //   AttachStdin: true,
  //   AttachStdout: true,
  //   AttachStderr: true,
  //   HostConfig: {
  //     Memory: 256 * 1024 * 1024, // 256MB per user (tune based on server capacity)
  //     CpuShares: 256, // Fair CPU time
  //     Binds: [`${volumeName}:/home/student`], // Mount persistent volume
  //     AutoRemove: true, // Remove container after it stops
  //     CapDrop: ["ALL"], // Drop all Linux capabilities for security
  //     CapAdd: ["CHOWN", "SETUID"], // Add back only what's needed
  //     NetworkMode: "none", // Optional: isolate network
  //   },
  // });

  // await container.start();

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
        ws.send(
          JSON.stringify({
            type: "matched",
            // command: commandBuffer,
            question: Object.entries(questions["q1"]).find(
              ([k, v]) => v === commandBuffer
            )[0],
          })
        );
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
