import config from "../config";
import mongoose from "mongoose";
import logger from "../utilities/logger";

const MONGO_URI = `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@cluster0.utv6lja.mongodb.net/?retryWrites=true&w=majority`;

const connectToDbClient = async (uri: string = MONGO_URI): Promise<void> => {
  try {
    await mongoose.connect(uri);

    logger.info(`Successfully connected to database ✅`);
  } catch (error) {
    logger.error(`Failed to connect to database 🛑 : ${error}`);
  }
};

export default connectToDbClient;
