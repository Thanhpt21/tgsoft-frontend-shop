'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Radio, Space, Typography, Spin } from 'antd';
import { useProductAttributes } from '@/hooks/product-attribute/useProductAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { ProductAttribute } from '@/types/product.type';

const { Title } = Typography;

interface ProductAttributeSelectorProps {
  productId: number;
  onSelect?: (selected: Record<number, number>) => void;
  initialSelected?: Record<number, number>;
}

export default function ProductAttributeSelector({
  productId,
  onSelect,
  initialSelected = {},
}: ProductAttributeSelectorProps) {
  // State management
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>(initialSelected);
  const [isValuesLoading, setIsValuesLoading] = useState(false);

  // Fetch product attributes
  const { 
    data: productAttributes, 
    isLoading: loadingAttributes,
    isError: attributesError
  } = useProductAttributes(productId);

  // Extract attribute IDs for parallel fetching
  const attributeIds = useMemo(() => {
    if (!productAttributes?.length) return [];
    return productAttributes.map((attr: any) => attr.attributeId).filter(Boolean);
  }, [productAttributes]);

  // Parallel fetch all attribute values
  const { 
    data: attributeValuesData,
    isLoading: loadingAttributeValues,
    isError: valuesError 
  } = useAttributeValues({
    attributeId: attributeIds
  });

  // Organize values by attribute ID for quick lookup
  const valuesByAttributeId = useMemo(() => {
    if (!attributeValuesData?.data) return {};
    
    const organized: Record<number, any[]> = {};
    attributeValuesData.data.forEach(value => {
      if (value.attributeId) {
        if (!organized[value.attributeId]) {
          organized[value.attributeId] = [];
        }
        organized[value.attributeId].push(value);
      }
    });
    return organized;
  }, [attributeValuesData]);

  // Initialize selected values when attributes are loaded
  useEffect(() => {
    if (productAttributes?.length && Object.keys(initialSelected).length === 0) {
      const initialSelections: Record<number, number> = {};
      productAttributes.forEach((attr: any) => {
        const values = valuesByAttributeId[attr.attributeId];
        if (values?.length > 0) {
          // Select first value by default
          initialSelections[attr.attributeId] = values[0].id;
        }
      });
      
      if (Object.keys(initialSelections).length > 0) {
        setSelectedValues(initialSelections);
        onSelect?.(initialSelections);
      }
    }
  }, [productAttributes, valuesByAttributeId, initialSelected, onSelect]);

  // Handle value change
  const handleChange = useCallback((attributeId: number, valueId: number) => {
    const newSelected = { 
      ...selectedValues, 
      [attributeId]: valueId 
    };
    
    setSelectedValues(newSelected);
    onSelect?.(newSelected);
  }, [selectedValues, onSelect]);

  // Calculate loading states
  const isLoading = loadingAttributes || loadingAttributeValues || isValuesLoading;
  const hasError = attributesError || valuesError;
  const hasAttributes = productAttributes && productAttributes.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Spin size="large" />
        <div className="text-gray-500 text-sm">Đang tải thuộc tính...</div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="text-center py-8 text-red-500">
        <div>Đã có lỗi xảy ra khi tải thuộc tính</div>
        <div className="text-sm text-gray-500 mt-1">Vui lòng thử lại sau</div>
      </div>
    );
  }

  // No attributes state
  if (!hasAttributes) {
    return (
      <div className="text-center py-8 text-gray-500">
        Sản phẩm này không có thuộc tính lựa chọn
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {productAttributes.map((attr: ProductAttribute) => {
        const values = valuesByAttributeId[attr.attributeId] || [];
        const attrName = attr.attribute?.name || `Thuộc tính ${attr.attributeId}`;
        const selectedValueId = selectedValues[attr.attributeId];

        if (values.length === 0) {
          return (
            <div key={attr.attributeId} className="text-gray-400 text-sm">
              Đang cập nhật giá trị cho {attrName}...
            </div>
          );
        }

        return (
          <div key={attr.attributeId} className="space-y-3">
            <div>
              <Title level={5} className="!mb-3 !text-base font-medium text-gray-800">
                {attrName}
              </Title>
              
              <Radio.Group
                value={selectedValueId}
                onChange={(e) => handleChange(attr.attributeId, e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" className="w-full">
                  {values.map((value) => (
                    <Radio 
                      key={value.id} 
                      value={value.id}
                      className={`
                        !flex !items-center !p-3 !h-auto
                        !rounded-lg !border !border-gray-200
                        hover:!border-blue-300 hover:!bg-blue-50
                        transition-all duration-200
                        ${selectedValueId === value.id 
                          ? '!border-blue-500 !bg-blue-50 !text-blue-600' 
                          : ''
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-medium">{value.value}</span>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </div>
        );
      })}
      
      {/* Selection summary */}
      {Object.keys(selectedValues).length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Đã chọn {Object.keys(selectedValues).length} thuộc tính
          </div>
        </div>
      )}
    </div>
  );
}