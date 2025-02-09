# `auth` microservice

Used to authenticate users and stores role based access controls.

OpenAPI Spec: http://localhost:8081/swagger-ui/#/

### Dependencies
- [rust](https://www.rust-lang.org/tools/install)
- [postgresql](https://www.postgresql.org/download/)

Typically you would use the [`Dockerfile.auth`] at the project root to develop this project.
But if you need to develop or would like to start locally, you need to set the `.env` variables.

```sh
cargo run
```

### Migrations
If you want to change the database schema you'll need the [diesel-cli](https://diesel.rs/guides/getting-started).

```sh
diesel migration generate 
```

Make sure you can run and revert the migration
```sh
diesel migration run
diesel migration redo # runs revert and run
diesel migraiton revert
```
