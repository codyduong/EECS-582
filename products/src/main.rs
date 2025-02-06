use self::models::*;
use diesel::prelude::*;
use products::*;

fn main() {
  use self::schema::marketplaces::dsl::*;

  let connection = &mut establish_connection();
  let results = marketplaces
    .limit(5)
    .select(Marketplace::as_select())
    .load(connection)
    .expect("Error loading posts");

  println!("Displaying {} marketplaces", results.len());
  for marketplace in results {
    println!("{:?}", marketplace);
  }
}
