import * as functions from "firebase-functions";
import * as express from "express";
import * as path from "path";
import * as createError from "http-errors";
import * as cors from "cors";
import { router } from "./router/router";

import {
  ErrorContent,
  ErrorContentInstance,
} from "./view-model/error-viewmodel";

const app = express();
const main = express();

// const corsSetting = {
//   origin: "*",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   preflightContinue: false,
//   optionsSuccessStatus: 204,
// };

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

for (const route of router) {
  app.use(route.getPrefix(), route.getRouter());
}

app.use(function (_req: any, _res: any, next: any) {
  next(createError(404));
});

app.use(function (err: any, _req: any, res: any, _next: any) {
  res.status(err.status || 500);
  const errorContent: ErrorContent = new ErrorContentInstance(err);
  res.json(errorContent);
});

main.use("/", app);

export const webApi = functions.https.onRequest(main);
