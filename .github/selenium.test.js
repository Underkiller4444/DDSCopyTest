const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Use the GitHub Actions Chrome path
const chromePath = process.env.CHROME_BIN || '/usr/bin/google-chrome';

(async function runTest() {
    let options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
    options.setChromeBinaryPath(chromePath); // <-- Explicitly set Chrome binary path

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('http://localhost:8080/index.html');
        let title = await driver.getTitle();
        if (!title.includes('Login Page')) throw new Error('Login Page not loaded');

        let passwordInput = await driver.findElement(By.id('password'));
        let loginButton = await driver.findElement(By.css('button'));

        await passwordInput.sendKeys('Secure@2024');
        await loginButton.click();

        await driver.wait(until.urlContains('welcome.html'), 5000);
        let url = await driver.getCurrentUrl();
        if (!url.includes('welcome.html')) throw new Error('Did not redirect to welcome page');

        let pageSource = await driver.getPageSource();
        if (!pageSource.includes('Secure@2024')) throw new Error('Password not displayed on welcome page');

        let logoutButton = await driver.findElement(By.css('button'));
        await logoutButton.click();

        await driver.wait(until.titleContains('Login Page'), 5000);
        let newTitle = await driver.getTitle();
        if (!newTitle.includes('Login Page')) throw new Error('Did not return to login page');

        console.log('UI test passed!');
    } finally {
        await driver.quit();
    }
})();