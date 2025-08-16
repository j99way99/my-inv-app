'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '../../utils/api';

interface Item {
  _id: string;
  itemNumber: string;
  name: string;
  category: string;
  stockQuantity: number;
  availableStock?: number;
  price: number;
}

interface ApplyEvent {
  _id: string;
  eventName: string;
  eventDate: string;
  eventItems: {
    item: Item;
    quantity: number;
  }[];
}

interface OrderItem {
  item: string;
  itemDetails: Item;
  quantity: number;
  price: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ApplyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedEventData, setSelectedEventData] = useState<ApplyEvent | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [subPaymentMethod, setSubPaymentMethod] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const lastSelectedEventId = localStorage.getItem('lastSelectedEvent');
      if (lastSelectedEventId && events.some(event => event._id === lastSelectedEventId)) {
        handleEventSelect(lastSelectedEventId);
      }
    }
  }, [events]);

  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  }, [orderItems]);

  const fetchEvents = async () => {
    try {
      const response = await apiGet('/apply-events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    const event = events.find(e => e._id === eventId);
    if (event) {
      setSelectedEventData(event);
      // Initialize order items with 0 quantity
      const initialOrderItems = event.eventItems.map(ei => ({
        item: ei.item._id,
        itemDetails: ei.item,
        quantity: 0,
        price: ei.item.price
      }));
      setOrderItems(initialOrderItems);
      // Save the selected event to localStorage
      localStorage.setItem('lastSelectedEvent', eventId);
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setOrderItems(orderItems.map(oi => {
      if (oi.item === itemId) {
        const newQuantity = Math.max(0, oi.quantity + change);
        const maxQuantity = oi.itemDetails.availableStock ?? oi.itemDetails.stockQuantity;
        return { ...oi, quantity: Math.min(newQuantity, maxQuantity) };
      }
      return oi;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOrderItems = orderItems.filter(oi => oi.quantity > 0);
    if (validOrderItems.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    try {
      const orderData: any = {
        applyEvent: selectedEvent,
        orderItems: validOrderItems.map(oi => ({
          item: oi.item,
          quantity: oi.quantity,
          price: oi.price
        })),
        totalAmount,
        paymentMethod
      };

      // Only include subPaymentMethod if paymentMethod is 'other'
      if (paymentMethod === 'other') {
        orderData.subPaymentMethod = subPaymentMethod;
      }

      const response = await apiPost('/orders', orderData);
      
      if (response.ok) {
        alert('주문이 성공적으로 생성되었습니다.');
        router.push('/order-list');
      } else {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        alert(`주문 생성 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('주문 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <h1 className="text-4xl font-bold mb-8">주문 생성</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">행사 선택</h2>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventSelect(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">행사를 선택하세요</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEventData && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">상품 선택</h2>
              {(() => {
                // Group items by category
                const groupedItems = orderItems.reduce((groups, orderItem) => {
                  const category = orderItem.itemDetails.category || '기타';
                  if (!groups[category]) {
                    groups[category] = [];
                  }
                  groups[category].push(orderItem);
                  return groups;
                }, {} as Record<string, OrderItem[]>);

                return Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b border-blue-200 pb-1">
                      {category}
                    </h3>
                    {/* 데스크톱 뷰 */}
                    <div className="hidden md:block space-y-3">
                      {items.map((orderItem) => {
                        const eventItem = selectedEventData.eventItems.find(
                          ei => ei.item._id === orderItem.item
                        );
                        return (
                          <div key={orderItem.item} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex-1">
                              <span className="font-medium">{orderItem.itemDetails.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                ({orderItem.itemDetails.itemNumber})
                              </span>
                              <div className="text-sm text-gray-600">
                                가격: ₩{orderItem.price.toLocaleString()} | 
                                잔여재고: {orderItem.itemDetails.availableStock ?? orderItem.itemDetails.stockQuantity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(orderItem.item, -1)}
                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={orderItem.quantity === 0}
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-medium">
                                {orderItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(orderItem.item, 1)}
                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={orderItem.quantity >= (orderItem.itemDetails.availableStock ?? orderItem.itemDetails.stockQuantity)}
                              >
                                +
                              </button>
                            </div>
                            <div className="ml-4 text-right min-w-[100px]">
                              <div className="font-medium">
                                ₩{(orderItem.price * orderItem.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 모바일 뷰 */}
                    <div className="md:hidden space-y-3">
                      {items.map((orderItem) => {
                        const eventItem = selectedEventData.eventItems.find(
                          ei => ei.item._id === orderItem.item
                        );
                        return (
                          <div key={orderItem.item} className="bg-white p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{orderItem.itemDetails.name}</h4>
                                <p className="text-sm text-gray-500">#{orderItem.itemDetails.itemNumber}</p>
                                <p className="text-sm font-medium text-blue-600 mt-1">
                                  ₩{orderItem.price.toLocaleString()}
                                </p>
                              </div>
                              {orderItem.quantity > 0 && (
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">
                                    ₩{(orderItem.price * orderItem.quantity).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                              <div className="text-sm text-gray-600">
                                잔여재고: {orderItem.itemDetails.availableStock ?? orderItem.itemDetails.stockQuantity}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(orderItem.item, -1)}
                                  className="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                                  disabled={orderItem.quantity === 0}
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-bold text-lg">
                                  {orderItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(orderItem.item, 1)}
                                  className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center text-lg font-bold"
                                  disabled={orderItem.quantity >= (orderItem.itemDetails.availableStock ?? orderItem.itemDetails.stockQuantity)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">결제 정보</h2>
              <div className="mb-4">
                <label className="block mb-2">결제 수단</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    if (e.target.value !== 'cash') {
                      setReceivedAmount(0);
                    }
                    if (e.target.value !== 'other') {
                      setSubPaymentMethod('');
                    }
                  }}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="cash">현금</option>
                  <option value="card">카드</option>
                  <option value="transfer">계좌이체</option>
                  <option value="other">기타</option>
                </select>
              </div>
              {paymentMethod === 'other' && (
                <div className="mb-4">
                  <label className="block mb-2">상세 결제 수단</label>
                  <select
                    value={subPaymentMethod}
                    onChange={(e) => setSubPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="kakaopay">카카오페이</option>
                    <option value="naverpay">네이버페이</option>
                  </select>
                </div>
              )}
              {paymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block mb-2">받은 돈</label>
                  <input
                    type="number"
                    value={receivedAmount || ''}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                    placeholder="받은 금액을 입력하세요"
                    min="0"
                  />
                </div>
              )}
              <div className="text-xl font-bold text-right">
                총 결제금액: ₩{totalAmount.toLocaleString()}
              </div>
              {paymentMethod === 'cash' && receivedAmount > 0 && (
                <div className="text-lg font-medium text-right mt-2">
                  거스름돈: ₩{Math.max(0, receivedAmount - totalAmount).toLocaleString()}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                orderItems.every(oi => oi.quantity === 0) ||
                (paymentMethod === 'cash' && receivedAmount < totalAmount) ||
                (paymentMethod === 'other' && !subPaymentMethod)
              }
            >
              주문 생성
            </button>
          </>
        )}
      </form>
    </main>
  );
}