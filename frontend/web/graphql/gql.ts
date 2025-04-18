/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n      description\n    }\n  }\n": typeof types.ProductDocument,
    "\n  query PriceComparison_GetProduct($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": typeof types.PriceComparison_GetProductDocument,
    "\n  query Products {\n    get_products {\n      edges {\n        node {\n          gtin\n          productname\n          images {\n            image_url\n          }\n        }\n      }\n    }\n  }\n": typeof types.ProductsDocument,
    "\n  query ProductForm_Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n    }\n  }\n": typeof types.ProductForm_ProductDocument,
    "\n  query ProductForm_Units {\n    get_units {\n      id\n      symbol\n    }\n  }\n": typeof types.ProductForm_UnitsDocument,
    "\n  mutation ProductForm_PostProduct(\n    $measures: [NewProductToMeasurePartial_Input]!\n    $productname: String!\n    $gtin: mutationInput_post_products_input_items_allOf_0_gtin!\n  ) {\n    post_products(\n      input: { gtin: $gtin, productname: $productname, measures: $measures }\n    )\n  }\n": typeof types.ProductForm_PostProductDocument,
};
const documents: Documents = {
    "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n      description\n    }\n  }\n": types.ProductDocument,
    "\n  query PriceComparison_GetProduct($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n": types.PriceComparison_GetProductDocument,
    "\n  query Products {\n    get_products {\n      edges {\n        node {\n          gtin\n          productname\n          images {\n            image_url\n          }\n        }\n      }\n    }\n  }\n": types.ProductsDocument,
    "\n  query ProductForm_Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n    }\n  }\n": types.ProductForm_ProductDocument,
    "\n  query ProductForm_Units {\n    get_units {\n      id\n      symbol\n    }\n  }\n": types.ProductForm_UnitsDocument,
    "\n  mutation ProductForm_PostProduct(\n    $measures: [NewProductToMeasurePartial_Input]!\n    $productname: String!\n    $gtin: mutationInput_post_products_input_items_allOf_0_gtin!\n  ) {\n    post_products(\n      input: { gtin: $gtin, productname: $productname, measures: $measures }\n    )\n  }\n": types.ProductForm_PostProductDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n      description\n    }\n  }\n"): (typeof documents)["\n  query Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PriceComparison_GetProduct($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n"): (typeof documents)["\n  query PriceComparison_GetProduct($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n      productname\n      images {\n        image_url\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Products {\n    get_products {\n      edges {\n        node {\n          gtin\n          productname\n          images {\n            image_url\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Products {\n    get_products {\n      edges {\n        node {\n          gtin\n          productname\n          images {\n            image_url\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProductForm_Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n    }\n  }\n"): (typeof documents)["\n  query ProductForm_Product($gtin: String!) {\n    get_product(gtin: $gtin) {\n      gtin\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProductForm_Units {\n    get_units {\n      id\n      symbol\n    }\n  }\n"): (typeof documents)["\n  query ProductForm_Units {\n    get_units {\n      id\n      symbol\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ProductForm_PostProduct(\n    $measures: [NewProductToMeasurePartial_Input]!\n    $productname: String!\n    $gtin: mutationInput_post_products_input_items_allOf_0_gtin!\n  ) {\n    post_products(\n      input: { gtin: $gtin, productname: $productname, measures: $measures }\n    )\n  }\n"): (typeof documents)["\n  mutation ProductForm_PostProduct(\n    $measures: [NewProductToMeasurePartial_Input]!\n    $productname: String!\n    $gtin: mutationInput_post_products_input_items_allOf_0_gtin!\n  ) {\n    post_products(\n      input: { gtin: $gtin, productname: $productname, measures: $measures }\n    )\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;