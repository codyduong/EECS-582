# walmart-scraper

This folder contains a Python-based scraper that integrates with the Walmart API to generate a list of product information of grocery products.

Note: uv.lock is copied from sample folder. May need to be changed.


## Features
Location Search: Uses cookies to search for items at a specific store.

Product Search: Returns a json file of products information.

## Requirements
- Python 3.7+
- Requests library: pip install requests.
- Valid http cookies to make API call.


## Usage
The script will:
    Request a json file of product information from Walmart grocery products.

    Receive and store that file locally.

    Parse and extract relevant data and store it in a new json file for use.

## Script Flow
### scraper_walmart.py
1. requests.request("GET", url, headers=headers)
    Send a call to the Walmart API with appropriate url and headers stored in the headers variable and stores the response string.

2. data = json.loads(response.text)
    Takes the response string and converts it to a python dict.

3. with open('response.json', "w") as output_file:
    json.dump(data, output_file)

    Stores the data in a json file named response.json.

### json-parser.py

4. with open('response.json', 'r') as file:
    data = json.load(file)

    Opens the response.json in read mode

5. item in data["data"]["search"]["searchResult"]["itemStacks"][0]["itemsV2"]
    Extracts product IDs, names, and prices and stores them in prices.json and ids.json
