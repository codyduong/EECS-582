# coding: utf-8

"""
    products

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 0.1.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest
import datetime

from products_api.models.unit import Unit  # noqa: E501

class TestUnit(unittest.TestCase):
    """Unit unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> Unit:
        """Test Unit
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `Unit`
        """
        model = Unit()  # noqa: E501
        if include_optional:
            return Unit(
                id = 56,
                symbol = 'fl oz'
            )
        else:
            return Unit(
                id = 56,
                symbol = 'fl oz',
        )
        """

    def testUnit(self):
        """Test Unit"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
