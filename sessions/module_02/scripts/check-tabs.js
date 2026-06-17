const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function runTest() {
    console.log('Starting playground server on port 3005...');
    
    // Start the server on port 3005
    const serverProcess = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: '3005' },
        cwd: path.join(__dirname, '..')
    });

    // Wait for server to be ready
    await new Promise((resolve) => {
        serverProcess.stdout.on('data', (data) => {
            if (data.toString().includes('listening on')) {
                resolve();
            }
        });
    });

    console.log('Server is running. Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to playground UI...');
    await page.goto('http://localhost:3005');

    // Wait for the UI to render
    await page.waitForTimeout(1000);

    console.log('\n--- Checking initial state (How It Works tab active) ---');
    
    // Check tab visibility
    const theoryVisible = await page.isVisible('#tab-theory');
    const playgroundVisible = await page.isVisible('#tab-playground');

    console.log(`How It Works Tab visible: ${theoryVisible} (Expected: true)`);
    console.log(`Playground Tab visible: ${playgroundVisible} (Expected: false)`);

    if (playgroundVisible) {
        console.error('❌ BUG FOUND: Playground content is visible when How It Works tab is active!');
    } else {
        console.log('✅ Success: Playground content is hidden.');
    }

    console.log('\n--- Clicking Playground Tab ---');
    await page.click('button[data-tab="playground"]');
    await page.waitForTimeout(500);

    const theoryVisibleAfter = await page.isVisible('#tab-theory');
    const playgroundVisibleAfter = await page.isVisible('#tab-playground');

    console.log(`How It Works Tab visible: ${theoryVisibleAfter} (Expected: false)`);
    console.log(`Playground Tab visible: ${playgroundVisibleAfter} (Expected: true)`);

    if (theoryVisibleAfter) {
        console.error('❌ BUG FOUND: How It Works content remains visible when Playground tab is active!');
    } else {
        console.log('✅ Success: How It Works content is hidden.');
    }

    console.log('\nClosing browser and stopping server...');
    await browser.close();
    serverProcess.kill();
    
    if (playgroundVisible || theoryVisibleAfter) {
        process.exit(1);
    } else {
        console.log('🎉 All tab tests passed successfully!');
        process.exit(0);
    }
}

runTest().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
