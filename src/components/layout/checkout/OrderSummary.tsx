'use client';

import { Typography, Spin, Checkbox, Button, InputNumber, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCartStore } from '@/stores/cartStore';
import useShippingMethod from '@/stores/shippingMethodStore';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { useEffect, useState, useTransition } from 'react';
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem';
import { useUpdateCartItem } from '@/hooks/cart/useUpdateCartItem';

const { Text } = Typography;

const OrderSummary: React.FC<{ onSelectedItemsChange: (selectedItems: Set<number>) => void }> = ({ onSelectedItemsChange }) => {
  const { items, getTotalPrice, syncFromServer,     updateQuantityOptimistic, removeItemOptimistic, } = useCartStore();
  const { shippingFee } = useShippingMethod();
  const [isPending, startTransition] = useTransition();

  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Map id → name/value
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // Đồng bộ server ở background (không block UI)
  useEffect(() => {
    const syncCart = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        if (data?.items) {
          syncFromServer(data.items);
        }
      } catch (err) {
        console.error('Sync cart failed:', err);
      }
    };

    syncCart();
  }, [syncFromServer]);

  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính';
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `${attrId}`;
        const valueName = attributeValueMap[Number(valueId)] || valueId;
        return `${attrName}: ${valueName}`;
      })
      .join(', ');
  };

  const handleCheckboxChange = (itemId: number) => {
  const newSelectedItems = new Set(selectedItems);
  if (newSelectedItems.has(itemId)) {
    newSelectedItems.delete(itemId);
  } else {
    newSelectedItems.add(itemId);
  }
  
  // Kiểm tra xem tất cả các item còn lại có được chọn không
  if (newSelectedItems.size === items.length) {
    setSelectAll(true); // Nếu tất cả các item được chọn, bật "Chọn tất cả"
  } else {
    setSelectAll(false); // Nếu không phải tất cả item được chọn, tắt "Chọn tất cả"
  }

  setSelectedItems(newSelectedItems);
  onSelectedItemsChange(newSelectedItems);  // Pass selected items to parent
};

// Handle "Select All" checkbox
const handleSelectAll = (e: any) => {
  const isChecked = e.target.checked;
  setSelectAll(isChecked);

  if (isChecked) {
    const allItemIds = items.map(item => item.id);
    setSelectedItems(new Set(allItemIds)); // Select all items
    onSelectedItemsChange(new Set(allItemIds));  // Pass all selected items to parent
  } else {
    setSelectedItems(new Set()); // Unselect all
    onSelectedItemsChange(new Set());  // Pass empty set to parent
  }
};

  // Handle quantity change
  const handleQuantityChange = (itemId: number, quantity: number) => {
    updateQuantityOptimistic(itemId, quantity); // update item quantity in zustand store
  };

  // Handle remove item
  const handleRemoveItem = (itemId: number) => {
    removeItemOptimistic(itemId); // remove item from cart
  };

  // HIỆN TỨC THÌ TỪ ZUSTAND
  if (items.length === 0) {
    return <Text type="secondary">Giỏ hàng trống.</Text>;
  }

  // **Tính toán tạm tính** chỉ cho sản phẩm được chọn
  const temporaryTotal = items
    .filter(item => selectedItems.has(item.id)) // Lọc ra các sản phẩm đã chọn
    .reduce((total, item) => total + item.priceAtAdd * item.quantity, 0); // Tính tổng tiền của những sản phẩm đã chọn

  const currentShippingFee = shippingFee || 0;
  const finalTotal = temporaryTotal + currentShippingFee;
 // Kiểm tra số lượng sản phẩm trong giỏ hàng
  const isSelectAllDisabled = items.length > 10;

  return (
    <div>
      {/* "Chọn tất cả" checkbox */}
      <div className="flex items-center mb-4">
        <Checkbox
          checked={selectAll}
          onChange={handleSelectAll}
           disabled={isSelectAllDisabled}
        />
        <Text className="ml-2">Chọn tất cả</Text>
           {isSelectAllDisabled && <Text type="secondary" className="ml-2">(Tối đa 10 sản phẩm)</Text>}
      </div>

      {/* Cart Items List */}
      {items.map((item) => {
        const thumbUrl = getImageUrl(item.thumb || '/no-image.png');

        return (
          <div key={item.id} className="flex items-start py-3 border-b">
            {/* Checkbox next to the item */}
            <Checkbox
              checked={selectedItems.has(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
              className="mr-4"
            />

            {/* Hình ảnh */}
            <div className="w-16 h-16 mr-4 flex-shrink-0">
              <img
                src={thumbUrl}
                alt={item.productName}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
              <Text strong>{item.productName}</Text>
              <div className="text-xs text-gray-500 mt-1">
                {renderAttributes(item.attributes)}
              </div>
              <div className="flex items-center text-sm mt-2">
                <Text>{formatVND(item.priceAtAdd)}</Text>
                <Text className="ml-2">x {item.quantity}</Text>
              </div>
            </div>

            {/* Điều khiển số lượng và nút xóa */}
            <div className="flex flex-col items-end ml-auto space-y-2">
              {/* Quantity Change */}
              {/* <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  icon="-"
                  size="small"
                />
                  <InputNumber
                    min={1}
                    value={item.quantity ?? 1}
                    onChange={(value: number | string | null) => {
                      if (typeof value === 'number') {
                        handleQuantityChange(item.id, value);
                      }
                    }}
                    className="mx-2"
                    style={{ width: `30px` }}  // Điều chỉnh width theo số lượng chữ
                    controls={false}  // Ẩn các nút tăng giảm
                  />
                <Button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  icon="+"
                  size="small"
                />
              </div> */}

              {/* Remove Item */}
              <Button
                type="text"
                danger
                onClick={() => handleRemoveItem(item.id)}
                icon={<DeleteOutlined />}
                className="mt-2"
              >
              </Button>
            </div>
          </div>
        );
      })}

      {/* Tổng tiền */}
      <div className="py-4 border-t mt-4">
        <div className="flex justify-between py-1">
          <Text>Tạm tính:</Text>
          <Text>{formatVND(temporaryTotal)}</Text>
        </div>
        <div className="flex justify-between py-1">
          <Text>Phí vận chuyển:</Text>
          <Text>{formatVND(currentShippingFee)}</Text>
        </div>
        <div className="flex justify-between py-2 border-t mt-2">
          <Text strong>Tổng cộng:</Text>
          <Text strong type="danger" className="text-lg">
            {formatVND(finalTotal)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
