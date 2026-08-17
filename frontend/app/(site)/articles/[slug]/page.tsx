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
      <Link href="/articles" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-[#0A0A0A] transition-colors mb-8 font-display font-800 tracking-wider text-xs uppercase bg-white px-5 py-3 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100 overflow-hidden relative">
        {/* Ambient glow behind article */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="w-full h-[300px] md:h-[450px] bg-zinc-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img 
              src={article.thumbnail} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <div className="p-6 md:p-12 relative z-20">
          {/* Header bài viết */}
          <h1 className="text-3xl md:text-5xl font-display font-900 text-[#0A0A0A] mb-8 leading-[1.2] tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-[11px] md:text-xs font-display font-800 tracking-widest uppercase text-zinc-500 mb-10 pb-8 border-b border-zinc-100/80">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm">
                <User size={16} className="text-[#0A0A0A]" />
              </div>
              <span className="text-[#0A0A0A]">{article.author || 'Quản trị viên'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar size={16} />
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>

          {/* Nội dung bài viết */}
          {/* Sử dụng CSS tùy chỉnh để style các thẻ HTML được trả về từ database */}
          <div 
            className="mt-8 text-zinc-600 leading-relaxed text-[17px] font-body
            [&>h1]:text-4xl [&>h1]:font-display [&>h1]:font-900 [&>h1]:text-[#0A0A0A] [&>h1]:mb-6 [&>h1]:mt-12 [&>h1]:tracking-tight
            [&>h2]:text-3xl [&>h2]:font-display [&>h2]:font-800 [&>h2]:text-[#0A0A0A] [&>h2]:mb-5 [&>h2]:mt-10 [&>h2]:tracking-tight
            [&>h3]:text-2xl [&>h3]:font-display [&>h3]:font-800 [&>h3]:text-[#0A0A0A] [&>h3]:mb-4 [&>h3]:mt-8
            [&>p]:mb-6 [&>p]:leading-[1.8]
            [&>ul]:list-none [&>ul]:pl-2 [&>ul]:mb-6 [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:mb-3 [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-2.5 [&>ul>li]:before:w-2 [&>ul>li]:before:h-2 [&>ul>li]:before:bg-[#ff0000] [&>ul>li]:before:rounded-full
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-6 [&>ol>li]:mb-3 [&>ol>li::marker]:font-display [&>ol>li::marker]:font-800 [&>ol>li::marker]:text-[#0A0A0A]
            [&>a]:text-[#ff0000] [&>a]:font-800 hover:[&>a]:underline
            [&>img]:rounded-[1.5rem] [&>img]:my-10 [&>img]:w-full [&>img]:object-cover [&>img]:shadow-[0_15px_35px_rgba(0,0,0,0.1)]
            [&>blockquote]:border-l-4 [&>blockquote]:border-[#ff0000] [&>blockquote]:bg-zinc-50 [&>blockquote]:p-6 [&>blockquote]:rounded-r-2xl [&>blockquote]:italic [&>blockquote]:text-zinc-800 [&>blockquote]:my-8 [&>blockquote]:font-serif [&>blockquote]:text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </div>
  );
}
