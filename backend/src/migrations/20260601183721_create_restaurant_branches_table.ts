import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE EXTENSION IF NOT EXISTS postgis;
        
        CREATE TABLE restaurant_branches (
            id BIGSERIAL PRIMARY KEY,
            restaurant_id INT NOT NULL,
            country_code TEXT NOT NULL CHECK(type IN ('EG','SA')),
            address_text TEXT NOT NULL,
            label TEXT NOT NULL,
            lat DECIMAL(9, 6) NOT NULL,
            lng DECIMAL(9, 6) NOT NULL,
            is_active BOOLEAN NOT NULL,
            opens_at TIME NOT NULL,
            closes_at TIME NOT NULL,
            accept_orders BOOLEAN NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            delivery_fee INTEGER NOT NULL DEFAULT 0,
            currency TEXT NOT NULL CHECK(type IN ('EGP','SAR')),
            commission INT NOT NULL,
            location geography(Point, 4326) GENERATED ALWAYS AS ( ST_MakePoint(lng::float, lat::float)::geography) STORED,
            
            CONSTRAINT fk_restaurant_branches_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
        );
        
        CREATE INDEX idx_restaurant_branches_restaurant_id ON restaurant_branches(restaurant_id);
        CREATE INDEX idx_restaurant_branches_is_active ON restaurant_branches(is_active);
        CREATE INDEX idx_restaurant_branches_location ON restaurant_branches USING GIST(location);
        
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP TABLE restaurant_branches;
        DROP TYPE IF EXISTS country_enum;
        DROP TYPE IF EXISTS currency_enum;
    `);
}
