const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect To Database
connectDB();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/classrooms", require("./routes/classrooms"));
app.use("/api/room", require("./routes/room"));
app.use("/api/room", require("./routes/material"));
app.use("/api/room", require("./routes/tasks"));
app.use("/api/room", require("./routes/students"));
require("./chat/chat")(io);

// Setting PORT & Starting Server
const PORT = process.env.port || 5000;
server.listen(PORT, () => console.log(`Server Started on PORT ${PORT}`));
