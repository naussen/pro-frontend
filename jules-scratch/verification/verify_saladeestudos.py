import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        # Get the absolute path of the file
        import os
        index_path = os.path.abspath('index.html')
        saladeestudos_path = os.path.abspath('saladeestudos.html')

        # Go to index first to avoid immediate redirection
        await page.goto(f'file://{index_path}')

        # Now, navigate to the study room
        await page.goto(f'file://{saladeestudos_path}')

        # Wait for the study room to load
        await page.wait_for_selector('.study-layout')
        await page.screenshot(path='jules-scratch/verification/verification.png')
        await browser.close()

asyncio.run(main())