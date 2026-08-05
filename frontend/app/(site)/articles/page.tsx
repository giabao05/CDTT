import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

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

export default async function ArticlesPage() {
  const articles = await getArticles();
  
  // Sắp xếp bài viết mới nhất lên đầu và lọc ra các bài viết chưa xuất bản
  const publishedArticles = articles
    .filter(a => a.isPublished !== false)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const featuredArticle = publishedArticles[0];
  const regularArticles = publishedArticles.slice(1);

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

      {/* Bài viết nổi bật (Mới nhất) */}
      <div className="mb-12">
        <Link href={`/articles/${featuredArticle.slug || featuredArticle.id}`} className="group block">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col md:flex-row">
            <div className="md:w-3/5 h-64 md:h-[420px] relative overflow-hidden bg-zinc-100">
              {featuredArticle.thumbnail ? (
                <img 
                  src={featuredArticle.thumbnail} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                  <span className="font-500 text-lg">Không có ảnh minh hoạ</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-[#E8002D] text-white text-xs font-800 px-3 py-1.5 rounded-md shadow-md uppercase tracking-widest">
                Mới nhất
              </div>
            </div>
            
            <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white relative">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/50 pointer-events-none hidden md:block z-0"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <h2 className="text-2xl md:text-3xl font-800 text-zinc-900 mb-4 group-hover:text-[#E8002D] transition-colors leading-tight line-clamp-3">
                  {featuredArticle.title}
                </h2>
                
                <p className="text-zinc-600 mb-8 line-clamp-4 leading-relaxed text-base">
                  {getExcerpt(featuredArticle.content, 250)}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-600 text-zinc-500 mt-auto pt-6 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                      <User size={16} className="text-zinc-600" />
                    </div>
                    <span className="text-zinc-700">{featuredArticle.author || 'Quản trị viên'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={16} />
                    <span>{formatDate(featuredArticle.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Danh sách bài viết khác */}
      {regularArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug || article.id}`} className="group block h-full">
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-zinc-300 transition-all duration-300 h-full flex flex-col">
                <div className="h-56 bg-zinc-100 relative overflow-hidden">
                  {article.thumbnail ? (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-50">
                      <span className="text-sm font-500">Không có ảnh minh hoạ</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-700 text-zinc-900 mb-3 group-hover:text-[#E8002D] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-zinc-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                    {getExcerpt(article.content, 120)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-600 text-zinc-500 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <User size={14} />
                      <span className="truncate max-w-[120px]">{article.author || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar size={14} />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
