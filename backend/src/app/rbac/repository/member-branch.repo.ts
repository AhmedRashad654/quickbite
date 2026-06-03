import {Knex} from "knex";
import { db } from "../../../lib/knex/knex.js";
import { MemberBranch } from "../type.js";

export async function setMemberBranches(memberId: number, rows: Partial<MemberBranch>[], trx?: Knex.Transaction) {
    // delete
    const query = trx || db
    await query("member_branches").where('member_id', memberId).delete();
    // insert
    if(rows.length > 0) {
        await query("member_branches").insert(
            rows.map(row => ({
                member_id: row.member_id,
                branch_id: row.branch_id
            }))
        );
    }
}

export async function findBranchIdsByMemberId(memberId: number): Promise<number[]> {
    const rows = await db("member_branches").select("branch_id").where("member_id", memberId);
    return rows?.map(row => row.branch_id);
}

export async function countBranchesByIdsAndRestaurant(branchIds: number[], restaurantId: number): Promise<number> {
    const [{count}] = await db("restaurant_branches")
        .whereIn("id", branchIds)
        .andWhere("restaurant_id", restaurantId)
        .count("id as count");
    return Number(count);
}

