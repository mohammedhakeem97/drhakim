const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

http.createServer((req, res) => {
  const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
  const relPath = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = path.resolve(path.join(root, relPath));

  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    res.end(data);
  });
}).listen(4173, "127.0.0.1");
