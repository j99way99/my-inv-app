'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface Item {
  _id: string;
  itemNumber: string;
  name: string;
  price: number;
}

interface ApplyEvent {
  _id: string;
  eventName: string;
  eventDate: string;
}

interface OrderItem {
  item: Item;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  applyEvent: ApplyEvent;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  subPaymentMethod?: string;
  orderDate: string;
  status: string;
}

interface FlattenedOrder {
  _id: string;
  orderNumber: string;
  eventName: string;
  eventDate: string;
  orderDate: string;
  itemNumber: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  totalAmount: number;
  paymentMethod: string;
  subPaymentMethod?: string;
  status: string;
  itemIndex: number;
  totalItems: number;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [flattenedOrders, setFlattenedOrders] = useState<FlattenedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<FlattenedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Search filters
  const [searchEvent, setSearchEvent] = useState('');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchItemNumber, setSearchItemNumber] = useState('');
  const [searchItemName, setSearchItemName] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Flatten orders for grid display
    const flattened: FlattenedOrder[] = [];
    orders.forEach(order => {
      order.orderItems.forEach((item, index) => {
        flattened.push({
          _id: order._id,
          orderNumber: order.orderNumber,
          eventName: order.applyEvent.eventName,
          eventDate: order.applyEvent.eventDate,
          orderDate: order.orderDate,
          itemNumber: item.item?.itemNumber || '-',
          itemName: item.item?.name || '-',
          quantity: item.quantity,
          unitPrice: item.price,
          itemTotal: item.price * item.quantity,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          subPaymentMethod: order.subPaymentMethod,
          status: order.status,
          itemIndex: index,
          totalItems: order.orderItems.length
        });
      });
    });
    setFlattenedOrders(flattened);
    setFilteredOrders(flattened);
  }, [orders]);

  useEffect(() => {
    // Apply filters
    let filtered = [...flattenedOrders];

    if (searchEvent) {
      filtered = filtered.filter(order => 
        order.eventName.toLowerCase().includes(searchEvent.toLowerCase())
      );
    }

    if (searchOrderNumber) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchOrderNumber.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const searchDateFormatted = new Date(searchDate).toLocaleDateString();
        return orderDate === searchDateFormatted;
      });
    }

    if (searchItemNumber) {
      filtered = filtered.filter(order => 
        order.itemNumber.toLowerCase().includes(searchItemNumber.toLowerCase())
      );
    }

    if (searchItemName) {
      filtered = filtered.filter(order => 
        order.itemName.toLowerCase().includes(searchItemName.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchEvent, searchOrderNumber, searchDate, searchItemNumber, searchItemName, flattenedOrders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method: string, subMethod?: string) => {
    const methods: { [key: string]: string } = {
      'cash': '현금',
      'card': '카드',
      'transfer': '계좌이체',
      'other': '기타'
    };
    
    const subMethods: { [key: string]: string } = {
      'kakaopay': '카카오페이',
      'naverpay': '네이버페이'
    };
    
    const mainMethodText = methods[method] || method;
    
    if (method === 'other' && subMethod) {
      const subMethodText = subMethods[subMethod] || subMethod;
      return `${mainMethodText}(${subMethodText})`;
    }
    
    return mainMethodText;
  };

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '대기',
      'completed': '완료',
      'cancelled': '취소'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'completed': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        fetchOrders();
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const clearFilters = () => {
    setSearchEvent('');
    setSearchOrderNumber('');
    setSearchDate('');
    setSearchItemNumber('');
    setSearchItemName('');
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 pt-20">
        <h1 className="text-4xl font-bold mb-8">주문 목록</h1>
        <p>로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <h1 className="text-4xl font-bold mb-8">주문 목록</h1>
      
      {/* Search Filters */}
      <div className="w-full max-w-7xl mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">검색 필터</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">행사</label>
            <input
              type="text"
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)}
              placeholder="행사명 검색"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주문번호</label>
            <input
              type="text"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              placeholder="주문번호 검색"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주문일시</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">상품번호</label>
            <input
              type="text"
              value={searchItemNumber}
              onChange={(e) => setSearchItemNumber(e.target.value)}
              placeholder="상품번호 검색"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">상품명</label>
            <input
              type="text"
              value={searchItemName}
              onChange={(e) => setSearchItemName(e.target.value)}
              placeholder="상품명 검색"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            필터 초기화
          </button>
          <span className="text-sm text-gray-600 py-2">
            검색 결과: {filteredOrders.length}건
          </span>
        </div>
      </div>

      {/* Pagination Info */}
      {filteredOrders.length > 0 && (
        <div className="w-full max-w-7xl mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            전체 {filteredOrders.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)}건 표시
          </div>
          <div className="text-sm text-gray-600">
            페이지 {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <div className="w-full max-w-7xl overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left sticky left-0 bg-gray-100">행사</th>
                <th className="border p-2 text-left">주문번호</th>
                <th className="border p-2 text-left">주문일시</th>
                <th className="border p-2 text-left">상품번호</th>
                <th className="border p-2 text-left">상품명</th>
                <th className="border p-2 text-center">수량</th>
                <th className="border p-2 text-right">단가</th>
                <th className="border p-2 text-right">금액</th>
                <th className="border p-2 text-right">총 주문금액</th>
                <th className="border p-2 text-center">결제수단</th>
                <th className="border p-2 text-center">상태</th>
                <th className="border p-2 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => {
                const isFirstItem = order.itemIndex === 0;
                const prevOrder = index > 0 ? paginatedOrders[index - 1] : null;
                const isNewOrder = !prevOrder || prevOrder.orderNumber !== order.orderNumber;
                
                return (
                  <tr key={`${order._id}-${order.itemIndex}`} 
                      className={isNewOrder ? 'border-t-2 border-t-gray-400' : ''}>
                    <td className="border p-2 sticky left-0 bg-white">
                      {isFirstItem ? (
                        <>
                          <div className="font-medium">{order.eventName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.eventDate).toLocaleDateString()}
                          </div>
                        </>
                      ) : null}
                    </td>
                    <td className="border p-2">
                      {isFirstItem ? order.orderNumber : null}
                    </td>
                    <td className="border p-2">
                      {isFirstItem ? (
                        <div className="text-sm">
                          {new Date(order.orderDate).toLocaleString()}
                        </div>
                      ) : null}
                    </td>
                    <td className="border p-2">{order.itemNumber}</td>
                    <td className="border p-2">{order.itemName}</td>
                    <td className="border p-2 text-center">{order.quantity}</td>
                    <td className="border p-2 text-right">
                      ₩{order.unitPrice.toLocaleString()}
                    </td>
                    <td className="border p-2 text-right">
                      ₩{order.itemTotal.toLocaleString()}
                    </td>
                    <td className="border p-2 text-right font-semibold">
                      {isFirstItem ? `₩${order.totalAmount.toLocaleString()}` : null}
                    </td>
                    <td className="border p-2 text-center">
                      {isFirstItem ? getPaymentMethodText(order.paymentMethod, order.subPaymentMethod) : null}
                    </td>
                    <td className={`border p-2 text-center ${getStatusColor(order.status)}`}>
                      {isFirstItem ? getStatusText(order.status) : null}
                    </td>
                    <td className="border p-2 text-center">
                      {isFirstItem && order.status === 'pending' ? (
                        <button
                          onClick={() => handleCompleteOrder(order._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          완료
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredOrders.length > itemsPerPage && (
        <div className="w-full max-w-7xl mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="처음 페이지"
            >
              «
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="이전 페이지"
            >
              ‹
            </button>
            
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => goToPage(1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  1
                </button>
                {currentPage > 4 && <span className="px-2">...</span>}
              </>
            )}
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                <button
                  onClick={() => goToPage(totalPages)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="다음 페이지"
            >
              ›
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="마지막 페이지"
            >
              »
            </button>

            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm">페이지로 이동:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (!isNaN(page)) {
                    goToPage(page);
                  }
                }}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}