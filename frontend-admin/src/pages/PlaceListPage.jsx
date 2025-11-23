import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';
import PlaceEditModal from '../components/PlaceEditModal';

export default function PlaceListPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleLogout } = useOutletContext();

  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [categoryList, setCategoryList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    category: '',
    keyword: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const PAGE_SIZE = 20;

  const fetchPlaces = async (page, filters) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/places', {
        params: {
          page: page,
          size: PAGE_SIZE,
          mainCategory: filters.category,
          keyword: filters.keyword,
          sort: 'id,asc'
        }
      });

      setPlaces(response.data.content);
      setPageInfo(response.data);
      setError(null);
    } catch (err) {
      console.error("장소 목록 로딩 실패:", err);
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/places/categories');
      setCategoryList(response.data);
    } catch (err) {
      console.error("카테고리 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPlaces(currentPage, activeFilters);
  }, [currentPage, activeFilters]);

  const handleDeleteAll = () => {
    Swal.fire({
      title: '정말로 모든 장소 데이터를 삭제하시겠습니까?',
      text: "DB에서 모든 장소 데이터가 영구적으로 삭제되며, 복구할 수 없습니다!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '전체 삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        apiClient.delete('/places/all')
          .then((response) => {
            Swal.fire('삭제 완료!', response.data, 'success');
            clearSearch();
          })
          .catch((err) => {
            Swal.fire('삭제 실패', err.response?.data || '오류가 발생했습니다.', 'error');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  const handleLoadFromDisk = async () => {
    Swal.fire({
      title: '서버 JSON 일괄 등록',
      text: "서버의 JSON 파일을 DB로 적재합니다. 몇 분 이상 소요될 수 있습니다. 실행하시겠습니까?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '실행',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await apiClient.post('/places/import-json');
          const jobId = response.data;

          Swal.fire({
            title: '데이터 적재 중...',
            html: '서버에서 작업을 시작합니다...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const intervalId = setInterval(async () => {
            try {
              const statusResponse = await apiClient.get(`/places/status/${jobId}`);
              const statusData = statusResponse.data;
              const status = statusData.status;

              const swalContent = Swal.getHtmlContainer();
              if (swalContent) {
                swalContent.textContent = status;
              }

              if (status.startsWith("COMPLETED") || status.startsWith("FAILED")) {
                clearInterval(intervalId);
                setLoading(false);
                clearSearch();

                if (status.startsWith("COMPLETED")) {
                  Swal.fire('성공!', status.replace("COMPLETED: ", ""), 'success');
                } else {
                  Swal.fire('실패', status.replace("FAILED: ", ""), 'error');
                }
              }
            } catch (pollErr) {
              console.error("상태 조회 실패:", pollErr);
              clearInterval(intervalId);
              setLoading(false);
              Swal.fire('오류', '작업 상태를 조회하는 데 실패했습니다.', 'error');
            }
          }, 2000);

        } catch (startErr) {
          console.error("JSON 일괄 적재 시작 실패:", startErr);
          Swal.fire('실패', startErr.response?.data || '작업 시작에 실패했습니다.', 'error');
          setLoading(false);
        }
      }
    });
  };

  // --- 👇 [신규] 데이터 변환 실행 핸들러 ---
  const handleDataTransform = () => {
    Swal.fire({
        title: '데이터 변환 실행',
        text: "임시 테이블(raw)의 데이터를 메인 테이블로 변환합니다. JSON 임포트 후에 실행해주세요.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '실행',
        cancelButtonText: '취소'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await apiClient.post('/places/transform/run');
                Swal.fire('시작됨', response.data, 'success');
            } catch (error) {
                Swal.fire('오류', error.response?.data || '데이터 변환 작업 시작에 실패했습니다.', 'error');
            }
        }
    });
  };

  // --- 👇 [신규] 지오코딩 실행 핸들러 ---
  const handleGeocoding = () => {
    Swal.fire({
        title: '수동 지오코딩 실행',
        text: "좌표가 없는 장소 데이터에 대해 주소 기반 지오코딩을 실행합니다. (API 할당량 소모)",
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '실행',
        cancelButtonText: '취소'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await apiClient.post('/places/geocoding/run');
                Swal.fire('시작됨', response.data, 'success');
            } catch (error) {
                Swal.fire('오류', error.response?.data || '지오코딩 작업 시작에 실패했습니다.', 'error');
            }
        }
    });
  };


  const handleSearch = () => {
    setCurrentPage(0);
    setActiveFilters({
      category: filterCategory,
      keyword: filterKeyword
    });
  };

  const clearSearch = () => {
    setCurrentPage(0);
    setFilterCategory('');
    setFilterKeyword('');
    setActiveFilters({ category: '', keyword: '' });
  };

  const goToPage = (page) => {
    if (pageInfo && page >= 0 && page < pageInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (place) => {
    setEditingPlace(place);
    setIsEditModalOpen(true);
  };

  const handleUpdatePlace = async (updatedPlaceData) => {
    try {
      setLoading(true);
      await apiClient.put(`/places/${updatedPlaceData.id}`, updatedPlaceData);
      Swal.fire('수정 완료', '장소 정보가 성공적으로 업데이트되었습니다.', 'success');
      setIsEditModalOpen(false);
      setEditingPlace(null);
      fetchPlaces(currentPage, activeFilters);
    } catch (err) {
      console.error("장소 수정 실패:", err);
      Swal.fire('수정 실패', err.response?.data?.message || '장소 정보 업데이트에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = (placeId, placeName) => {
    Swal.fire({
      title: `[${placeName}] 장소를 삭제하시겠습니까?`,
      text: "삭제된 데이터는 복구할 수 없습니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: '취소',
      confirmButtonText: '삭제'
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        apiClient.delete(`/places/${placeId}`)
          .then(() => {
            Swal.fire('삭제 완료!', `[${placeName}] 장소가 삭제되었습니다.`, 'success');
            fetchPlaces(currentPage, activeFilters);
          })
          .catch((err) => {
            Swal.fire('삭제 실패', err.response?.data || '오류가 발생했습니다.', 'error');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">장소 관리</h1>
        <div className="flex items-center space-x-2">
          {/* --- 👇 [수정] 데이터 관리 버튼 그룹 --- */}
          <button
            onClick={handleLoadFromDisk}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-blue-300"
          >
            {loading ? '처리 중...' : 'JSON 임포트'}
          </button>
          <button
            onClick={handleDataTransform}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-green-300"
          >
            {loading ? '처리 중...' : '데이터 변환'}
          </button>
          <button
            onClick={handleGeocoding}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-purple-300"
          >
            {loading ? '처리 중...' : '지오코딩'}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-yellow-300"
          >
            {loading ? '처리 중...' : '전체 삭제'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none 
    focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- 전체 카테고리 --</option>
              {categoryList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">매장명 또는 주소</label>
            <input
              type="text"
              id="keyword"
              placeholder="매장명 또는 주소 일부..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 
    focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-1 flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
            >
              검색
            </button>
            <button
              onClick={clearSearch}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-200 w-full"
            >
              초기화
            </button>
          </div>
        </div>

        {loading && <p>로딩 중...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {places.map((place) => (
                <tr key={place.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{place.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{place.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{place.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{place.mainCategory} &gt; {place.subCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/places/${place.id}/reviews`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      리뷰 보기
                    </button>
                    <button
                      onClick={() => handleEdit(place)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeletePlace(place.id, place.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageInfo && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
              총 {pageInfo.totalElements}개 항목 중 {pageInfo.numberOfElements}개 표시 (페이지 {pageInfo.number + 1} / {pageInfo.totalPages})
            </span>
            <div className="space-x-2">
              <button
                onClick={() => goToPage(pageInfo.number - 1)}
                disabled={pageInfo.first}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={() => goToPage(pageInfo.number + 1)}
                disabled={pageInfo.last}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </main>
      {isEditModalOpen && (
        <PlaceEditModal
          place={editingPlace}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdatePlace}
        />
      )}
    </div>
  );
}
