const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const chromePath = process.env.CHROME_BIN || '/usr/bin/google-chrome';

(async function runTest() {
    let options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
    options.setChromeBinaryPath(chromePath);

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Use port 80 as per your docker-compose and server.js
        await driver.get('http://localhost/');

        // Check for the correct title
        let title = await driver.getTitle();
        if (!title.includes('Login')) throw new Error('Login page not loaded');

        // Find the password input (no id, so use name)
        let passwordInput = await driver.findElement(By.name('password'));
        let loginButton = await driver.findElement(By.css('button[type="submit"]'));

        // Enter a valid password and submit
        await passwordInput.sendKeys('Secure@2024');
        await loginButton.click();

        // Wait for the welcome message to appear
        await driver.wait(until.elementLocated(By.css('h1')), 5000);
        let h1 = await driver.findElement(By.css('h1'));
        let h1Text = await h1.getText();
        if (!h1Text.includes('Welcome')) throw new Error('Did not reach welcome page');

        // Check that the password is displayed
        let pageSource = await driver.getPageSource();
        if (!pageSource.includes('Secure@2024')) throw new Error('Password not displayed on welcome page');

        // Click the logout button
        let logoutButton = await driver.findElement(By.css('button[type="submit"]'));
        await logoutButton.click();

        // Wait for the login page to reload
        await driver.wait(until.titleContains('Login'), 5000);
        let newTitle = await driver.getTitle();
        if (!newTitle.includes('Login')) throw new Error('Did not return to login page');

        console.log('UI test passed!');
    } finally {
        await driver.quit();
    }
})();