const products = [
  {
    "name": "iPhone 15 Pro Max 256GB",
    "category": "Gaming_phone",
    "brand": "Apple",
    "description": "Điện thoại cao cấp khung Titan, chip A17 Pro mạnh mẽ hỗ trợ chơi game đồ họa cao.",
    "basePrice": 29990000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=iPhone+15+Pro+Max",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.7\" Super Retina XDR OLED",
      "processor": "Apple A17 Pro",
      "mainCamera": "48MP + 12MP + 12MP",
      "battery": "4422 mAh",
      "os": "iOS 17"
    },
    "variants": [
      {
        "sku": "IP15PM-256-NAT",
        "color": "Titanium Natural",
        "storage": "256GB",
        "ram": "8GB",
        "price": 29990000,
        "stockQuantity": 20
      },
      {
        "sku": "IP15PM-512-BLU",
        "color": "Titanium Blue",
        "storage": "512GB",
        "ram": "8GB",
        "price": 35990000,
        "stockQuantity": 15
      }
    ]
  },
  {
    "name": "Samsung Galaxy S24 Ultra 12GB/256GB",
    "category": "Điện thoại thông minh",
    "brand": "Samsung",
    "description": "Flagship AI thông minh tích hợp bút S-Pen và cụm camera 200MP xuất sắc.",
    "basePrice": 28490000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=S24+Ultra",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.8\" Dynamic AMOLED 2X 120Hz",
      "processor": "Snapdragon 8 Gen 3 for Galaxy",
      "mainCamera": "200MP + 50MP + 12MP + 10MP",
      "battery": "5000 mAh",
      "os": "Android 14 (One UI 6.1)"
    },
    "variants": [
      {
        "sku": "S24U-256-BLK",
        "color": "Đen Titan",
        "storage": "256GB",
        "ram": "12GB",
        "price": 28490000,
        "stockQuantity": 25
      },
      {
        "sku": "S24U-512-GLD",
        "color": "Vàng Titan",
        "storage": "512GB",
        "ram": "12GB",
        "price": 32490000,
        "stockQuantity": 15
      }
    ]
  },
  {
    "name": "Xiaomi 14 Ultra 16GB/512GB",
    "category": "Điện thoại thông minh",
    "brand": "Xiaomi",
    "description": "Siêu phẩm nhiếp ảnh kết hợp cùng Leica với ống kính cảm biến 1 inch.",
    "basePrice": 29990000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Xiaomi+14+Ultra",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.73\" LTPO AMOLED 2K",
      "processor": "Snapdragon 8 Gen 3",
      "mainCamera": "50MP + 50MP + 50MP + 50MP",
      "battery": "5000 mAh",
      "os": "Android 14 (Xiaomi HyperOS)"
    },
    "variants": [
      {
        "sku": "XI14U-512-WHT",
        "color": "Trắng",
        "storage": "512GB",
        "ram": "16GB",
        "price": 29990000,
        "stockQuantity": 10
      },
      {
        "sku": "XI14U-512-BLK",
        "color": "Đen",
        "storage": "512GB",
        "ram": "16GB",
        "price": 29990000,
        "stockQuantity": 15
      }
    ]
  },
  {
    "name": "ASUS ROG Phone 8 Pro",
    "category": "Gaming_phone",
    "brand": "ASUS",
    "description": "Quái thú Gaming với hệ thống tản nhiệt tiên tiến và màn hình 165Hz siêu mượt.",
    "basePrice": 35490000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=ROG+Phone+8+Pro",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.78\" LTPO AMOLED 165Hz",
      "processor": "Snapdragon 8 Gen 3",
      "mainCamera": "50MP + 32MP + 13MP",
      "battery": "5500 mAh",
      "os": "Android 14"
    },
    "variants": [
      {
        "sku": "ROG8P-1TB-BLK",
        "color": "Phantom Black",
        "storage": "1TB",
        "ram": "24GB",
        "price": 35490000,
        "stockQuantity": 15
      }
    ]
  },
  {
    "name": "iPhone 13 128GB",
    "category": "Điện thoại thông minh",
    "brand": "Apple",
    "description": "Thiết kế gọn nhẹ, hiệu năng ổn định cùng mức giá cực kỳ hấp dẫn.",
    "basePrice": 13690000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=iPhone+13",
    "images": [],
    "isFeatured": false,
    "isActive": true,
    "specification": {
      "screenSize": "6.1\" Super Retina XDR OLED",
      "processor": "Apple A15 Bionic",
      "mainCamera": "12MP + 12MP",
      "battery": "3240 mAh",
      "os": "iOS 17"
    },
    "variants": [
      {
        "sku": "IP13-128-ST",
        "color": "Starlight",
        "storage": "128GB",
        "ram": "4GB",
        "price": 13690000,
        "stockQuantity": 40
      },
      {
        "sku": "IP13-128-PNK",
        "color": "Pink",
        "storage": "128GB",
        "ram": "4GB",
        "price": 13690000,
        "stockQuantity": 40
      }
    ]
  },
  {
    "name": "Samsung Galaxy Z Fold5 512GB",
    "category": "Điện thoại thông minh",
    "brand": "Samsung",
    "description": "Smartphone gập mở đa nhiệm tối ưu, màn hình rộng rãi như một chiếc máy tính bảng.",
    "basePrice": 32990000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Z+Fold5",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "7.6\" Dynamic AMOLED 2X",
      "processor": "Snapdragon 8 Gen 2 for Galaxy",
      "mainCamera": "50MP + 12MP + 10MP",
      "battery": "4400 mAh",
      "os": "Android 13"
    },
    "variants": [
      {
        "sku": "ZF5-512-BLK",
        "color": "Phantom Black",
        "storage": "512GB",
        "ram": "12GB",
        "price": 32990000,
        "stockQuantity": 10
      },
      {
        "sku": "ZF5-512-CRM",
        "color": "Cream",
        "storage": "512GB",
        "ram": "12GB",
        "price": 32990000,
        "stockQuantity": 10
      }
    ]
  },
  {
    "name": "Nubia Red Magic 9 Pro",
    "category": "Gaming_phone",
    "brand": "Nubia",
    "description": "Điện thoại chuyên game mặt lưng phẳng hoàn toàn, tích hợp quạt tản nhiệt RGB cơ học.",
    "basePrice": 17990000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Red+Magic+9+Pro",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.85\" AMOLED 120Hz",
      "processor": "Snapdragon 8 Gen 3",
      "mainCamera": "50MP + 50MP + 2MP",
      "battery": "6500 mAh",
      "os": "Android 14 (REDMAGIC OS 9.0)"
    },
    "variants": [
      {
        "sku": "RM9P-512-WHT",
        "color": "Snowfall",
        "storage": "512GB",
        "ram": "16GB",
        "price": 21990000,
        "stockQuantity": 15
      }
    ]
  },
  {
    "name": "OPPO Find X7 Ultra",
    "category": "Điện thoại thông minh",
    "brand": "OPPO",
    "description": "Đỉnh cao nhiếp ảnh với 2 ống kính tiềm vọng tele hợp tác tinh chỉnh cùng Hasselblad.",
    "basePrice": 22500000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Find+X7+Ultra",
    "images": [],
    "isFeatured": true,
    "isActive": true,
    "specification": {
      "screenSize": "6.82\" LTPO AMOLED 2K",
      "processor": "Snapdragon 8 Gen 3",
      "mainCamera": "50MP + 50MP + 50MP + 50MP",
      "battery": "5000 mAh",
      "os": "Android 14 (ColorOS 14)"
    },
    "variants": [
      {
        "sku": "OPFX7U-256-BRN",
        "color": "Sepia Brown",
        "storage": "256GB",
        "ram": "16GB",
        "price": 22500000,
        "stockQuantity": 18
      }
    ]
  },
  {
    "name": "Vivo X100 Pro 5G",
    "category": "Điện thoại thông minh",
    "brand": "Vivo",
    "description": "Sử dụng chip Dimensity mạnh nhất cùng ống kính ZEISS phủ lớp chống lóa APO tiêu chuẩn.",
    "basePrice": 19990000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Vivo+X100+Pro",
    "images": [],
    "isFeatured": false,
    "isActive": true,
    "specification": {
      "screenSize": "6.78\" LTPO AMOLED 120Hz",
      "processor": "MediaTek Dimensity 9300",
      "mainCamera": "50MP + 50MP + 50MP",
      "battery": "5400 mAh",
      "os": "Android 14 (Funtouch OS 14)"
    },
    "variants": [
      {
        "sku": "VX100P-512-BLK",
        "color": "Đen Asteroid",
        "storage": "512GB",
        "ram": "16GB",
        "price": 19990000,
        "stockQuantity": 22
      }
    ]
  },
  {
    "name": "Xiaomi Redmi Note 13 Pro 5G",
    "category": "Điện thoại thông minh",
    "brand": "Xiaomi",
    "description": "Quốc dân tầm trung sở hữu camera 200MP, sạc nhanh 67W và màn hình AMOLED sắc nét.",
    "basePrice": 8290000,
    "thumbnail": "https://dummyimage.com/600x600/000/fff&text=Redmi+Note+13+Pro",
    "images": [],
    "isFeatured": false,
    "isActive": true,
    "specification": {
      "screenSize": "6.67\" AMOLED 1.5K 120Hz",
      "processor": "Snapdragon 7s Gen 2",
      "mainCamera": "200MP + 8MP + 2MP",
      "battery": "5100 mAh",
      "os": "Android 13"
    },
    "variants": [
      {
        "sku": "RN13P-256-GRN",
        "color": "Xanh Ngọc Bích",
        "storage": "256GB",
        "ram": "8GB",
        "price": 8290000,
        "stockQuantity": 50
      },
      {
        "sku": "RN13P-256-PUR",
        "color": "Tím Cực Quang",
        "storage": "256GB",
        "ram": "8GB",
        "price": 8290000,
        "stockQuantity": 50
      }
    ]
  }
];

async function insertProducts() {
    for (const p of products) {
        console.log('Inserting', p.name);
        const res = await fetch('http://localhost:8080/api/v1/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
        });
        const data = await res.json();
        console.log('Result:', data);
    }
}
insertProducts();
