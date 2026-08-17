import axiosCustom from "@/axiosCustom";

const ProductServices = {
    getProductAll: () => {
        return axiosCustom.get('products');
    },
    getProductOne: (id) => {
        return axiosCustom.get(`products/${id}`);
    },
    productInsert: (data) => {
        return axiosCustom.post('products', data);
    },
    productUpdate: (id, data) => {
        return axiosCustom.put(`products/${id}`, data);
    },
    productDelete: (id) => {
        return axiosCustom.delete(`products/${id}`);
    }
};

export default ProductServices;
