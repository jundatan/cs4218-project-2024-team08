const { test, expect, beforeEach, afterEach } = require('@playwright/test');

test.describe.serial('Home, Categories and Cart Page Components', () => {
    beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/', { timeout: 30000 });
    
        // Expects Login page to load
        await page.click('text=Login');
        await page.waitForURL('http://localhost:3000/login');
        await expect(page.url()).toBe('http://localhost:3000/login');
    
        // Expects Home page to load
        await page.getByPlaceholder('Enter Your Email').fill('Test123@Email.com');
        await page.getByPlaceholder('Enter Your Password').fill('TestTest123123');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');
        await expect(page.url()).toBe('http://localhost:3000/');
    
        // Expects Dashboard page to load
        await page.click('text=TestTest123123');
        await page.click('text=Dashboard');
        await page.waitForURL('http://localhost:3000/dashboard/admin');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin');
    });
    
    afterEach(async ({ page }) => {
        await page.click('text=TestTest123123');
        await page.click('text=Logout');
    });
    
    test('should reflect the new category on Home page and All Categories Page', async ({ page }) => {
        // Expects Create Category page to load
        await page.click('text=Create Category');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/create-category');
    
        // Expects a message for successful creation of category
        await page.getByPlaceholder('Enter new category').fill('Chairs');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Chairs is created')).toBeVisible();
    
        // Expects All Categories page to load
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.click("text=All Categories");
        await expect(page.url()).toBe('http://localhost:3000/categories');
        
        // Expects All Categories page to have reflect the new category
        await expect(page.getByRole('link', { name: 'Chairs' })).toBeVisible();
    
        // Expects Home Page to load
        await page.locator('a.nav-link[href="/"]').click();
        await expect(page.url()).toBe('http://localhost:3000/');
        
        // Expects Home Page to have a checkbox for the new category
        await expect(page.getByLabel('Chairs')).toBeVisible();
        await expect(page.getByLabel('Chairs')).toBeEnabled();
        await expect(page.getByLabel('Chairs')).not.toBeChecked();
    });
    
    test('should reflect the new product on its CategoryProduct page', async({ page }) => {
        // Create a category
        await page.click('text=Create Category');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/create-category');
        await page.getByPlaceholder('Enter new category').fill('Chairs');
        await page.getByRole('button', { name: 'Submit' }).click();
    
        // Expects Create Product page to load
        await page.click('text=Create Product');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/create-product');
    
        // Fill in particulars for the product
        await page.locator('input[role="combobox"][id="rc_select_0"]').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.getByPlaceholder('write a name').fill('Wooden Chair');
        await page.getByPlaceholder('write a description').fill('A wooden chair.');
        await page.getByPlaceholder('write a Price').fill('79');
        await page.getByPlaceholder('write a quantity').fill('10');
        await page.locator('input[role="combobox"][id="rc_select_1"]').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
    
        // Upload an image for the product
        await page.click('label.btn.btn-outline-secondary');
        const filePath = 'client/public/images/WoodenChair.jpg'; // Update with your image path
        await page.setInputFiles('input[type="file"]', filePath);
        const img = page.locator('img[alt="product_photo"]');
    
        // Expects the image to be loaded on the page
        await expect(img).toBeVisible();
        await expect(img).toHaveAttribute('src', /^blob:/);
        await expect(page.locator('label.btn.btn-outline-secondary')).toHaveText('WoodenChair.jpg');
        
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/products')
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.waitForSelector('.product-link');
    
        // Expects Category Product page to load
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.click("text=Chairs");
        await expect(page.url()).toBe('http://localhost:3000/category/chairs');
        await page.goto('http://localhost:3000/category/chairs');
    
        // Expects the Product details to be correct
        const productCard = await page.locator('.card').nth(0);
        const productName = productCard.locator('h5.card-title').nth(0);
        const productPrice = productCard.locator('h5.card-title.card-price');
        const productDescription = productCard.locator('p.card-text');
        await page.waitForSelector('.card');
        await expect(productName).toBeVisible();
        await expect(productName).toHaveText("Wooden Chair");
        await expect(productPrice).toBeVisible();
        await expect(productPrice).toHaveText("$79.00");
        await expect(productDescription).toBeVisible();
        await expect(productDescription).toHaveText("A wooden chair....");
    });
    
    test('should be able to add product to cart', async({ page }) => {
        // Create a category
        await page.click('text=Create Category');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/create-category');
        await page.getByPlaceholder('Enter new category').fill('Chairs');
        await page.getByRole('button', { name: 'Submit' }).click();
    
        // Create a product
        await page.click('text=Create Product');
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/create-product');
        await page.locator('input[role="combobox"][id="rc_select_0"]').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.getByPlaceholder('write a name').fill('Wooden Chair');
        await page.getByPlaceholder('write a description').fill('A wooden chair.');
        await page.getByPlaceholder('write a Price').fill('79');
        await page.getByPlaceholder('write a quantity').fill('10');
        await page.locator('input[role="combobox"][id="rc_select_1"]').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.url()).toBe('http://localhost:3000/dashboard/admin/products')
        await page.goto('http://localhost:3000/dashboard/admin/products');
    
        // Expect Home page to load
        await page.locator('a.nav-link[href="/"]').click();
        await expect(page.url()).toBe('http://localhost:3000/');
        await page.goto('http://localhost:3000/');
    
        // Expect Product to be on Home page
        const productCard = page.locator('.card').nth(0);
        const productName = productCard.locator('h5.card-title').nth(0);
        const productPrice = productCard.locator('.card-title.card-price');
        const productDescription = productCard.locator('p.card-text');
        await page.waitForSelector('.card');
        await expect(productName).toBeVisible();
        await expect(productName).toHaveText('Wooden Chair');
        await expect(productPrice).toBeVisible();
        await expect(productPrice).toHaveText('$79.00');
        await expect(productDescription).toBeVisible();
        await expect(productDescription).toHaveText('A wooden chair....');
    
        // Expect Cart page to load
        await page.getByRole('button', { name: 'ADD TO CART' }).nth(0).click();
        await page.click('text=Cart');
        await expect(page.url()).toBe('http://localhost:3000/cart');
    
        // Expect the product to be in cart
        const item = page.locator('.col-md-7 .card');
        const itemName = item.locator('p').nth(0);
        const itemDescription = item.locator('p').nth(1);
        const itemPrice = item.locator('p').nth(2);
        await page.waitForSelector('.col-md-7 .card');
        await expect(itemName).toBeVisible();
        await expect(itemName).toHaveText('Wooden Chair');
        await expect(itemDescription).toBeVisible();
        await expect(itemDescription).toHaveText('A wooden chair.');
        await expect(itemPrice).toBeVisible();
        await expect(itemPrice).toHaveText('Price : 79');
    
        // Expect cart summary price to be correct
        await expect(page.getByText('Total : $79.00')).toBeVisible();
    });
});
