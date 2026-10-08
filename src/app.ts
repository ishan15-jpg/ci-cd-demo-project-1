import { createServer } from "node:http";

export function createApp() {
  return createServer((request, response) => {
    response.setHeader("content-type", "application/json; charset=utf-8");

    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200);
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if(request.method === "GET" && request.url === "/hello"){
        response.writeHead(200);
        response.end(JSON.stringify({ message: "hello" }));
        return;
    }

    if(request.method === "GET" && request.url === "/bye"){
        response.writeHead(200);
        response.end(JSON.stringify({ message: "bye" }));
        return;
    }

    if(request.method === "GET" && request.url === "/weather"){
        response.writeHead(200);
        response.end(JSON.stringify({ message: "sunny" }));
        return;
    }

    if(request.method === "GET" && request.url === "/sayonara"){
        response.writeHead(200);
        response.end(JSON.stringify({ message: "sayonara" }));
        return;
    }

    response.writeHead(404);
    response.end(JSON.stringify({ error: "not_found" }));
  });
}