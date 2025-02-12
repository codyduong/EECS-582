use clap::Parser;
use serde::Serialize;
use std::path::PathBuf;
mod get_schemas;
use get_schemas::*;

#[derive(clap::ValueEnum, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
enum Schema {
    ProductExternal,
    PriceReportExternal,
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Args {
    schema: Schema,

    #[arg(short, long)]
    output: PathBuf,
}

fn main() {
    let cli = Args::parse();

    match cli.schema {
        Schema::ProductExternal => get_product_external_schema(cli.output),
        Schema::PriceReportExternal => panic!("Not implemented yet"),
    }
}
