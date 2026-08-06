import type { Product, ProductVariant, Brand } from '@/types';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper to map backend ProductResponse to frontend Product type
function mapProduct(backendData: any): Product {
  return {
    id: backendData.id.toString(),
    name: backendData.name,
    brand: backendData.brand?.name as Brand || 'Apple',
    category: 'flagship', // Fallback
    slug: backendData.slug,
    description: backendData.description || '',
    thumbnail: backendData.thumbnail || '',
    images: backendData.images?.map((img: any) => img.imageUrl) || [],
    basePrice: backendData.basePrice || 0,
    baseSalePrice: undefined,
    rating: 5,
    reviewCount: 0,
    isFeatured: backendData.isFeatured || false,
    isNew: false,
    inStock: true,
    variants: backendData.variants?.map((v: any) => {
      let colorCode = '#888888';
      let parsedImageUrl = v.imageUrl || '';

      if (parsedImageUrl.includes('|')) {
        const parts = parsedImageUrl.split('|');
        colorCode = parts[0];
        parsedImageUrl = parts[1];
      } else if (/^#[0-9a-fA-F]{6}$/.test(parsedImageUrl)) {
        colorCode = parsedImageUrl;
        parsedImageUrl = '';
      } else {
        const c = (v.color || '').toLowerCase();
        if (c.includes('đỏ') || c.includes('red')) colorCode = '#ef4444';
        else if (c.includes('xanh lá') || c.includes('green')) colorCode = '#22c55e';
        else if (c.includes('xanh') || c.includes('blue')) colorCode = '#3b82f6';
        else if (c.includes('trắng') || c.includes('white')) colorCode = '#f5f5f5';
        else if (c.includes('đen') || c.includes('black')) colorCode = '#1a1a1a';
        else if (c.includes('vàng') || c.includes('gold') || c.includes('yellow')) colorCode = '#eab308';
        else if (c.includes('tím') || c.includes('purple')) colorCode = '#a855f7';
        else if (c.includes('hồng') || c.includes('pink')) colorCode = '#ec4899';
        else if (c.includes('xám') || c.includes('grey') || c.includes('gray')) colorCode = '#6b7280';
        else if (c.includes('bạc') || c.includes('silver')) colorCode = '#e5e7eb';
        else if (c.includes('titan')) colorCode = '#a3a3a3';
        else if (c.includes('cam') || c.includes('orange')) colorCode = '#f97316';
        else if (c.includes('nâu') || c.includes('brown')) colorCode = '#a16207';
      }

      return {
        id: v.id.toString(),
        color: v.color || '',
        colorCode,
        imageUrl: parsedImageUrl,
        storage: v.storage || '',
        ram: v.ram || '8GB',
        price: v.price || backendData.basePrice || 0,
        stock: v.stockQuantity || 0,
        sku: v.sku || ''
      };
    }) || [],
    specs: {
      screen: backendData.specification?.screenSize || '',
      chip: backendData.specification?.processor || '',
      camera: backendData.specification?.mainCamera || '',
      battery: backendData.specification?.battery || '',
      charging: '',
      os: backendData.specification?.os || ''
    },
    reviews: []
  };
}

export async function fetchProducts(
  category?: string, 
  brand?: string,
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,desc'
): Promise<{ products: Product[], totalPages: number, totalElements: number }> {
  try {
    let url = `${API_BASE_URL}/products`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (brand) params.append('brand', brand);
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', sort);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return {
      products: data.content.map(mapProduct),
      totalPages: data.totalPages,
      totalElements: data.totalElements
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], totalPages: 0, totalElements: 0 };
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/featured`);
    if (!res.ok) throw new Error('Failed to fetch featured products');
    const data = await res.json();
    return data.map(mapProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`);
    if (res.status === 404 || res.status === 500) {
      return null;
    }
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    const product = mapProduct(data);
    
    // Fetch reviews
    try {
      const reviewRes = await fetch(`${API_BASE_URL}/reviews/product/${product.id}`);
      if (reviewRes.ok) {
        const reviewsData = await reviewRes.json();
        product.reviews = reviewsData.map((r: any) => ({
          id: r.id.toString(),
          author: r.authorName || `Khách hàng ${r.userId || ''}`,
          avatar: r.authorAvatar || `https://i.pravatar.cc/150?u=${r.userId || r.id}`,
          rating: r.rating || 5,
          date: new Date(r.createdAt || Date.now()).toLocaleDateString('vi-VN'),
          title: (r.rating || 5) >= 4 ? 'Tuyệt vời' : (r.rating === 3 ? 'Bình thường' : 'Chưa tốt'),
          body: r.comment || '',
          verified: true
        }));
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function createReview(reviewData: any): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error('Failed to create review');
    return await res.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function createProduct(productData: any): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!res.ok) throw new Error('Failed to create product');
    const data = await res.json();
    return mapProduct(data);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, productData: any): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!res.ok) throw new Error('Failed to update product');
    const data = await res.json();
    return mapProduct(data);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string | number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function createOrder(orderData: any): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function fetchOrders(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}



export async function fetchBanners(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners`);
    if (!res.ok) throw new Error("Failed to fetch banners");
    return await res.json();
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function updateUserProfile(id: number | string, data: any): Promise<any> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Failed to update user profile');
    }
    return await res.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function fetchVouchers(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers`);
    if (!res.ok) throw new Error("Failed to fetch vouchers");
    return await res.json();
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return [];
  }
}

export async function fetchArticles(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`);
    if (!res.ok) throw new Error("Failed to fetch articles");
    return await res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function fetchBrands(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return await res.json();
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

// User Orders
export async function fetchUserOrders(email: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/user/${email}`);
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return await res.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

// Favorites
export async function fetchUserFavorites(email: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites/${email}`);
    if (!res.ok) throw new Error('Failed to fetch user favorites');
    return await res.json();
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}

export async function addFavorite(email: string, productId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId })
    });
    return res.ok;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
}

export async function removeFavorite(email: string, productId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites/${email}/${productId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

// Notifications
export async function fetchUserNotifications(email: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${email}`);
    if (!res.ok) throw new Error('Failed to fetch user notifications');
    return await res.json();
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return res.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function changeUserPassword(id: string | number, data: any): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Lỗi cập nhật mật khẩu');
  }
}

export async function deleteUserAccount(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Lỗi xóa tài khoản');
  }
}

export async function uploadFile(file: File): Promise<string | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

