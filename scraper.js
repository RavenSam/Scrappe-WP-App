const puppeteer = require("puppeteer");
const fs = require("fs");

// Extract The Web Site Links From The Url
const getSiteInfo = url => {
   const obj = {};
   const spl = url
      .split("/")
      .slice(0, 3)
      .filter(x => x !== "");

   obj.website_name = spl[1].split(".").length > 2 ? spl[1].split(".")[1] : spl[1].split(".")[0];
   obj.website_link = spl.join("//");

   return obj;
};

async function scrapeData(searchAbout) {
   try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent(
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
      );

      await page.goto("https://google.com");
      await page.waitForSelector(".a4bIc");
      console.log("Page Loaded... OK");

      await page.type("input.gLFyf.gsfi", searchAbout);
      page.keyboard.press("Enter");
      console.log("Serching... OK");

      await page.waitForSelector("#search", { timeout: 0 });
      console.log("Search Result Loaded...OK");

      // await page.waitForSelector("#nav");
      const pages = await page.$$("td a.fl");
      console.log("Pages... OK");

      const datas = [];

      for (let p = 0; p < pages.length; p++) {
         await page.waitForSelector("#search", { timeout: 0 });
         console.log("Search Result Loaded...OK");

         const links = await page.$$(".rc");
         console.log("Serching Links... OK");

         // Loop throw the result links
         for (let i = 0; i < links.length; i++) {
            const link = await links[i];
            // console.log("Link defined...OK");

            const searchUrl = await link.$eval(".r > a[href]", a => a.getAttribute("href"));
            // console.log("Searchs Url...OK");

            const searchTitle = await link.$eval(".r h3", h3 => h3.innerHTML);
            // console.log("Search Title...OK");

            const info = getSiteInfo(searchUrl);

            info.search_url = searchUrl;
            info.search_title = searchTitle;
            info.page_number = `Page ${p + 1}`;
            info.search_date = new Date().toLocaleDateString();
            info.search_about = searchAbout;

            datas.push(info);
            // console.log("Info Pushed To Data");
         }

         await page.waitForSelector("#nav");
         console.log("Nav Loaded...OK");

         const nav = await page.$("#nav");
         console.log("Nav Selected...OK");

         const pageNum = await nav.$eval(".cur", td => td.textContent);
         console.log(`Page Number ===> ${pageNum}`);

         const next = await page.$("#pnnext");
         console.log("Next Selected...OK");

         await next.click();
         console.log("Next Clicked...OK");
      }

      let data = JSON.stringify(datas, null, 2);

      fs.writeFile(`./data/${searchAbout} search.json`, data, (err, result) => {
         if (err) console.log("error", err);
         console.log(`Data written to file ./data/${searchAbout} search.json`);
      });

      await browser.close();
   } catch (err) {
      console.log({ myError: err });
   }
}

scrapeData("best dogs");
