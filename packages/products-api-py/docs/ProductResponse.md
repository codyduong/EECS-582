# ProductResponse


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**created_at** | **datetime** |  | 
**gtin** | **str** |  | 
**productname** | **str** |  | 
**sellsinraw** | **bool** |  | 
**sku** | **str** |  | [optional] 
**updated_at** | **datetime** |  | 
**measures** | [**List[ProductToMeasureResponse]**](ProductToMeasureResponse.md) |  | 

## Example

```python
from products_api.models.product_response import ProductResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ProductResponse from a JSON string
product_response_instance = ProductResponse.from_json(json)
# print the JSON string representation of the object
print ProductResponse.to_json()

# convert the object into a dict
product_response_dict = product_response_instance.to_dict()
# create an instance of ProductResponse from a dict
product_response_from_dict = ProductResponse.from_dict(product_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


