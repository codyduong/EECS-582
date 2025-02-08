# `products` microservice

Used to store product information

OpenAPI Spec: http://localhost:8082/swagger-ui/#/

### Dependencies
- [rust](https://www.rust-lang.org/tools/install)
- [postgresql](https://www.postgresql.org/download/)

Typically you would use the [`Dockerfile.products`] at the project root to develop this project.
But if you need to develop or would like to start locally, you need to set the `.env` variables.

```
cargo run
```