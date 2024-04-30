const { default: axios } = require("axios");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const { BookingRepository } = require("../repositories");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

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

const makePayment = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );

    if (Date.now() - bookingDetails.createdAt > 300000) {
      await bookingRepository.update(
        data.bookingId,
        { status: CANCELLED },
        transaction
      );
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The amount of the payment doesn't match",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        "The user corresponding to the booking doesn't match",
        StatusCodes.BAD_REQUEST
      );
    }
    //we assume here that payment is successfull
    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createBooking,
  makePayment,
};
