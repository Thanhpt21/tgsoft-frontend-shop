'use client';

import React from 'react';
import call from '@/assets/images/call.png';
import zalo from '@/assets/images/zalo.png';

const ContactButtons: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-3 z-50">
      {/* Nút Zalo */}
      <a
        href="https://zalo.me/your-zalo-id"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-2 rounded-lg shadow hover:bg-green-100 transition"
      >
        <img
          src={zalo.src}
          alt="Zalo"
          className="w-10 h-10" // icon to ra
        />
      </a>

      {/* Nút Gọi điện */}
      <a
        href="tel:0909123456"
        className="flex items-center p-2 rounded-lg shadow hover:bg-blue-100 transition"
      >
        <img
          src={call.src}
          alt="Call"
          className="w-10 h-10" // icon to ra
        />
      </a>
    </div>
  );
};

export default ContactButtons;
