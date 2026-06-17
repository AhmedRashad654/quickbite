import {Router} from "express";
import {authenticate} from "../../lib/auth/guard.js";
import {idempotency} from "../../lib/idempotency/idempotency.js";
import {container} from "../../lib/di/container.js";
import {TOKENS} from "../../lib/di/tokens.js";
import {OrderController} from "./controller/order.controller.js";

export const orderRouter = Router();

const orderController = container.resolve<OrderController>(TOKENS.OrderController);

// ── Customer-facing ─────────────────────────────────────────────────────
orderRouter.post(
    "/",
    authenticate,
    idempotency({strict: true}),
    orderController.placeOrder,
);

orderRouter.get(
    "/:publicId",
    authenticate,
    orderController.getOrder,
);



