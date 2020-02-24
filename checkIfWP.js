const puppeteer = require("puppeteer");
const fs = require("fs");

async function verifyWP(file) {
   try {
      const content = await fs.readFileSync(file);
      const jsonDatas = await JSON.parse(content);

      const browser = await puppeteer.launch({ headless: true });

      const verifiedWP = [];

      for (let j = 0; j < jsonDatas.length; j++) {
         let jsonData = jsonDatas[j];
         const website = jsonData.website_link;
         console.log(`Verifying Website ${website}`);

         const page = await browser.newPage();

         console.log(`Start Navigation to ${website}`);
         let response = await page.goto(`${website}/wp-admin`, { timeout: 0 });
         console.log("Navigate...OK");

         let status = response.status();
         console.log(`Get Status =======> ${status}`);

         if (status !== 404) {
            jsonData.status = status;
            jsonData.wp_admin = `${website}/wp-admin`;

            verifiedWP.push(jsonData);
            console.log(`Status: ${status} - ${jsonData.website_name} WP Verified`);
         }

         console.log(`***************  [${j + 1} / ${jsonDatas.length}]  ***************`);

         await page.close();
      }
      await browser.close();

      let data = JSON.stringify(verifiedWP, null, 2);

      fs.writeFile(`./WP Websites/wp_verified ${new Date().toLocaleDateString()} search.json`, data, (err, result) => {
         if (err) console.log("Writing Error", err);
         console.log(`Data written to file ./WP Websites/wp_verified ${new Date().toLocaleDateString()} search.json`);
      });

      // await page.screenshot({ path: "example.png" });
   } catch (err) {
      console.log(err);
   }
}

verifyWP("./WP Websites/best dogs search.json");
