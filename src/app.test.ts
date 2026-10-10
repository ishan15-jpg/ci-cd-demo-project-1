import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import type { AddressInfo } from "node:net";
import { mock, test } from "node:test";
import app from "./app.js";
import pool from "./db.js";

async function httpGetJson(url: string) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const req = httpRequest(url, { method: "GET", agent: false }, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      response.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        const contentType = response.headers["content-type"] ?? "";

        resolve({
          status: response.statusCode ?? 0,
          body: raw && contentType.includes("application/json") ? JSON.parse(raw) : raw || null,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

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
    server.closeAllConnections?.();

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
    const response = await httpGetJson(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: "Healthy" });
  });
});

test("GET /hi reports that the API is hi", async () => {
  await withApp(async (baseUrl) => {
    const response = await httpGetJson(`${baseUrl}/hi`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: "hi" });
  });
});

test("GET /users reports rows from the database", async () => {
  const queryMock = mock.method(pool, "query", async () => ({
    rows: [{ id: 1, name: "Ada" }],
  }));

  await withApp(async (baseUrl) => {
    const response = await httpGetJson(`${baseUrl}/users`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { rows: [{ id: 1, name: "Ada" }] });
  });

  queryMock.mock.restore();
});

test("unknown routes return a 404", async () => {
  await withApp(async (baseUrl) => {
    const response = await httpGetJson(`${baseUrl}/missing`);

    assert.equal(response.status, 404);
  });
});