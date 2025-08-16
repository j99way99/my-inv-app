'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, token, isLoading } = useAuth();

  // Don't show menu on auth pages or when loading
  if (isLoading || !token) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <div className="w-6 h-0.5 bg-gray-800 mb-1.5"></div>
        <div className="w-6 h-0.5 bg-gray-800 mb-1.5"></div>
        <div className="w-6 h-0.5 bg-gray-800"></div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 mt-16">
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold">메뉴</h2>
                <p className="text-sm text-gray-600 mt-1">{user?.name}님 환영합니다</p>
              </div>
              <nav className="space-y-2">
                <Link 
                  href="/main" 
                  className="block p-2 hover:bg-gray-100 rounded font-semibold text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  🏠 메인 페이지
                </Link>
                <Link 
                  href="/" 
                  className="block p-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  📦 상품 관리
                </Link>
                <Link 
                  href="/apply-event" 
                  className="block p-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  🎪 참여행사 재고관리
                </Link>
                <Link 
                  href="/create-order" 
                  className="block p-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  🛒 주문 생성
                </Link>
                <Link 
                  href="/order-list" 
                  className="block p-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  📋 주문 목록
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-red-100 rounded text-red-600"
                >
                  로그아웃
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}