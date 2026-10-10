import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import app from "./app.js";

async function withApp(run: (baseUrl: string) => Promise<void>) {
  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

test("GET /health reports that the API is healthy", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Healthy" });
  });
});

test("unknown routes return a 404", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/missing`);

    assert.equal(response.status, 404);
  });
});