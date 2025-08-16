'use client';

import Link from 'next/link';

export default function MainPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20 bg-gray-50">
      <div className="w-full max-w-6xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">MY재고장부</h1>
          <p className="text-xl text-gray-600">팝업스토어, 행사전시와 같이 짧은 기간 동안만 운영되는 임시 매장에서 운영되는 개인사업자 및 소규모 법인의 재고를 관리하고, 상품부터 주문까지, 체계적인 재고관리를 위한 시스템</p>
        </div>

        {/* 이용 매뉴얼 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">📚 이용 매뉴얼</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 1. 상품관리 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="text-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
                <h3 className="text-xl font-bold text-blue-800">📦 상품관리</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-2">상품 등록하기</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 상품명, 분류, 설명 입력</li>
                    <li>• 재고수량과 가격 설정</li>
                    <li>• 등록 후 상품목록에서 확인</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border-l-4 border-blue-300">
                  <h4 className="font-semibold text-blue-600 mb-2">💡 팁</h4>
                  <p className="text-sm text-gray-600">
                    상품 등록 시 정확한 재고수량을 입력하세요. 이후 행사나 주문에서 재고가 자동으로 차감됩니다.
                  </p>
                </div>
                
                <Link href="/" className="block w-full bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition-colors">
                  상품관리 바로가기
                </Link>
              </div>
            </div>

            {/* 2. 참여행사 관리 */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="text-center mb-4">
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
                <h3 className="text-xl font-bold text-green-800">🎪 참여행사 관리</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-2">행사 등록하기</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 행사명과 행사일정 입력</li>
                    <li>• 출품할 상품 선택</li>
                    <li>• 상품별 출품수량 설정</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-2">행사별 상품 관리</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 등록된 행사의 출품상품 확인</li>
                    <li>• 상품별 수량 및 금액 확인</li>
                    <li>• 행사 정보 수정 및 삭제</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border-l-4 border-green-300">
                  <h4 className="font-semibold text-green-600 mb-2">💡 팁</h4>
                  <p className="text-sm text-gray-600">
                    행사별로 출품상품을 체계적으로 관리하여 행사 준비를 효율적으로 진행하세요.
                  </p>
                </div>
                
                <Link href="/apply-event" className="block w-full bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition-colors">
                  참여행사 관리 바로가기
                </Link>
              </div>
            </div>

            {/* 3. 주문생성 */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="text-center mb-4">
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
                <h3 className="text-xl font-bold text-purple-800">🛒 주문생성</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-700 mb-2">주문 생성하기</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 고객정보 입력 (이름, 연락처)</li>
                    <li>• 주문할 상품 선택</li>
                    <li>• 상품별 주문수량 입력</li>
                    <li>• 주문 완료 및 확인</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-700 mb-2">주문 관리</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 생성된 주문목록 확인</li>
                    <li>• 주문별 상세정보 조회</li>
                    <li>• 주문 상태 관리</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border-l-4 border-purple-300">
                  <h4 className="font-semibold text-purple-600 mb-2">💡 팁</h4>
                  <p className="text-sm text-gray-600">
                    주문 생성 시 재고수량을 확인하여 적절한 수량을 주문하세요. 재고 부족 시 알림이 표시됩니다.
                  </p>
                </div>
                
                <Link href="/create-order" className="block w-full bg-purple-500 text-white text-center py-2 rounded hover:bg-purple-600 transition-colors">
                  주문생성 바로가기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">🚀 빠른 시작 가이드</h2>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold">STEP 1</h3>
              <p className="text-sm opacity-90">상품을 등록하고 기본 정보를 입력합니다</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="font-semibold">STEP 2</h3>
              <p className="text-sm opacity-90">참여할 행사를 등록하고 출품상품을 선택합니다</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold">STEP 3</h3>
              <p className="text-sm opacity-90">고객 주문을 생성하고 재고를 관리합니다</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold">STEP 4</h3>
              <p className="text-sm opacity-90">주문목록에서 전체 현황을 확인합니다</p>
            </div>
          </div>
        </div>

        {/* 기능 소개 */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-gray-800">✨ 주요 기능</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                실시간 재고 관리 및 추적
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                행사별 상품 출품 관리
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                고객 주문 생성 및 관리
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                직관적이고 사용하기 쉬운 인터페이스
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📞 도움이 필요하신가요?</h3>
            <p className="text-gray-700 mb-4">
              시스템 사용 중 궁금한 점이나 문제가 있으시면 언제든지 문의해 주세요.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 각 페이지별 자세한 사용법은 해당 페이지에서 확인하실 수 있습니다</p>
              <p>• 데이터는 실시간으로 저장되어 안전하게 관리됩니다</p>
              <p>• 모든 기능은 웹 브라우저에서 바로 사용 가능합니다</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}