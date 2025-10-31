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
      // Navigate to products page with search query
      router.push(`/san-pham?search=${encodeURIComponent(trimmedValue)}`);
    } else {
      // If empty, just go to products page
      router.push('/san-pham');
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={(e) => handleSearch(e.currentTarget.value)}
        prefix={<SearchOutlined className="text-gray-400" />}
        suffix={
          searchValue && (
            <span
              onClick={() => {
                setSearchValue('');
                router.push('/san-pham');
              }}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              ✕
            </span>
          )
        }
        className="flex-1"
        size="large"
        allowClear
      />
      <Button
        type="primary"
        size="large"
        icon={<SearchOutlined />}
        onClick={() => handleSearch(searchValue)}
        className="flex-shrink-0"
      >
        Tìm kiếm
      </Button>
    </div>
  );
};

export default SearchBar;