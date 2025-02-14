# NewProductToMeasurePartialUnion


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **float** |  | 
**is_converted** | **bool** |  | [optional] 
**is_primary_measure** | **bool** |  | 
**raw_amount** | **float** |  | 

## Example

```python
from products_api.models.new_product_to_measure_partial_union import NewProductToMeasurePartialUnion

# TODO update the JSON string below
json = "{}"
# create an instance of NewProductToMeasurePartialUnion from a JSON string
new_product_to_measure_partial_union_instance = NewProductToMeasurePartialUnion.from_json(json)
# print the JSON string representation of the object
print NewProductToMeasurePartialUnion.to_json()

# convert the object into a dict
new_product_to_measure_partial_union_dict = new_product_to_measure_partial_union_instance.to_dict()
# create an instance of NewProductToMeasurePartialUnion from a dict
new_product_to_measure_partial_union_from_dict = NewProductToMeasurePartialUnion.from_dict(new_product_to_measure_partial_union_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


