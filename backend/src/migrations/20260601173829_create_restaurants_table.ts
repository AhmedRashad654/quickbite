import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`        
        CREATE TABLE restaurants (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NOT NULL,
            name text NOT NULL,
            logo_url TEXT,
            status TEXT NOT NULL CHECK(status IN ('active','suspended','disabled','pending')) DEFAULT 'pending',
            primary_country TEXT NOT NULL CHECK(type IN ('EG','SA')),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            status_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                 
            CONSTRAINT fk_restaurants_owner_id FOREIGN KEY (owner_id) REFERENCES users(id)
        );

        CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
        CREATE INDEX idx_restaurants_status ON restaurants(status);
        CREATE INDEX idx_restaurants_primary_country ON restaurants(primary_country);
        CREATE INDEX idx_restaurants_primary_created_at ON restaurants(created_at);
        
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE restaurants;`);
}
