const axios = require("axios");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

const createBooking = async (data) => {
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVER}/api/v1/flights/${data.flightId}`
    );
    const flightData = flight.data.data;
    if (data.noofSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }
    return true;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createBooking,
};
