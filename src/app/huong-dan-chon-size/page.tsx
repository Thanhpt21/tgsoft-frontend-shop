'use client';

import React, { useState } from 'react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const SportsShirtGuide: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md my-3">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Hướng Dẫn Sử Dụng Áo Thể Thao Xe Đạp
      </h2>

      <p className="mb-6 text-gray-700">
        Áo thể thao xe đạp giúp bạn thoải mái và thoáng khí trong mỗi chuyến đi. Vui lòng chọn size phù hợp để có trải nghiệm tốt nhất.
      </p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Chọn size áo</h3>
        <div className="flex space-x-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 rounded border 
                ${
                  selectedSize === size
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
                } transition`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedSize && (
          <p className="mt-4 text-green-700 font-semibold">
            Bạn đã chọn size: <span className="text-blue-600">{selectedSize}</span>
          </p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Bảng kích thước tham khảo</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2">Size</th>
              <th className="border border-gray-300 px-3 py-2">Ngực (cm)</th>
              <th className="border border-gray-300 px-3 py-2">Eo (cm)</th>
              <th className="border border-gray-300 px-3 py-2">Dài áo (cm)</th>
            </tr>
          </thead>
        <tbody>
        {sizes.map((size, idx) => {
            // Tạo map từ size sang dữ liệu số đo cho dễ
            const sizeData = {
            S: { chest: '86 - 91', waist: '70 - 75', length: '65' },
            M: { chest: '92 - 97', waist: '76 - 81', length: '67' },
            L: { chest: '98 - 103', waist: '82 - 87', length: '69' },
            XL: { chest: '104 - 109', waist: '88 - 93', length: '71' },
            XXL: { chest: '110 - 115', waist: '94 - 99', length: '73' },
            }[size];

              if (!sizeData) return null;

            return (
            <tr
                key={size}
                className={
                selectedSize === size
                    ? 'bg-blue-100 font-semibold'
                    : idx % 2 === 1
                    ? 'bg-gray-50'
                    : ''
                }
            >
                <td className="border border-gray-300 px-3 py-2">{size}</td>
                <td className="border border-gray-300 px-3 py-2">{sizeData.chest}</td>
                <td className="border border-gray-300 px-3 py-2">{sizeData.waist}</td>
                <td className="border border-gray-300 px-3 py-2">{sizeData.length}</td>
            </tr>
            );
        })}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportsShirtGuide;
