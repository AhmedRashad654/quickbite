import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE TABLE payment_providers (
            id         INT PRIMARY KEY,
            name       TEXT NOT NULL UNIQUE,
            is_enabled BOOLEAN NOT NULL DEFAULT TRUE
        );
    `);

  await knex('payment_providers').insert([{ id: 1, name: 'kashier', is_enabled: true }]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS payment_providers`);
}
