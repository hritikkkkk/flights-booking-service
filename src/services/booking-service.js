const { default: axios } = require("axios");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const { BookingRepository } = require("../repositories");

const bookingRepository = new BookingRepository();

const createBooking = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVER}/api/v1/flights/${data.flightId}`
    );
    const flightData = flight.data.data;
    if (data.noofSeats > flightData.totalSeats) {
      throw new AppError(
        "Not enough seats available at this moment",
        StatusCodes.BAD_REQUEST
      );
    }
    const totalBill = data.noofSeats * flightData.price;
    const bookingPayLoad = { ...data, totalCost: totalBill };
    const booking = await bookingRepository.create(bookingPayLoad, transaction);

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVER}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noofSeats,
      }
    );
    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
module.exports = {
  createBooking,
};
