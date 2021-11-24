require('dotenv').config()

const puppeteer = require('puppeteer')
const setDevice = puppeteer.devices['iPhone 11 Pro Max']

const index = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  })

  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()

  try {
    await page.emulate(setDevice)

    const usernames = ['nrjdalal']
    const list = []
    for (i = 0; i < usernames.length; i++) {
      await page.goto(`https://www.instagram.com/${usernames[i]}/`)
      await page.waitForTimeout(5000)
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

      let getPosts
      try {
        getPosts = await page.$eval(
          'span._81NM2 > span:nth-child(1)',
          (el) => el.textContent
        )
      } catch {
        getPosts = await page.$eval(
          'li.LH36I:nth-child(1) > a:nth-child(1) > span:nth-child(1)',
          (el) => el.textContent
        )
      }

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

      list.push(profile)
      console.log(list)
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
