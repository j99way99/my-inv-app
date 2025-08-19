'use client';

import { useEffect, useState } from 'react';

interface Item {
  _id: string;
  itemNumber: string;
  name: string;
  category: string;
  description?: string;
  stockQuantity: number;
  price: number;
}

interface EventItem {
  item: string;
  quantity: number;
}

interface ApplyEvent {
  _id: string;
  eventName: string;
  eventDate: string;
  eventItems: {
    item: Item;
    quantity: number;
  }[];
  createdAt: string;
}

export default function ApplyEventPage() {
  const [events, setEvents] = useState<ApplyEvent[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<EventItem[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/apply-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchEvents();
  }, []);

  const handleItemToggle = (itemId: string) => {
    const existingIndex = selectedItems.findIndex(si => si.item === itemId);
    if (existingIndex >= 0) {
      setSelectedItems(selectedItems.filter(si => si.item !== itemId));
    } else {
      setSelectedItems([...selectedItems, { item: itemId, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(si => 
      si.item === itemId ? { ...si, quantity } : si
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingEventId 
        ? `http://localhost:5001/api/apply-events/${editingEventId}`
        : 'http://localhost:5001/api/apply-events';
      
      const response = await fetch(url, {
        method: editingEventId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventName,
          eventDate,
          eventItems: selectedItems
        }),
      });
      if (response.ok) {
        setEventName('');
        setEventDate('');
        setSelectedItems([]);
        setEditingEventId(null);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event: ApplyEvent) => {
    setEditingEventId(event._id);
    setEventName(event.eventName);
    setEventDate(event.eventDate.split('T')[0]);
    setSelectedItems(event.eventItems.map(ei => ({
      item: ei.item._id,
      quantity: ei.quantity
    })));
  };

  const handleCancel = () => {
    setEditingEventId(null);
    setEventName('');
    setEventDate('');
    setSelectedItems([]);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('정말로 이 행사를 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/apply-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <h1 className="text-4xl font-bold mb-8">참여행사 재고관리</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">
          {editingEventId ? '행사 수정' : '새 행사 등록'}
        </h2>
        
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="행사명"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">출품 상품 선택</h3>
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {items.map((item) => {
              const isSelected = selectedItems.some(si => si.item === item._id);
              return (
                <div key={item._id} className="flex items-center mb-2 p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleItemToggle(item._id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.itemNumber})</span>
                    <span className="text-sm text-gray-500 ml-2">재고: {item.stockQuantity || 0}</span>
                  </div>
                  {isSelected && (
                    <input
                      type="number"
                      value={selectedItems.find(si => si.item === item._id)?.quantity || 1}
                      onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                      className="w-20 p-1 border rounded ml-2"
                      min="1"
                      max={item.stockQuantity || 1}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={selectedItems.length === 0}
          >
            {editingEventId ? '수정 완료' : '행사 등록'}
          </button>
          {editingEventId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">등록된 행사 목록</h2>
        {events.length === 0 ? (
          <p>등록된 행사가 없습니다</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{event.eventName}</h3>
                    <p className="text-gray-600">
                      행사일: {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-gray-500">
                      등록일: {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-semibold mb-2">출품 상품 목록:</h4>
                  {(() => {
                    // Group items by category
                    const groupedItems = event.eventItems.reduce((groups, ei) => {
                      const category = ei.item?.category || '기타';
                      if (!groups[category]) {
                        groups[category] = [];
                      }
                      groups[category].push(ei);
                      return groups;
                    }, {} as Record<string, typeof event.eventItems>);

                    return Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <h5 className="text-md font-semibold mb-2 text-blue-600 border-b border-blue-200 pb-1">
                          {category}
                        </h5>
                        <table className="w-full text-sm mb-3">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border p-2 text-left">상품번호</th>
                              <th className="border p-2 text-left">상품명</th>
                              <th className="border p-2 text-left">상품설명</th>
                              <th className="border p-2 text-center">재고수량</th>
                              <th className="border p-2 text-right">가격</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((ei, index) => (
                              <tr key={index}>
                                <td className="border p-2">{ei.item?.itemNumber || '-'}</td>
                                <td className="border p-2">{ei.item?.name || '-'}</td>
                                <td className="border p-2">{ei.item?.description || '-'}</td>
                                <td className="border p-2 text-center">{ei.item?.stockQuantity || 0}</td>
                                <td className="border p-2 text-right">
                                  ₩{ei.item?.price ? ei.item.price.toLocaleString() : '0'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}