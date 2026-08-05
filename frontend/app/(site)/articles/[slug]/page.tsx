import { Calendar, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

async function getArticle(slugOrId: string): Promise<Article | null> {
  try {
    const res = await fetch('http://localhost:8080/api/v1/articles', { cache: 'no-store' });
    if (!res.ok) return null;
    const articles: Article[] = await res.json();
    
    // Tìm bài viết có slug hoặc id khớp
    const article = articles.find(a => a.slug === slugOrId || a.id.toString() === slugOrId);
    
    // Nếu bài viết đang bị ẩn (isPublished = false) thì không hiển thị
    if (article && article.isPublished === false) return null;
    
    return article || null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

export default async function ArticleDetailPage(props: { params: Promise<{ slug: string }> }) {
  // Trong Next.js 15+, params là một Promise
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const article = await getArticle(decodedSlug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <Link href="/articles" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#E8002D] transition-colors mb-8 font-600 text-sm bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
        <ChevronLeft size={16} />
        Quay lại danh sách bài viết
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="w-full h-[400px] bg-zinc-100 relative overflow-hidden">
            <img 
              src={article.thumbnail} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* Header bài viết */}
          <h1 className="text-3xl md:text-4xl font-800 text-zinc-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-600 text-zinc-500 mb-10 pb-6 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <User size={16} className="text-zinc-600" />
              </div>
              <span className="text-zinc-700">{article.author || 'Quản trị viên'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar size={16} />
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>

          {/* Nội dung bài viết */}
          {/* Sử dụng CSS tùy chỉnh để style các thẻ HTML được trả về từ database */}
          <div 
            className="mt-8 text-zinc-700 leading-relaxed text-[17px] 
            [&>h1]:text-3xl [&>h1]:font-800 [&>h1]:text-zinc-900 [&>h1]:mb-6 [&>h1]:mt-10
            [&>h2]:text-2xl [&>h2]:font-700 [&>h2]:text-zinc-900 [&>h2]:mb-4 [&>h2]:mt-8
            [&>h3]:text-xl [&>h3]:font-700 [&>h3]:text-zinc-900 [&>h3]:mb-3 [&>h3]:mt-6
            [&>p]:mb-5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-5
            [&>li]:mb-2 [&>a]:text-[#E8002D] [&>a]:font-600 hover:[&>a]:underline
            [&>img]:rounded-2xl [&>img]:my-8 [&>img]:w-full [&>img]:object-cover [&>img]:shadow-sm
            [&>blockquote]:border-l-4 [&>blockquote]:border-[#E8002D] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-zinc-600 [&>blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </div>
  );
}
