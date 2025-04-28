# EECS-582

* [backend](./backend/)
  + [gateway](./backend/gateway/) is a hive GQL federation server
    - http://localhost:4000/
  + [auth](./backend/auth/) is a REST server with a postgresql database
    - SwaggerUI: http://localhost:8081/swagger-ui/#/
    - OpenAPI Spec: http://localhost:8081/api-docs/openapi.json
  + [products](./backend/products/) is a REST/~~gRPC~~ server with a postgresql database
    - SwaggerUI: http://localhost:8082/swagger-ui/#/
    - OpenAPI Spec: http://localhost:8082/api-docs/openapi.json

* [frontend](./frontend/)
  + [web](./frontend/web) is a Next.js website using [Tailwind CSS](https://tailwindcss.com/) + [Mantine](https://mantine.dev/)

* [packages](./packages/), contains any shared code libraries used within other tools
  + [auth-api-py](./packages/auth-api-py/),
    OpenAPI generated client library for `auth`
  + [products-api-py](./packages/products-api-py/), 
    OpenAPI generated generated client library for `products`

* [scrapers](./scrapers/)
  + [scraper-py-dillions](./scrapers/scraper-py-dillions/)
  + [scraper-py-sample](./scrapers/scraper-py-sample/)
  + [scraper-py-target](./scrapers/scraper-py-target/)
  + [scraper-py-walmart](./scrapers/scraper-py-walmart/)

* [tooling](./tooling/), contains any tooling/cli that is not a scraper
  + [grocerywise-ingestion-cli](./tooling/grocerywise-ingestion-cli/), 
    Used to ingest scraped data into various DBs

## Setting up

### Dependencies

It is very possible to run this entirely with only docker as a dependency, but you may require other tools
during development:
* [docker](https://www.docker.com/)
* [rust](https://www.rust-lang.org/tools/install)
  + [diesel-cli](https://diesel.rs/guides/getting-started), Diesel is what we
    use as our ORM on various backend services, you will need it to write SQL
    migrations.

* [postgresql](https://www.postgresql.org/download/)
  + Select install with pgAdmin 4 if you do not have a database management tool to view databases.
* [python](https://www.python.org/)
  + Python is managed by [`uv`](https://docs.astral.sh/uv/getting-started/installation/), 
    depending on your installation method you may not need to install python at all, and can just install
    `uv` to manage your python version, packages, and projects.

* [OpenAPI generator cli](https://openapi-generator.tech/docs/installation), 
  Used to generate client libraries based on our backend APIs that support OpenAPI spec

For vscode users this repo also comes with [`.vscode`](./vscode) to indicate recommended extensions.

It also comes with an optional [`grocerywise.code-workspace`](./grocerywise.code-workspace) file to open all projects but in
seperate workspaces. Read more here: [What is a VS Code Workspace?](https://code.visualstudio.com/docs/editor/workspaces/workspaces)
* Useful in python development, where you may need seperate instances of the python intepreter.
* Rust extension is configured for multi-project repos like this, and as such does not need code workspaces to work properly.

```sh
code grocerywise.code_workspaces  # Recommended use if you are working in .py projects/files
code .                            # Otherwise don't open and use default vscode behavior
```

<!--
* [node.js](https://nodejs.org/en)
  + I recommend using a node version manager for your machine. 
    [ `n` ](https://github.com/tj/n), [ `nvm` ](https://github.com/nvm-sh/nvm), or [ `nvm-windows` ](https://github.com/coreybutler/nvm-windows) are good options.

-->

### Setting up Environment

* Copy [`.env-sample`](./.env-sample) to `.env`
  

```sh
  cp .env-sample .env         # shell
  Copy-Item .env-sample .env  # powershell
  ```

* Fill out env variables.
  + `POSTGRES_USER` and `POSTGRES_PASSWORD` can be whatever you want. Just keep it in mind for your connection string
    for your pgadmin4 or preferred database management tool.

    - [Connecting to DB with pgAdmin 4](./docs/pgadmin/pgadmin.md)
    <!-- - [Connecting to DB with vscode extension](./docs/db-vscode.md) -->

  + `TEST_PASSWORD` is the password for the `test` user, by default it is `abc123`

    - [Authorizing user and getting test data](./docs/authorization/authorization.md)

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
docker build -t gateway -f ./backend/gateway/Dockerfile.local ./backend/gateway\
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

If you want to develop, you probably want these instructions:
- [Go to the primary docs for frontend/web](./frontend/web/README.md)

Alternatively, a docker-compose has been made for previewing production builds.

```sh
docker-compose -f docker-compose.frontend.yml up
```

## Deployment

Uses pulumi, extra notes hidden in source.

Requires GCP + pulumi + kubectl

```sh
winget install -e --id Kubernetes.kubectl
# assuming you follow gcloud instructions install
gcloud components install gke-gcloud-auth-plugin

gcloud config set project grocerywise-458406
gcloud auth application-default set-quota-project grocerywise-458406
gcloud auth application-default login
```

```sh
pulumi up --logtostderr -v=6 # 3, 6, 9 are common errors
```

<!-- 

-->