# EECS-582

overengineered project monorepo

* [backend](./backend/)
  * [auth](./backend/auth/) is a primarily REST server with a postgresql database
    + OpenAPI Spec: http://localhost:8081/swagger-ui/#/
  * [products](./backend/products/) is a REST/~~gRPC~~ server with a postgresql database
    + OpenAPI Spec: http://localhost:8082/swagger-ui/#/
<!--
* website is a Next.js server
  + http://localhost:3000/
-->

## Setting up

This assumes at a minimum you have [ `docker` ](https://www.docker.com/). Install via your preferred method.

### Dependencies

It is very possible to run this entirely with only docker as a dependency, but you may require other tools
during development:
* [rust](https://www.rust-lang.org/tools/install)
* [postgresql](https://www.postgresql.org/download/)
  - Select install with pgAdmin 4 if you do not have a database management tool to view databases.

For vscode users this repo also comes with [ `.vscode` ](./vscode) to indicate recommended extensions.

<!--
* [node.js](https://nodejs.org/en)
  + I recommend using a node version manager for your machine. 
    [ `n` ](https://github.com/tj/n), [ `nvm` ](https://github.com/nvm-sh/nvm), or [ `nvm-windows` ](https://github.com/coreybutler/nvm-windows) are good options.
-->

### Setting up Environment

* Copy [`.env-sample`](./env-sample) to [`.env`](./env) <div>`cp .env-sample .env`</div>
* Fill out env variables.
  + `POSTGRES_USER` and `POSTGRES_PASSWORD` can be whatever you want. Just keep it in mind for your connection string
    for your pgadmin4 or preferred database management tool.

    - [Connecting to DB with pgAdmin 4](./docs/pgadmin/pgadmin.md)
    <!-- - [Connecting to DB with vscode extension](./docs/db-vscode.md) -->

  + `TEST_PASSWORD` is the password for the `test` user, by default it is `abc123`
  + `JWT_SECRET` is any arbitrary length string used to encode our JWTs. Set it to anything.

## Starting Project

### Starting backend/microservices

```sh
docker-compose -f docker-compose.backend.yml up
```

Whenever you edit a microservice you may have to restart the docker container manually.

```sh
# restarting
docker-compose -f docker-compose.backend.yml stop    # stop existing container
docker build -t auth -f Dockerfile.auth .            # if you changed auth
docker build -t products -f Dockerfile.products .    # if you changed products
docker-compose -f docker-compose.backend.yml up

# alternatively you can use --build flag, but this will rebuild every microservice
docker-compose -f docker-compose.backend.yml up --build
```

### Removing DB
If your database somehow entered a bad state, it is possible to delete all the data.

```sh
# WARNING, this will delete all db data, 
# use stop instead if you simply want to stop the service
docker-compose -f docker-compose.backend.yml down 
# this volume name may not be correct depending on your workdir, see all images
# with `docker volume ls`, it will end in database
docker volume rm eecs-582_database
```

### Starting frontend
TODO
