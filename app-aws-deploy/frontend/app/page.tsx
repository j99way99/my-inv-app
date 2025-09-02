'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface Item {
  _id: string;
  itemNumber: string;
  name: string;
  category: string;
  description: string;
  stockQuantity: number;
  price: number;
  salesQuantity: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function Home() {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isPublicView, setIsPublicView] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      let response;
      if (token) {
        // Fetch user's actual items if logged in
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsPublicView(false);
      } else {
        // Fetch public/sample items if not logged in
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/public`);
        setIsPublicView(true);
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('stockQuantity', stockQuantity);
      formData.append('price', price);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (response.ok) {
        setName('');
        setCategory('');
        setDescription('');
        setStockQuantity('');
        setPrice('');
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchItems();
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <h1 className="text-4xl font-bold mb-8">MY재고장부</h1>
      
      {isPublicView && (
        <div className="w-full max-w-4xl mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">환영합니다!</h2>
          <p className="text-gray-700 mb-4">
            MY재고장부는 팝업스토어, 행사전시를 위한 임시 매장 재고관리 시스템입니다.
            아래는 샘플 데이터이며, 실제 재고 관리를 위해서는 로그인이 필요합니다.
          </p>
          <div className="flex gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              로그인
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      )}
      
      {!isPublicView && (
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품명을 입력하세요"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            상품분류 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="상품분류를 입력하세요"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            상품설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상품설명을 입력하세요"
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            재고수량 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                setStockQuantity(value);
              }
            }}
            placeholder="재고수량을 입력하세요"
            className="w-full p-2 border rounded"
            required
            min="0"
            step="1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            가격 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setPrice(value);
              }
            }}
            placeholder="가격을 입력하세요"
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            상품 이미지
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          상품 추가
        </button>
        </form>
      )}

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">
          {isPublicView ? '샘플 상품 목록' : '상품 목록'}
        </h2>
        {items.length === 0 ? (
          <p>등록된 상품이 없습니다</p>
        ) : (
          <>
            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">이미지</th>
                    <th className="border p-2">상품번호</th>
                    <th className="border p-2">상품명</th>
                    <th className="border p-2">분류</th>
                    <th className="border p-2">재고수량</th>
                    <th className="border p-2">가격</th>
                    <th className="border p-2">판매수량</th>
                    <th className="border p-2">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="border p-2">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="border p-2">{item.itemNumber || '-'}</td>
                      <td className="border p-2">{item.name || '-'}</td>
                      <td className="border p-2">{item.category || '-'}</td>
                      <td className="border p-2 text-center">{item.stockQuantity || 0}</td>
                      <td className="border p-2 text-right">₩{item.price ? item.price.toLocaleString() : '0'}</td>
                      <td className="border p-2 text-center">{item.salesQuantity || 0}</td>
                      <td className="border p-2 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="md:hidden space-y-3">
              {items.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                      {item.thumbnailUrl ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{item.name || '-'}</h3>
                        <p className="text-sm text-gray-600">{item.category || '-'}</p>
                        {item.itemNumber && (
                          <p className="text-xs text-gray-500">#{item.itemNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">
                        ₩{item.price ? item.price.toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">재고수량</p>
                      <p className="font-semibold text-green-600">{item.stockQuantity || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">판매수량</p>
                      <p className="font-semibold">{item.salesQuantity || 0}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      등록일: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}