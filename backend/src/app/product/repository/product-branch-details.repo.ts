import { db } from "../../../lib/knex/knex.js";
import { NoFieldsToUpdateError } from "../errors.js";
import { ProductBranchDetails } from "../type.js";

const PBD_COLUMNS = ['id', 'branch_id', 'product_id', 'price', 'stock', 'is_available'];

export async function updateBranchDetails(
  branchId: number,
  productId: number,
  data: { price?: number; stock?: number; is_available?: boolean },
): Promise<ProductBranchDetails> {
  const updateData: Record<string, unknown> = {};
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.is_available !== undefined) updateData.is_available = data.is_available;
  if(Object.keys(updateData).length === 0) {
    throw NoFieldsToUpdateError;
   }
  const [row] = await db('product_branch_details')
    .where('branch_id', branchId)
    .where('product_id', productId)
    .update(updateData)
    .returning(PBD_COLUMNS);
  return row;
}
