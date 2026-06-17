import {Router} from "express";
import {container} from "../../lib/di/container.js";
import {TOKENS} from "../../lib/di/tokens.js";
import { WebhookController } from "./controller/webhook.controller.js";


export const paymentRouter = Router();

const webhookController = container.resolve<WebhookController>(TOKENS.WebhookController);

// Public webhook — verified by HMAC inside the controller; no auth middleware.
// Region comes from `?region=eg` (Kashier can't set custom headers).
paymentRouter.post(
    "/webhook/kashier",
    webhookController.kashier,
);

