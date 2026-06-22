const puppeteer = require('puppeteer');

async function fetchBeautyRanking() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  );

  await page.goto('https://www.qoo10.com/gmkt.inc/Ranking/RankingMain.aspx?cate1=100000400', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // 뷰티 카테고리 랭킹 데이터 추출
  const items = await page.evaluate(() => {
    const results = [];
    const rows = document.querySelectorAll('.ranking_list li, .rank_list li, li[class*="rank"]');

    rows.forEach((row, i) => {
      if (i >= 10) return;
      const name = row.querySelector('.goods_name, .item_name, a[class*="name"]')?.innerText?.trim();
      const price = row.querySelector('.price, .goods_price, [class*="price"]')?.innerText?.trim();
      const rank = i + 1;
      if (name) results.push({ rank, name, price: price || '가격 정보 없음' });
    });

    return results;
  });

  await browser.close();
  return items;
}

module.exports = { fetchBeautyRanking };
