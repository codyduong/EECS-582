import json

with open('response.json', 'r') as file:
    data = json.load(file)

ids = []
prices = []

# Iterate through the items in the JSON data
for item in data["data"]["search"]["searchResult"]["itemStacks"][0]["itemsV2"]:
    if item["__typename"] == "Product":
        item_id = item["usItemId"]
        item_name = item["name"]
        item_price = item["priceInfo"]["currentPrice"]["price"]

        # Append item IDs and price reports to respective lists
        ids.append({"id": item_id, "name": item_name})
        prices.append({"id": item_id, "price": item_price})

        # Print the product details
        print(f"Name: {item_name}, Price: {item_price}")

# Save IDs to 'ids.json'
with open('ids.json', 'w') as file:
    json.dump(ids, file, indent=4)

# Save prices to 'prices.json'
with open('prices.json', 'w') as file:
    json.dump(prices, file, indent=4)