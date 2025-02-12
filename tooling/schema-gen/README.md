# validators-cli

Tooling to check/output the schema

```
cargo build --locked --release
./target/release/validator --help
```

You can export any schema
```
./target/release/validator product-external --output "./product_external.schema.json"
```

Note that our schemas in [/schemas/...](../../schemas/) are a combination of 
manually generated and automatically generated here. 

As such you should take care when overwriting schemas.