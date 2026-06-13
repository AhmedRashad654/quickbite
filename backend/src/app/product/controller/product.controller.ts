import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../service/product.service.js';
import { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { SystemRole } from '../../users/enums.js';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { sendSuccess } from '../../../lib/http/response.js';
import { MissingProductIdsQueryError } from '../errors.js';

@injectable()
export class ProductController {
  constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) {}

  create = async (req: Request, res: Response) => {
    const data = await validateBody(CreateProductDTO, req.body);
    const product = await this.productService.create(
      Number(req.params.restaurantId),
      req.user?.userId!,
      req.user?.role! as SystemRole,
      data,
    );
    sendSuccess(res, { message: 'Product created', product }, 201);
  };

  findByRestaurant = async (req: Request, res: Response) => {
    const results = await this.productService.findByRestaurant(
      Number(req.params.restaurantId),
      req.user?.userId!,
      req.user?.role! as SystemRole,
    );
    sendSuccess(res, { data: results });
  };

  findCategories = async (req: Request, res: Response) => {
    const results = await this.productService.findCategories(Number(req.params.restaurantId));
    sendSuccess(res, { data: results });
  };

  findByBranch = async (req: Request, res: Response) => {
    const results = await this.productService.findByBranch(Number(req.params.branchId));
    sendSuccess(res, { data: results });
  };

  findById = async (req: Request, res: Response) => {
    const product = await this.productService.findById(Number(req.params.id));
    sendSuccess(res, product);
  };

  update = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateProductDTO, req.body);
    const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
    const result = await this.productService.update(
      Number(req.params.id),
      req.user?.userId!,
      req.user?.role! as SystemRole,
      data,
      branchId,
    );
    sendSuccess(res, { message: 'Product updated', ...result });
  };
}
