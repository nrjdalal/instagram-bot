require('dotenv').config()

const puppeteer = require('puppeteer')
const setDevice = puppeteer.devices['iPhone 11 Pro Max']

const user = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  evaluate: process.env.EVALUATE,
}

const index = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  })
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()

  try {
    await page.emulate(setDevice)

    // visiting website
    await page.goto('https://www.instagram.com/accounts/login/')

    // filling login information
    await page.waitForSelector('input[name=username]', { visible: true })
    await page.type('input[name=username]', user.username, { delay: 100 })
    await page.type('input[name=password]', user.password, { delay: 100 })

    // clicking on login
    let button = await page.$x(
      `/html/body/div[1]/section/main/div[1]/div/div/div/form/div[1]/div[6]/button/div`
    )
    await button[0].click({ delay: 100 })

    // page load timer
    await page.waitForTimeout(5000)

    // saying no to saving login info
    button = await page.$x(`/html/body/div[1]/section/main/div/div/div/button`)
    await button[0].click({ delay: 100 })

    // visiting profile
    await page.goto(`https://www.instagram.com/${user.evaluate}/`)

    button = await page.$x(`/html/body/div[1]/section/main/div/ul/li[2]/a`)
    await button[0].click({ delay: 100 })

    // page load timer
    await page.waitForTimeout(5000)

    // scroll to bottom
    let lastHeight = await page.evaluate('document.body.scrollHeight')
    while (true) {
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
      await page.waitForTimeout(2500) // sleep a bit
      let newHeight = await page.evaluate('document.body.scrollHeight')
      if (newHeight === lastHeight) {
        break
      }
      lastHeight = newHeight
    }

    // getting all followers
    const usernames = await page.$$eval(
      'main > div > ul > div > li > div > div > div > div > a',
      (links) => links.map((link) => link.textContent)
    )

    for (i = 0; i < usernames.length; i++) {
      console.log(usernames[i])
    }

    console.log(usernames.length)

    // for dev purposes
    await page.waitForTimeout(7000)
  } catch (error) {
    console.log(error)
    await browser.close()
  }

  await browser.close()
}

index()
