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

from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel, Field, StrictBool, StrictFloat, StrictInt, StrictStr, constr
from products_api.models.unit import Unit

class ProductToMeasureResponse(BaseModel):
    """
    ProductToMeasureResponse
    """
    amount: StrictStr = Field(...)
    created_at: datetime = Field(...)
    gtin: constr(strict=True, max_length=14, min_length=8) = Field(...)
    id: StrictInt = Field(...)
    is_converted: Optional[StrictBool] = None
    is_primary_measure: StrictBool = Field(...)
    raw_amount: Union[StrictFloat, StrictInt] = Field(...)
    unit_id: StrictInt = Field(...)
    unit: Unit = Field(...)
    __properties = ["amount", "created_at", "gtin", "id", "is_converted", "is_primary_measure", "raw_amount", "unit_id", "unit"]

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
    def from_json(cls, json_str: str) -> ProductToMeasureResponse:
        """Create an instance of ProductToMeasureResponse from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.dict(by_alias=True,
                          exclude={
                          },
                          exclude_none=True)
        # override the default output from pydantic by calling `to_dict()` of unit
        if self.unit:
            _dict['unit'] = self.unit.to_dict()
        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> ProductToMeasureResponse:
        """Create an instance of ProductToMeasureResponse from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return ProductToMeasureResponse.parse_obj(obj)

        _obj = ProductToMeasureResponse.parse_obj({
            "amount": obj.get("amount"),
            "created_at": obj.get("created_at"),
            "gtin": obj.get("gtin"),
            "id": obj.get("id"),
            "is_converted": obj.get("is_converted"),
            "is_primary_measure": obj.get("is_primary_measure"),
            "raw_amount": obj.get("raw_amount"),
            "unit_id": obj.get("unit_id"),
            "unit": Unit.from_dict(obj.get("unit")) if obj.get("unit") is not None else None
        })
        return _obj


