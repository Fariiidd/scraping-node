const puppeter = require("puppeteer");
const userAgent = require("random-useragent");
const ExcelJS = require("exceljs");

let arrPaginate = [];

let count = 0;

let browser;

let page;

let data = [];


const saveExcel = (data) => {
  const workBook = new ExcelJS.Workbook();

  const fileName = "listado-de-iphones.xlsx";

  const sheet = workBook.addWorksheet("Resultados");

  const reColumns = [
    { header: "Descripción", key: "desc" },
    { header: "Precio", key: "price" },
    { header: "Imagen", key: "image" },
  ];

  sheet.columns = reColumns;

  sheet.addRows(data);

  workBook.xlsx
    .writeFile(fileName)
    .then(() => {
      console.log(`El excel se creo exitosamente`);
    })
    .catch(() => {
      console.log(`Algo salio mal con el archivo excel`);
    });
};

const init = async (url = false) => {
  const urlMain = "https://listado.mercadolibre.com.ar/iphone#D[A:iphone]";

  const header = userAgent.getRandom();

  console.log(`Vuelta numero: ${count}`);
  console.log(`Visitando pagina: ${url}`);

  if (url === false) {
    browser = await puppeter.launch({ headless: false });
    page = await browser.newPage();
    await page.setUserAgent(header);
    await page.setViewport({ width: 1860, height: 1080 });
  }

  if (count > 5) {
    console.log("Se terminaron las vueltas");
    await browser.close();
  } else {
    await page.goto(url ? url : urlMain);

    await page.screenshot({ path: "example.png" });

    await page.waitForSelector(".ui-search-results");

    const nextButton = await page.$(".andes-pagination__button--next a");

    const getUrl = await nextButton.evaluate(
      (nextButton) => nextButton.getAttribute("href"),
      nextButton
    );

    const listItems = await page.$$(".ui-search-layout__item");


    for (const item of listItems) {
      const price = await item.$(".price-tag-fraction");
      const desc = await item.$(".ui-search-item__title");
      const image = await item.$(".ui-search-result-image__element");

      const getPrice = await page.evaluate((price) => price.innerText, price);
      const getDesc = await page.evaluate((desc) => desc.innerText, desc);
      const getImage = await page.evaluate(
        (image) => image.getAttribute("src"),
        image
      );

      data.push({
        desc: getDesc,
        price: getPrice,
        image: getImage,
      });
    }
    count++;

    saveExcel(data);
    init(getUrl);
  }
};

init();
