import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./utilities/logger";
import container from "./inversify.config";
import { RegistrableController } from "./api/registrable.controller";
import TYPES from "./types";

export default (): Promise<express.Application> =>
  new Promise<express.Application>((resolve, reject) => {
    try {
      const app = express();

      // set middlewares
      app.use(cors());
      app.use(express.urlencoded({ extended: true }));
      app.use(express.json());
      app.use(morgan("dev"));

      // register api routes
      // const controllers: RegistrableController[] =
      //   container.getAll<RegistrableController>(TYPES.Controller);
      // controllers.forEach((controller) => controller.registerRoutes(app));

      // test api route
      app.get(
        "/api/v1",
        async (
          req: express.Request,
          res: express.Response
        ): Promise<express.Response> => {
          return res.json({ "Stepinto API": "Version 1" });
        }
      );

      resolve(app);
    } catch (error) {
      logger.error(`Error when bootstrapping app: ${error}`);
      reject(error);
    }
  });
