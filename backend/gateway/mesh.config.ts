import {
  defineConfig,
  loadGraphQLHTTPSubgraph as _loadGraphQLHTTPSubgraph,
  createRenameTransform,
} from "@graphql-mesh/compose-cli";
import { loadOpenAPISubgraph } from "@omnigraph/openapi";

const PRODUCTS_TYPE_RENAME_MAP = {
  query_get_products_edges_items_node: "ProductResponse",
};

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadOpenAPISubgraph("Auth", {
        // TODO allow dynamic generation inside docker -@codyduong
        // see: https://stackoverflow.com/questions/52788472/how-can-one-make-a-docker-compose-service-build-depend-on-another-service
        source: "http://127.0.0.1:8081/api-docs/openapi.json",
        operationHeaders: {
          "Content-Type": "application/json",
          // todo we should probably use different headers for different apis? or well, this is fine for now
          // since we use the same universal JWT across microservices? -@codyduong
          authorization: 'Bearer {context.headers["authorization"]}',
        },
      }),
    },
    {
      sourceHandler: loadOpenAPISubgraph("Products", {
        source: "http://127.0.0.1:8082/api-docs/openapi.json",
        operationHeaders: {
          "Content-Type": "application/json",
          // todo we should probably use different headers for different apis? or well, this is fine for now
          // since we use the same universal JWT across microservices? -@codyduong
          authorization: 'Bearer {context.headers["authorization"]}',
        },
      }),
      transforms: [
        createRenameTransform({
          typeRenamer(opts) {
            if (opts.typeName in PRODUCTS_TYPE_RENAME_MAP) {
              return PRODUCTS_TYPE_RENAME_MAP[opts.typeName];
            }
            return opts.typeName;
          },
        }),
      ],
    },
  ],
  additionalTypeDefs: `
   extend type ProductResponse {
      price_reports(
        """
        Number of items after cursor
        """
        first: Int
        """
        Cursor for forward pagination
        """
        after: Int
        """
        Number of items before cursor
        """
        last: Int
        """
        Cursor for backward pagination
        """
        before: Int
        marketplace_id: String
      ): Connection_PriceResponse!
      @resolve(
        field: "get_price_reports_for_gtin"
        arguments: {
          gtin: "{root.gtin}"
          first: "{args.first}"
          after: "{args.after}"
          last: "{args.last}"
          before: "{args.before}"
          marketplace_id: "{args.marketplace_id}"
        }
        sourceTypeName: "Query"
        sourceName: "Products"
      )
    }
  `,
});
