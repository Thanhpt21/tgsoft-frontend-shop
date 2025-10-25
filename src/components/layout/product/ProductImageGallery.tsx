'use client';

import React, { useRef } from 'react';
import { Card, Carousel, Button, Image } from 'antd'; // dùng Image của antd
import { UpOutlined, DownOutlined } from '@ant-design/icons';
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
    <div className="grid grid-cols-5 gap-4">
      {/* Thumbnail column */}
      <div className="col-span-1 flex flex-col items-center justify-center gap-2">
        {showNavigation && (
          <Button
            type="text"
            icon={<UpOutlined />}
            onClick={prev}
            className="w-full !min-w-0 !p-0"
          />
        )}
        <div className="flex-grow w-full">
          <Carousel
            ref={carouselRef}
            dots={false}
            vertical
            slidesToShow={4}
            slidesToScroll={1}
            infinite={false}
            className="h-full"
          >
            {uniqueCurrentImages.map((img: string, index: number) => (
              <div key={img} className="px-1 py-1">
                <Card
                  bodyStyle={{ padding: 0 }}
                  className={`relative w-full aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 border ${
                    mainImage === img ? 'border-blue-500 border-2' : 'border-gray-300'
                  }`}
                  hoverable
                  onClick={() => onThumbnailClick(img)}
                >
                  <Image
                    src={img}
                    alt={`${currentData?.title || productTitle} - Hình ảnh ${index + 1}`}
                    preview={false} // disable preview
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
            icon={<DownOutlined />}
            onClick={next}
            className="w-full !min-w-0 !p-0"
          />
        )}
      </div>

      {/* Main Image */}
      <div className="col-span-4">
        <Card bodyStyle={{ padding: 0 }} className="w-full aspect-square overflow-hidden rounded-md border">
          <Image
            src={mainImage || ''}
            alt={currentData?.title || productTitle}
            preview={false} // disable preview
            width="100%"
            height="100%"
            style={{ objectFit: 'contain' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ProductImageGallery;
