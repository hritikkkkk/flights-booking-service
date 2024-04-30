const { StatusCodes } = require("http-status-codes");
const { bookingService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
async function createBooking(req, res) {
  try {
    const response = await bookingService.createBooking({
      flightId: req.body.flightId,
      noofSeats: req.body.noofSeats,
    });
  
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
};
