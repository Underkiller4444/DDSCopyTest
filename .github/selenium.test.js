const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Try to find Chrome on Windows
const chromePath = process.env.CHROME_BIN || 
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' ||
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

(async function runTest() {
    let options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu');
    
    // Only set Chrome binary path if it's not the default
    if (process.env.CHROME_BIN) {
        options.setChromeBinaryPath(chromePath);
    }

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log('Starting UI tests...');
        
        // Test 1: Check login page loads correctly
        console.log('Test 1: Loading login page...');
        await driver.get('http://localhost:8080/');
        let title = await driver.getTitle();
        if (!title.includes('Login')) throw new Error('Login page not loaded');
        console.log('✓ Login page loaded successfully');

        // Test 2: Test password that doesn't meet criteria (too short)
        console.log('Test 2: Testing invalid password (too short)...');
        let passwordInput = await driver.findElement(By.name('password'));
        let loginButton = await driver.findElement(By.css('button[type="submit"]'));
        
        await passwordInput.clear();
        await passwordInput.sendKeys('Short1!'); // Only 7 characters
        await loginButton.click();
        
        // Should redirect back to login page
        await driver.wait(until.titleContains('Login'), 5000);
        let currentTitle = await driver.getTitle();
        if (!currentTitle.includes('Login')) throw new Error('Should have redirected back to login page');
        console.log('✓ Invalid password (too short) correctly rejected');

        // Test 3: Test password without special characters
        console.log('Test 3: Testing invalid password (no special characters)...');
        passwordInput = await driver.findElement(By.name('password'));
        loginButton = await driver.findElement(By.css('button[type="submit"]'));
        
        await passwordInput.clear();
        await passwordInput.sendKeys('Password123'); // No special characters
        await loginButton.click();
        
        // Should redirect back to login page
        await driver.wait(until.titleContains('Login'), 5000);
        currentTitle = await driver.getTitle();
        if (!currentTitle.includes('Login')) throw new Error('Should have redirected back to login page');
        console.log('✓ Invalid password (no special characters) correctly rejected');

        // Test 4: Test password from common passwords list
        console.log('Test 4: Testing password from common list...');
        passwordInput = await driver.findElement(By.name('password'));
        loginButton = await driver.findElement(By.css('button[type="submit"]'));
        
        await passwordInput.clear();
        await passwordInput.sendKeys('password'); // This is definitely in the common passwords list
        await loginButton.click();
        
        // Should redirect back to login page (will fail due to multiple criteria, including being common)
        await driver.wait(until.titleContains('Login'), 5000);
        currentTitle = await driver.getTitle();
        if (!currentTitle.includes('Login')) throw new Error('Should have redirected back to login page');
        console.log('✓ Common password correctly rejected');

        // Test 5: Test valid password that leads to welcome page
        console.log('Test 5: Testing valid password...');
        passwordInput = await driver.findElement(By.name('password'));
        loginButton = await driver.findElement(By.css('button[type="submit"]'));

        await passwordInput.clear();
        await passwordInput.sendKeys('Secure@2024');
        await loginButton.click();

        // Wait for the welcome message to appear
        await driver.wait(until.elementLocated(By.css('h1')), 5000);
        let h1 = await driver.findElement(By.css('h1'));
        let h1Text = await h1.getText();
        if (!h1Text.includes('Welcome')) throw new Error('Did not reach welcome page');
        console.log('✓ Valid password accepted - reached welcome page');

        // Check that the password is displayed
        let pageSource = await driver.getPageSource();
        if (!pageSource.includes('Secure@2024')) throw new Error('Password not displayed on welcome page');
        console.log('✓ Password correctly displayed on welcome page');

        // Test 6: Test logout functionality
        console.log('Test 6: Testing logout...');
        let logoutButton = await driver.findElement(By.css('button[type="submit"]'));
        await logoutButton.click();

        // Wait for the login page to reload
        await driver.wait(until.titleContains('Login'), 5000);
        let newTitle = await driver.getTitle();
        if (!newTitle.includes('Login')) throw new Error('Did not return to login page');
        console.log('✓ Logout successful - returned to login page');

        console.log('\n🎉 All UI tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    } finally {
        await driver.quit();
    }
})();