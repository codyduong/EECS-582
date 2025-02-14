# NewProductToMeasurePost


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **float** |  | 
**is_converted** | **bool** |  | [optional] 
**is_primary_measure** | **bool** |  | 
**raw_amount** | **float** |  | 
**unit** | [**UnitSymbol**](UnitSymbol.md) |  | 

## Example

```python
from products_api.models.new_product_to_measure_post import NewProductToMeasurePost

# TODO update the JSON string below
json = "{}"
# create an instance of NewProductToMeasurePost from a JSON string
new_product_to_measure_post_instance = NewProductToMeasurePost.from_json(json)
# print the JSON string representation of the object
print NewProductToMeasurePost.to_json()

# convert the object into a dict
new_product_to_measure_post_dict = new_product_to_measure_post_instance.to_dict()
# create an instance of NewProductToMeasurePost from a dict
new_product_to_measure_post_from_dict = NewProductToMeasurePost.from_dict(new_product_to_measure_post_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


