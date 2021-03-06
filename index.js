const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')

const browser = puppeteer.launch()

const snap = async (content, opts = {}) => {
  let _browser = await browser
  let page = await _browser.newPage()
  let image
  try {
      /* istanbul ignore next */
    page.on('console', msg => console.log(msg.text))
    /* istanbul ignore next */
    page.on('error', err => { throw err })
    /* istanbul ignore next */
    page.on('pageerror', msg => { throw new Error(`Page Error: ${msg}`) })

    if (opts.emulate) {
      await page.emulate(devices[opts.emulate])
    } else if (opts.viewport) {
      await page.setViewport(opts.viewport)
    } else {
      await page.setViewport({width: 1024, height: 768})
    }
    if (opts.userAgent) {
      await page.setUserAgent(opts.userAgent)
    }
    if (content.startsWith('http://') || content.startsWith('https://')) {
      await page.goto(content)
    } else {
      await page.setContent(content)
    }
    if (opts.selector) {
      await page.waitFor(opts.selector, {timeout: 10 * 1000})
    }
    if (!opts.clip) {
      let view = await page.viewport()
      opts.clip = {x: 0, y: 0, width: view.width, height: view.height}
    }

    let captureOptions = {
      fullPage: opts.fullPage,
      clip: opts.clip,
      quality: opts.quality,
      type: opts.type,
      omitBackground: opts.transparency
    }
    image = await page.screenshot(captureOptions)
  } finally {
    await page.close()
  }

  return image
}

module.exports = snap
module.exports.close = async () => {
  let _browser = await browser
  _browser.close()
}
module.exports.devices = Object.keys(devices).filter(k => k.length > 2)
