# `auth` microservice

Used to authenticate users and stores role based access controls.

OpenAPI Spec: http://localhost:8081/swagger-ui/#/

### Dependencies
- [rust](https://www.rust-lang.org/tools/install)
- [postgresql](https://www.postgresql.org/download/)

Typically you would use the [`Dockerfile.auth`] at the project root to develop this project.
But if you need to develop or would like to start locally, you need to set the `.env` variables.

```
cargo run
```