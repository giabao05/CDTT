async function testUpdate() {
    const listRes = await fetch('http://localhost:8080/api/v1/products?size=1');
    const listData = await listRes.json();
    if (!listData.content || listData.content.length === 0) {
        console.error('No products found');
        return;
    }
    const product = listData.content[0];
    const id = product.id;
    console.log('Testing update on product ID:', id);

    const testPayload = {
        name: product.name + " Edit",
        description: product.description,
        basePrice: product.basePrice,
        thumbnail: product.thumbnail,
        category: product.category ? product.category.name : "",
        brand: product.brand ? product.brand.name : "",
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        specification: {
          screenSize: product.specification ? product.specification.screenSize : "",
          processor: product.specification ? product.specification.processor : "",
          mainCamera: product.specification ? product.specification.mainCamera : "",
          battery: product.specification ? product.specification.battery : "",
          os: product.specification ? product.specification.os : ""
        },
        variants: product.variants ? product.variants.map(v => ({
            id: v.id,
            sku: v.sku,
            color: v.color,
            storage: v.storage,
            ram: v.ram,
            price: v.price,
            stockQuantity: v.stockQuantity,
            imageUrl: v.imageUrl,
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
