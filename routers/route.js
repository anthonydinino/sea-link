const express = require("express");
const { Mongoose } = require("mongoose");
const router = express.Router();
const { routeModel, stopModel } = require("../models/models");

router.get("/", async (req, res) => {
  //finds all routes
  try {
    const routes = await routeModel
      .find({})
      .populate("stops", "-_id -__v -routes");
    res.json(routes);
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/add", async (req, res) => {
  const routeName = req.body.route.toUpperCase();

  //if adding the route normally
  if (!req.body.stop) {
    const newroute = new routeModel({
      name: routeName,
    });
    //trys to save the new route to the database
    try {
      const addedroute = await newroute.save();
      res.json({ ...addedroute._doc, message: "added this route!" });
    } catch (error) {
      //change error message if route already exists
      if (error.name === 11000) {
        error.message = `${routeName} already exists...`;
      }
      res.json({ error: error.message });
    }
  }
  //else adding a stop to the route
  else {
    try {
      //check if route and stop exist
      const stopCode = req.body.stop.toUpperCase();
      const routeExists = await checkExists({ name: routeName }, routeModel);
      const stopExists = await checkExists({ code: stopCode }, stopModel);
      if (!routeExists) throw new Error(`Route ${routeName} doesn't exist...`);
      if (!stopExists) throw new Error(`Stop ${stopCode} doesn't exist...`);

      //finds both stop and route in the database
      const stop = await stopModel.findOne({ code: stopCode });
      const route = await routeModel.findOne({ name: routeName });

      //adds the stop and routes to eachothers subdocument
      await route.stops.push(stop._id);
      await stop.routes.push(route._id);
      await route.save();
      await stop.save();

      //returns the added route with a message
      res.json({
        ...route._doc,
        message: `Added stop ${stopCode} to route ${routeName}...`,
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  }
});

router.post("/remove", async (req, res) => {
  const routeName = req.body.route.toUpperCase();
  try {
    const routeToRemove = await routeModel.findOne({
      name: routeName,
    });
    //if no route was found, catches the error and changes error message
    if (!routeToRemove) throw new Error(`Could not find ${routeToRemove}`);

    //delete routes in stops collection
    routeToRemove.stops.forEach(async (stopId) => {
      const stop = await stopModel.findById(stopId);
      stop.routes.pull(routeToRemove._id);
      await stop.save();
    });

    //finally removes the route
    await routeModel.findByIdAndDelete(routeToRemove._id);

    //sends the route that was deleted back plus a message
    res.json({ ...routeToRemove._doc, message: "removed this route!" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const checkExists = async (query, model) => {
  const found = await model.findOne(query);
  if (found) return true;
  else return false;
};

module.exports = router;
