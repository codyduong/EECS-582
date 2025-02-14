# Marketplace


## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** |  | 
**name** | **str** |  | 

## Example

```python
from products_api.models.marketplace import Marketplace

# TODO update the JSON string below
json = "{}"
# create an instance of Marketplace from a JSON string
marketplace_instance = Marketplace.from_json(json)
# print the JSON string representation of the object
print Marketplace.to_json()

# convert the object into a dict
marketplace_dict = marketplace_instance.to_dict()
# create an instance of Marketplace from a dict
marketplace_from_dict = Marketplace.from_dict(marketplace_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


