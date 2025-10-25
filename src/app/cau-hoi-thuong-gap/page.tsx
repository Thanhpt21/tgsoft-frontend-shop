'use client';

import React, { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'Làm thế nào để đăng ký chương trình khách hàng thân thiết?',
    answer:
      'Bạn có thể đăng ký trực tiếp tại cửa hàng hoặc trên website của chúng tôi bằng cách điền vào mẫu đăng ký khách hàng thân thiết.',
  },
  {
    question: 'Tôi có thể tích điểm như thế nào?',
    answer:
      'Mỗi đơn hàng bạn mua sẽ được tích điểm dựa trên giá trị thanh toán. Điểm sẽ được cập nhật tự động vào tài khoản của bạn.',
  },
  {
    question: 'Điểm tích lũy có thời hạn sử dụng không?',
    answer:
      'Có, điểm tích lũy sẽ có hiệu lực trong vòng 12 tháng kể từ ngày ghi nhận điểm.',
  },
  {
    question: 'Tôi có thể đổi điểm lấy quà gì?',
    answer:
      'Bạn có thể đổi điểm lấy nhiều phần quà hấp dẫn hoặc phiếu giảm giá tùy theo chương trình hiện tại.',
  },
  {
    question: 'Làm sao để liên hệ bộ phận chăm sóc khách hàng?',
    answer:
      'Bạn có thể gọi hotline hoặc gửi email tới địa chỉ hỗ trợ khách hàng được cung cấp trên website.',
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-[700px] mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h2 className="text-xl font-bold mb-6 text-center text-blue-700">Câu hỏi thường gặp (FAQ)</h2>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div key={idx} className="border border-gray-300 rounded-md">
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full text-left px-4 py-3 flex justify-between items-center text-gray-800 font-semibold hover:bg-blue-50 focus:outline-none focus:bg-blue-100"
            >
              {item.question}
              <span className="ml-2 text-blue-600">
                {openIndex === idx ? '−' : '+'}
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 py-3 text-gray-700 border-t border-gray-300 bg-blue-50">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
