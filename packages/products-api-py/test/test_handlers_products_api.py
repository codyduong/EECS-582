# coding: utf-8

"""
    products

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 0.1.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from products_api.api.handlers_products_api import HandlersProductsApi  # noqa: E501


class TestHandlersProductsApi(unittest.TestCase):
    """HandlersProductsApi unit test stubs"""

    def setUp(self) -> None:
        self.api = HandlersProductsApi()

    def tearDown(self) -> None:
        self.api.api_client.close()

    def test_get_product(self) -> None:
        """Test case for get_product

        """
        pass

    def test_get_products(self) -> None:
        """Test case for get_products

        """
        pass


if __name__ == '__main__':
    unittest.main()
