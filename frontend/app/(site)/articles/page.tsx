export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  author: string;
  createdAt: string;
  isPublished: boolean;
}

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch('http://localhost:8080/api/v1/articles', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> | { page?: string } }) {
  const articles = await getArticles();
  
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const itemsPerPage = 4;
  
  // Sắp xếp bài viết mới nhất lên đầu và lọc ra các bài viết chưa xuất bản
  const publishedArticles = articles
    .filter(a => a.isPublished !== false)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(publishedArticles.length / itemsPerPage);
  
  if (publishedArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-display font-900 text-zinc-900 mb-4 tracking-tight">
          BÀI <span className="text-[#E8002D]">VIẾT</span>
        </h1>
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-zinc-200 text-center max-w-lg w-full">
          <p className="text-zinc-500 text-lg">Hiện tại chưa có bài viết nào được đăng tải.</p>
          <p className="text-zinc-400 text-sm mt-2">Vui lòng quay lại sau nhé!</p>
        </div>
      </div>
    );
  }

  const currentArticles = publishedArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const featuredArticle = currentPage === 1 ? currentArticles[0] : null;
  const regularArticles = currentPage === 1 ? currentArticles.slice(1) : currentArticles;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };

  const getExcerpt = (html: string, length: number = 150) => {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-display font-900 text-zinc-900 tracking-tight">
            TIN TỨC & <span className="text-[#E8002D]">BÀI VIẾT</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Cập nhật những thông tin công nghệ mới nhất từ Phone Store</p>
        </div>
      </div>

      {/* Bài viết nổi bật (Mới nhất) - Chỉ hiển thị ở trang 1 */}
      {featuredArticle && (
        <div className="mb-12">
          <Link href={`/articles/${featuredArticle.slug || featuredArticle.id}`} className="group block">
            <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col md:flex-row relative">
              <div className="md:w-3/5 h-64 md:h-[450px] relative overflow-hidden bg-[#F8F8F7] p-2 sm:p-4">
                {featuredArticle.thumbnail ? (
                  <img 
                    src={featuredArticle.thumbnail} 
                    alt={featuredArticle.title} 
                    className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full rounded-[1.5rem] flex flex-col items-center justify-center text-zinc-400 bg-zinc-100/50">
                    <span className="font-500 text-lg">Không có ảnh minh hoạ</span>
                  </div>
                )}
                <div className="absolute top-8 left-8 bg-gradient-to-r from-[#ff0000] to-[#ff6a00] text-white text-xs font-900 px-4 py-2 rounded-full shadow-[0_5px_15px_rgba(232,0,45,0.3)] uppercase tracking-widest z-10">
                  Mới nhất
                </div>
              </div>
              
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white relative z-10">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/80 pointer-events-none hidden md:block z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <h2 className="text-[28px] md:text-4xl font-display font-900 text-[#0A0A0A] mb-5 group-hover:text-[#E8002D] transition-colors duration-300 leading-[1.1] line-clamp-3">
                    {featuredArticle.title}
                  </h2>
                  
                  <p className="text-zinc-500 mb-8 line-clamp-4 leading-relaxed text-sm sm:text-base">
                    {getExcerpt(featuredArticle.content, 250)}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-xs font-display font-800 tracking-wider text-zinc-500 mt-auto pt-6 border-t border-zinc-100/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm">
                        <User size={14} className="text-[#0A0A0A]" />
                      </div>
                      <span className="text-[#0A0A0A] uppercase">{featuredArticle.author || 'Quản trị viên'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 uppercase">
                      <Calendar size={14} />
                      <span>{formatDate(featuredArticle.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Danh sách bài viết khác */}
      {regularArticles.length > 0 && (
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {regularArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug || article.id}`} className="group block h-full relative z-0">
                <div className="bg-white border border-zinc-100 rounded-[1.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(232,0,45,0.08)] hover:border-red-100 transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2">
                  
                  {/* Glowing Aura */}
                  <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-tr from-[#E8002D] to-[#ff4444] opacity-0 blur-xl group-hover:opacity-20 transition-all duration-500 -z-10 pointer-events-none"></div>

                  <div className="h-56 bg-[#F8F8F7] relative overflow-hidden p-2">
                    {article.thumbnail ? (
                      <img 
                        src={article.thumbnail} 
                        alt={article.title} 
                        className="w-full h-full object-cover rounded-xl group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-100/50">
                        <span className="text-sm font-500">Không có ảnh minh hoạ</span>
                      </div>
                    )}
                    {/* Light Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] pointer-events-none z-10"></div>
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-display font-900 text-[#0A0A0A] shadow-sm z-20 uppercase tracking-widest border border-white/50">
                      Tin Tức
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow relative z-20 bg-white">
                    <h3 className="text-[17px] font-display font-900 text-[#0A0A0A] mb-3 group-hover:text-[#E8002D] transition-colors duration-300 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6 line-clamp-3 flex-grow leading-relaxed">
                      {getExcerpt(article.content, 120)}
                    </p>
                    
                    <div className="flex items-center justify-between text-[11px] font-display font-800 tracking-wider text-zinc-500 pt-5 border-t border-zinc-100/80 uppercase">
                      <div className="flex items-center gap-1.5 text-[#0A0A0A]">
                        <User size={13} className="text-[#E8002D]" />
                        <span className="truncate max-w-[120px]">{article.author || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar size={13} />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination UI */}
          <div className="mt-auto flex items-center justify-center gap-2 pb-8">
            {currentPage > 1 ? (
                <Link
                  href={`/articles?page=${currentPage - 1}`}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300 transition-all"
                >
                  <ChevronLeft size={16} />
                </Link>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-300 opacity-50 cursor-not-allowed">
                  <ChevronLeft size={16} />
                </div>
              )}
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/articles?page=${i + 1}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-display font-700 transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#0A0A0A] text-white shadow-md'
                      : 'bg-white border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              
              {currentPage < totalPages ? (
                <Link
                  href={`/articles?page=${currentPage + 1}`}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300 transition-all"
                >
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-300 opacity-50 cursor-not-allowed">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
