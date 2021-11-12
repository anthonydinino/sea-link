const mongoose = require("mongoose");

const busSchema = mongoose.Schema({
  registration: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /[A-Z]{3}-[0-9]{3}/gi.test(v);
      },
      message: (props) => `${props.value} is not a valid bus registration!`,
    },
  },
  lines: [{ type: mongoose.Types.ObjectId, ref: "line" }],
});

const stopSchema = mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^\w{2,3}$/gi.test(v);
      },
      message: (props) => `${props.value} is not a valid stop code!`,
    },
  },
  routes: [{ type: mongoose.Types.ObjectId, ref: "route" }],
});

const routeSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^\w{2,3}$/gi.test(v);
      },
      message: (props) => `${props.value} is not a valid route code!`,
    },
  },
  stops: [{ type: mongoose.Types.ObjectId, ref: "stop" }],
});

const lineSchema = mongoose.Schema({
  time: { type: String, required: true },
  routes: [{ type: mongoose.Types.ObjectId, ref: "route" }],
  buses: [{ type: mongoose.Types.ObjectId, ref: "bus" }],
});

const busModel = mongoose.model("bus", busSchema);
const stopModel = mongoose.model("stop", stopSchema);
const routeModel = mongoose.model("route", routeSchema);
const lineModel = mongoose.model("line", lineSchema);

module.exports = {
  busModel: busModel,
  stopModel: stopModel,
  routeModel: routeModel,
  lineModel: lineModel,
};
