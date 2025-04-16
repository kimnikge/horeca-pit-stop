"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link: string;
  expiresAt: Date;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoplayInterval?: number;
}

export function BannerCarousel({
  banners,
  autoplayInterval = 3000, // 3 секунды по умолчанию
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Минимальное расстояние свайпа для переключения (в пикселях)
  const minSwipeDistance = 50;

  // Обработчики свайпа
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Сбрасываем состояние
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Функция для переключения на следующий баннер
  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Функция для переключения на предыдущий баннер
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  // Установка автоматического переключения
  useEffect(() => {
    if (banners.length <= 1) return;

    // Сначала очищаем существующий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Затем создаем новый интервал, только если не находимся в режиме наведения
    if (!isHovering) {
      intervalRef.current = setInterval(goToNext, autoplayInterval);
    }

    // Очистка интервала при размонтировании компонента
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoplayInterval, banners.length, isHovering, currentIndex]); // Добавили currentIndex в зависимости

  // Корректно останавливаем и запускаем автопроигрывание при наведении мыши
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Явно очищаем интервал при наведении
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Явно запускаем интервал при уходе мыши
    if (banners.length > 1 && !intervalRef.current) {
      intervalRef.current = setInterval(goToNext, autoplayInterval);
    }
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative my-3 md:my-6 w-full max-w-[90%] mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id} 
              className="relative w-full flex-shrink-0" 
            >
              <Link href={banner.link} className="block w-full">
                <div className="relative aspect-[16/5] md:aspect-[16/5] overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                    priority={index === 0}
                    onError={(e) => {
                      console.error("Ошибка загрузки изображения:", banner.imageUrl);
                      // Установить изображение по умолчанию при ошибке
                      (e.target as HTMLImageElement).src = '/banners/banner-default.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 md:p-6">
                    <h3 className="text-white text-base md:text-xl font-bold mb-1 md:mb-2 text-shadow">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-white text-xs md:text-sm line-clamp-2 md:line-clamp-none max-w-xl text-shadow">
                        {banner.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки навигации */}
      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md z-10 h-8 w-8 md:h-10 md:w-10"
            onClick={(e) => {
              e.preventDefault(); // Предотвращаем переход по ссылке
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md z-10 h-8 w-8 md:h-10 md:w-10"
            onClick={(e) => {
              e.preventDefault(); // Предотвращаем переход по ссылке
              goToNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Индикаторы слайдов */}
          <div className="flex justify-center mt-3">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 md:w-3 md:h-3 mx-1 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-primary shadow-sm scale-125" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Предотвращаем переход по ссылке
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 