"""
Name: dillons-scraper.py

Description: Obtains an OAuth2 token from Kroger. Searches for nearby store IDs in the specified zip code.
For each store ID, scrapes products matching each ingredient in list.
Writes the combined results to a dillons_scrape_results.json file (or use the data as needed).

Programmer: Joon Hee Ooten
Date Created: 2025-02-16
Revision History:
    -2025-02-25 - Joon Hee Ooten - add prologue comments

Preconditions:
- Must have OAuth2 access credentials for Kroger API
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# --------------------------------------------------
# Kroger Developer Credentials
# --------------------------------------------------

# Load environment variables from .env
load_dotenv()
CLIENT_ID = "grocerywise-24326124303424486d71346d664548627957596f68623757642e4230656f614a6a424357474d7752417551314d797242694b4a74514f696d5a4c366d1253636185741314204"
CLIENT_SECRET = os.getenv("KROGER_CLIENT_SECRET")

# For CERTIFICATION environment:
BASE_URL = "https://api-ce.kroger.com"
TOKEN_URL = f"{BASE_URL}/v1/connect/oauth2/token"
LOCATIONS_URL = f"{BASE_URL}/v1/locations"
PRODUCTS_URL = f"{BASE_URL}/v1/products"

# If using PRODUCTION:
# BASE_URL = "https://api.kroger.com"
# TOKEN_URL = f"{BASE_URL}/v1/connect/oauth2/token"
# LOCATIONS_URL = f"{BASE_URL}/v1/locations"
# PRODUCTS_URL = f"{BASE_URL}/v1/products"

# Scope for product data
SCOPE = "product.compact"

# --------------------------------------------------
# Obtain OAuth2 Token
# --------------------------------------------------
def get_oauth2_token(client_id, client_secret, scope):
    """
    Obtain an OAuth2 token using the client_credentials grant.
    """
    auth = (client_id, client_secret)
    data = {
        "grant_type": "client_credentials",
        "scope": scope,
    }
    resp = requests.post(TOKEN_URL, auth=auth, data=data)
    resp.raise_for_status()
    token_data = resp.json()
    return token_data["access_token"]

# --------------------------------------------------
# Find Location IDs Near a Zip Code
# --------------------------------------------------
def find_location_ids_near(zip_code, access_token, radius=10, limit=10):
    """
    Use the Kroger Locations API to find store IDs near the given zip code.
    By default, returns up to 'limit' stores within 'radius' miles.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }
    params = {
        "filter.zipCode.near": zip_code,
        "filter.radiusInMiles": radius,
        "filter.limit": limit,
    }
    resp = requests.get(LOCATIONS_URL, headers=headers, params=params)
    if not resp.ok:
        print("Locations error response:", resp.status_code, resp.text)
    resp.raise_for_status()

    data = resp.json()
    location_ids = []
    for loc in data.get("data", []):
        loc_id = loc.get("locationId")
        if loc_id:
            location_ids.append(loc_id)
    return location_ids

# --------------------------------------------------
# Fetch Products for a Location+Term, Single Page
# --------------------------------------------------
def fetch_products_for_location_and_term(access_token, location_id, term, start=0, limit=50):
    """
    Calls the Kroger Products API for a single 'page' of results,
    searching for 'term' at 'location_id'.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }
    params = {
        "filter.locationId": location_id,
        "filter.term": term,
        "filter.start": start,
        "filter.limit": limit,
    }
    resp = requests.get(PRODUCTS_URL, headers=headers, params=params)
    if not resp.ok:
        print("Products error response:", resp.status_code, resp.text)
    resp.raise_for_status()
    return resp.json()

# --------------------------------------------------
# Paginate Through All Products for One Ingredient
# --------------------------------------------------
def scrape_products_for_ingredient(access_token, location_id, ingredient):
    """
    Fetches *all* products matching 'ingredient' at the given location,
    using pagination.
    """
    all_products = []
    start = 0
    limit = 50

    while True:
        data = fetch_products_for_location_and_term(
            access_token, location_id, ingredient,
            start=start, limit=limit
        )
        products = data.get("data", [])
        if not products:
            break  # no more products returned

        all_products.extend(products)

        # Check if there's more pages
        meta = data.get("meta", {})
        pagination = meta.get("pagination", {})
        total = pagination.get("total", 0)
        current_start = pagination.get("start", 0)
        current_limit = pagination.get("limit", 0)
        next_start = current_start + current_limit

        if next_start >= total:
            break  # reached the end
        start = next_start

        time.sleep(0.3)  # small delay to avoid rate-limiting

    return all_products

# --------------------------------------------------
# Integrating Both Location and Product Searches
# --------------------------------------------------
def main():
    # Obtain an Access Token
    access_token = get_oauth2_token(CLIENT_ID, CLIENT_SECRET, SCOPE)
    print("Got access token successfully.")

    # Find store(s) near a given zip code (e.g., Lawrence, KS = "66044")
    location_ids = find_location_ids_near("66044", access_token, radius=10, limit=5)
    print(f"Found {len(location_ids)} store location(s) near 66044:", location_ids)

    if not location_ids:
        print("No stores found near that zip code.")
        return

    # Suppose the user has selected a recipe with these ingredients:
    ingredients = ["catfish", "banana", "asparagus"]
    # In the real website, one would gather these from the user's chosen recipe or grocery list.

    # For each location, scrape all matching products for each ingredient
    results = {}
    for loc_id in location_ids:
        print(f"\nScraping for locationId={loc_id} ...")
        loc_results = {}
        for ingr in ingredients:
            print(f"  -> Searching for '{ingr}'")
            products = scrape_products_for_ingredient(access_token, loc_id, ingr)
            print(f"     Found {len(products)} products for '{ingr}'")
            loc_results[ingr] = products

        # Store location-specific results in 'results'
        results[loc_id] = loc_results

    # Save or process the final data
    with open("dillons_scrape_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\nDone. Saved product data to 'dillons_scrape_results.json'.")

if __name__ == "__main__":
    main()
