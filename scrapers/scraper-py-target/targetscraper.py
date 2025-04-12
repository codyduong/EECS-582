"""
targetscraper.py

A webscraper used for target.com
currently using an website to scrape potato chips from target

Author: @Tyler51235
Date Created: 2025-02-16
Revision History:
- 2025-02-16 - @Tyler51235 - PoC of Target scraper
- 2025-02-19 - @Tyler51235 - Add prologue comment
- 2025-02-25 - @codyduong - Update prologue comment
- 2025-04-12 - @Tyler51235 - Improve scraper
"""
import asyncio
import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

import playwright.async_api as pw
from playwright.async_api import Playwright, Browser, BrowserContext, Page

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class Product:
    id: str
    name: str
    url: str
    image_url: str
    price: Optional[float]
    rating: Optional[float]
    review_count: int
    category: Optional[str]
    promotion: Optional[str]
    scraped_at: datetime

@dataclass
class ProductDetails:
    # This class isn't defined in the original code but is referenced
    # Adding a placeholder that can be expanded later
    pass

@dataclass
class Category:
    # This class isn't defined in the original code but is referenced
    # Adding a placeholder that can be expanded later
    pass


class Scraper:
    def __init__(self, headless: bool = True, timeout: int = 30):
        self.headless = headless
        self.timeout = timeout

    async def init_browser(self) -> Tuple[Playwright, Browser, BrowserContext]:
        """Initialize Playwright browser"""
        # Initialize Playwright
        playwright = await pw.async_playwright().start()
        
        # Install and launch browser
        browser = await playwright.chromium.launch(headless=self.headless)
        
        # Create a new browser context with custom options
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        
        return playwright, browser, context

    async def navigate(self, page: Page, url: str) -> None:
        """Navigate to URL with retry logic"""
        retry_count = 0
        MAX_RETRIES = 3
        
        while retry_count < MAX_RETRIES:
            try:
                await page.goto(url)
                
                # Check if page loaded successfully
                title = await page.title()
                if title and "Access Denied" not in title:
                    return
                
                logger.error(f"Page loaded with unexpected title: {title}")
            except Exception as e:
                logger.error(f"Failed to navigate to {url}: {e}")
            
            retry_count += 1
            if retry_count < MAX_RETRIES:
                logger.info(f"Retrying navigation ({retry_count}/{MAX_RETRIES})")
                await asyncio.sleep(2)
        
        raise Exception(f"Failed to navigate to {url} after {MAX_RETRIES} attempts")

    async def wait_for_page_load(self, page: Page) -> None:
        """Wait for page to load"""
        # Wait for network to be idle
        await page.wait_for_load_state("networkidle")
        
        try:
            # Wait for content to be visible
            await page.wait_for_selector("main, #pageBodyContainer", 
                                        state="visible", 
                                        timeout=self.timeout * 1000)
        except Exception as e:
            logger.warning(f"Timeout waiting for content: {e}")
            # Continue anyway, as some content might still be available
        
        return

    async def scroll_to_load_all(self, page: Page) -> None:
        """Scroll to load all products"""
        logger.info("Scrolling to load all content...")
        
        last_height = 0
        same_height_count = 0
        
        # Keep scrolling until we've seen the same height 3 times in a row
        while same_height_count < 3:
            # Scroll to bottom
            current_height = await page.evaluate("""
                () => {
                    window.scrollTo(0, document.body.scrollHeight);
                    return document.body.scrollHeight;
                }
            """)
            
            # Wait for any new content to load
            await asyncio.sleep(1.5)
            
            # Check if the page height has changed
            if current_height == last_height:
                same_height_count += 1
            else:
                same_height_count = 0
                last_height = current_height
            
            logger.debug(f"Scroll height: {current_height}, Count: {same_height_count}")
        
        # Scroll back to top
        await page.evaluate("window.scrollTo(0, 0)")
        
        logger.info("Finished scrolling page")

    async def extract_products(self, page: Page) -> List[Product]:
        """Extract product data from page"""
        logger.info("Extracting products...")
        
        # Wait for product grid to be visible
        product_grid = await page.wait_for_selector("div[data-test='product-grid']")
        
        # Get all product cards
        product_cards = await product_grid.query_selector_all("[data-test='product-card']")
        logger.info(f"Found {len(product_cards)} product cards")
        
        products = []
        
        for i, card in enumerate(product_cards):
            logger.debug(f"Processing product {i+1}/{len(product_cards)}")
            
            # Extract product data using JavaScript for better reliability
            product_data = await card.evaluate("""
                (card) => {
                    try {
                        // Extract name
                        const nameElement = card.querySelector('[data-test="product-title"]');
                        const name = nameElement ? nameElement.textContent.trim() : '';
                        
                        // Extract URL
                        const linkElement = card.querySelector('a[href*="/p/"]');
                        const url = linkElement ? linkElement.href : '';
                        
                        // Extract image URL
                        const imgElement = card.querySelector('img');
                        const imageUrl = imgElement ? imgElement.src : '';
                        
                        // Extract price
                        const priceElement = card.querySelector('[data-test="product-price"]');
                        const price = priceElement ? priceElement.textContent.trim() : '';
                        
                        // Extract rating if exists
                        const ratingElement = card.querySelector('[data-test="ratings"]');
                        const rating = ratingElement ? parseFloat(ratingElement.getAttribute('aria-label').match(/(\d+(\.\d+)?)/)[0]) : null;
                        
                        // Extract rating count
                        const reviewCountElement = card.querySelector('[data-test="review-count"]');
                        const reviewCount = reviewCountElement ? parseInt(reviewCountElement.textContent.replace(/[^0-9]/g, '')) : 0;
                        
                        // Extract promotion or special offer
                        const promoElement = card.querySelector('[data-test="product-promotions"], [data-test="product-item-deal-flag"]');
                        const promotion = promoElement ? promoElement.textContent.trim() : null;
                        
                        return { name, url, imageUrl, price, rating, reviewCount, promotion };
                    } catch (e) {
                        return { error: e.toString() };
                    }
                }
            """)
            
            # Skip items that failed to parse
            if "error" in product_data:
                error = product_data.get("error", "Unknown error")
                logger.warning(f"Failed to extract product {i}: {error}")
                continue
            
            name = product_data.get("name", "")
            url = product_data.get("url", "")
            image_url = product_data.get("imageUrl", "")
            price_str = product_data.get("price", "")
            
            # Skip items with missing critical info
            if not name or not url:
                logger.warning(f"Skipping product with incomplete data: name={name}, url={url}")
                continue
            
            # Extract product ID from URL
            try:
                product_id = self.extract_product_id_from_url(url)
            except Exception as e:
                logger.warning(f"Failed to extract product ID for {url}: {e}")
                continue
            
            # Convert price string to float
            try:
                price = float(price_str.replace("$", "").replace(",", "")) if price_str else None
            except ValueError:
                price = None
            
            # Extract rating if available
            rating = product_data.get("rating")
            
            review_count = int(product_data.get("reviewCount", 0))
            
            promotion = product_data.get("promotion")
            
            # Create product object
            product = Product(
                id=product_id,
                name=name,
                url=url,
                image_url=image_url,
                price=price,
                rating=rating,
                review_count=review_count,
                category=None,  # Will be filled from page metadata
                promotion=promotion,
                scraped_at=datetime.utcnow()
            )
            
            products.append(product)
        
        # Try to get category from page metadata
        category = await self.extract_page_category(page)
        
        # Assign category to all products
        for product in products:
            product.category = category
        
        logger.info(f"Extracted {len(products)} products")
        return products
    
    async def extract_page_category(self, page: Page) -> Optional[str]:
        """Extract page category"""
        category_data = await page.evaluate("""
            () => {
                // Try to get from breadcrumbs
                const breadcrumbs = document.querySelectorAll('[data-test="breadcrumb"]');
                if (breadcrumbs.length > 1) {
                    return breadcrumbs[breadcrumbs.length - 1].textContent.trim();
                }
                
                // Try to get from page title
                const title = document.querySelector('h1');
                if (title) {
                    return title.textContent.trim();
                }
                
                return null;
            }
        """)
        
        return category_data
    
    @staticmethod
    def extract_product_id_from_url(url: str) -> str:
        """Extract product ID from URL"""
        # Look for patterns like /p/A-12345678 or similar
        match = re.search(r'/p/([A-Z0-9-]+)', url)
        if match:
            return match.group(1)
        
        # If no standard pattern found, just use the last part of the URL
        path_parts = url.rstrip('/').split('/')
        return path_parts[-1]

    async def scrape_category_page(self, url: str) -> List[Product]:
        """Scrape products from a category page"""
        logger.info(f"Scraping category page: {url}")
        
        playwright, browser, context = await self.init_browser()
        
        try:
            # Create a new page
            page = await context.new_page()
            
            # Navigate to the category page
            await self.navigate(page, url)
            
            # Wait for the page to load
            await self.wait_for_page_load(page)
            
            # Scroll to load all products
            await self.scroll_to_load_all(page)
            
            # Extract products
            products = await self.extract_products(page)
            
            return products
            
        finally:
            # Clean up
            await context.close()
            await browser.close()
            await playwright.stop()
    
    async def scrape_product_details(self, url: str) -> ProductDetails:
        """Scrape detailed information about a specific product"""
        # This function is not implemented in the original code fragment
        # Adding a placeholder for completeness
        raise NotImplementedError("Product details scraping not implemented")