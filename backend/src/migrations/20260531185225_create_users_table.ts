import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE TYPE system_role_enum AS ENUM('customer', 'delivery_agent', 'restaurant_user', 'system_admin');
        
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            system_role system_role_enum NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
         );

         CREATE INDEX idx_users_system_role ON users(system_role);
         `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP TABLE users;
    `);
}
