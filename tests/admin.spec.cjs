const { test, expect } = require("@playwright/test");
const { describe, beforeEach, afterEach } = test;

//Set the email and password for the admin
const adminEmail = "Test123@Email.com";
const adminPassword = "TestTest123123";
const adminUsername = "TestTest123123";

describe("Admin Create Category", () => {
  beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.click("text=Login");
    expect(page.url()).toBe("http://localhost:3000/login");
    await page.fill("input[id=exampleInputEmail1]", adminEmail);
    await page.fill("input[id=exampleInputPassword1]", adminPassword);
    await page.click('button.btn-primary:has-text("LOGIN")');
    await page.waitForNavigation();
    expect(page.url()).toBe("http://localhost:3000/");
    await page.click("text=" + adminUsername);
    await page.click("text=Dashboard");
    expect(page.url()).toBe("http://localhost:3000/dashboard/admin");
    await page.click("text=Create Category");
    expect(page.url()).toBe(
      "http://localhost:3000/dashboard/admin/create-category"
    );
  });

  afterEach(async ({ page }) => {
    await page.click("text=" + adminUsername);
    await page.click("text=Logout");
    expect(page.url()).toBe("http://localhost:3000/login");
  });

  test("should create a new category and display it on admin create category page", async ({ page }) => {
    const category = Math.random().toString(36).substring(10);
    await page.fill(
      'input[placeholder="Enter new category"]',
      category
    );
    await page.click('button.btn-primary:has-text("Submit")');
    await expect(
      page.getByText(`${category} is created`)
    ).toBeVisible();
    const deleterow = await page.locator("tr", {
      hasText: category,
    });
    await expect(deleterow).toBeVisible();
    await deleterow.locator('button:has-text("Delete")').click();
    await expect(page.getByText("category is deleted")).toBeVisible();
    await expect(page.locator("tr", { hasText: category })).toHaveCount(0);
  });

  test("should edit a category and display the update on admin create category page", async ({ page }) => {
    const category = Math.random().toString(36).substring(10);
    const editCategory = Math.random().toString(36).substring(10);
    await page.fill(
      'input[placeholder="Enter new category"]',
      category
    );
    await page.click('button.btn-primary:has-text("Submit")');
    await expect(
      page.getByText(`${category} is created`)
    ).toBeVisible();
    const row = await page.locator("tr", { hasText: category});
    await row.locator('button:has-text("Edit")').click();
    const modalSubmit = ".ant-modal";
    const inputModal = `${modalSubmit} input[value="${category}"]`;
    await page.waitForSelector(modalSubmit);
    await page.fill(inputModal, editCategory);
    await page.click(`${modalSubmit} button[type="submit"]`);
    await expect(
      page.getByText(`${editCategory} is updated`)
    ).toBeVisible();
    const deleterow = await page.locator("tr", {
      hasText: editCategory,
    });
    await expect(deleterow).toBeVisible();
    await deleterow.locator('button:has-text("Delete")').click();
    await expect(page.getByText("category is deleted")).toBeVisible();
    await expect(page.locator("tr", { hasText: category })).toHaveCount(0);
  });

  test("should delete the category and the category is not displayed on the admin create category page", async ({ page }) => {
    const category = Math.random().toString(36).substring(10);
    await page.fill(
      'input[placeholder="Enter new category"]',
      category
    );
    await page.click('button.btn-primary:has-text("Submit")');
    await expect(
      page.getByText(`${category} is created`)
    ).toBeVisible();
    const row = await page.locator("tr", { hasText: category });
    await row.locator('button:has-text("Delete")').click();
    await expect(page.getByText("category is deleted")).toBeVisible();
    await expect(page.locator("tr", { hasText: category })).toHaveCount(0);
  });
});
