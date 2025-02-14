# NewProduct


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gtin** | **str** |  | 
**productname** | **str** |  | 
**sku** | **str** |  | [optional] 

## Example

```python
from products_api.models.new_product import NewProduct

# TODO update the JSON string below
json = "{}"
# create an instance of NewProduct from a JSON string
new_product_instance = NewProduct.from_json(json)
# print the JSON string representation of the object
print NewProduct.to_json()

# convert the object into a dict
new_product_dict = new_product_instance.to_dict()
# create an instance of NewProduct from a dict
new_product_from_dict = NewProduct.from_dict(new_product_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


