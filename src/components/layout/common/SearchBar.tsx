'use client';

import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  // Sync with URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    setSearchValue(searchFromUrl);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    
    if (trimmedValue) {
      router.push(`/san-pham?search=${encodeURIComponent(trimmedValue)}`);
    } else {
      router.push('/san-pham');
    }
  };

  return (
    <div className="flex gap-3 w-full max-w-2xl">
      <style jsx global>{`
        .modern-search-input .ant-input-affix-wrapper {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 2px solid #e9ecef;
          border-radius: 60px !important;
          padding: 10px 28px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .modern-search-input .ant-input-affix-wrapper:hover {
          border-color: #4F46E5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
          transform: translateY(-1px);
        }

        .modern-search-input .ant-input-affix-wrapper-focused {
          border-color: #4F46E5 !important;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.25) !important;
          transform: translateY(-1px);
          background: #ffffff;
        }

        .modern-search-input .ant-input {
          background: transparent;
          font-size: 15px;
          font-weight: 400;
          color: #1f2937;
          border-radius: 60px !important;
        }

        .modern-search-input .ant-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .modern-search-input .anticon-search {
          color: #4F46E5;
          font-size: 18px;
        }

        .clear-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-icon:hover {
          background: #4F46E5;
          color: white;
          transform: rotate(90deg);
        }

        .modern-search-btn {
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          border: none;
          border-radius: 50px;
          height: 48px;
          padding: 0 32px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-search-btn:hover {
          background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important;
        }

        .modern-search-btn:active {
          transform: translateY(0);
        }

        .modern-search-btn .anticon {
          font-size: 18px;
        }

        @media (max-width: 640px) {
          .modern-search-btn span:not(.anticon) {
            display: none;
          }
          
          .modern-search-btn {
            padding: 0 20px;
          }
        }
      `}</style>

      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={(e) => handleSearch(e.currentTarget.value)}
        prefix={<SearchOutlined />}
        suffix={
          searchValue && (
            <span
              onClick={() => {
                setSearchValue('');
                router.push('/san-pham');
              }}
              className="clear-icon"
            >
              ✕
            </span>
          )
        }
        className="modern-search-input flex-1"
        size="large"
      />
      <Button
        type="primary"
        size="large"
        icon={<SearchOutlined />}
        onClick={() => handleSearch(searchValue)}
        className="modern-search-btn flex-shrink-0"
      >
        Tìm kiếm
      </Button>
    </div>
  );
};

export default SearchBar;