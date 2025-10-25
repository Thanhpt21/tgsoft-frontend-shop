'use client';

interface AccountSidebarProps {
  onMenuClick: (key: 'personal' | 'address' | 'history') => void;
  selected: 'personal' | 'address' | 'history';
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ onMenuClick, selected }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="font-semibold mb-4">Tài khoản của tôi</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onMenuClick('personal')}
            className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${selected === 'personal' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            Thông tin cá nhân
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuClick('history')}
            className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${selected === 'history' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            Lịch sử mua hàng
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AccountSidebar;