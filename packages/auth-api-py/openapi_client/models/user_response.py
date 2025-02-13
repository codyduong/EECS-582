# coding: utf-8

"""
    auth

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
from typing import Optional
from pydantic import BaseModel, Field, StrictBool, StrictInt, StrictStr

class UserResponse(BaseModel):
    """
    UserResponse
    """
    created_at: datetime = Field(...)
    deleted: StrictBool = Field(...)
    deleted_at: Optional[datetime] = None
    email: StrictStr = Field(...)
    id: StrictInt = Field(...)
    username: StrictStr = Field(...)
    __properties = ["created_at", "deleted", "deleted_at", "email", "id", "username"]

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
    def from_json(cls, json_str: str) -> UserResponse:
        """Create an instance of UserResponse from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.dict(by_alias=True,
                          exclude={
                          },
                          exclude_none=True)
        # set to None if deleted_at (nullable) is None
        # and __fields_set__ contains the field
        if self.deleted_at is None and "deleted_at" in self.__fields_set__:
            _dict['deleted_at'] = None

        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> UserResponse:
        """Create an instance of UserResponse from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return UserResponse.parse_obj(obj)

        _obj = UserResponse.parse_obj({
            "created_at": obj.get("created_at"),
            "deleted": obj.get("deleted"),
            "deleted_at": obj.get("deleted_at"),
            "email": obj.get("email"),
            "id": obj.get("id"),
            "username": obj.get("username")
        })
        return _obj


