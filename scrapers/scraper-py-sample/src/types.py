"""
types.py

Provides typing support using TypedDict: SEE PEP 589
"""

from typing import TypedDict


class Product(TypedDict):
    gtin: str
    productname: str


class PriceReport(TypedDict):
    gtin: str
    price: int
