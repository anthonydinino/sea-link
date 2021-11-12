const express = require("express");
const router = express.Router();
const { stopModel, routeModel } = require("../models/models");

router.get("/", async (req, res) => {
  //finds all stops
  try {
    const stops = await stopModel
      .find({})
      .populate("routes", "-_id -__v -stops");
    res.json(stops);
  } catch (error) {}
});

router.post("/add", async (req, res) => {
  //creates the new stop using the stopModel
  const stopCode = req.body.stop.toUpperCase();
  const newStop = new stopModel({
    code: stopCode,
  });
  //trys to save the new stop to the database
  try {
    const addedStop = await newStop.save();
    res.json({ ...addedStop._doc, message: "added this stop!" });
  } catch (error) {
    //change error message if stop already exists
    if (error.code === 11000) {
      error.message = `${stopCode} already exists...`;
    }
    res.json({ error: error.message });
  }
});

router.post("/remove", async (req, res) => {
  const stopCode = req.body.stop.toUpperCase();

  try {
    //locates the stop
    const stopToRemove = await stopModel.findOne({
      code: stopCode,
    });
    //if doesn't exist
    if (!stopToRemove) throw new Error(`Could not find ${stopCode}`);

    //delete stops in routes collection
    stopToRemove.routes.forEach(async (routeId) => {
      const route = await routeModel.findById(routeId);
      route.stops.pull(stopToRemove._id);
      await route.save();
    });

    //finally deletes the stop
    await stopModel.findByIdAndDelete(stopToRemove._id);

    //sends the stop that was deleted back plus a message
    res.json({ ...stopToRemove._doc, message: "removed this stop!" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
