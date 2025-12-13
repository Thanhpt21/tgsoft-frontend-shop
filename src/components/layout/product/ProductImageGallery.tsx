'use client';

import React, { useRef } from 'react';
import { Card, Carousel, Button, Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getImageUrl } from '@/utils/getImageUrl';

interface ProductImageGalleryProps {
  currentData: any;
  productTitle: string;
  mainImage: string | null;
  onThumbnailClick: (imageUrl: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  currentData,
  productTitle,
  mainImage,
  onThumbnailClick,
}) => {
  const carouselRef = useRef<any>(null);

  // Tạo mảng ảnh duy nhất
  const allCurrentImages: string[] = currentData?.images
    ? [currentData.thumb, ...currentData.images]
        .map(getImageUrl)
        .filter((img): img is string => !!img)
    : [getImageUrl(currentData?.thumb)].filter((img): img is string => !!img);

  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));
  
  const showNavigation = uniqueCurrentImages.length > 4;

  const next = () => carouselRef.current?.next();
  const prev = () => carouselRef.current?.prev();

  // Handle khi không có ảnh
  if (uniqueCurrentImages.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Không có hình ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square overflow-hidden rounded-md border border-gray-200">
        <Card bodyStyle={{ padding: 0 }} className="w-full h-full">
          <Image
            src={mainImage || uniqueCurrentImages[0] || ''}
            alt={currentData?.title || productTitle}
            preview={false}
            width="100%"
            height="100%"
            style={{ objectFit: 'contain' }}
            className="transition-transform duration-300 hover:scale-105"
          />
        </Card>
      </div>

      {/* Thumbnail carousel */}
      {uniqueCurrentImages.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {showNavigation && (
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={prev}
              className="!min-w-0 !p-2 flex-shrink-0 hover:!bg-gray-100"
              aria-label="Previous thumbnails"
            />
          )}
          
          <div className="flex-grow overflow-hidden">
            <Carousel
              ref={carouselRef}
              dots={false}
              slidesToShow={Math.min(4, uniqueCurrentImages.length)}
              slidesToScroll={1}
              infinite={false}
              className="w-full"
            >
              {uniqueCurrentImages.map((img: string, index: number) => (
                <div key={`${img}-${index}`} className="px-1">
                  <Card
                    bodyStyle={{ padding: 0 }}
                    className={`relative w-full aspect-square overflow-hidden rounded-md cursor-pointer transition-all duration-200 border-2 ${
                      mainImage === img 
                        ? 'border-blue-500 shadow-sm' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    hoverable={false}
                    onClick={() => onThumbnailClick(img)}
                  >
                    <Image
                      src={img}
                      alt={`${currentData?.title || productTitle} - Hình ảnh ${index + 1}`}
                      preview={false}
                      width="100%"
                      height="100%"
                      style={{ objectFit: 'cover' }}
                      className="hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Active indicator */}
                    {mainImage === img && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </Card>
                </div>
              ))}
            </Carousel>
          </div>

          {showNavigation && (
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={next}
              className="!min-w-0 !p-2 flex-shrink-0 hover:!bg-gray-100"
              aria-label="Next thumbnails"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductImageGallery);