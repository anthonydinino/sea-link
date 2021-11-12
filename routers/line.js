const express = require("express");
const router = express.Router();
const { lineModel, routeModel, busModel } = require("../models/models");

router.get("/", async (req, res) => {
  //finds all lines
  try {
    const lines = await lineModel
      .find({})
      .populate("buses", "-lines")
      .populate("routes", "-stops");
    res.json(lines);
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    //check if the bus and routes exist
    const busExists = await busModel.exists({ registration: req.body.bus });
    if (!busExists) throw new Error(`Bus ${req.body.bus} doesn't exist...`);
    const routesArr = [req.body.route1, req.body.route2];
    routesArr.forEach(async (route) => {
      const routeExists = await routeModel.exists({ name: route });
      if (!routeExists) throw new Error(`Route ${route} doesn't exist...`);
    });

    //creates and saves the line to the database
    const bus = await busModel.findOne({ registration: req.body.bus });
    const route1 = await routeModel.findOne({ name: routesArr[0] });
    const route2 = await routeModel.findOne({ name: routesArr[1] });
    const time = new Date(`01/01/1970 ${req.body.time}`).toLocaleTimeString();

    const newLine = new lineModel({
      time,
      routes: [route1._id, route2._id],
      buses: [bus._id],
    });
    await newLine.save();

    //adds the line to the bus
    bus.lines.push(newLine._id);
    await bus.save();

    res.json({ ...newLine._doc, message: "Added this new line!" });
  } catch (error) {
    res.json({ error: error.message });
  }
});
router.post("/remove", async (req, res) => {
  //remove line from buses array
  try {
    await busModel.updateMany({}, { $set: { lines: [] } });
    const deletedLines = await lineModel.deleteMany({});
    res.json(deletedLines);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
