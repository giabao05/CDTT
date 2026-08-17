const testPayload = {
    name: "OPPO Find X7 Ultra Edit",
    description: "Đỉnh cao nhiếp ảnh",
    basePrice: 22500000,
    thumbnail: "https://dummyimage.com/600x600/000/fff&text=Find+X7+Ultra",
    category: "Điện thoại thông minh",
    brand: "OPPO",
    isFeatured: true,
    isActive: true,
    specification: {
      screenSize: "6.82\" LTPO AMOLED 2K",
      processor: "Snapdragon 8 Gen 3",
      mainCamera: "50MP",
      battery: "5000 mAh",
      os: "Android 14"
    },
    variants: [
      {
        id: null,
        sku: "OPFX7U-256-BRN",
        color: "Sepia Brown",
        storage: "256GB",
        ram: "16GB",
        price: 22500000,
        stockQuantity: 18,
        imageUrl: "",
        isActive: true
      }
    ],
    images: []
};

async function testUpdate() {
    // Assuming OPPO Find X7 Ultra is ID 18 based on insertion
    const res = await fetch('http://localhost:8080/api/v1/products/18', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
    });
    
    if (!res.ok) {
        const text = await res.text();
        console.error('Error:', res.status, text);
    } else {
        const data = await res.json();
        console.log('Success:', data.id);
    }
}
testUpdate();
