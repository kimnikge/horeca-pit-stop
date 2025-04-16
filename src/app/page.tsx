"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { BannerCarousel, Banner } from "@/components/banner/banner-carousel";
import { getActiveBanners } from "@/services/banner-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Briefcase,
  FileText,
  User,
  Home as HomeIcon,
  Grid,
  Bell,
  ChevronDown,
  Star,
  Clock,
  MapPin,
  Building,
  Coffee,
  Menu,
  X,
  Heart,
  MessageSquare,
  Share2,
  BookmarkPlus,
} from "lucide-react";

// Типы для объявлений
type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  logo: string;
  urgent: boolean;
  likes: number;
  comments: number;
  category: string;
};

// Пользовательские иконки
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const Glass = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 21h8m-4-7v7m-9-7h18l-3-14H5z" />
  </svg>
);

const Utensils = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
  </svg>
);

// Компонент карточки объявления
const JobCard = ({ job, onInteraction }: { job: JobListing; onInteraction: (type: string, jobId: number) => void }) => (
  <Card key={job.id} className="horeca-card overflow-hidden">
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12 rounded-lg border">
              <img src={job.logo} alt={job.company} />
            </Avatar>
            {job.urgent && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] bg-red-500">
                СРОЧНО
              </Badge>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 py-0 text-[11px] font-medium"
              >
                {job.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{job.postedAt}</span>
            </div>
            <Link href={`/jobs/${job.id}`}>
              <h3 className="font-semibold text-lg leading-tight mb-1 hover:text-primary transition-colors">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <Building className="h-3.5 w-3.5 mr-1 text-primary" />
              {job.company}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => onInteraction("bookmark", job.id)}
        >
          <BookmarkPlus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4">
        <div className="flex items-center text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-sm">
          <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          <span>{job.type}</span>
        </div>
      </div>
    </div>

    {/* Линия разделения */}
    <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent"></div>

    {/* Нижняя панель взаимодействия */}
    <div className="px-5 py-3 flex justify-between">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => onInteraction("like", job.id)}
        >
          <Heart
            className={`h-4 w-4 mr-1.5 ${
              job.likes > 30 ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span>{job.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => onInteraction("comment", job.id)}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          <span>{job.comments}</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onInteraction("share", job.id)}
      >
        <Share2 className="h-4 w-4 mr-1.5" />
        <span>Поделиться</span>
      </Button>
    </div>
  </Card>
);

// Компонент мобильного меню
const MobileMenu = () => (
  <div className="container py-4 md:hidden">
    <div className="flex items-center relative mb-4">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:bg-background"
        placeholder="Поиск..."
      />
    </div>
    <nav className="flex flex-col space-y-3">
      <Link
        href="/"
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary"
      >
        <HomeIcon className="h-4 w-4" /> Главная
      </Link>
      <Link
        href="/jobs"
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary"
      >
        <Grid className="h-4 w-4" /> Вакансии
      </Link>
      <Link
        href="/jobs/create"
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary"
      >
        <FileText className="h-4 w-4" /> Создать пост
      </Link>
      <Link
        href="/profile"
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary"
      >
        <User className="h-4 w-4" /> Профиль
      </Link>
    </nav>
  </div>
);

export default function HomePage() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  
  // Контролирует скрытие верхнего меню при прокрутке
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Загрузка активных баннеров
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const activeBanners = await getActiveBanners();
        console.log("Loaded banners:", activeBanners);
        
        // Если баннеры не загрузились из базы данных, используем демо-баннеры для визуального отображения
        if (activeBanners.length === 0) {
          console.log("Используем демо-баннеры");
          const demoBanners: Banner[] = [
            {
              id: "demo1",
              title: "Работа в лучших ресторанах",
              description: "Вакансии от премиальных заведений с высокой оплатой",
              imageUrl: "/banners/banner-1.svg",
              link: "/jobs",
              expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
            },
            {
              id: "demo2",
              title: "Ищем шеф-поваров",
              description: "Особые условия для профессионалов высокого класса",
              imageUrl: "/banners/banner-2.svg",
              link: "/jobs?category=chef",
              expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
            },
            {
              id: "demo3",
              title: "Разместите вакансию бесплатно",
              description: "Специальное предложение для работодателей до конца месяца",
              imageUrl: "/banners/banner-3.svg",
              link: "/post-job",
              expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
            },
          ];
          setBanners(demoBanners);
        } else {
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error("Ошибка при загрузке баннеров:", error);
        // Используем демо-баннеры в случае ошибки
        const errorBanners: Banner[] = [
          {
            id: "error1",
            title: "HoReCa PitStop - найди работу мечты",
            description: "Лучшие вакансии в сфере гостеприимства",
            imageUrl: "/banners/banner-default.svg",
            link: "/jobs",
            expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
          }
        ];
        setBanners(errorBanners);
      } finally {
        setBannersLoading(false);
      }
    };

    loadBanners();
  }, []);

  // Пример данных объявлений для демонстрации
  const jobListings: JobListing[] = [
    {
      id: 1,
      title: "Шеф-повар итальянской кухни",
      company: "Trattoria Siciliana",
      location: "Москва",
      salary: "от 150 000 ₽",
      type: "Полная занятость",
      postedAt: "2 часа назад",
      logo: "https://placehold.co/100x100/9ACD32/white?text=TS",
      urgent: true,
      likes: 45,
      comments: 12,
      category: "Кухня",
    },
    {
      id: 2,
      title: "Бариста в кофейню",
      company: "CoffeeLab",
      location: "Санкт-Петербург",
      salary: "от 60 000 ₽",
      type: "Полная занятость",
      postedAt: "3 часа назад",
      logo: "https://placehold.co/100x100/6B8E23/white?text=CL",
      urgent: false,
      likes: 23,
      comments: 5,
      category: "Бар",
    },
    {
      id: 3,
      title: "Администратор ресторана",
      company: "GastroGroup",
      location: "Москва",
      salary: "от 80 000 ₽",
      type: "Полная занятость",
      postedAt: "5 часов назад",
      logo: "https://placehold.co/100x100/556B2F/white?text=GG",
      urgent: false,
      likes: 12,
      comments: 3,
      category: "Менеджмент",
    },
    {
      id: 4,
      title: "Сомелье в винный бар",
      company: "WineTime",
      location: "Сочи",
      salary: "от 120 000 ₽",
      type: "Полная занятость",
      postedAt: "1 день назад",
      logo: "https://placehold.co/100x100/8B0000/white?text=WT",
      urgent: true,
      likes: 34,
      comments: 8,
      category: "Бар",
    },
    {
      id: 5,
      title: "Официант в ресторан высокой кухни",
      company: "Гранд Палас",
      location: "Казань",
      salary: "от 70 000 ₽",
      type: "Полная занятость",
      postedAt: "2 дня назад",
      logo: "https://placehold.co/100x100/483D8B/white?text=ГП",
      urgent: false,
      likes: 19,
      comments: 4,
      category: "Зал",
    },
    {
      id: 6,
      title: "Пиццамейкер",
      company: "ПиццаМаркет",
      location: "Новосибирск",
      salary: "от 65 000 ₽",
      type: "Полная занятость",
      postedAt: "3 дня назад",
      logo: "https://placehold.co/100x100/FF4500/white?text=ПМ",
      urgent: false,
      likes: 15,
      comments: 2,
      category: "Кухня",
    },
  ];

  // Фильтрованные объявления
  const filteredJobs = activeCategory === "Все"
    ? jobListings
    : jobListings.filter(job => job.category === activeCategory);

  // Обработчик взаимодействия с объявлением
  const handleInteraction = (type: string, jobId: number) => {
    console.log(`${type} взаимодействие с объявлением ${jobId}`);
    // Здесь будет логика обработки разных типов взаимодействий (лайк, комментарий и т.д.)
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Хедер */}
      <header className={`sticky ${hideHeader ? "-top-20" : "top-0"} transition-all duration-300 z-40 w-full bg-white border-b`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary mr-6">
              HoReCa<span className="text-black">PitStop</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" className="h-9 px-2 text-base" asChild>
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Вакансии
                </Link>
              </Button>
              <Button variant="ghost" className="h-9 px-2 text-base" asChild>
                <Link href="/resume">
                  <FileText className="h-4 w-4 mr-2" />
                  Резюме
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2 text-base flex gap-2">
                    <MapPin className="h-4 w-4" />
                    Местоположение
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuItem>Москва</DropdownMenuItem>
                  <DropdownMenuItem>Санкт-Петербург</DropdownMenuItem>
                  <DropdownMenuItem>Новосибирск</DropdownMenuItem>
                  <DropdownMenuItem>Екатеринбург</DropdownMenuItem>
                  <DropdownMenuItem>Казань</DropdownMenuItem>
                  <DropdownMenuItem>Сочи</DropdownMenuItem>
                  <DropdownMenuItem>Вся Россия</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <MapPin className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuItem>Москва</DropdownMenuItem>
                <DropdownMenuItem>Санкт-Петербург</DropdownMenuItem>
                <DropdownMenuItem>Новосибирск</DropdownMenuItem>
                <DropdownMenuItem>Екатеринбург</DropdownMenuItem>
                <DropdownMenuItem>Казань</DropdownMenuItem>
                <DropdownMenuItem>Сочи</DropdownMenuItem>
                <DropdownMenuItem>Вся Россия</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="default" asChild>
              <Link href="/post-job">Разместить вакансию</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {showMobileMenu && <MobileMenu />}

      {/* Баннерная карусель */}
      {!bannersLoading && banners.length > 0 && (
        <div className="container mt-6 px-0 md:px-4">
          <BannerCarousel banners={banners} autoplayInterval={5000} />
        </div>
      )}

      {/* Основной контент: лента объявлений */}
      <main className="flex-1 pt-6 pb-20">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          {/* Категории */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
            {["Все", "Кухня", "Бар", "Зал", "Менеджмент", "Отель"].map(
              (category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full flex whitespace-nowrap ${
                    activeCategory === category
                      ? ""
                      : "hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {category === "Кухня" && <Utensils className="h-3.5 w-3.5 mr-1.5" />}
                  {category === "Бар" && <Glass className="h-3.5 w-3.5 mr-1.5" />}
                  {category}
                </Button>
              )
            )}
          </div>

          {/* Список объявлений */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onInteraction={handleInteraction} />
            ))}
          </div>

          {/* Загрузить еще кнопка */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Показать еще
            </Button>
          </div>
        </div>
      </main>

      {/* Нижняя панель навигации, закрепленная снизу */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
        <div className="container h-full max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-4 h-full">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-primary">
              <HomeIcon className="h-5 w-5" />
              <span className="text-[10px] font-medium">Главная</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-full h-full">
                  <Grid className="h-5 w-5" />
                  <span className="text-[10px] font-medium flex items-center">
                    Категории <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-background border z-50">
                {["Кухня", "Бар", "Зал", "Менеджмент"].map((category) => (
                  <DropdownMenuItem 
                    key={category} 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category === "Кухня" && <Utensils className="h-4 w-4" />}
                    {category === "Бар" && <Glass className="h-4 w-4" />}
                    <span>{category}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-full h-full">
                  <FileText className="h-5 w-5" />
                  <span className="text-[10px] font-medium flex items-center">
                    Пост <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-background border z-50">
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/post-job" className="flex items-center gap-2 w-full">
                    <Briefcase className="h-4 w-4" />
                    <span>Разместить вакансию</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    <span>Создать резюме</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">Профиль</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Добавляем пользовательский компонент для стилей */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}