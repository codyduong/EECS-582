/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  ObjMap: { input: any; output: any; }
  /** Represents empty values */
  Void: { input: any; output: any; }
  _DirectiveExtensions: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
  mutationInput_post_products_input_items_allOf_0_gtin: { input: any; output: any; }
  queryInput_post_image_input_items_gtin: { input: any; output: any; }
  query_get_image_oneOf_1_gtin: { input: any; output: any; }
  query_get_products_items_allOf_0_gtin: { input: any; output: any; }
  query_get_products_items_allOf_1_measures_items_allOf_0_gtin: { input: any; output: any; }
};

export enum HttpMethod {
  Connect = 'CONNECT',
  Delete = 'DELETE',
  Get = 'GET',
  Head = 'HEAD',
  Options = 'OPTIONS',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT',
  Trace = 'TRACE'
}

/** Login request. Either `email` or `username` must be provided. */
export type LoginRequest_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Marketplace = {
  __typename?: 'Marketplace';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login_route?: Maybe<Scalars['JSON']['output']>;
  post_marketplace?: Maybe<Marketplace>;
  post_products?: Maybe<Scalars['Boolean']['output']>;
  refresh_route?: Maybe<Scalars['JSON']['output']>;
  register_route?: Maybe<Scalars['JSON']['output']>;
};


export type MutationLogin_RouteArgs = {
  input?: InputMaybe<LoginRequest_Input>;
};


export type MutationPost_MarketplaceArgs = {
  input?: InputMaybe<NewMarketplace_Input>;
};


export type MutationPost_ProductsArgs = {
  input?: InputMaybe<Array<InputMaybe<NewProductPost_Input>>>;
};


export type MutationRegister_RouteArgs = {
  input?: InputMaybe<RegisterRequest_Input>;
};

export type NewMarketplace_Input = {
  name: Scalars['String']['input'];
};

export type NewProductPost_Input = {
  gtin: Scalars['mutationInput_post_products_input_items_allOf_0_gtin']['input'];
  measures: NewProductToMeasurePost_Input;
  productname: Scalars['String']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
};

export type NewProductToImage_Input = {
  gtin: Scalars['queryInput_post_image_input_items_gtin']['input'];
  image_url: Scalars['String']['input'];
};

export type NewProductToMeasurePost_Input = {
  amount: Scalars['Float']['input'];
  is_converted?: InputMaybe<Scalars['Boolean']['input']>;
  is_primary_measure: Scalars['Boolean']['input'];
  raw_amount: Scalars['Float']['input'];
  unit: UnitSymbol;
};

export type ProductResponse = {
  __typename?: 'ProductResponse';
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['query_get_products_items_allOf_0_gtin']['output'];
  images: Array<Maybe<ProductToImage>>;
  measures: Array<Maybe<ProductToMeasureResponse>>;
  productname: Scalars['String']['output'];
  sellsinraw: Scalars['Boolean']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type ProductToImage = {
  __typename?: 'ProductToImage';
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['query_get_image_oneOf_1_gtin']['output'];
  id: Scalars['Int']['output'];
  image_url: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type ProductToMeasureResponse = {
  __typename?: 'ProductToMeasureResponse';
  amount: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['query_get_products_items_allOf_1_measures_items_allOf_0_gtin']['output'];
  id: Scalars['BigInt']['output'];
  is_converted?: Maybe<Scalars['Boolean']['output']>;
  is_primary_measure: Scalars['Boolean']['output'];
  raw_amount: Scalars['Float']['output'];
  unit: Unit;
  unit_id: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  get_image?: Maybe<Get_Image_200_Response>;
  get_marketplace?: Maybe<Marketplace>;
  get_marketplaces?: Maybe<Array<Maybe<Marketplace>>>;
  get_product?: Maybe<ProductResponse>;
  get_products?: Maybe<Array<Maybe<ProductResponse>>>;
  get_user_route?: Maybe<UserResponse>;
  get_users_route?: Maybe<Array<Maybe<UserResponse>>>;
  post_image?: Maybe<Scalars['Boolean']['output']>;
};


export type QueryGet_ImageArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_MarketplaceArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGet_ProductArgs = {
  gtin: Scalars['String']['input'];
};


export type QueryGet_User_RouteArgs = {
  id: Scalars['Int']['input'];
};


export type QueryPost_ImageArgs = {
  input?: InputMaybe<Array<InputMaybe<NewProductToImage_Input>>>;
};

export type RegisterRequest_Input = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Unit = {
  __typename?: 'Unit';
  id: Scalars['Int']['output'];
  symbol: UnitSymbol;
};

export enum UnitSymbol {
  Count = 'count',
  FlOz = 'fl_oz',
  G = 'g',
  ML = 'mL',
  Oz = 'oz'
}

export type UserResponse = {
  __typename?: 'UserResponse';
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type Void_Container = {
  __typename?: 'Void_container';
  Void?: Maybe<Scalars['Void']['output']>;
};

export type Get_Image_200_Response = ProductToImage | Void_Container;

export enum Join__Graph {
  Auth = 'AUTH',
  Products = 'PRODUCTS'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}

export type ProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductsQuery = { __typename?: 'Query', get_products?: Array<{ __typename?: 'ProductResponse', gtin: any, productname: string, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null> } | null> | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ProductsDocument = new TypedDocumentString(`
    query Products {
  get_products {
    gtin
    productname
    images {
      image_url
    }
  }
}
    `) as unknown as TypedDocumentString<ProductsQuery, ProductsQueryVariables>;