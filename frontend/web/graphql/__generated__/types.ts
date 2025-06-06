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
  mutationInput_post_price_report_input_items_allOf_0_currency: { input: any; output: any; }
  mutationInput_post_price_report_input_items_allOf_0_gtin: { input: any; output: any; }
  mutationInput_post_products_input_items_allOf_0_gtin: { input: any; output: any; }
  queryInput_post_image_input_items_gtin: { input: any; output: any; }
  query_get_image_oneOf_1_gtin: { input: any; output: any; }
  query_get_price_reports_for_gtin_edges_items_node_allOf_0_currency: { input: any; output: any; }
  query_get_price_reports_for_gtin_edges_items_node_allOf_0_gtin: { input: any; output: any; }
  query_get_products_edges_items_node_allOf_0_gtin: { input: any; output: any; }
  query_get_products_edges_items_node_allOf_1_measures_items_allOf_0_gtin: { input: any; output: any; }
};

export type Company = {
  __typename?: 'Company';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Connection_PriceResponse = {
  __typename?: 'Connection_PriceResponse';
  edges: Array<Maybe<Node_PriceResponse>>;
  page_info: PageInfo;
};

export type Connection_PriceResponse2 = {
  __typename?: 'Connection_PriceResponse2';
  edges: Array<Maybe<Node_PriceResponse>>;
  page_info: PageInfo;
};

export type Connection_PriceResponse2_Entry = {
  __typename?: 'Connection_PriceResponse2_entry';
  key: Scalars['ID']['output'];
  value?: Maybe<Connection_PriceResponse2>;
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

export type GtinsRequest_Input = {
  gtins: Array<InputMaybe<Scalars['String']['input']>>;
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

export type ItemPatchAction_Input = {
  mutationInput_patch_shopping_list_input_items_items_oneOf_0_Input?: InputMaybe<MutationInput_Patch_Shopping_List_Input_Items_Items_OneOf_0_Input>;
  mutationInput_patch_shopping_list_input_items_items_oneOf_1_Input?: InputMaybe<MutationInput_Patch_Shopping_List_Input_Items_Items_OneOf_1_Input>;
};

/** Login request. Either `email` or `username` must be provided. */
export type LoginRequest_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MarketplaceResponse = {
  __typename?: 'MarketplaceResponse';
  company: Company;
  company_id: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  online_marketplace?: Maybe<Query_Get_Marketplaces_Items_AllOf_1_Online_Marketplace>;
  physical_marketplace?: Maybe<Query_Get_Marketplaces_Items_AllOf_1_Physical_Marketplace>;
  updated_at: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  create_shopping_list?: Maybe<ShoppingListResponse>;
  create_users?: Maybe<Scalars['JSON']['output']>;
  delete_product?: Maybe<ProductResponse>;
  delete_shopping_list?: Maybe<ShoppingListResponse>;
  delete_user?: Maybe<Scalars['Void']['output']>;
  delete_users?: Maybe<Scalars['Void']['output']>;
  get_price_reports_for_gtins?: Maybe<PriceResponses>;
  login_route?: Maybe<Scalars['JSON']['output']>;
  patch_shopping_list?: Maybe<ShoppingListResponse>;
  post_marketplace?: Maybe<MarketplaceResponse>;
  post_price_report?: Maybe<Scalars['Boolean']['output']>;
  post_products?: Maybe<Scalars['Boolean']['output']>;
  refresh_route?: Maybe<Scalars['JSON']['output']>;
  register_route?: Maybe<Scalars['JSON']['output']>;
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


export type MutationGet_Price_Reports_For_GtinsArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  input?: InputMaybe<GtinsRequest_Input>;
  last?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLogin_RouteArgs = {
  input?: InputMaybe<LoginRequest_Input>;
};


export type MutationPatch_Shopping_ListArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<PatchShoppingListRequest_Input>;
};


export type MutationPost_MarketplaceArgs = {
  input?: InputMaybe<NewMarketplace_Input>;
};


export type MutationPost_Price_ReportArgs = {
  input?: InputMaybe<Array<InputMaybe<NewPriceReportDsl_Input>>>;
};


export type MutationPost_ProductsArgs = {
  input?: InputMaybe<Array<InputMaybe<NewProductPost_Input>>>;
};


export type MutationRegister_RouteArgs = {
  input?: InputMaybe<RegisterRequest_Input>;
};


export type MutationUpsert_UserArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<NewUserDto_Input>;
  upsert?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NewMarketplace_Input = {
  company_id: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type NewPriceReportDsl_Input = {
  currency: Scalars['mutationInput_post_price_report_input_items_allOf_0_currency']['input'];
  gtin: Scalars['mutationInput_post_price_report_input_items_allOf_0_gtin']['input'];
  marketplace_id: Scalars['Int']['input'];
  price: Scalars['Float']['input'];
  reported_at?: InputMaybe<Scalars['DateTime']['input']>;
};

export type NewProductPost_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
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
  name?: InputMaybe<Scalars['String']['input']>;
  user_ids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type NewUserDto_Input = {
  email: Scalars['String']['input'];
  password_hash: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Node_PriceResponse = {
  __typename?: 'Node_PriceResponse';
  cursor: Scalars['String']['output'];
  node: Query_Get_Price_Reports_For_Gtin_Edges_Items_Node;
};

export type Node_ProductResponse = {
  __typename?: 'Node_ProductResponse';
  cursor: Scalars['String']['output'];
  node: ProductResponse;
};

export type Node_UserResponse = {
  __typename?: 'Node_UserResponse';
  cursor: Scalars['String']['output'];
  node: Query_Get_Users_Edges_Items_Node;
};

export type OnlineMarketplace = {
  __typename?: 'OnlineMarketplace';
  id: Scalars['Int']['output'];
  uri: Scalars['String']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  end_cursor?: Maybe<Scalars['String']['output']>;
  has_next_page: Scalars['Boolean']['output'];
  has_prev_page: Scalars['Boolean']['output'];
  start_cursor?: Maybe<Scalars['String']['output']>;
};

export type PatchShoppingListRequest_Input = {
  items?: InputMaybe<Array<InputMaybe<ItemPatchAction_Input>>>;
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

export type PhysicalMarketplace = {
  __typename?: 'PhysicalMarketplace';
  adr_address: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  open_location_code: Scalars['String']['output'];
  place_id?: Maybe<Scalars['String']['output']>;
};

export type PriceResponses = {
  __typename?: 'PriceResponses';
  additionalProperties?: Maybe<Array<Maybe<Connection_PriceResponse2_Entry>>>;
};

export type ProductResponse = {
  __typename?: 'ProductResponse';
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gtin: Scalars['query_get_products_edges_items_node_allOf_0_gtin']['output'];
  images: Array<Maybe<ProductToImage>>;
  measures: Array<Maybe<ProductToMeasureResponse>>;
  price_reports: Connection_PriceResponse;
  productname: Scalars['String']['output'];
  sellsinraw: Scalars['Boolean']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
};


export type ProductResponsePrice_ReportsArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['String']['input']>;
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
  get_companies?: Maybe<Array<Maybe<Company>>>;
  get_company?: Maybe<Company>;
  get_image?: Maybe<Get_Image_200_Response>;
  get_marketplace?: Maybe<MarketplaceResponse>;
  get_marketplaces?: Maybe<Array<Maybe<MarketplaceResponse>>>;
  get_price_reports_for_gtin?: Maybe<Connection_PriceResponse>;
  get_product?: Maybe<ProductResponse>;
  get_products?: Maybe<Connection_ProductResponse>;
  get_shopping_list?: Maybe<ShoppingListResponse>;
  get_shopping_lists?: Maybe<ShoppingListsResponse>;
  get_unit?: Maybe<Unit>;
  get_units?: Maybe<Array<Maybe<Unit>>>;
  get_user?: Maybe<UserResponse>;
  get_users?: Maybe<Connection_UserResponse>;
  post_image?: Maybe<Scalars['Boolean']['output']>;
};


export type QueryGet_CompanyArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGet_ImageArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_MarketplaceArgs = {
  company_id?: InputMaybe<Scalars['Int']['input']>;
  company_name?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};


export type QueryGet_MarketplacesArgs = {
  company_id?: InputMaybe<Scalars['Int']['input']>;
  company_name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGet_Price_Reports_For_GtinArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  gtin: Scalars['String']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGet_ProductArgs = {
  gtin: Scalars['String']['input'];
};


export type QueryGet_ProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  company_id?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hide_unpriced?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maximum_price?: InputMaybe<Scalars['Float']['input']>;
  minimum_price?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGet_Shopping_ListArgs = {
  id: Scalars['Int']['input'];
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

export type ShoppingList = {
  __typename?: 'ShoppingList';
  created_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type ShoppingListItem = {
  __typename?: 'ShoppingListItem';
  amount: Scalars['Float']['output'];
  created_at: Scalars['DateTime']['output'];
  gtin: Scalars['String']['output'];
  shopping_list_id: Scalars['Int']['output'];
  unit_id?: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type ShoppingListItemRequest_Input = {
  amount: Scalars['Float']['input'];
  gtin: Scalars['String']['input'];
  unit_id?: InputMaybe<Scalars['Int']['input']>;
};

export type ShoppingListResponse = {
  __typename?: 'ShoppingListResponse';
  items: Array<Maybe<ShoppingListItem>>;
  list: ShoppingList;
  users: Array<Maybe<ShoppingListToUser>>;
};

export type ShoppingListToUser = {
  __typename?: 'ShoppingListToUser';
  shopping_list_id: Scalars['Int']['output'];
  user_id: Scalars['Int']['output'];
};

export type ShoppingListsResponse = {
  __typename?: 'ShoppingListsResponse';
  lists: Array<Maybe<ShoppingListResponse>>;
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
  permissions?: Maybe<Array<Maybe<Permission>>>;
  roles?: Maybe<Array<Maybe<Role>>>;
  username?: Maybe<Scalars['String']['output']>;
};

export type Void_Container = {
  __typename?: 'Void_container';
  Void?: Maybe<Scalars['Void']['output']>;
};

export enum Add_Const {
  Add = 'add'
}

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

export type MutationInput_Patch_Shopping_List_Input_Items_Items_OneOf_0_Input = {
  action: Add_Const;
  amount: Scalars['Float']['input'];
  gtin: Scalars['String']['input'];
  unit_id?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationInput_Patch_Shopping_List_Input_Items_Items_OneOf_1_Input = {
  action: Remove_Const;
  gtin: Scalars['String']['input'];
};

export type MutationInput_Post_Products_Input_Items_AllOf_1_Images_Input = {
  NewProductToImagePartial_Input?: InputMaybe<NewProductToImagePartial_Input>;
  Void?: InputMaybe<Scalars['Void']['input']>;
};

export type Query_Get_Marketplaces_Items_AllOf_1_Online_Marketplace = OnlineMarketplace | Void_Container;

export type Query_Get_Marketplaces_Items_AllOf_1_Physical_Marketplace = PhysicalMarketplace | Void_Container;

export type Query_Get_Price_Reports_For_Gtin_Edges_Items_Node = {
  __typename?: 'query_get_price_reports_for_gtin_edges_items_node';
  company: Company;
  created_at: Scalars['DateTime']['output'];
  created_by: Scalars['Int']['output'];
  currency: Scalars['query_get_price_reports_for_gtin_edges_items_node_allOf_0_currency']['output'];
  gtin: Scalars['query_get_price_reports_for_gtin_edges_items_node_allOf_0_gtin']['output'];
  id: Scalars['BigInt']['output'];
  marketplace: MarketplaceResponse;
  price: Scalars['Float']['output'];
  reported_at: Scalars['DateTime']['output'];
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

export enum Remove_Const {
  Remove = 'remove'
}

export type ProductsPage_QueriesQueryVariables = Exact<{
  gtin: Scalars['String']['input'];
}>;


export type ProductsPage_QueriesQuery = { __typename?: 'Query', get_product?: { __typename?: 'ProductResponse', gtin: any, productname: string, description?: string | null, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null>, price_reports: { __typename?: 'Connection_PriceResponse', edges: Array<{ __typename?: 'Node_PriceResponse', node: { __typename?: 'query_get_price_reports_for_gtin_edges_items_node', id: any, reported_at: any, price: number, company: { __typename?: 'Company', name: string } } } | null> } } | null, get_companies?: Array<{ __typename?: 'Company', id: number, name: string } | null> | null };

export type ProductsPage_MarketplacesQueryVariables = Exact<{
  company_id: Scalars['Int']['input'];
}>;


export type ProductsPage_MarketplacesQuery = { __typename?: 'Query', get_marketplaces?: Array<{ __typename?: 'MarketplaceResponse', id: number, physical_marketplace?: { __typename?: 'PhysicalMarketplace', id: number, adr_address: string, open_location_code: string, place_id?: string | null } | { __typename?: 'Void_container' } | null, online_marketplace?: { __typename?: 'OnlineMarketplace', id: number } | { __typename?: 'Void_container' } | null } | null> | null };

export type ProductsPage_PriceReportMutationVariables = Exact<{
  currency: Scalars['mutationInput_post_price_report_input_items_allOf_0_currency']['input'];
  gtin: Scalars['mutationInput_post_price_report_input_items_allOf_0_gtin']['input'];
  marketplace_id: Scalars['Int']['input'];
  price: Scalars['Float']['input'];
}>;


export type ProductsPage_PriceReportMutation = { __typename?: 'Mutation', post_price_report?: boolean | null };

export type ProductsPage_ShoppingListsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductsPage_ShoppingListsQuery = { __typename?: 'Query', get_shopping_lists?: { __typename?: 'ShoppingListsResponse', lists: Array<{ __typename?: 'ShoppingListResponse', list: { __typename?: 'ShoppingList', id: number, name?: string | null }, users: Array<{ __typename?: 'ShoppingListToUser', shopping_list_id: number } | null> } | null> } | null };

export type PriceComparison_GetProductQueryVariables = Exact<{
  gtin: Scalars['String']['input'];
}>;


export type PriceComparison_GetProductQuery = { __typename?: 'Query', get_product?: { __typename?: 'ProductResponse', gtin: any, productname: string, description?: string | null, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null>, price_reports: { __typename?: 'Connection_PriceResponse', edges: Array<{ __typename?: 'Node_PriceResponse', node: { __typename?: 'query_get_price_reports_for_gtin_edges_items_node', id: any, reported_at: any, price: number, company: { __typename?: 'Company', name: string } } } | null> } } | null };

export type ProductsPage_PrimaryQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  company_id?: InputMaybe<Scalars['Int']['input']>;
  maximum_price?: InputMaybe<Scalars['Float']['input']>;
  hide_unpriced?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ProductsPage_PrimaryQuery = { __typename?: 'Query', get_companies?: Array<{ __typename?: 'Company', id: number, name: string } | null> | null, get_products?: { __typename?: 'Connection_ProductResponse', edges: Array<{ __typename?: 'Node_ProductResponse', node: { __typename?: 'ProductResponse', gtin: any, productname: string, images: Array<{ __typename?: 'ProductToImage', image_url: string } | null>, price_reports: { __typename?: 'Connection_PriceResponse', edges: Array<{ __typename?: 'Node_PriceResponse', node: { __typename?: 'query_get_price_reports_for_gtin_edges_items_node', id: any, reported_at: any, price: number, company: { __typename?: 'Company', name: string } } } | null> } } } | null> } | null };

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
