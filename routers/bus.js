const express = require("express");
const router = express.Router();
const { busModel } = require("../models/models");

router.get("/", async (req, res) => {
  //finds all buses without the id and the __v keys
  const buses = await busModel
    .find({}, "-_id -__v")
    .populate("lines", "-routes -buses");
  res.json(buses);
});

router.post("/add", async (req, res) => {
  //creates the bus using the model
  const busRegistration = req.body.bus.toUpperCase();
  const newBus = new busModel({ registration: busRegistration });
  //trys to add the bus into the database
  try {
    await newBus.save();
    res.json({ ...newBus._doc, message: "added this bus!" });
  } catch (error) {
    //catch error if bus registration already exists
    if (error.code === 11000) {
      error.message = `${busRegistration} already exists...`;
    }
    //catch all other errors
    res.json({ message: error });
  }
});

router.post("/remove", async (req, res) => {
  const busToRemove = req.body.bus.toUpperCase();
  try {
    const removedBus = await busModel.findOneAndDelete({
      registration: busToRemove,
    });
    //if no bus was found, catches the error and changes error message
    if (!removedBus) throw new Error(`Could not find ${busToRemove}`);
    //sends the bus that was deleted back plus a message
    res.json({ ...removedBus._doc, message: "removed this bus!" });
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
