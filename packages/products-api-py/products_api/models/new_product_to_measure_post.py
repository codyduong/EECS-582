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


from typing import Optional, Union
from pydantic import BaseModel, Field, StrictBool, StrictFloat, StrictInt
from products_api.models.unit_symbol import UnitSymbol

class NewProductToMeasurePost(BaseModel):
    """
    NewProductToMeasurePost
    """
    amount: Union[StrictFloat, StrictInt] = Field(...)
    is_converted: Optional[StrictBool] = None
    is_primary_measure: StrictBool = Field(...)
    raw_amount: Union[StrictFloat, StrictInt] = Field(...)
    unit: UnitSymbol = Field(...)
    __properties = ["amount", "is_converted", "is_primary_measure", "raw_amount", "unit"]

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
    def from_json(cls, json_str: str) -> NewProductToMeasurePost:
        """Create an instance of NewProductToMeasurePost from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.dict(by_alias=True,
                          exclude={
                          },
                          exclude_none=True)
        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> NewProductToMeasurePost:
        """Create an instance of NewProductToMeasurePost from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return NewProductToMeasurePost.parse_obj(obj)

        _obj = NewProductToMeasurePost.parse_obj({
            "amount": obj.get("amount"),
            "is_converted": obj.get("is_converted"),
            "is_primary_measure": obj.get("is_primary_measure"),
            "raw_amount": obj.get("raw_amount"),
            "unit": obj.get("unit")
        })
        return _obj


