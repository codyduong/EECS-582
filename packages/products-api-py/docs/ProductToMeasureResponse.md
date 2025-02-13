# ProductToMeasureResponse


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **str** |  | 
**created_at** | **datetime** |  | 
**gtin** | **str** |  | 
**id** | **int** |  | 
**is_converted** | **bool** |  | [optional] 
**is_primary_measure** | **bool** |  | 
**raw_amount** | **float** |  | 
**unit_id** | **int** |  | 
**unit** | [**Unit**](Unit.md) |  | 

## Example

```python
from products_api.models.product_to_measure_response import ProductToMeasureResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ProductToMeasureResponse from a JSON string
product_to_measure_response_instance = ProductToMeasureResponse.from_json(json)
# print the JSON string representation of the object
print ProductToMeasureResponse.to_json()

# convert the object into a dict
product_to_measure_response_dict = product_to_measure_response_instance.to_dict()
# create an instance of ProductToMeasureResponse from a dict
product_to_measure_response_from_dict = ProductToMeasureResponse.from_dict(product_to_measure_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


