import {
  defineConfig,
  loadGraphQLHTTPSubgraph,
} from "@graphql-mesh/compose-cli";
import { loadOpenAPISubgraph } from "@omnigraph/openapi";

export const composeConfig = defineConfig({
  subgraphs: [
    // {
    //   sourceHandler: loadGraphQLHTTPSubgraph('Products', {
    //     endpoint: 'http://localhost:8081/'
    //   })
    // }
    {
      sourceHandler: loadOpenAPISubgraph("Auth", {
        // TODO allow dynamic generation inside docker -@codyduong
        // see: https://stackoverflow.com/questions/52788472/how-can-one-make-a-docker-compose-service-build-depend-on-another-service
        source: "http://localhost:8081/api-docs/openapi.json",
        operationHeaders: {
          'Content-Type': 'application/json',
          // todo we should probably use different headers for different apis? or well, this is fine for now
          // since we use the same universal JWT across microservices? -@codyduong
          authorization: 'Bearer {context.headers["authorization"]}',
        },
      }),
    },
    {
      sourceHandler: loadOpenAPISubgraph("Products", {
        source: "http://localhost:8082/api-docs/openapi.json",
        operationHeaders: {
          'Content-Type': 'application/json',
          // todo we should probably use different headers for different apis? or well, this is fine for now
          // since we use the same universal JWT across microservices? -@codyduong
          authorization: 'Bearer {context.headers["authorization"]}',
        },
      }),
    },
  ],
});
