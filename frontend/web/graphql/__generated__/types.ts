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
  query_get_products_edges_items_node_allOf_0_gtin: { input: any; output: any; }
  query_get_products_edges_items_node_allOf_1_measures_items_allOf_0_gtin: { input: any; output: any; }
};

export type Connection_ProductResponse = {
  __typename?: 'Connection_ProductResponse';
  edges: Array<Maybe<Node_ProductResponse>>;
  page_info: PageInfo;
};

export type Connection_UserResponse = {
  __typename?: 'Connection_UserResponse';
  edges: Array<Maybe<Node_UserResponse>>;
  page_info: PageInfo;
};

export type DeleteUsersRequest_Input = {
  ids: Array<InputMaybe<Scalars['Int']['input']>>;
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
  create_shopping_list?: Maybe<Scalars['JSON']['output']>;
  create_users?: Maybe<Scalars['JSON']['output']>;
  delete_product?: Maybe<ProductResponse>;
  delete_shopping_list?: Maybe<Scalars['Void']['output']>;
  delete_user?: Maybe<Scalars['Void']['output']>;
  delete_users?: Maybe<Scalars['Void']['output']>;
  login_route?: Maybe<Scalars['JSON']['output']>;
  post_marketplace?: Maybe<Marketplace>;
  post_products?: Maybe<Scalars['Boolean']['output']>;
  refresh_route?: Maybe<Scalars['JSON']['output']>;
  register_route?: Maybe<Scalars['JSON']['output']>;
  update_shopping_list?: Maybe<Scalars['JSON']['output']>;
  upsert_user?: Maybe<Scalars['JSON']['output']>;
};


export type MutationCreate_Shopping_ListArgs = {
  input?: InputMaybe<NewShoppingListRequest_Input>;
};


export type MutationCreate_UsersArgs = {
  input?: InputMaybe<Array<InputMaybe<NewUserDto_Input>>>;
  upsert?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDelete_ProductArgs = {
  gtin: Scalars['String']['input'];
};


export type MutationDelete_Shopping_ListArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDelete_UserArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDelete_UsersArgs = {
  input?: InputMaybe<DeleteUsersRequest_Input>;
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


export type MutationUpdate_Shopping_ListArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<UpdateShoppingListRequest_Input>;
};


export type MutationUpsert_UserArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<NewUserDto_Input>;
  upsert?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NewMarketplace_Input = {
  name: Scalars['String']['input'];
};

export type NewProductPost_Input = {
  gtin: Scalars['mutationInput_post_products_input_items_allOf_0_gtin']['input'];
  images?: InputMaybe<Array<InputMaybe<MutationInput_Post_Products_Input_Items_AllOf_1_Images_Input>>>;
  measures: Array<InputMaybe<NewProductToMeasurePartial_Input>>;
  productname: Scalars['String']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
};

export type NewProductToImagePartial_Input = {
  image_url: Scalars['String']['input'];
};

export type NewProductToImage_Input = {
  gtin: Scalars['queryInput_post_image_input_items_gtin']['input'];
  image_url: Scalars['String']['input'];
};

export type NewProductToMeasurePartial_Input = {
  amount: Scalars['Float']['input'];
  is_converted?: InputMaybe<Scalars['Boolean']['input']>;
  is_primary_measure: Scalars['Boolean']['input'];
  raw_amount?: InputMaybe<Scalars['Float']['input']>;
  unit: UnitSymbol;
};

export type NewShoppingListRequest_Input = {
  items: Array<InputMaybe<ShoppingListItemRequest_Input>>;
  user_ids: Array<InputMaybe<Scalars['Int']['input']>>;
};

export type NewUserDto_Input = {
  email: Scalars['String']['input'];
  password_hash: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Node_ProductResponse = {
  __typename?: 'Node_ProductResponse';
  cursor: Scalars['String']['output'];
  node: Query_Get_Products_Edges_Items_Node;
};

export type Node_UserResponse = {
  __typename?: 'Node_UserResponse';
  cursor: Scalars['String']['output'];
  node: Query_Get_Users_Edges_Items_Node;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  end_cursor?: Maybe<Scalars['String']['output']>;
  has_next_page: Scalars['Boolean']['output'];
  has_prev_page: Scalars['Boolean']['output'];
  start_cursor?: Maybe<Scalars['String']['output']>;
};

export type Permission = {
  __typename?: 'Permission';
  id: Scalars['Int']['output'];
  name: PermissionName;
};

export enum PermissionName {
  CreateAll = 'create_all',
  CreateMarketplace = 'create_marketplace',
  CreatePriceReport = 'create_price_report',
  CreateProduct = 'create_product',
  CreateUser = 'create_user',
  DeleteAll = 'delete_all',
  DeleteMarketplace = 'delete_marketplace',
  DeletePriceReport = 'delete_price_report',
  DeleteProduct = 'delete_product',
  DeleteUser = 'delete_user',
  ReadAll = 'read_all',
  ReadMarketplace = 'read_marketplace',
  ReadPriceReport = 'read_price_report',
  ReadProduct = 'read_product',
  ReadUser = 'read_user',
  UpdateAll = 'update_all',
  UpdateMarketplace = 'update_marketplace',
  UpdatePriceReport = 'update_price_report',
  UpdateProduct = 'update_product',
  UpdateUser = 'update_user'
}

export type ProductResponse = {
  __typename?: 'ProductResponse';
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['query_get_products_edges_items_node_allOf_0_gtin']['output'];
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
  gtin: Scalars['query_get_products_edges_items_node_allOf_1_measures_items_allOf_0_gtin']['output'];
  id: Scalars['Int']['output'];
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
  get_products?: Maybe<Connection_ProductResponse>;
  get_unit?: Maybe<Unit>;
  get_units?: Maybe<Array<Maybe<Unit>>>;
  get_user?: Maybe<UserResponse>;
  get_users?: Maybe<Connection_UserResponse>;
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


export type QueryGet_UnitArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGet_UserArgs = {
  id: Scalars['Int']['input'];
  include_permissions?: InputMaybe<Scalars['Boolean']['input']>;
  include_roles?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGet_UsersArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  include_permissions?: InputMaybe<Scalars['Boolean']['input']>;
  include_roles?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPost_ImageArgs = {
  input?: InputMaybe<Array<InputMaybe<NewProductToImage_Input>>>;
};

export type RegisterRequest_Input = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type ShoppingListItemRequest_Input = {
  amount: Scalars['Float']['input'];
  gtin: Scalars['String']['input'];
  unit_id?: InputMaybe<Scalars['Int']['input']>;
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

export type UpdateShoppingListRequest_Input = {
  items?: InputMaybe<Array<InputMaybe<ShoppingListItemRequest_Input>>>;
  user_ids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  permissions?: Maybe<Array<Maybe<Permission>>>;
  roles?: Maybe<Array<Maybe<Role>>>;
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

export type MutationInput_Post_Products_Input_Items_AllOf_1_Images_Input = {
  NewProductToImagePartial_Input?: InputMaybe<NewProductToImagePartial_Input>;
  Void?: InputMaybe<Scalars['Void']['input']>;
};

export type Query_Get_Products_Edges_Items_Node = {
  __typename?: 'query_get_products_edges_items_node';
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['query_get_products_edges_items_node_allOf_0_gtin']['output'];
  images: Array<Maybe<ProductToImage>>;
  measures: Array<Maybe<ProductToMeasureResponse>>;
  productname: Scalars['String']['output'];
  sellsinraw: Scalars['Boolean']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type Query_Get_Users_Edges_Items_Node = {
  __typename?: 'query_get_users_edges_items_node';
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  permissions?: Maybe<Array<Maybe<Permission>>>;
  roles?: Maybe<Array<Maybe<Role>>>;
  username?: Maybe<Scalars['String']['output']>;
};

export type ProductQueryVariables = Exact<{
  gtin: Scalars['String']['input'];
}>;


export type ProductQuery = { __typename?: 'Query', get_product?: { __typename?: 'ProductResponse', gtin: any, productname: string, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null> } | null };

export type ProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductsQuery = { __typename?: 'Query', get_products?: { __typename?: 'Connection_ProductResponse', edges: Array<{ __typename?: 'Node_ProductResponse', node: { __typename?: 'query_get_products_edges_items_node', gtin: any, productname: string, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null> } } | null> } | null };

export type ProductForm_ProductQueryVariables = Exact<{
  gtin: Scalars['String']['input'];
}>;


export type ProductForm_ProductQuery = { __typename?: 'Query', get_product?: { __typename?: 'ProductResponse', gtin: any } | null };

export type ProductForm_UnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductForm_UnitsQuery = { __typename?: 'Query', get_units?: Array<{ __typename?: 'Unit', id: number, symbol: UnitSymbol } | null> | null };

export type ProductForm_PostProductMutationVariables = Exact<{
  measures: Array<InputMaybe<NewProductToMeasurePartial_Input>> | InputMaybe<NewProductToMeasurePartial_Input>;
  productname: Scalars['String']['input'];
  gtin: Scalars['mutationInput_post_products_input_items_allOf_0_gtin']['input'];
}>;


export type ProductForm_PostProductMutation = { __typename?: 'Mutation', post_products?: boolean | null };
