import axios from "axios";

const axiosCustom = axios.create({
    baseURL: "http://localhost:8080/api"
    //  timeout: 5000,
    //  headers: { "X-Custom-Header": "foobar" },
});

axiosCustom.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default axiosCustom;
