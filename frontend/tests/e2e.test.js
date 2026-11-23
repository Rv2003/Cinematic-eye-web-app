import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import chromedriver from 'chromedriver';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import process from 'node:process';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const chromeDriverPath = process.env.CHROMEDRIVER_PATH || chromedriver.path;
const headless = process.env.HEADLESS !== 'false';
let driver;

beforeEach(async () => {
  const options = new chrome.Options()
    .addArguments('--disable-dev-shm-usage', '--window-size=1440,1000');
  if (headless) {
    options.addArguments('--headless=new');
  }

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
    .build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 15000 });
});

afterEach(async () => {
  if (driver) {
    await driver.quit();
    driver = undefined;
  }
});

test('homepage displays the studio hero and navigation', async () => {
  await driver.get(baseUrl);

  const hero = await driver.wait(
    until.elementLocated(By.css('.hero-title')),
    10000
  );
  const heroText = await driver.wait(async () => {
    const text = await hero.getAttribute('textContent');
    return text?.trim() ? text : false;
  }, 10000);
  assert.match(heroText, /SHAPING THE ART|CAPTURING MOTION|INTO THE DEPTHS/);
  assert.equal(
    (await driver.findElement(By.css('.nav-brand')).getText()).replace(/\s+/g, ' ').trim(),
    'CINEMATIC EYE'
  );
  assert.equal(
    (await driver.findElement(By.css('.nav-login')).getText()).toUpperCase(),
    'LOGIN'
  );
});

test('Explore Portfolio scrolls to the work section', async () => {
  await driver.get(baseUrl);
  await driver.findElement(By.css('.hero-btn-primary')).click();

  await driver.wait(until.urlContains('#work'), 10000);
  assert.equal(await driver.findElement(By.id('work')).isDisplayed(), true);
});

test('About navigation opens the studio manifesto', async () => {
  await driver.get(baseUrl);
  await driver.findElement(By.css('a.nav-link[href="/about"]')).click();

  await driver.wait(until.urlContains('/about'), 10000);
  const heading = await driver.wait(
    until.elementLocated(By.css('.about-hero-title')),
    10000
  );
  assert.match(await heading.getText(), /SHAPING STORIES IN/);
});

test('login carousel controls change the active slide', async () => {
  await driver.get(`${baseUrl}/login`);
  const secondSlide = await driver.wait(
    until.elementLocated(By.css('button[aria-label="Slide 2"]')),
    10000
  );
  await secondSlide.click();

  await driver.wait(async () =>
    (await secondSlide.getAttribute('class')).includes('active'),
  5000);
});

test('visitors can navigate from sign-in to account creation', async () => {
  await driver.get(`${baseUrl}/login`);
  await driver.wait(
    until.elementLocated(By.css('form.login-form')),
    10000
  );
  await driver.findElement(By.css('.login-signup-link')).click();

  await driver.wait(until.urlContains('/register'), 10000);
  await driver.wait(until.elementLocated(By.id('username')), 10000);
  assert.equal(
    await driver.findElement(By.id('username')).getAttribute('autocomplete'),
    'username'
  );
  assert.equal(await driver.findElement(By.id('email')).getAttribute('type'), 'email');
  assert.equal(await driver.findElement(By.id('password')).getAttribute('type'), 'password');
});

test('registration form enforces required and valid field values', async () => {
  await driver.get(`${baseUrl}/register`);
  const form = await driver.wait(
    until.elementLocated(By.css('form.login-form')),
    10000
  );

  assert.equal(await driver.executeScript('return arguments[0].checkValidity()', form), false);

  await driver.findElement(By.id('username')).sendKeys('selenium-client');
  await driver.findElement(By.id('email')).sendKeys('selenium-client@example.com');
  await driver.findElement(By.id('password')).sendKeys('test-password-123');
  assert.equal(await driver.executeScript('return arguments[0].checkValidity()', form), true);
});

test('booking session selection updates the summary and OTP requires an email', async () => {
  await driver.get(`${baseUrl}/booking`);
  await driver.wait(
    until.elementLocated(By.css('.booking-title')),
    10000
  );

  await driver.findElement(
    By.xpath("//button[contains(@class, 'session-chip') and normalize-space(.)='Graduation']")
  ).click();
  const sessionSummary = await driver.wait(async () => {
    const text = await driver.findElement(By.css('.summary-line .v')).getText();
    return text === 'Graduation' ? text : false;
  }, 5000);
  assert.equal(sessionSummary, 'Graduation');

  const sendOtp = await driver.findElement(By.css('.otp-send-btn'));
  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" })',
    sendOtp
  );
  await sendOtp.click();
  const otpError = await driver.wait(
    until.elementLocated(By.css('.otp-error-msg')),
    5000
  );
  assert.equal(await otpError.getText(), 'Please enter your email address first.');
});

test('unauthenticated visitors are redirected from the profile page to sign-in', async () => {
  await driver.get(`${baseUrl}/profile`);

  await driver.wait(until.urlContains('/login'), 10000);
  const loginForm = await driver.wait(
    until.elementLocated(By.css('form.login-form')),
    10000
  );
  await driver.wait(until.elementIsVisible(loginForm), 10000);
});




