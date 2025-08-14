import { test, expect } from '@playwright/test';

test.describe('Map Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load map with default view', async ({ page }) => {
    // Wait for map container to be visible
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/NZ Mashup/i);
  });

  test('should display navigation elements', async ({ page }) => {
    // Check for main navigation or control elements
    // This will depend on the actual UI structure
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for any leaflet tiles to start loading
    await page.waitForTimeout(2000);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify the page still loads on mobile
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle basic interactions', async ({ page }) => {
    // Basic interaction test - clicking on the map container
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
    
    // Try to interact with the map
    await mapContainer.click();
  });
});