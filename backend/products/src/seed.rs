/*
  Name: seed.rs

  Description:
  This file seeds database with test data, only in development environments

  Programmer: Cody Duong
  Date Created: 2025-03-28
  Revision History:
  - 2025-03-28 - Cody Duong - add seed.rs

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `permissions` table must exist in the database.

  Side Effects:
  - This script modifies the local database.
*/

use crate::handlers::products::db_insert_products;
use crate::models::*;
use crate::schema::*;
use diesel::dsl::*;
use diesel::prelude::*;
use diesel::ExpressionMethods;
use std::str::FromStr;

pub(super) fn run(pool: crate::Pool) {
  let mut conn = pool.get().unwrap();

  #[cfg(debug_assertions)]
  let seed = true;
  #[cfg(not(debug_assertions))]
  let seed = std::env::var("SEED").is_ok();

  if seed {
    log::debug!("Seeding development environment data");

    let products: Vec<NewProductPost> = vec![
      NewProductPost {
        new_product: NewProduct {
          gtin: "009800124015".to_string(),
          sku: Some("10311201".to_string()),
          productname: "Ferrero Rocher, 24 Count, Premium Milk Chocolate Hazelnut, 10.6oz".to_string(),
          description: Some(
            "\
<li>GOURMET CHOCOLATE GIFT BOX: Share the indulgent taste of Ferrero Rocher with this 24-countbox \
of individually wrapped chocolates for gifting</li> \
<li>MILK CHOCOLATE HAZELNUT: A tempting combination made with a whole crunchy hazelnut dipped in \
delicious creamy  chocolate hazelnut filling and covered with milk chocolate, crispy wafers and \
gently roasted hazelnut pieces</li> \
<li>CELEBRATE THE MOMENT: Share special moments with your family and friends, or take a moment \
just for you. Ferrero chocolates make indulgent treats that are great for unwinding after a long \
day</li> \
<li>PREMIUM CHOCOLATE: Expertly crafted from premium gourmet chocolate, these timeless classics \
deliver decadent taste one exquisite bite at a time</li> \
<li>ELEGANT HAZELNUT DELIGHT: Experience the iconic taste of FERRERO ROCHER with creamy milk \
chocolate, a crisp wafer shell, and a whole hazelnut</li>
"
            .to_string(),
          ),
        },
        measures: vec![
          NewProductToMeasurePartial {
            unit: UnitSymbol::Count,
            amount: 24.into(),
            is_primary_measure: false,
            is_converted: None,
            raw_amount: None,
          },
          NewProductToMeasurePartial {
            unit: UnitSymbol::Ounce,
            amount: bigdecimal::BigDecimal::from_str("10.6").unwrap(),
            is_primary_measure: true,
            is_converted: Some(false),
            raw_amount: None,
          },
        ]
        .into(),
        images: Some(
          NewProductToImagePartial {
            image_url: "/009800124015_1.webp".to_string(),
          }
          .into(),
        ),
      },
      NewProductPost {
        new_product: NewProduct {
          gtin: "044700361146".to_string(),
          sku: Some("13908431".to_string()),
          productname: "Lunchables Extra Cheese Pizza Kids Lunch Meal Kit, 10.6 oz Box".to_string(),
          description: None,
        },
        measures: NewProductToMeasurePartial {
          unit: UnitSymbol::Ounce,
          amount: bigdecimal::BigDecimal::from_str("10.6").unwrap(),
          is_primary_measure: true,
          is_converted: Some(false),
          raw_amount: None,
        }
        .into(),
        images: Some(
          vec![
            NewProductToImagePartial {
              image_url: "/044700361146_1.webp".to_string(),
            },
            NewProductToImagePartial {
              image_url: "/044700361146_2.webp".to_string(),
            },
          ]
          .into(),
        ),
      },
      NewProductPost {
        new_product: NewProduct {
          gtin: "048500205716".to_string(),
          sku: Some("5512318310".to_string()),
          productname: "Tropicana Pure Premium 100% Orange Juice Original, No Pulp, No Sugar Added, 46 fl oz"
            .to_string(),
          description: None,
        },
        measures: NewProductToMeasurePartial {
          unit: UnitSymbol::FluidOunce,
          amount: 46.into(),
          is_primary_measure: true,
          is_converted: Some(false),
          raw_amount: None,
        }
        .into(),
        images: Some(
          NewProductToImagePartial {
            image_url: "/048500205716_1.webp".to_string(),
          }
          .into(),
        ),
      },
      NewProductPost {
        new_product: NewProduct {
          gtin: "078742046105".to_string(),
          sku: Some("34788345".to_string()),
          productname: "Great Value Light Greek Yogurt, Blueberry Nonfat Yogurt, 5.3 oz, 4 Count".to_string(),
          description: None,
        },
        measures: vec![
          NewProductToMeasurePartial {
            unit: UnitSymbol::Count,
            amount: 4.into(),
            is_primary_measure: false,
            is_converted: None,
            raw_amount: None,
          },
          NewProductToMeasurePartial {
            unit: UnitSymbol::Ounce,
            amount: bigdecimal::BigDecimal::from_str("5.3").unwrap(),
            is_primary_measure: true,
            is_converted: Some(false),
            raw_amount: None,
          },
        ]
        .into(),
        images: Some(
          NewProductToImagePartial {
            image_url: "/078742046105_1.webp".to_string(),
          }
          .into(),
        ),
      },
    ];

    let gtins: Vec<String> = products.clone().into_iter().map(|v| v.new_product.gtin).collect();

    let _ = delete(products::table)
      .filter(products::gtin.eq_any(gtins))
      .execute(&mut conn)
      .unwrap();

    let result = db_insert_products(products, &mut conn);

    // ensure we either add the user entirely, or don't at all
    match result {
      Ok(_) => (),
      Err(err) => {
        log::error!("Failed to create test user: {}", err);
      }
    };
  }
}
