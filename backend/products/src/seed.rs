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
use ::products::schema::price_report_to_marketplaces::price_report_id;
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

    // no delete cascade means we have to ensure integrity via manual deletion
    let _ = delete(
      price_report_to_marketplaces::table.filter(
        price_report_id.eq_any(
          price_reports::table
            .filter(price_reports::gtin.eq_any(gtins.clone()))
            .select(price_reports::id), // Assuming 'id' is the primary key of price_reports
        ),
      ),
    )
    .execute(&mut conn)
    .unwrap();

    // no delete cascade means we have to ensure integrity via manual deletion
    let _ = delete(price_reports::table)
      .filter(price_reports::gtin.eq_any(gtins.clone()))
      .execute(&mut conn)
      .unwrap();

    let _ = delete(products::table)
      .filter(products::gtin.eq_any(gtins))
      .execute(&mut conn)
      .unwrap();

    let result = db_insert_products(products, &mut conn);

    // ensure we either add the products entirely, or don't at all
    match result {
      Ok(_) => (),
      Err(err) => {
        log::error!("Failed to insert products: {}", err);
      }
    };

    // 1 - Walmart, 2 - Target, 3 - Kroger/Dillons
    let marketplaces: Vec<NewMarketplace> = vec![
      NewMarketplace {
        id: Some(1),
        company_id: 1,
      },
      NewMarketplace {
        id: Some(2),
        company_id: 1,
      },
    ];

    let physical_marketplaces: Vec<PhysicalMarketplace> = vec![
      PhysicalMarketplace {
        id: 1,
        adr_address: "550 Congressional Dr, Lawrence, KS 66049".to_string(),
        place_id: Some("KqoCZ8oPCSA2Fiad9".to_string()),
        open_location_code: "XMFR+73".to_string(),
      },
      PhysicalMarketplace {
        id: 2,
        adr_address: "3300 Iowa St, Lawrence, KS 66046".to_string(),
        place_id: Some("uQLgqWtxdSnzgP4r9".to_string()),
        open_location_code: "WPFV+84".to_string(),
      },
    ];

    let ids: Vec<i32> = marketplaces.clone().into_iter().filter_map(|v| v.id).collect();

    diesel::delete(marketplaces::table)
      .filter(marketplaces::id.eq_any(ids))
      .execute(&mut conn)
      .unwrap();

    diesel::insert_into(marketplaces::table)
      .values(marketplaces)
      .execute(&mut conn)
      .unwrap();

    diesel::insert_into(physical_marketplaces::table)
      .values(physical_marketplaces)
      .execute(&mut conn)
      .unwrap();

    let reported_at = chrono::NaiveDateTime::from_str("2025-04-14T13:48:59.791").unwrap();

    let price_reports: Vec<NewPriceReport> = vec![
      NewPriceReport {
        id: Some(1),
        reported_at: Some(reported_at),
        created_by: 0,
        gtin: "009800124015".to_string(),
        price: bigdecimal::BigDecimal::from_str("12.39").unwrap(),
        currency: "USD".to_string(),
      },
      NewPriceReport {
        id: Some(2),
        reported_at: Some(reported_at),
        created_by: 0,
        gtin: "044700361146".to_string(),
        price: bigdecimal::BigDecimal::from_str("3.12").unwrap(),
        currency: "USD".to_string(),
      },
    ];

    diesel::insert_into(price_reports::table)
      .values(price_reports)
      .execute(&mut conn)
      .unwrap();

    let price_report_to_marketplaces: Vec<PriceReportToMarketplace> = vec![
      PriceReportToMarketplace {
        price_report_id: 1,
        reported_at,
        marketplace_id: 1,
      },
      PriceReportToMarketplace {
        price_report_id: 2,
        reported_at,
        marketplace_id: 1,
      },
    ];

    diesel::insert_into(price_report_to_marketplaces::table)
      .values(price_report_to_marketplaces)
      .execute(&mut conn)
      .unwrap();
  }
}
