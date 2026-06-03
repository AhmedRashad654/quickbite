import { db } from "../../../lib/knex/knex.js";


export async function findRoleByName(
    name: string
): Promise<number | null> {
    const row = await db("roles")
        .select('id')
        .where("name", name)
        .first();

    if (!row) return null;

    return row.id;
}