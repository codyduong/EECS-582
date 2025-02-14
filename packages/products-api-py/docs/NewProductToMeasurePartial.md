# NewProductToMeasurePartial


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **float** |  | 
**is_converted** | **bool** |  | [optional] 
**is_primary_measure** | **bool** |  | 
**raw_amount** | **float** |  | 

## Example

```python
from products_api.models.new_product_to_measure_partial import NewProductToMeasurePartial

# TODO update the JSON string below
json = "{}"
# create an instance of NewProductToMeasurePartial from a JSON string
new_product_to_measure_partial_instance = NewProductToMeasurePartial.from_json(json)
# print the JSON string representation of the object
print NewProductToMeasurePartial.to_json()

# convert the object into a dict
new_product_to_measure_partial_dict = new_product_to_measure_partial_instance.to_dict()
# create an instance of NewProductToMeasurePartial from a dict
new_product_to_measure_partial_from_dict = NewProductToMeasurePartial.from_dict(new_product_to_measure_partial_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


