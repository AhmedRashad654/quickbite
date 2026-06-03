import { db } from "../../../lib/knex/knex.js";

export async function getPermissionsByRoleName(
    roleName: string
): Promise<string[]> {
    const rows = await db("permissions as p")
        .select("p.id", "p.resource", "p.action", "p.created_at")
        .join("role_permissions as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName);

    return rows.map(row => {
        return `${row.resource}:${row.action}`; 
    });
}