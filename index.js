const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const path = require("path");
const fs = require("fs");
const filePath = path.resolve("./data.json");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello fellas");
});

app.get("/api/schedules/:id", (req, res) => {
  const readableData = fs.readFileSync(filePath);
  const parsed = JSON.parse(readableData);
  const { id } = req.params;
  const schedule = parsed.find((schedule) => schedule.id === id);
  res.send(schedule);
});

app.patch("/api/schedules/:id", (req, res) => {
  const readableData = fs.readFileSync(filePath);
  const schedule = JSON.parse(readableData);
  const { id } = req.params;
  const index = schedule.findIndex((schedule) => schedule.id === id);
  const activeSchedule = schedule.find(
    (schedule) => schedule.status === "active"
  );

  if (schedule[index].status === "complete") {
    return res
      .status(422)
      .send(
        "Update functionality has been revoked because this schedule has been completed!"
      );
  }

  schedule[index] = req.body;

  if (req.body.status === "active") {
    if (activeSchedule) {
      return res.status(422).send("There is a running schedule already!");
    }

    schedule[index].status = "active";
    schedule[index].activationTime = new Date();
  }

  fs.writeFile(filePath, JSON.stringify(schedule, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Unable to store schedule");
    }

    return res.send("Schedule updated!");
  });
});

app.get("/api/activeschedule", (req, res) => {
  const schedule = JSON.parse(fs.readFileSync(filePath));
  const activeSchedule = schedule.find(
    (schedule) => schedule.status === "active"
  );

  res.send(activeSchedule);
});

app.get("/api/schedules", (req, res) => {
  const readableData = fs.readFileSync(filePath);
  const parsed = JSON.parse(readableData);
  res.send(parsed);
});

app.post("/api/schedules", (req, res) => {
  const readableData = fs.readFileSync(filePath);
  const parsed = JSON.parse(readableData);

  const schedule = req.body;

  schedule.createdAt = new Date();
  schedule.status = "inactive";
  schedule.id = Date.now().toString();
  parsed.unshift(schedule);

  fs.writeFile(filePath, JSON.stringify(parsed, null, 2), (err) => {
    if (err) {
      return res.status(422).send(" Failed to store data in the base file");
    }
    res.send("Data recieved");
  });
});

app.listen(PORT, () => {
  console.log("App is coolin' off on port:" + PORT);
});
