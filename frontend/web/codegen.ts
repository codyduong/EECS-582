import type { CodegenConfig } from "@graphql-codegen/cli";

// todo support the url as well, is there an SDL url for hive gateway at localhost:4000?
// who knows... i sure as hell didn't read enough docs -@codyduong
const schema = "../../backend/gateway/supergraph.graphql";

const config: CodegenConfig = {
  schema,
  documents: ["**/*.tsx", "./app/products/[id]/page.tsx"],
  ignoreNoDocuments: true,
  generates: {
    "./graphql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
