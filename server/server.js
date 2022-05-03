const { application } = require("express");
const express = require("express");
const cors = require("cors");
const app = express();
const doctorsRoutes = require("./routes/doctorsRoutes");

const port = 8080;

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/doctors", doctorsRoutes);

app.listen(port, () => {
    console.log("The server is running on " + port);
});

 