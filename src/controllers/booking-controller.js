const { StatusCodes } = require("http-status-codes");
const { bookingService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const InMemDb = {};

async function createBooking(req, res) {
  try {
    const response = await bookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noofSeats: req.body.noofSeats,
    });

    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

const makePayment = async (req, res) => {
  try {
    const idempotencyKey = req.headers.idempotencykey;
    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "idempotency key is missing" });
    }

    if (InMemDb[idempotencyKey]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on a successful payment" });
    }

    const response = await bookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    InMemDb[idempotencyKey] = idempotencyKey;
    SuccessResponse.data = response;
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

module.exports = {
  createBooking,
  makePayment,
};
