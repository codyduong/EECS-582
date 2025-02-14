# products_api.HandlersMarketplacesApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_marketplace**](HandlersMarketplacesApi.md#get_marketplace) | **GET** /api/v1/marketplaces/{id} | 
[**get_marketplaces**](HandlersMarketplacesApi.md#get_marketplaces) | **GET** /api/v1/marketplaces | 
[**post_marketplace**](HandlersMarketplacesApi.md#post_marketplace) | **POST** /api/v1/marketplaces/{id} | 


# **get_marketplace**
> Marketplace get_marketplace(id)



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.marketplace import Marketplace
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
    except Exception as e:
        print("Exception when calling HandlersMarketplacesApi->get_marketplace: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int**| id | 

### Return type

[**Marketplace**](Marketplace.md)

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
**500** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_marketplaces**
> List[Marketplace] get_marketplaces()



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.marketplace import Marketplace
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

    try:
        api_response = api_instance.get_marketplaces()
        print("The response of HandlersMarketplacesApi->get_marketplaces:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersMarketplacesApi->get_marketplaces: %s\n" % e)
```



### Parameters
This endpoint does not need any parameter.

### Return type

[**List[Marketplace]**](Marketplace.md)

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
**500** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **post_marketplace**
> Marketplace post_marketplace(new_marketplace)



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import products_api
from products_api.models.marketplace import Marketplace
from products_api.models.new_marketplace import NewMarketplace
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
    new_marketplace = products_api.NewMarketplace() # NewMarketplace | A marketplace

    try:
        api_response = api_instance.post_marketplace(new_marketplace)
        print("The response of HandlersMarketplacesApi->post_marketplace:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersMarketplacesApi->post_marketplace: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **new_marketplace** | [**NewMarketplace**](NewMarketplace.md)| A marketplace | 

### Return type

[**Marketplace**](Marketplace.md)

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |
**401** |  |  -  |
**500** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

