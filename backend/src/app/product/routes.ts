import {Router} from "express";
import { productController } from "./controller/product.controller.js";
import { authenticate } from "../../lib/auth/guard.js";

export const productRouter = Router();

productRouter.get('/restaurants/:restaurantId/categories', productController.findCategories);
productRouter.get('/restaurants/:restaurantId', authenticate, productController.findByRestaurant);
productRouter.get('/branches/:branchId', productController.findByBranch);
productRouter.get('/:id', productController.findById);
productRouter.post('/restaurants/:restaurantId', authenticate, productController.create);
productRouter.patch('/:id', authenticate, productController.update);
