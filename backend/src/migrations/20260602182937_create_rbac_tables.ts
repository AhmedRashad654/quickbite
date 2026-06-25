import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void>{
    await knex.raw(`
        CREATE TABLE roles (
            id SMALLSERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE permissions (
            id SMALLSERIAL PRIMARY KEY,
            resource TEXT NOT NULL,
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(resource,action)
        );

        CREATE TABLE role_permissions (
            role_id smallint NOT NULL,
            permission_id smallint NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (role_id, permission_id),
            CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(id),
            CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id)
        ); 
        
        CREATE TABLE restaurant_members (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role_id SMALLINT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('active','inactive','suspended')) DEFAULT 'active',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (restaurant_id, user_id),
            CONSTRAINT fk_restaurant_members_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            CONSTRAINT fk_restaurant_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_restaurant_members_role_id FOREIGN KEY (role_id) REFERENCES roles(id)
        );

        CREATE TABLE member_branches (
         member_id INTEGER NOT NULL,
         branch_id INTEGER NOT NULL,
         created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         PRIMARY KEY (member_id, branch_id),
         CONSTRAINT fk_member_branches_member_id FOREIGN KEY (member_id) REFERENCES restaurant_members(id) ON DELETE CASCADE,
         CONSTRAINT fk_member_branches_branch_id FOREIGN KEY (branch_id) REFERENCES restaurant_branches(id) ON DELETE CASCADE
        );   
        
        CREATE INDEX idx_restaurant_members_restaurant_id ON restaurant_members(restaurant_id);
        CREATE INDEX idx_restaurant_members_user_id ON restaurant_members(user_id);
        CREATE INDEX idx_member_branches_member_id ON member_branches(member_id);
`)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS member_branches;
        DROP TABLE IF EXISTS restaurant_members;
        DROP TABLE IF EXISTS role_permissions;
        DROP TABLE IF EXISTS permissions;
        DROP TABLE IF EXISTS roles;
    `);
}