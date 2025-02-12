"""
main.py

A sample scraper python file. When run from main it will invoke ArgumentParser

```
usage: Sample Scraper [-h] export

Sample scraper exports a simple query

positional arguments:
  export

options:
  -h, --help  show this help message and exit
```

"""

import argparse
import json
from src.types import Product, PriceReport
from typing import Any
import requests

products: list[Product] = []
price_reports: list[PriceReport] = []

"""

We are using `requests` as our http client library. The docs are here:
  https://requests.readthedocs.io/en/latest/

In this sample scraper we are using openfoodfacts API endpoint as a scraping endpoint:

- Note that openfoodfacts provides a JSON dump/or dump in various data formats of all
  their data, this is done this way simply as a means to demonstrate a simple
  API endpoint hit and parse into our format.

- openfoodfacts does not having a price api, otherwise our project would kind of be
  moot. It is not demonstrated in this sample, but the expected price output might
  be something like

    ```json
    {
        "gtin": "12345678",
        "price" 12.34 // assuming USD for ease
    }
    ```

"""


def main(export: str) -> None:
    # https://requests.readthedocs.io/en/latest/user/quickstart/#passing-parameters-in-urls
    params: dict[str, Any] = {
        "json": "true",
        "search_terms": "strawberry",
        "page_size": 20,
    }

    # https://world.openfoodfacts.org/files/api-documentation.html#jump-SearchRequests-Searchingforproducts
    response = requests.get(
        "https://world.openfoodfacts.org/cgi/search.pl", params=params
    )

    results: Any = response.json()

    # show the first 2 products to show that it is working
    # print(results["products"][:2])

    products.extend(
        [
            {"gtin": product["code"], "productname": product["product_name_en"]}
            for product in results["products"]
            if "product_name_en" in product and product["product_name_en"].strip() != ""  # type: ignore
        ]
    )

    # print(products)

    with open(export, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    """
    To limit the amount of dependencies it is recommended to use the default
    ArgumentParser to build the cli. RTFM: https://docs.python.org/3/library/argparse.html
    """
    parser = argparse.ArgumentParser(
        prog="Sample Scraper", description="Sample scraper exports a simple query"
    )
    parser.add_argument("export", default="./sample_products.json")
    args = parser.parse_args()

    main(args.export)
