const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const app = express();

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
app.use("/api/room", require("./routes/students"));

// Setting PORT & Starting Server
const PORT = process.env.port || 5000;
app.listen(PORT, () => console.log(`Server Started on PORT ${PORT}`));
