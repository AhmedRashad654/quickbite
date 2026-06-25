import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE TABLE order_items (
            id                  SERIAL PRIMARY KEY,
            order_id            INT NOT NULL,
            product_id          INT NOT NULL,
            quantity            INT NOT NULL CHECK (quantity > 0),
            unit_price_snapshot INT NOT NULL,
            name_snapshot       TEXT NOT NULL,
            image_url_snapshot  TEXT NULL,
            line_total          INT NOT NULL,
            created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);

  await knex.raw(`CREATE INDEX idx_order_items_order_id ON order_items (order_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS order_items`);
}
