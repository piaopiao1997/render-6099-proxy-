const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = process.env.PORT || 3000;
const TARGET = "http://47.253.206.60:6099";

app.get("/_health", (req, res) => {
  res.send("OK");
});

const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  ws: true,
  secure: false,
  xfwd: true,
  timeout: 600000,
  proxyTimeout: 600000,
  onError(err, req, res) {
    console.error("Proxy error:", err.message);
    if (!res.headersSent) {
      res.status(502).send("Bad Gateway: " + err.message);
    }
  }
});

app.use("/", proxy);

const server = app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`Target: ${TARGET}`);
});

server.on("upgrade", proxy.upgrade);
