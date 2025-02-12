use schemars::schema_for;
use serde_json::to_string_pretty;
use std::{fs, path::PathBuf};

pub(crate) fn get_product_external_schema(path: PathBuf) {
    let schema = schema_for!(products::models::ProductExternal);
    let schema_json = to_string_pretty(&schema).unwrap();
    fs::write(path, schema_json).unwrap();
}
