/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": typeof types.ProductDocument,
    "\n  query Products {\n    get_products {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": typeof types.ProductsDocument,
};
const documents: Documents = {
    "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": types.ProductDocument,
    "\n  query Products {\n    get_products {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": types.ProductsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n"): typeof import('./graphql').ProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Products {\n    get_products {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n"): typeof import('./graphql').ProductsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
