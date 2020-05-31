var express = require("express");
var app = express();

var http = require("http").createServer(app);
var io = require("socket.io")(http);

var path = require("path");
var cookieParser = require("cookie-parser");
var webclient;
var ignition = true;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  console.log("a client connected");
  socket.emit("hello", { hello: "world" });
  webclient = socket;
  socket.on("disconnect", reason => {
    webclient = null;
  });
  socket.on("ignition", msg => {
    console.log("Received Ignition command ", msg);
    ignition = msg;
  });
});

app.post("/endpoint", (req, res) => {
  console.log("Received", req.body);
  if (webclient) {
    webclient.emit("request", req.body);
  }
  res.json({ ignition: ignition });
});

http.listen(process.env.PORT || 8080, () => {
  console.log("listening ");
});
