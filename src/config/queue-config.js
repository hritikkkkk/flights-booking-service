const amqplib = require("amqplib");

const { ServerConfig } = require("../config");
let channel, connection;

const connectQueue = async () => {
  try {
    connection = await amqplib.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue("flights-notiQueue");
  } catch (error) {
    console.log(error);
  }
};

const sendData = async (data) => {
  try {
    await channel.sendToQueue(
      "flights-notiQueue",
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    console.log("queue error", error);
  }
};

module.exports = {
  connectQueue,
  sendData,
};
