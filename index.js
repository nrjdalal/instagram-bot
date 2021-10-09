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

    // saying no to saving login info
    await page.waitForXPath('/html/body/div[1]/section/main/div/div/div/button')
    button = await page.$x(`/html/body/div[1]/section/main/div/div/div/button`)
    await button[0].click({ delay: 100 })

    // visiting profile and getting followers
    await page.goto(`https://www.instagram.com/${user.evaluate}/`)
    await page.waitForXPath(
      '/html/body/div[1]/section/main/div/header/section/div[1]/h2',
      { visible: true }
    )

    button = await page.$x(`/html/body/div[1]/section/main/div/ul/li[2]/a`)
    await button[0].click({ delay: 100 })

    // followers page
    await page.waitForSelector(
      'main > div > ul > div > li > div > div > div > div > a'
    )

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

    console.log(usernames.length + '\n')

    for (i = 0; i < usernames.length; i++) {
      await page.waitForTimeout(1000)
      await page.goto(`https://www.instagram.com/${usernames[i]}/`)
      await page.waitForXPath(
        '/html/body/div[1]/section/main/div/header/section/div[1]/h2',
        { visible: true }
      )

      const getUsername = await page.$eval('h2._7UhW9', (el) => el.textContent)

      let getDescription
      try {
        getDescription = await page.$eval(
          '.-vDIg > span:nth-child(3)',
          (el) => el.textContent
        )
      } catch {
        getDescription = ''
      }

      const getPosts = await page.$eval(
        'span._81NM2 > span:nth-child(1)',
        (el) => el.textContent
      )

      let getFollowers
      try {
        getFollowers = await page.$eval(
          'li.LH36I:nth-child(2) > a:nth-child(1) > span:nth-child(1)',
          (el) => el.textContent
        )
      } catch {
        getFollowers = await page.$eval(
          'li.LH36I:nth-child(2) > span:nth-child(1) > span:nth-child(1)',
          (el) => el.textContent
        )
      }

      let getFollowing
      try {
        getFollowing = await page.$eval(
          'li.LH36I:nth-child(3) > a:nth-child(1) > span:nth-child(1)',
          (el) => el.textContent
        )
      } catch {
        getFollowing = await page.$eval(
          'li.LH36I:nth-child(3) > span:nth-child(1) > span:nth-child(1)',
          (el) => el.textContent
        )
      }

      const profile = {
        Username: getUsername,
        Description: getDescription,
        Posts: getPosts,
        Followers: getFollowers,
        Following: getFollowing,
      }

      console.log(profile)
    }

    // for dev purposes
    await page.waitForTimeout(7000)
  } catch (error) {
    console.log(error)
    await browser.close()
  }

  await browser.close()
}

index()
