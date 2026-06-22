const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

async function generateComment(items) {
  const itemList = items.map(i => `${i.rank}위: ${i.name} (${i.price})`).join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `다음은 Qoo10 실시간 뷰티 랭킹 1~10위입니다:\n\n${itemList}\n\n각 상품에 대해 2~3문장의 트렌드 분석 코멘트를 작성해주세요. 왜 인기인지, 어떤 소비자층에게 어필하는지 간결하게 써주세요. JSON 배열로 반환하되 형식은 [{"rank": 1, "comment": "..."}] 입니다.`,
      },
    ],
  });

  const raw = message.content[0].text;
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

function buildHTML(items, comments) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const rows = items.map(item => {
    const c = comments.find(c => c.rank === item.rank);
    return `
    <div class="card">
      <div class="rank">${item.rank}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="price">${item.price}</div>
        <div class="comment">${c ? c.comment : ''}</div>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Qoo10 뷰티 트렌드 리포트</title>
  <style>
    body { font-family: 'Apple SD Gothic Neo', sans-serif; background: #f9f9f9; padding: 40px; color: #222; }
    h1 { font-size: 1.8rem; margin-bottom: 4px; }
    .date { color: #888; margin-bottom: 32px; font-size: 0.9rem; }
    .card { display: flex; background: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); gap: 20px; align-items: flex-start; }
    .rank { font-size: 2rem; font-weight: 700; color: #e63946; min-width: 48px; text-align: center; line-height: 1; padding-top: 4px; }
    .name { font-size: 1.05rem; font-weight: 600; margin-bottom: 4px; }
    .price { font-size: 0.9rem; color: #e63946; margin-bottom: 8px; }
    .comment { font-size: 0.92rem; color: #555; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Qoo10 뷰티 트렌드 리포트</h1>
  <div class="date">${today} 기준 실시간 랭킹</div>
  ${rows}
</body>
</html>`;
}

async function generateReport(items) {
  console.log('Claude가 분석 코멘트를 작성 중입니다...');
  const comments = await generateComment(items);
  const html = buildHTML(items, comments);

  const outputPath = path.join(__dirname, 'report.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`리포트 저장 완료: ${outputPath}`);
  return outputPath;
}

module.exports = { generateReport };
