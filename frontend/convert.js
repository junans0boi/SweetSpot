const fs = require('fs');
const Papa = require('papaparse');

// =================================================================
// 1. 태그 규칙 정의
// =================================================================

// 업태구분명 키워드에 따른 태그 매핑
// key: CSV의 '업태구분명'에 포함된 키워드
// value: 부여할 태그 배열
const CATEGORY_TO_TAGS = {
    // --- 카페/디저트 ---
    '까페': ['카페·디저트', '데이트'],
    '커피숍': ['카페·디저트', '데이트', '공부하기좋은'],
    '다방': ['카페·디저트'],
    '아이스크림': ['카페·디저트'],
    '제과점': ['카페·디저트'],
    // --- 음식점 ---
    '한식': ['맛집(음식점)', '한식'],
    '일식': ['맛집(음식점)', '일식', '데이트', '특별한날'],
    '중국식': ['맛집(음식점)', '중식'],
    '경양식': ['맛집(음식점)', '양식', '데이트', '특별한날'],
    '레스토랑': ['맛집(음식점)', '양식', '데이트', '특별한날'],
    '뷔페식': ['맛집(음식점)', '가족외식', '특별한날'],
    '분식': ['맛집(음식점)', '분식', '혼밥/혼술'],
    '패스트푸드': ['맛집(음식점)', '패스트푸드', '혼밥/혼술'],
    '기타': ['맛집(음식점)'], // 기본 '맛집' 태그
    // --- 술집 ---
    '호프/통닭': ['맛집(음식점)', '술집', '치킨', '친구와'],
    '정종/대포집/소주방': ['술집', '친구와', '회식'],
    '라이브카페': ['술집', '데이트', '특별한날'],
    '감성주점': ['술집', '데이트'],
    '유흥주점': ['술집'],
};

// 사업장명 키워드에 따른 태그 매핑
// 가게 이름에 특정 키워드가 포함될 경우 추가 태그 부여
const NAME_TO_TAGS = {
    '치킨': ['치킨'],
    '피자': ['피자'],
    '갈비': ['고기', '한식'],
    '삼겹살': ['고기', '한식', '회식'],
    '곱창': ['고기', '한식', '술집'],
    '족발': ['족발·보쌈', '야식'],
    '보쌈': ['족발·보쌈', '야식'],
    '파스타': ['파스타', '양식', '데이트'],
    '돈까스': ['돈까스·회·일식'],
    '회': ['돈까스·회·일식', '술집', '회식'],
    '포차': ['술집', '친구와'],
    '주점': ['술집'],
    '맥주': ['술집', '친구와'],
};


// =================================================================
// 2. 태그 생성 함수
// =================================================================
function generateTags(row) {
    const { 업태구분명, 사업장명 } = row;
    // 중복 태그를 방지하기 위해 Set 사용
    const tags = new Set();

    // 1. 업태구분명 기준으로 태그 부여
    if (업태구분명) {
        for (const keyword in CATEGORY_TO_TAGS) {
            if (업태구분명.includes(keyword)) {
                CATEGORY_TO_TAGS[keyword].forEach(tag => tags.add(tag));
            }
        }
    }

    // 2. 사업장명 기준으로 추가 태그 부여
    if (사업장명) {
        for (const keyword in NAME_TO_TAGS) {
            if (사업장명.includes(keyword)) {
                NAME_TO_TAGS[keyword].forEach(tag => tags.add(tag));
            }
        }
    }

    // 3. 기본 태그 부여 로직 (태그가 하나도 없는 경우)
    if (tags.size === 0) {
        if (row.개방서비스명 === '일반음식점') {
            tags.add('맛집(음식점)');
        } else if (row.개방서비스명 === '휴게음식점') {
            tags.add('카페·디저트');
        }
    }

    // Set을 배열로 변환하여 반환
    return Array.from(tags);
}


// =================================================================
// 3. 메인 파싱 로직
// =================================================================

const files = [
    './csv/6410000_경기도_07_24_04_P_일반음식점_utf8.csv',
    './csv/6410000_경기도_07_24_05_P_휴게음식점_utf8.csv'
];

let allData = [];
let idCounter = 1;

async function processFiles() {
    for (const file of files) {
        console.log(`Processing ${file} with streaming...`);
        const parsedData = await new Promise((resolve, reject) => {
            const data = [];
            const stream = fs.createReadStream(file, 'utf8');

            Papa.parse(stream, {
                header: true,
                skipEmptyLines: true,
                step: (result) => {
                    const row = result.data;
                    if (row.영업상태명 === '영업/정상') {
                        // ===========================================
                        // generateTags 함수 호출하여 tags 필드 추가
                        // ===========================================
                        const tags = generateTags(row);

                        data.push({
                            id: String(idCounter++),
                            name: row.사업장명,
                            address: row.도로명전체주소 || row.소재지전체주소,
                            category: row.업태구분명, // 기존 category는 유지
                            tags: tags, // ◀◀◀ 새로 생성된 태그 배열 추가
                            rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
                            reviews: Math.floor(Math.random() * 200) + 1,
                            image: `https://picsum.photos/seed/${idCounter}/600/400`,
                            coordinate: {
                                latitude: parseFloat(row['좌표정보y(epsg5174)']),
                                longitude: parseFloat(row['좌표정보x(epsg5174)']),
                            },
                        });
                    }
                },
                complete: () => {
                    resolve(data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
        allData = allData.concat(parsedData);
    }

    fs.writeFileSync('restaurants.json', JSON.stringify(allData, null, 2));
    console.log(`✅ Success! ${allData.length} items with tags saved to restaurants.json`);
}

processFiles();