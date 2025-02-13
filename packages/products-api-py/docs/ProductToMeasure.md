# ProductToMeasure


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

## Example

```python
from products_api.models.product_to_measure import ProductToMeasure

# TODO update the JSON string below
json = "{}"
# create an instance of ProductToMeasure from a JSON string
product_to_measure_instance = ProductToMeasure.from_json(json)
# print the JSON string representation of the object
print ProductToMeasure.to_json()

# convert the object into a dict
product_to_measure_dict = product_to_measure_instance.to_dict()
# create an instance of ProductToMeasure from a dict
product_to_measure_from_dict = ProductToMeasure.from_dict(product_to_measure_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


