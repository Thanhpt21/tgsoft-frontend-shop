'use client';

import { useState, useEffect } from 'react';
import { Radio, Space, Typography, Spin } from 'antd';
import { useProductAttributes } from '@/hooks/product-attribute/useProductAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { ProductAttribute } from '@/types/product.type';

const { Title } = Typography;

interface ProductAttributeSelectorProps {
  productId: number;
  onSelect?: (selected: Record<number, number>) => void;
}

export default function ProductAttributeSelector({
  productId,
  onSelect,
}: ProductAttributeSelectorProps) {
  const { data: productAttributes, isLoading: loadingAttributes } = useProductAttributes(productId);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});
  const [allValues, setAllValues] = useState<Record<number, any[]>>({});

  // Fetch tất cả AttributeValues cho từng attribute
  useEffect(() => { 
    if (!productAttributes?.length) return;

    const fetchValues = async () => {
      const all: Record<number, any[]> = {};
      for (const attr of productAttributes) {
        const res = await useAttributeValues({ attributeId: attr.attributeId }).refetch();
        all[attr.attributeId] = res.data?.data ?? [];
      }
      setAllValues(all);
    };

    fetchValues();
  }, [productAttributes]);

  const handleChange = (attributeId: number, valueId: number) => {
    const newSelected = { ...selectedValues, [attributeId]: valueId };
    setSelectedValues(newSelected);
    onSelect?.(newSelected);
  };

  if (loadingAttributes) return <Spin tip="Đang tải thuộc tính..." />;

  if (!productAttributes || productAttributes.length === 0)
    return <div>Sản phẩm này không có thuộc tính.</div>;

  return (
    <div className="space-y-4">
      {productAttributes.map((attr: ProductAttribute) => {
        const values = allValues[attr.attributeId] ?? [];
        const attrName = attr.attribute?.name ?? 'Tên thuộc tính không xác định';

        if (!values.length)
          return (
            <div key={attr.attributeId}>Không có giá trị cho {attrName}</div>
          );

        return (
          <div key={attr.attributeId}>
            <Title level={5}>{attrName}</Title>
            <Radio.Group
              onChange={(e) => handleChange(attr.attributeId, e.target.value)}
              value={selectedValues[attr.attributeId]}
            >
              <Space direction="vertical">
                {values.map((v) => (
                  <Radio key={v.id} value={v.id}>
                    {v.value}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        );
      })}
    </div>
  );
}
