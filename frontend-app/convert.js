const fs = require('fs');
const Papa = require('papaparse');
const proj4 = require('proj4');

proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");

// =================================================================
// 1. 파일별 분류 및 태그 규칙 정의
// =================================================================
const FILE_CONFIGS = [
    // (이 부분은 이전 코드와 동일)
    { path: './csv/fulldata_07_24_04_P_일반음식점_utf8.csv', mainCategory: '맛집', type: 'food' },
    { path: './csv/fulldata_07_24_05_P_휴게음식점_utf8.csv', mainCategory: '카페', type: 'food' },
    { path: './csv/fulldata_03_05_05_P_인터넷컴퓨터게임시설제공업_utf8.csv', mainCategory: '놀거리', type: 'play' },
    // ... 모든 파일 경로
];

// ✅ [업그레이드] '업태구분명'으로 세부 카테고리를 결정하는 규칙 (훨씬 상세해짐)
const UPTAE_TO_SUBCATEGORY = {
    // 맛집
    '한식': '한식', '일식': '일식/횟집', '횟집': '일식/횟집', '복어취급': '일식/횟집',
    '중국식': '중식', '경양식': '양식', '서양식':'양식', '패밀리레스트랑': '양식', '외국음식전문점(인도,태국등)': '세계음식',
    '분식': '분식', '김밥(도시락)': '분식', '뷔페식': '뷔페',
    '호프/통닭': '치킨', '통닭(치킨)': '치킨',
    '식육(숯불구이)': '고기/구이',
    '정종/대포집/소주방': '술집/포차', '감성주점': '술집/포차', '라이브카페': '술집/포차',
    '패스트푸드': '패스트푸드',
    // 카페
    '까페': '카페', '커피숍': '카페', '제과점': '베이커리', '과자점': '베이커리', '아이스크림': '아이스크림',
    '다방': '전통찻집', '전통찻집': '전통찻집', '떡카페': '떡카페',
    // 놀거리
    '인터넷컴퓨터게임시설제공업': 'PC방', '노래연습장업': '노래방', '당구장업': '당구장', '복합영상물제공업': '멀티방',
    '청소년게임제공업': '오락실', '목욕장업': '목욕탕/사우나', '찜질시설서비스영업': '찜질방', '한증막업': '찜질방',
    '체력단련장업': '헬스장', '빙상장업': '빙상장', '썰매장업': '썰매장', '스키장업': '스키장', '종합체육시설업': '스포츠',
    // 문화/관광
    '영화상영관': '영화관', '영화상영업': '영화관', '공연장': '공연장', '박물관': '박물관/미술관', '미술관': '박물관/미술관',
    '관광궤도업': '케이블카/궤도', '유원시설업': '테마파크', '일반유원시설업': '테마파크', '종합유원시설업': '테마파크',
};

// =================================================================
// 2. 분류 및 태그 생성 함수 (업그레이드)
// =================================================================
function determineSubCategory(row, config) {
    const uptae = row.업태구분명 || row.문화체육업종명 || row.위생업태명 || '';
    let subCategory = '기타';

    // 1. 업태명으로 1차 분류
    for (const [key, value] of Object.entries(UPTAE_TO_SUBCATEGORY)) {
        if (uptae.includes(key)) {
            subCategory = value;
            break;
        }
    }

    // 2. 사업장명으로 2차 세분화 (특별 규칙)
    const name = row.사업장명 || '';
    if (config.mainCategory === '맛집') {
        if (name.includes('족발') || name.includes('보쌈')) subCategory = '족발/보쌈';
        else if (name.includes('피자')) subCategory = '피자';
        else if (name.includes('갈비') || name.includes('삼겹') || name.includes('곱창')) subCategory = '고기/구이';
        else if (subCategory === '기타' || subCategory === '음식점') subCategory = '기타 맛집';
    }
    if (config.mainCategory === '문화/관광' && (name.includes('키즈') || name.includes('어린이'))) {
        subCategory = '키즈카페';
    }

    return subCategory;
}

function generateTags(row, subCategory) {
    const tags = new Set();
    tags.add(subCategory);
    if (row.사업장명?.includes('데이트')) tags.add('데이트');
    if (row.사업장명?.includes('가족')) tags.add('가족외식');
    return Array.from(tags);
}

// =================================================================
// 3. 메인 파싱 로직 (스트리밍 방식 유지)
// =================================================================
async function processFiles() {
    let allData = [];
    let idCounter = 1;

    for (const config of FILE_CONFIGS) {
        if (!fs.existsSync(config.path)) {
            console.warn(`\n[경고] 파일을 찾을 수 없습니다: ${config.path}. 건너뜁니다.`);
            continue;
        }

        console.log(`\n[정보] 스트리밍 처리를 시작합니다: ${config.path}`);
        let processedCount = 0, includedCount = 0, skippedCount = 0;

        const parsedData = await new Promise((resolve) => {
            const data = [];
            Papa.parse(fs.createReadStream(config.path, 'utf8'), {
                header: true,
                skipEmptyLines: true,
                step: (result) => {
                    processedCount++;
                    const row = result.data;
                    const isValid = row.영업상태명 === '영업/정상' &&
                        row.사업장명 &&
                        (row.도로명전체주소 || row.소재지전체주소) &&
                        row['좌표정보x(epsg5174)'] &&
                        row['좌표정보y(epsg5174)'];

                    if (isValid) {
                        try {
                            const x = parseFloat(row['좌표정보x(epsg5174)']);
                            const y = parseFloat(row['좌표정보y(epsg5174)']);
                            if (isNaN(x) || isNaN(y)) throw new Error();

                            const [lon, lat] = proj4("EPSG:5174", "WGS84", [x, y]);
                            const subCategory = determineSubCategory(row, config);
                            const tags = generateTags(row, subCategory);

                            data.push({
                                id: String(idCounter++),
                                name: row.사업장명,
                                address: row.도로명전체주소 || row.소재지전체주소,
                                mainCategory: config.mainCategory,
                                subCategory: subCategory,
                                tags: tags,
                                rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
                                image: `https://picsum.photos/seed/${idCounter}/600/400`,
                                coordinate: { latitude: lat, longitude: lon }
                            });
                            includedCount++;
                        } catch(e) { skippedCount++; }
                    } else { skippedCount++; }

                    if (processedCount % 1000 === 0) {
                        process.stdout.write(`[진행] 처리된 행: ${processedCount} (포함: ${includedCount}, 제외: ${skippedCount})\r`);
                    }
                },
                complete: () => {
                    process.stdout.write('\n');
                    console.log(`[정보] 파일 처리 완료: ${config.path} (총 ${includedCount}개 포함)`);
                    resolve(data);
                },
                error: (error) => { resolve([]); }
            });
        });
        allData = allData.concat(parsedData);
    }

    console.log('\n[정보] 모든 파일 처리가 완료되었습니다. places.json 파일에 저장합니다...');
    fs.writeFileSync('places.json', JSON.stringify(allData, null, 2));
    console.log(`✅ [성공] 총 ${allData.length}개의 항목을 places.json 파일에 저장했습니다.`);
}

processFiles();