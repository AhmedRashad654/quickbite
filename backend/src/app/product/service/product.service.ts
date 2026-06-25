import { PermissionDeniedError } from '../../../lib/auth/error.js';
import { isBranchOpen } from '../../../lib/utils/branchTime.js';
import { BranchNotFoundError } from '../../branch/errors.js';
import { findBranchByIdWithRestaurant } from '../../branch/repository/branch.repo.js';
import { RestaurantNotFoundError } from '../../restaurant/errors.js';
import { findRestaurantById } from '../../restaurant/repository/restaurant.repo.js';
import { SystemRole } from '../../users/enums.js';
import { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto.js';
import { ProductNotFoundError } from '../errors.js';
import { createCategory, findCategoriesByRestaurant, findCategoryByName } from '../repository/category.repo.js';
import { updateBranchProductDetails } from '../repository/product-branch-details.repo.js';
import {
  createProduct,
  findProductById,
  findProductsByBranch,
  findProductsByRestaurant,
  updateProduct,
} from '../repository/product.repo.js';

export class ProductService {
  create = async (restaurantId: number, userId: number, userRole: SystemRole, data: CreateProductDTO) => {
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) throw RestaurantNotFoundError;
    if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
      throw PermissionDeniedError;
    }

    let categoryId: number | undefined = undefined;
    if (data.category_name) {
      let category = await findCategoryByName(restaurantId, data.category_name);
      if (!category) {
        category = await createCategory(restaurantId, data.category_name);
      }
      categoryId = category.id;
    }

    return await createProduct({
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      restaurant_id: restaurantId,
      category_id: categoryId,
    });
  };

  findByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) throw RestaurantNotFoundError;
    if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
      throw PermissionDeniedError;
    }
    return await findProductsByRestaurant(restaurantId);
  };

  findCategories = async (restaurantId: number) => {
    return await findCategoriesByRestaurant(restaurantId);
  };

  findByBranch = async (branchId: number) => {
    let branch = await findBranchByIdWithRestaurant(branchId);
    if (!branch) throw BranchNotFoundError;

    branch = {
      ...branch,
      is_open: isBranchOpen({
        opens_at: branch.opens_at!,
        closes_at: branch.closes_at!,
        accept_orders: branch.accept_orders!,
        is_active: branch.is_active!,
        country_code: branch.country_code!,
      }),
    };
    const products = await findProductsByBranch(branchId);
    const categoriesMap: Record<number, any> = {};
    products.forEach((row) => {
      const categoryId = row.category_id || 0;
      const categoryName = row.category_name || 'Others';

      if (!categoriesMap[categoryId]) {
        categoriesMap[categoryId] = {
          id: categoryId,
          name: categoryName,
          products: [],
        };
      }

      categoriesMap[categoryId].products.push({
        id: row.id,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        price: row.price,
        stock: row.stock,
        is_available: row.is_available,
      });
    });
    return {
      ...branch,
      menu: Object.values(categoriesMap),
    };
  };

  findById = async (id: number) => {
    const product = await findProductById(id);
    if (!product) {
      throw ProductNotFoundError;
    }
    return product;
  };

  update = async (
    productId: number,
    userId: number,
    userRole: SystemRole,
    data: UpdateProductDTO,
    branchId?: number,
  ) => {
    const product = await findProductById(productId);
    if (!product) {
      throw ProductNotFoundError;
    }

    const restaurant = await findRestaurantById(product.restaurant_id);
    if (!restaurant) throw RestaurantNotFoundError;
    if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
      throw PermissionDeniedError;
    }

    let categoryId: number | undefined = undefined;
    if (data.category_name) {
      let category = await findCategoryByName(product.restaurant_id, data.category_name);
      if (!category) {
        category = await createCategory(product.restaurant_id, data.category_name);
      }
      categoryId = category.id;
    }

    const updatedProduct = await updateProduct(productId, {
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      category_id: categoryId,
    });

    let branchDetails;
    if (branchId && (data.price !== undefined || data.stock !== undefined || data.is_available !== undefined)) {
      branchDetails = await updateBranchProductDetails(branchId, productId, {
        price: data.price,
        stock: data.stock,
        is_available: data.is_available,
      });
    }

    return { product: updatedProduct, branchDetails };
  };
}
