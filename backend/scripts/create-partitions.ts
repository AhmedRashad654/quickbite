import { db } from "../src/lib/knex/knex"; 

const MONTHS_AHEAD = Number(process.env.MONTHS_AHEAD ?? 12);

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

interface MonthRange {
    name: string;       
    fromIso: string;    
    toIso: string;      
}

function monthRanges(start: Date, count: number): MonthRange[] {
    const ranges: MonthRange[] = [];
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    for (let i = 0; i < count; i++) {
        const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
        ranges.push({
            name: `orders_${cursor.getUTCFullYear()}_${pad(cursor.getUTCMonth() + 1)}`,
            fromIso: `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-01`,
            toIso: `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-01`,
        });
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return ranges;
}

function isSafeIdentifier(name: string): boolean {
    return /^[a-z_][a-z0-9_]{0,62}$/.test(name);
}

function isSafeDate(d: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

async function main() {

    const ranges = monthRanges(new Date(), MONTHS_AHEAD);

    for (const r of ranges) {
        if (!isSafeIdentifier(r.name) || !isSafeDate(r.fromIso) || !isSafeDate(r.toIso)) {
            throw new Error(`Refusing to inline unsafe partition spec: ${JSON.stringify(r)}`);
        }

        const sql = `CREATE TABLE IF NOT EXISTS ${r.name} PARTITION OF orders FOR VALUES FROM ('${r.fromIso}') TO ('${r.toIso}')`;
        
        await db.raw(sql);
        console.log(`✅ Ensured partition: ${r.name} (${r.fromIso} -> ${r.toIso})`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ partitions script failed:", err);
        process.exit(1);
    });