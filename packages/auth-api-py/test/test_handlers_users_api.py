# coding: utf-8

"""
    auth

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 0.1.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from openapi_client.api.handlers_users_api import HandlersUsersApi  # noqa: E501


class TestHandlersUsersApi(unittest.TestCase):
    """HandlersUsersApi unit test stubs"""

    def setUp(self) -> None:
        self.api = HandlersUsersApi()

    def tearDown(self) -> None:
        self.api.api_client.close()

    def test_get_user_route(self) -> None:
        """Test case for get_user_route

        """
        pass

    def test_get_users_route(self) -> None:
        """Test case for get_users_route

        """
        pass


if __name__ == '__main__':
    unittest.main()
