const fs = require('fs');
const JSONStream = require('jsonstream');

const INPUT_FILE = './places.json';
const OUTPUT_FILE = './src/data/places.mock.json'; // ✅ 저장할 위치
const FILTER_KEY = '경기도 군포시';

console.log(`[정보] '${INPUT_FILE}' 파일을 스트리밍으로 읽어 필터링을 시작합니다...`);

const gunpoData = [];
let processedCount = 0;

// 1. 거대한 JSON 파일을 읽는 스트림을 엽니다.
const readStream = fs.createReadStream(INPUT_FILE, 'utf8');

// 2. JSON 스트림을 파싱합니다. ('*'는 "배열 안의 모든 객체"를 의미)
const parser = JSONStream.parse('*');

// 3. 파이프를 통해 데이터를 흘려보냅니다.
readStream.pipe(parser);

// 4. 데이터가 한 줄씩 파싱될 때마다 'data' 이벤트가 발생합니다.
parser.on('data', (place) => {
    processedCount++;
    if (processedCount % 10000 === 0) {
        process.stdout.write(`[진행] ${processedCount}개 항목 스캔 중...\r`);
    }

    // 5. 주소 필터링
    if (place && place.address && place.address.includes(FILTER_KEY)) {
        gunpoData.push(place);
    }
});

// 6. 파일 읽기가 모두 끝나면 'end' 이벤트가 발생합니다.
parser.on('end', () => {
    process.stdout.write('\n');
    console.log(`[정보] 총 ${processedCount}개 항목 스캔 완료.`);
    console.log(`[성공] ${FILTER_KEY} 데이터 ${gunpoData.length}개를 '${OUTPUT_FILE}'에 저장합니다.`);
    
    // 7. 필터링된 데이터를 새 파일로 저장합니다.
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gunpoData, null, 2));
});

parser.on('error', (err) => {
    console.error('[오류] JSON 파싱 중 오류가 발생했습니다:', err);
});
