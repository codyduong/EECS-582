# coding: utf-8

"""
    auth

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 0.1.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest
import datetime

from openapi_client.models.login_request import LoginRequest  # noqa: E501

class TestLoginRequest(unittest.TestCase):
    """LoginRequest unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> LoginRequest:
        """Test LoginRequest
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `LoginRequest`
        """
        model = LoginRequest()  # noqa: E501
        if include_optional:
            return LoginRequest(
                password = '',
                username = ''
            )
        else:
            return LoginRequest(
                password = '',
                username = '',
        )
        """

    def testLoginRequest(self):
        """Test LoginRequest"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
