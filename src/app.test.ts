import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { createApp } from "./app.js";

async function withApp(run: (baseUrl: string) => Promise<void>) {
  const app = createApp();

  await new Promise<void>((resolve, reject) => {
    app.once("error", reject);
    app.listen(0, "127.0.0.1", resolve);
  });

  const address = app.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      app.close((error) => {
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
    assert.deepEqual(await response.json(), { status: "ok" });
  });
});

test("GET /hello reports that the API is returning hello message", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/hello`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "hello" });
  });
});

test("GET /bye reports that the API is returning bye message", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/bye`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "bye" });
  });
});

test("GET /bye reports that the API is returning fine message", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/how-are-you`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "i am fine" });
  });
});

test("GET /bye reports that the API is returning weather message", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/weather`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "sunny" });
  });
});

test("GET /bye reports that the API is returning mood message", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/mood`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "happy" });
  });
});


test("unknown routes return a JSON 404", async () => {
  await withApp(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/missing`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "not_found" });
  });
});