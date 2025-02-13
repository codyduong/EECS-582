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

from products_api.models.product_to_measure_response import ProductToMeasureResponse  # noqa: E501

class TestProductToMeasureResponse(unittest.TestCase):
    """ProductToMeasureResponse unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> ProductToMeasureResponse:
        """Test ProductToMeasureResponse
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `ProductToMeasureResponse`
        """
        model = ProductToMeasureResponse()  # noqa: E501
        if include_optional:
            return ProductToMeasureResponse(
                amount = '',
                created_at = datetime.datetime.strptime('2013-10-20 19:20:30.00', '%Y-%m-%d %H:%M:%S.%f'),
                gtin = '01234567',
                id = 56,
                is_converted = True,
                is_primary_measure = True,
                raw_amount = 1.337,
                unit_id = 56,
                unit = products_api.models.unit.Unit(
                    id = 56, 
                    symbol = 'fl oz', )
            )
        else:
            return ProductToMeasureResponse(
                amount = '',
                created_at = datetime.datetime.strptime('2013-10-20 19:20:30.00', '%Y-%m-%d %H:%M:%S.%f'),
                gtin = '01234567',
                id = 56,
                is_primary_measure = True,
                raw_amount = 1.337,
                unit_id = 56,
                unit = products_api.models.unit.Unit(
                    id = 56, 
                    symbol = 'fl oz', ),
        )
        """

    def testProductToMeasureResponse(self):
        """Test ProductToMeasureResponse"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
