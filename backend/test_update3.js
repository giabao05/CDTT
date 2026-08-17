async function testUpdate() {
    const listRes = await fetch('http://localhost:8080/api/v1/products?size=1');
    const listData = await listRes.json();
    const product = listData.content[0];
    const id = product.id;

    const testPayload = {
        name: product.name,
        description: product.description,
        basePrice: String(product.basePrice), // Send as string like frontend
        thumbnail: product.thumbnail,
        category: product.category ? product.category.name : "",
        brand: product.brand ? product.brand.name : "",
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        specification: {
          screenSize: product.specification?.screenSize,
          processor: product.specification?.processor,
          mainCamera: product.specification?.mainCamera,
          battery: product.specification?.battery,
          os: product.specification?.os
        },
        variants: product.variants ? product.variants.map(v => ({
            id: String(v.id), // Sent as string from frontend
            sku: `${product.name}-${v.color}-${v.storage}-${v.ram}`.toUpperCase().replace(/\s+/g, '-'),
            color: v.color,
            storage: v.storage,
            ram: v.ram,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity),
            imageUrl: v.imageUrl || '#888888',
            isActive: v.isActive
        })) : [],
        images: []
    };

    const res = await fetch(`http://localhost:8080/api/v1/products/${id}`, {
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
