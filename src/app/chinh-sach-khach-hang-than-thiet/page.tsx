'use client';

import React from 'react';

const LoyaltyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-xl font-bold mb-6 text-center text-blue-700">
        Chính Sách Khách Hàng Thân Thiết
      </h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Giới thiệu</h2>
        <p className="text-gray-700">
          Chương trình khách hàng thân thiết của chúng tôi được thiết kế để tri ân và giữ gìn mối quan hệ lâu dài với khách hàng. Khách hàng thân thiết sẽ được hưởng nhiều ưu đãi hấp dẫn và dịch vụ chăm sóc đặc biệt.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Cách thức tham gia</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Đăng ký trở thành khách hàng thân thiết tại cửa hàng hoặc qua website.</li>
          <li>Mỗi lần mua hàng, khách hàng sẽ được tích điểm dựa trên giá trị đơn hàng.</li>
          <li>Điểm tích lũy có thể sử dụng để đổi quà hoặc giảm giá trong các lần mua tiếp theo.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Quyền lợi khách hàng thân thiết</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Ưu đãi giảm giá đặc biệt cho các sản phẩm chọn lọc.</li>
          <li>Quà tặng sinh nhật và các dịp lễ tết.</li>
          <li>Thông báo sớm về các chương trình khuyến mãi và sự kiện.</li>
          <li>Dịch vụ chăm sóc khách hàng ưu tiên.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Điều khoản và điều kiện</h2>
        <p className="text-gray-700 mb-3">
          Điểm tích lũy có giá trị trong vòng 12 tháng kể từ ngày được ghi nhận. Chúng tôi có quyền thay đổi các điều khoản của chương trình mà không cần báo trước. Mọi quyết định của công ty là cuối cùng.
        </p>
        <p className="text-gray-700">
          Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng tôi.
        </p>
      </section>
    </div>
  );
};

export default LoyaltyPolicy;
