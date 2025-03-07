# products-api
No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

This Python package is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: 0.1.0
- Package version: 1.0.0
- Generator version: 7.11.0
- Build package: org.openapitools.codegen.languages.PythonPydanticV1ClientCodegen

## Requirements.

Python 3.7+

## Installation & Usage
### pip install

If the python package is hosted on a repository, you can install directly using:

```sh
pip install git+https://github.com/GIT_USER_ID/GIT_REPO_ID.git
```
(you may need to run `pip` with root permission: `sudo pip install git+https://github.com/GIT_USER_ID/GIT_REPO_ID.git`)

Then import the package:
```python
import products_api
```

### Setuptools

Install via [Setuptools](http://pypi.python.org/pypi/setuptools).

```sh
python setup.py install --user
```
(or `sudo python setup.py install` to install the package for all users)

Then import the package:
```python
import products_api
```

### Tests

Execute `pytest` to run the tests.

## Getting Started

Please follow the [installation procedure](#installation--usage) and then run the following:

```python

import time
import products_api
from products_api.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = products_api.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization (JWT): http
configuration = products_api.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)


# Enter a context with an instance of the API client
with products_api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = products_api.HandlersMarketplacesApi(api_client)
    id = 56 # int | id

    try:
        api_response = api_instance.get_marketplace(id)
        print("The response of HandlersMarketplacesApi->get_marketplace:\n")
        pprint(api_response)
    except ApiException as e:
        print("Exception when calling HandlersMarketplacesApi->get_marketplace: %s\n" % e)

```

## Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*HandlersMarketplacesApi* | [**get_marketplace**](docs/HandlersMarketplacesApi.md#get_marketplace) | **GET** /api/v1/marketplaces/{id} | 
*HandlersMarketplacesApi* | [**get_marketplaces**](docs/HandlersMarketplacesApi.md#get_marketplaces) | **GET** /api/v1/marketplaces | 
*HandlersMarketplacesApi* | [**post_marketplace**](docs/HandlersMarketplacesApi.md#post_marketplace) | **POST** /api/v1/marketplaces/{id} | 
*HandlersProductsApi* | [**get_product**](docs/HandlersProductsApi.md#get_product) | **GET** /api/v1/products/{gtin} | 
*HandlersProductsApi* | [**get_products**](docs/HandlersProductsApi.md#get_products) | **GET** /api/v1/products | 
*HandlersProductsApi* | [**post_products**](docs/HandlersProductsApi.md#post_products) | **POST** /api/v1/products | 


## Documentation For Models

 - [Marketplace](docs/Marketplace.md)
 - [NewMarketplace](docs/NewMarketplace.md)
 - [NewProduct](docs/NewProduct.md)
 - [NewProductPost](docs/NewProductPost.md)
 - [NewProductToMeasurePartial](docs/NewProductToMeasurePartial.md)
 - [NewProductToMeasurePartialUnion](docs/NewProductToMeasurePartialUnion.md)
 - [NewProductToMeasurePost](docs/NewProductToMeasurePost.md)
 - [Product](docs/Product.md)
 - [ProductResponse](docs/ProductResponse.md)
 - [ProductToMeasure](docs/ProductToMeasure.md)
 - [ProductToMeasureResponse](docs/ProductToMeasureResponse.md)
 - [Unit](docs/Unit.md)
 - [UnitSymbol](docs/UnitSymbol.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="http"></a>
### http

- **Type**: Bearer authentication (JWT)


## Author




