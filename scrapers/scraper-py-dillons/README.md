# dillons-scraper

This folder contains a Python-based scraper that integrates with Kroger’s API to:
    Obtain a Kroger OAuth2 Access Token
    Search Nearby Kroger Stores by zip code
    Scrape Product Information based on user-supplied search terms (e.g., ingredients in a recipe)


## Features
Location Search: Uses filter.zipCode.near and optionally filter.radiusInMiles to find store location IDs near a zip code.

Product Search: For each store ID, calls the Products API using filter.term to match user-supplied ingredients.

Pagination: Handles multiple pages of results by reading Kroger’s meta.pagination fields.


## Requirements
- Python 3.7+
- Requests library: pip install requests
- Valid Kroger Developer credentials (client ID, secret) with access to the Products and Locations APIs (Public or Certification).


## Usage
The script will:
    Obtain an OAuth2 token from Kroger.

    Search for nearby store IDs in the specified zip code.

    For each store ID, scrape products matching each ingredient in your list.

    Write the combined results to a dillons_scrape_results.json file (or use the data as needed).


## Script Flow
1. get_oauth2_token(client_id, client_secret, scope)
    Sends a POST request to TOKEN_URL for an OAuth2 token.

2. find_location_ids_near(zip_code, access_token, radius, limit)
    Calls the Kroger Locations API with filter.zipCode.near=zip_code.
    Returns up to limit store IDs within radius miles.

3. fetch_products_for_location_and_term(access_token, location_id, term, start, limit)
    Makes a GET request to PRODUCTS_URL, passing filter.locationId and filter.term.
    Retrieves a single “page” of product results.

4. scrape_products_for_ingredient(access_token, location_id, ingredient)
    Paginates through all results for a given ingredient and location until no more products are returned.

5. main()
    Orchestrates the process:
        Get token
        Find locations near a zip
        Loop over each location and each ingredient, fetching all matching products
        Saves or processes the data