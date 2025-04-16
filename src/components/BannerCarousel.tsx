'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner, getActiveBanners } from '@/lib/banners';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const activeBanners = await getActiveBanners();
        setBanners(activeBanners);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке баннеров:', err);
        setError('Не удалось загрузить баннеры');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Автоматическое переключение каждые 5 секунд

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-64 bg-gray-200 rounded-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500">Загрузка баннеров...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-64 bg-red-100 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Не показываем компонент, если нет баннеров
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
      {/* Фоновое изображение */}
      <div className="absolute inset-0">
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>

      {/* Контент баннера */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentBanner.title}</h2>
        {currentBanner.description && (
          <p className="text-sm md:text-base max-w-md mb-4">{currentBanner.description}</p>
        )}
        {currentBanner.link && (
          <Link href={currentBanner.link}>
            <Button variant="secondary" className="w-max">Подробнее</Button>
          </Link>
        )}
      </div>

      {/* Индикаторы и кнопки навигации */}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
            aria-label="Предыдущий баннер"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
            aria-label="Следующий баннер"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}; 