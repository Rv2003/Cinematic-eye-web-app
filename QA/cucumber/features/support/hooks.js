import { Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

setDefaultTimeout(20000);

Before(async function () {
  const options = new chrome.Options().addArguments(
    "--headless=new",
    "--disable-dev-shm-usage",
    "--window-size=1440,1000"
  );

  this.driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await this.driver.manage().setTimeouts({
    implicit: 0,
    pageLoad: 15000
  });

  this.baseUrl = process.env.BASE_URL || "http://localhost:5173";
});

After(async function () {
  if (this.driver) {
    await this.driver.quit();
    this.driver = undefined;
  }
});
