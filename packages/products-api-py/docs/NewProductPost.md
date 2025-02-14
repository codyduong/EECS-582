# NewProductPost


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gtin** | **str** |  | 
**productname** | **str** |  | 
**sku** | **str** |  | [optional] 
**measures** | [**NewProductToMeasurePost**](NewProductToMeasurePost.md) |  | 

## Example

```python
from products_api.models.new_product_post import NewProductPost

# TODO update the JSON string below
json = "{}"
# create an instance of NewProductPost from a JSON string
new_product_post_instance = NewProductPost.from_json(json)
# print the JSON string representation of the object
print NewProductPost.to_json()

# convert the object into a dict
new_product_post_dict = new_product_post_instance.to_dict()
# create an instance of NewProductPost from a dict
new_product_post_from_dict = NewProductPost.from_dict(new_product_post_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


