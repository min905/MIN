const { fetchBeautyRanking } = require('./scraper');
const { generateReport } = require('./report');

(async () => {
  console.log('Qoo10 뷰티 랭킹 수집 중...');
  const items = await fetchBeautyRanking();

  if (!items.length) {
    console.log('랭킹 데이터를 가져오지 못했습니다. 사이트 구조가 변경되었을 수 있습니다.');
    process.exit(1);
  }

  console.log(`${items.length}개 상품 수집 완료`);
  await generateReport(items);
})();
