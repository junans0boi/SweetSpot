import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../apiClient';
import Swal from 'sweetalert2';

export default function ReviewListPage() {
    const { placeId } = useParams(); // URL 파라미터
    const navigate = useNavigate();
    const { handleLogout } = useOutletContext();
    
    const [reviews, setReviews] = useState([]);
    const [placeName, setPlaceName] = useState(''); // 장소 이름 표시용
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 리뷰 목록 및 장소 정보 불러오기
    const fetchReviews = async () => {
        try {
            setLoading(true);
            // 관리자용 리뷰 조회 API 호출 (페이징이 필요하면 params 추가)
            // 백엔드: AdminPlaceController에 해당 엔드포인트가 있어야 함
            const response = await apiClient.get(`/places/${placeId}/reviews`);
            
            // 응답 구조에 따라 데이터 세팅 (List<ReviewResponse> 가정)
            setReviews(response.data);
            
            // (선택) 장소 상세 정보를 가져와서 제목에 표시하고 싶다면 추가 호출
            // const placeRes = await apiClient.get(`/places/${placeId}`);
            // setPlaceName(placeRes.data.name);

            setError(null);
        } catch (err) {
            console.error("리뷰 목록 로딩 실패:", err);
            setError("데이터를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [placeId]);

    // 2. 개별 리뷰 삭제 핸들러
    const handleDeleteReview = (reviewId) => {
        Swal.fire({
            title: '리뷰 삭제',
            text: "해당 리뷰를 영구적으로 삭제하시겠습니까?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // 관리자용 리뷰 삭제 API 호출
                    await apiClient.delete(`/reviews/${reviewId}`);
                    Swal.fire('삭제 완료', '리뷰가 삭제되었습니다.', 'success');
                    fetchReviews(); // 목록 새로고침
                } catch (err) {
                    console.error("리뷰 삭제 실패:", err);
                    Swal.fire('삭제 실패', err.response?.data?.message || '오류가 발생했습니다.', 'error');
                }
            }
        });
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* 상단 헤더 */}
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    리뷰 관리 <span className="text-sm font-normal text-gray-500">(Place ID: {placeId})</span>
                </h1>
                <div>
                    <button
                        onClick={() => navigate('/admin/places')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200 mr-4"
                    >
                        뒤로가기
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 p-6 overflow-y-auto">
                {loading && <p className="text-gray-600">데이터를 불러오는 중...</p>}
                {error && <p className="text-red-500 font-bold">{error}</p>}

                {!loading && !error && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평점</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">내용</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {review.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {review.authorName} <br/>
                                                <span className="text-xs text-gray-400">{review.authorEmail}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold">
                                                ★ {review.rating}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 break-all">
                                                {review.text}
                                                {/* 사진이 있으면 표시 */}
                                                {review.photoUrls && review.photoUrls.length > 0 && (
                                                    <div className="flex mt-2 space-x-2">
                                                        {review.photoUrls.map((url, idx) => (
                                                            <img key={idx} src={url} alt="review" className="w-16 h-16 object-cover rounded border" />
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded border border-red-200 hover:bg-red-100 transition"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            등록된 리뷰가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}