# products_api.HandlersProductsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_product**](HandlersProductsApi.md#get_product) | **GET** /api/v1/products/{gtin} | 
[**get_products**](HandlersProductsApi.md#get_products) | **GET** /api/v1/products | 
[**post_products**](HandlersProductsApi.md#post_products) | **POST** /api/v1/products | 


# **get_product**
> ProductResponse get_product(gtin)



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.product_response import ProductResponse
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
    api_instance = products_api.HandlersProductsApi(api_client)
    gtin = 'gtin_example' # str | Global Trade Item Number (gtin)

    try:
        api_response = api_instance.get_product(gtin)
        print("The response of HandlersProductsApi->get_product:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersProductsApi->get_product: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **gtin** | **str**| Global Trade Item Number (gtin) | 

### Return type

[**ProductResponse**](ProductResponse.md)

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_products**
> List[ProductResponse] get_products()



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.product_response import ProductResponse
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
    api_instance = products_api.HandlersProductsApi(api_client)

    try:
        api_response = api_instance.get_products()
        print("The response of HandlersProductsApi->get_products:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersProductsApi->get_products: %s\n" % e)
```



### Parameters
This endpoint does not need any parameter.

### Return type

[**List[ProductResponse]**](ProductResponse.md)

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **post_products**
> bool post_products(new_product_post)



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.new_product_post import NewProductPost
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
    api_instance = products_api.HandlersProductsApi(api_client)
    new_product_post = [products_api.NewProductPost()] # List[NewProductPost] | A product or products

    try:
        api_response = api_instance.post_products(new_product_post)
        print("The response of HandlersProductsApi->post_products:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersProductsApi->post_products: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **new_product_post** | [**List[NewProductPost]**](NewProductPost.md)| A product or products | 

### Return type

**bool**

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/plain

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |
**401** |  |  -  |
**500** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

