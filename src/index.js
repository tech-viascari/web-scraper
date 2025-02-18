import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const port = process.env.PORT || 3000;

app.get('/fetch-links', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the content to load
    await page.waitForSelector('.MuiTypography-root.MuiTypography-caption.MuiTypography-gutterBottom');

    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('.MuiTypography-root.MuiTypography-caption.MuiTypography-gutterBottom a');
      return Array.from(anchors).map(anchor => anchor.href);
    });

    await browser.close();
    const uniqueLinks = Array.from(new Set(links)).filter(link => link);
    res.json(uniqueLinks);
  } catch (error) {
    res.status(500).send('Error fetching links: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
