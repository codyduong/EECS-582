# auth_api.HandlersUsersApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_user_route**](HandlersUsersApi.md#get_user_route) | **GET** /api/v1/users/{id} | 
[**get_users_route**](HandlersUsersApi.md#get_users_route) | **GET** /api/v1/users | 


# **get_user_route**
> UserResponse get_user_route(id)



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import auth_api
from auth_api.models.user_response import UserResponse
from auth_api.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = auth_api.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization (JWT): http
configuration = auth_api.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with auth_api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = auth_api.HandlersUsersApi(api_client)
    id = 56 # int | User id

    try:
        api_response = api_instance.get_user_route(id)
        print("The response of HandlersUsersApi->get_user_route:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersUsersApi->get_user_route: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int**| User id | 

### Return type

[**UserResponse**](UserResponse.md)

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_users_route**
> List[UserResponse] get_users_route()



### Example

* Bearer (JWT) Authentication (http):
```python
import time
import os
import auth_api
from auth_api.models.user_response import UserResponse
from auth_api.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = auth_api.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization (JWT): http
configuration = auth_api.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with auth_api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = auth_api.HandlersUsersApi(api_client)

    try:
        api_response = api_instance.get_users_route()
        print("The response of HandlersUsersApi->get_users_route:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersUsersApi->get_users_route: %s\n" % e)
```



### Parameters
This endpoint does not need any parameter.

### Return type

[**List[UserResponse]**](UserResponse.md)

### Authorization

[http](../README.md#http)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

