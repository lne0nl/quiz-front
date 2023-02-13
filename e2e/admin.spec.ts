import { test, expect } from "@playwright/test";

test.describe("Test admin part", () => {
  // let quizID = "";

  test("Create a quiz", async ({ page }) => {
    await page.goto("/#/admin");
    const input = page.locator("input.quiz-name-input");
    await expect(input).toBeVisible();
    // await input.type("Quiz");
    // await page.keyboard.press("Enter");
    // await expect(input).not.toBeVisible();
    // quizID = page.url().substring(page.url().lastIndexOf("/") + 1);
  });

  // test("Start a quiz", async ({ page }) => {
  //   await page.goto(`/#/admin/${quizID}`);
  //   await page.screenshot({ path: "screenshots/screenshot.png" });
  //   await page.getByText("Start quiz").click();
  //   await expect(page.locator("div.quiz-name")).toHaveText("Quiz");
  // });

  // test("Delete a quiz", async ({ page }) => {
  //   await page.goto(`/#/admin/${quizID}`);
  //   await page.getByText("Delete quiz").click();
  //   await expect(page.locator("input.quiz-name-input")).toBeVisible();
  // });
});
