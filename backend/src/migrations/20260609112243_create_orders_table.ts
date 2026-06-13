import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE SEQUENCE IF NOT EXISTS orders_id_seq AS INTEGER`);

  await knex.raw(`
        CREATE TABLE orders (
            id                    INTEGER NOT NULL DEFAULT nextval('orders_id_seq'),
            public_id             UUID NOT NULL DEFAULT gen_random_uuid(),
            country_code          TEXT NOT NULL,
            restaurant_id         INTEGER NOT NULL,
            branch_id             INTEGER NOT NULL,
            customer_id           INTEGER NOT NULL,
            customer_address_id   INTEGER NOT NULL,

            delivery_lat          DECIMAL(10,7) NOT NULL,
            delivery_lng          DECIMAL(10,7) NOT NULL,
            delivery_address_text_snapshot TEXT NOT NULL,

            branch_lat            DECIMAL(10,7) NOT NULL,
            branch_lng            DECIMAL(10,7) NOT NULL,

            status                TEXT NOT NULL CHECK (status IN (
                                      'pending_payment','placed','accepted','rejected',
                                      'preparing','ready','assigned','picked','delivered','cancelled'
                                  )),

            subtotal              INT NOT NULL,
            delivery_fee          INT NOT NULL,
            service_fee           INT NOT NULL,
            total                 INT NOT NULL,
            commission            INT NOT NULL DEFAULT 0,
            currency              TEXT NOT NULL,
            payment_method        TEXT NOT NULL CHECK (payment_method IN ('online','cod')),

            delivery_agent_id     INTEGER,

            created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
            accepted_at           TIMESTAMP NULL,
            rejected_at           TIMESTAMP NULL,
            ready_at              TIMESTAMP NULL,
            assigned_at           TIMESTAMP NULL,
            picked_at             TIMESTAMP NULL,
            delivered_at          TIMESTAMP NULL,
            cancelled_at          TIMESTAMP NULL,

            PRIMARY KEY (id, created_at),
            
            CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
            CONSTRAINT fk_orders_branch FOREIGN KEY (branch_id) REFERENCES restaurant_branches(id),
            CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
            CONSTRAINT fk_orders_customer_address FOREIGN KEY (customer_address_id) REFERENCES customer_addresses(id),
            CONSTRAINT fk_orders_delivery_agent FOREIGN KEY (delivery_agent_id) REFERENCES users(id)
        ) PARTITION BY RANGE (created_at);
    `);

  await knex.raw(`ALTER SEQUENCE orders_id_seq OWNED BY orders.id`);

  await knex.raw(`CREATE INDEX idx_orders_public_id ON orders (public_id)`);
  await knex.raw(`CREATE INDEX idx_orders_customer_id_created_at ON orders (customer_id, created_at DESC)`);
  await knex.raw(`CREATE INDEX idx_orders_branch_status_created_at ON orders (branch_id, status, created_at DESC)`);
  await knex.raw(`CREATE INDEX idx_orders_status_created_at ON orders (status, created_at) WHERE status IN ('ready','assigned')`);
  await knex.raw(`CREATE INDEX idx_orders_delivery_agent_id_status ON orders (delivery_agent_id, status) WHERE delivery_agent_id IS NOT NULL`);
  

  await knex.raw(`CREATE TABLE orders_default PARTITION OF orders DEFAULT`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS orders CASCADE`);
  await knex.raw(`DROP SEQUENCE IF EXISTS orders_id_seq`);
}