import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { By, until } from "selenium-webdriver";

Given("I open the Cinematic Eye home page", async function () {
  await this.driver.get(this.baseUrl);
  await this.driver.wait(
    until.elementLocated(By.css(".hero-title")),
    10000
  );
});

When("I click Explore Portfolio", async function () {
  await this.driver.findElement(By.css(".hero-btn-primary")).click();
});

Then("the portfolio work section is visible", async function () {
  await this.driver.wait(until.urlContains("#work"), 10000);
  const workSection = await this.driver.findElement(By.id("work"));
  assert.equal(await workSection.isDisplayed(), true);
});

Given("I open the booking page", async function () {
  await this.driver.get(`${this.baseUrl}/booking`);
  await this.driver.wait(
    until.elementLocated(By.css(".booking-title")),
    10000
  );
});

When("I choose the {string} session", async function (sessionName) {
  const sessionButton = this.driver.findElement(
    By.xpath(
      `//button[contains(@class, 'session-chip') and normalize-space(.)='${sessionName}']`
    )
  );
  await sessionButton.click();
});

Then("the booking summary shows {string}", async function (sessionName) {
  const summaryValue = await this.driver.wait(async () => {
    const value = await this.driver
      .findElement(By.css(".summary-line .v"))
      .getText();
    return value === sessionName ? value : false;
  }, 5000);

  assert.equal(summaryValue, sessionName);
});

When("I request an OTP without entering an email address", async function () {
  const sendOtpButton = await this.driver.findElement(By.css(".otp-send-btn"));

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block: 'center', behavior: 'instant'});",
    sendOtpButton
  );

  await sendOtpButton.click();
});

Then("the email validation message is displayed", async function () {
  const errorMessage = await this.driver.wait(
    until.elementLocated(By.css(".otp-error-msg")),
    5000
  );

  assert.equal(
    (await errorMessage.getText()).trim(),
    "Please enter your email address first."
  );
});
