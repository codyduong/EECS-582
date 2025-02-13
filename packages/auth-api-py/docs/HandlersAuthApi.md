# auth_api.HandlersAuthApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**login_route**](HandlersAuthApi.md#login_route) | **POST** /api/v1/auth/login | 
[**register_route**](HandlersAuthApi.md#register_route) | **POST** /api/v1/auth/register | 


# **login_route**
> LoginResponse login_route(login_request)



### Example

```python
import time
import os
import auth_api
from auth_api.models.login_request import LoginRequest
from auth_api.models.login_response import LoginResponse
from auth_api.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = auth_api.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with auth_api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = auth_api.HandlersAuthApi(api_client)
    login_request = auth_api.LoginRequest() # LoginRequest | 

    try:
        api_response = api_instance.login_route(login_request)
        print("The response of HandlersAuthApi->login_route:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HandlersAuthApi->login_route: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **login_request** | [**LoginRequest**](LoginRequest.md)|  | 

### Return type

[**LoginResponse**](LoginResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **register_route**
> register_route(register_request)



### Example

```python
import time
import os
import auth_api
from auth_api.models.register_request import RegisterRequest
from auth_api.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = auth_api.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with auth_api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = auth_api.HandlersAuthApi(api_client)
    register_request = auth_api.RegisterRequest() # RegisterRequest | 

    try:
        api_instance.register_route(register_request)
    except Exception as e:
        print("Exception when calling HandlersAuthApi->register_route: %s\n" % e)
```



### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **register_request** | [**RegisterRequest**](RegisterRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

