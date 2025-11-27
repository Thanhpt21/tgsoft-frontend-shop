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

  const allCurrentImages: string[] = currentData?.images
    ? [currentData.thumb, ...currentData.images]
        .map(getImageUrl)
        .filter((img): img is string => !!img)
    : [getImageUrl(currentData.thumb)].filter((img): img is string => !!img);

  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));

  const next = () => carouselRef.current?.next();
  const prev = () => carouselRef.current?.prev();
  const showNavigation = uniqueCurrentImages.length > 4;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square overflow-hidden rounded-md border border-gray-200">
        <Card bodyStyle={{ padding: 0 }} className="w-full h-full">
          <Image
            src={mainImage || ''}
            alt={currentData?.title || productTitle}
            preview={false}
            width="100%"
            height="100%"
            style={{ objectFit: 'contain' }}
          />
        </Card>
      </div>

      {/* Thumbnail carousel - nằm dưới */}
      <div className="flex items-center justify-center gap-2">
        {showNavigation && (
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={prev}
            className="!min-w-0 !p-2 flex-shrink-0"
          />
        )}
        
        <div className="flex-grow overflow-hidden">
          <Carousel
            ref={carouselRef}
            dots={false}
            vertical={false}
            slidesToShow={4}
            slidesToScroll={1}
            infinite={false}
            className="w-full"
          >
            {uniqueCurrentImages.map((img: string, index: number) => (
              <div key={img} className="px-1">
                <Card
                  bodyStyle={{ padding: 0 }}
                  className={`relative w-full aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 border transition-all ${
                    mainImage === img ? 'border-blue-500 border-2' : 'border-gray-300'
                  }`}
                  hoverable
                  onClick={() => onThumbnailClick(img)}
                >
                  <Image
                    src={img}
                    alt={`${currentData?.title || productTitle} - Hình ảnh ${index + 1}`}
                    preview={false}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                  />
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
            className="!min-w-0 !p-2 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;