const fs = require('fs');

const API_BASE_URL = 'http://localhost:8080/api/v1';

const data = {
  "iphone-15-pro-max-256gb": {
    description: "Điện thoại cao cấp khung Titan, chip A17 Pro mạnh mẽ hỗ trợ chơi game đồ họa cao.",
    specification: {
      processor: "Apple A17 Pro",
      ram: "8GB",
      screenSize: "6.7\" Super Retina XDR OLED",
      battery: "4422 mAh",
      mainCamera: "48MP + 12MP + 12MP",
      os: "iOS 17"
    }
  },
  "samsung-galaxy-s24-ultra": {
    description: "Flagship AI thông minh tích hợp bút S-Pen và cụm camera 200MP xuất sắc.",
    specification: {
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      ram: "12GB",
      screenSize: "6.8\" Dynamic AMOLED 2X 120Hz",
      battery: "5000 mAh",
      mainCamera: "200MP + 50MP + 12MP + 10MP",
      os: "Android 14 (One UI 6.1)"
    }
  },
  "xiaomi-14-ultra-16gb-512gb": {
    description: "Siêu phẩm nhiếp ảnh kết hợp cùng Leica với ống kính cảm biến 1 inch.",
    specification: {
      processor: "Snapdragon 8 Gen 3",
      ram: "16GB",
      screenSize: "6.73\" LTPO AMOLED 2K",
      battery: "5000 mAh",
      mainCamera: "50MP + 50MP + 50MP + 50MP",
      os: "Android 14 (Xiaomi HyperOS)"
    }
  },
  "asus-rog-phone-8-pro": {
    description: "Quái thú Gaming với hệ thống tản nhiệt tiên tiến và màn hình 165Hz siêu mượt.",
    specification: {
      processor: "Snapdragon 8 Gen 3",
      ram: "24GB",
      screenSize: "6.78\" LTPO AMOLED 165Hz",
      battery: "5500 mAh",
      mainCamera: "50MP + 32MP + 13MP",
      os: "Android 14"
    }
  },
  "iphone-13-128gb": {
    description: "Thiết kế gọn nhẹ, hiệu năng ổn định cùng mức giá cực kỳ hấp dẫn.",
    specification: {
      processor: "Apple A15 Bionic",
      ram: "4GB",
      screenSize: "6.1\" Super Retina XDR OLED",
      battery: "3240 mAh",
      mainCamera: "12MP + 12MP",
      os: "iOS 17"
    }
  },
  "samsung-galaxy-z-fold5-512gb": {
    description: "Smartphone gập mở đa nhiệm tối ưu, màn hình rộng rãi như một chiếc máy tính bảng.",
    specification: {
      processor: "Snapdragon 8 Gen 2 for Galaxy",
      ram: "12GB",
      screenSize: "Màn chính 7.6\" Dynamic AMOLED 2X, Màn phụ 6.2\"",
      battery: "4400 mAh",
      mainCamera: "50MP + 12MP + 10MP",
      os: "Android 13 (Up to Android 14)"
    }
  },
  "nubia-red-magic-9-pro": {
    description: "Điện thoại chuyên game mặt lưng phẳng hoàn toàn, tích hợp quạt tản nhiệt RGB cơ học.",
    specification: {
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      screenSize: "6.85\" AMOLED 120Hz (Camera ẩn dưới màn hình)",
      battery: "6500 mAh",
      mainCamera: "50MP + 50MP + 2MP",
      os: "Android 14 (REDMAGIC OS 9.0)"
    }
  },
  "oppo-find-x7-ultra": {
    description: "Đỉnh cao nhiếp ảnh với 2 ống kính tiềm vọng tele hợp tác tinh chỉnh cùng Hasselblad.",
    specification: {
      processor: "Snapdragon 8 Gen 3",
      ram: "16GB",
      screenSize: "6.82\" LTPO AMOLED 2K",
      battery: "5000 mAh",
      mainCamera: "50MP + 50MP + 50MP + 50MP",
      os: "Android 14 (ColorOS 14)"
    }
  },
  "vivo-x100-pro-5g": {
    description: "Sử dụng chip Dimensity mạnh nhất cùng ống kính ZEISS phủ lớp chống lóa APO tiêu chuẩn.",
    specification: {
      processor: "MediaTek Dimensity 9300",
      ram: "16GB",
      screenSize: "6.78\" LTPO AMOLED 120Hz",
      battery: "5400 mAh",
      mainCamera: "50MP + 50MP + 50MP",
      os: "Android 14 (Funtouch OS 14)"
    }
  },
  "xiaomi-redmi-note-13-pro-5g": {
    description: "Quốc dân tầm trung sở hữu camera 200MP, sạc nhanh 67W và màn hình AMOLED sắc nét.",
    specification: {
      processor: "Snapdragon 7s Gen 2",
      ram: "8GB",
      screenSize: "6.67\" AMOLED 1.5K 120Hz",
      battery: "5100 mAh",
      mainCamera: "200MP + 8MP + 2MP",
      os: "Android 13 (Up to MIUI 14 / HyperOS)"
    }
  }
};

async function updateProducts() {
  const res = await fetch(`${API_BASE_URL}/products?size=100`);
  const list = await res.json();
  
  for (const item of list.content) {
    const slug = item.slug;
    const newData = data[slug];
    if (newData) {
      console.log(`Updating ${slug}...`);
      const detailRes = await fetch(`${API_BASE_URL}/products/${slug}`);
      const product = await detailRes.json();
      
      if (!product || !product.id) {
          console.error(`Skipping ${slug} - could not fetch details`, product);
          continue;
      }
      
      const spec = {
        screenSize: newData.specification.screenSize,
        os: newData.specification.os,
        processor: newData.specification.processor,
        mainCamera: newData.specification.mainCamera,
        selfieCamera: newData.specification.selfieCamera,
        battery: newData.specification.battery,
        sim: newData.specification.sim,
        ram: newData.specification.ram,
        storage: newData.specification.storage
      };
      
      const payload = {
        name: product.name,
        description: newData.description, // unconditionally update
        basePrice: product.basePrice,
        salePrice: newData.salePrice || product.salePrice, // new field
        thumbnail: product.thumbnail,
        category: product.category?.name,
        brand: product.brand?.name,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        specification: spec,
        variants: product.variants?.map(v => {
          const { id, ...rest } = v;
          return {
            ...rest,
            stockQuantity: v.stockQuantity
          };
        }),
        images: product.images?.map(i => {
            const { id, ...rest } = i;
            return rest;
        })
      };
      
      const updateRes = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (updateRes.ok) {
        console.log(`Updated ${slug} successfully.`);
      } else {
        const error = await updateRes.text();
        console.error(`Failed to update ${slug}: ${error}`);
      }
    }
  }
}

updateProducts().catch(console.error);
