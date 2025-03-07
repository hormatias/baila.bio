import { supabase } from "./supabase"

export async function setupDatabase() {
  // Check if tables exist, if not create them
  const { error: linksError } = await supabase.from("links").select("id").limit(1)

  if (linksError) {
    console.log("Creating links table...")
    const { error } = await supabase.rpc("create_links_table")
    if (error) console.error("Error creating links table:", error)
  }

  const { error: blocksError } = await supabase.from("blocks").select("id").limit(1)

  if (blocksError) {
    console.log("Creating blocks table...")
    const { error } = await supabase.rpc("create_blocks_table")
    if (error) console.error("Error creating blocks table:", error)
  }
}

// SQL functions to create tables (to be executed in Supabase SQL editor)
/*
-- Create links table function
create or replace function create_links_table()
returns void as $$
begin
  create table if not exists links (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    html_content text not null,
    created_at timestamp with time zone default now()
  );
end;
$$ language plpgsql;

-- Create blocks table function
create or replace function create_blocks_table()
returns void as $$
begin
  create table if not exists blocks (
    id uuid primary key default uuid_generate_v4(),
    link_id uuid not null references links(id) on delete cascade,
    type text not null,
    content jsonb not null,
    position integer not null,
    created_at timestamp with time zone default now()
  );
  
  -- Create index on link_id and position
  create index if not exists blocks_link_id_position_idx on blocks(link_id, position);
end;
$$ language plpgsql;
*/

