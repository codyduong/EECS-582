"""
targetscraper.py

A webscraper used for target.com
currently using an website to scrape potato chips from target

Author: @Tyler51235
Date Created: 2025-02-16
Revision History:
- 2025-02-16 - @Tyler51235 - PoC of dillions scraper
- 2025-02-19 - @Tyler51235 - Add prologue comment
- 2025-02-25 - @codyduong - Update prologue comment
"""
from playwright.sync_api import sync_playwright # Importing playwright to help webscrape, playwright is an open-source automation library for webscraping

#a function that is able goes to url, specfically target here, and scrape data from website, this example uses targets potato chip section and produces an output txt
def scrape_target_products(
    url="https://www.target.com/c/chips-snacks-grocery/potato-chips/-/N-5xsy7Z1140d",
    output_file="target_products.txt",):  

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) # opens a chromium browser 
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the target URL
        page.goto(url)

        # Wait for initial load
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(5000)

        # Scroll multiple times to load more products
        scroll_increment = 1000
        prev_count = 0
        max_attempts = 20
        for _ in range(max_attempts):  # Increased scroll count
            page.evaluate(f"window.scrollBy(0, {scroll_increment})")
            page.wait_for_timeout(2000)  # Wait between scrolls
            current_count = page.evaluate("document.querySelectorAll('[data-test=\"@web/site-top-of-funnel/ProductCardWrapper\"]').length") #finds the entities that are "data-test" with attributes of "ProductCardWrapper"
            if current_count == prev_count:
                break
            prev_count = current_count

        # This extracts product data information from the located ProductCardWrapper from current count and will extra, name, price, size, and URL using JavaScript code
        items = page.evaluate("""() => {
            const products = [];
            const productCards = document.querySelectorAll('[data-test="@web/site-top-of-funnel/ProductCardWrapper"]');
            
            for (const card of productCards) {
                try {
                    // Get product name from the button text (which contains the full product name)
                    const buttonElement = card.querySelector('[data-test="FavoritesButton"]');
                    let name = 'N/A';
                    if (buttonElement) {
                        const buttonText = buttonElement.getAttribute('aria-label') || '';
                        // Extract product name from "sign in to favorite X" text
                        name = buttonText.replace('sign in to favorite ', '').replace(' to keep tabs on it', '').trim();
                    }
                    
                    // Get price - try multiple possible selectors
                    const priceText = card.textContent;
                    const priceMatch = priceText.match(/\$\d+\.\d+/) || ['N/A'];
                    const price = priceMatch[0];
                    
                    // Get product link
                    const link = card.querySelector('a[href*="/p/"]')?.href || 'N/A';
                    
                    // Get size - extract from product name if available
                    const sizeMatch = name.match(/\d+\.?\d*\s*(?:oz|count|ct|pack|lb)/) || ['N/A'];
                    const size = sizeMatch[0];
                    
                    if (name !== 'N/A' && price !== 'N/A') {
                        products.push({ 
                            name, 
                            price, 
                            size,
                            link 
                        });
                    }
                } catch (e) {
                    console.error('Error processing card:', e);
                }
            }
            return products;
        }""")

        # Write items to text file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("Target Potato Chips Products\n")
            f.write("=" * 50 + "\n\n")
            if not items:
                f.write("No products found. Please check the selectors.\n")
            for item in items:
                f.write(f"Name: {item['name']}\n")
                f.write(f"Price: {item['price']}\n")
                f.write(f"Size: {item['size']}\n")
                f.write(f"URL: {item['link']}\n")
                f.write("-" * 50 + "\n")
                # Also print to console for monitoring
                print(f"Product found: {item['name']} - {item['price']}")

        print(f"\nTotal products found: {len(items)}")
        browser.close()

# Runs program
if __name__ == "__main__":
    scrape_target_products(output_file="target_products.txt")
