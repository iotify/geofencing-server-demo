var express = require("express");
var app = express();

var http = require("http").createServer(app);
var io = require("socket.io")(http);

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var webclient;

app.use(logger("dev"));
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
});

app.post("/endpoint", (req, res) => {
  console.log("Received", req.body);
  if (webclient) {
    webclient.emit("request", req.body);
    webclient.once("response", msg => {
      console.log("response: " + msg);
      res.json(msg);
    });
  } else {
    res.status(400).end();
  }
});

http.listen(process.env.PORT || 8080, () => {
  console.log("listening ");
});
