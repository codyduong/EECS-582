# coding: utf-8

"""
    products

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 0.1.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json


from typing import Optional
from pydantic import BaseModel, Field, StrictStr, constr

class NewProduct(BaseModel):
    """
    NewProduct
    """
    gtin: constr(strict=True, max_length=14, min_length=8) = Field(...)
    productname: StrictStr = Field(...)
    sku: Optional[StrictStr] = None
    __properties = ["gtin", "productname", "sku"]

    class Config:
        """Pydantic configuration"""
        allow_population_by_field_name = True
        validate_assignment = True

    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.dict(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> NewProduct:
        """Create an instance of NewProduct from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.dict(by_alias=True,
                          exclude={
                          },
                          exclude_none=True)
        # set to None if sku (nullable) is None
        # and __fields_set__ contains the field
        if self.sku is None and "sku" in self.__fields_set__:
            _dict['sku'] = None

        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> NewProduct:
        """Create an instance of NewProduct from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return NewProduct.parse_obj(obj)

        _obj = NewProduct.parse_obj({
            "gtin": obj.get("gtin"),
            "productname": obj.get("productname"),
            "sku": obj.get("sku")
        })
        return _obj


