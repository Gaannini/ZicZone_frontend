import axios from 'axios';
import config from '../../config';

const api = axios.create({
  baseURL: config.baseURL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  async error => {
    if(error.response.status === 401 && error.response.data.message === "Access token expired"){
      console.log("토큰 만료");

      // 쿠키에서 Refresh Token을 가져옴(정규식)
      const refreshToken = document.cookie.replace(/(?:(?:^|.*;\s*)refresh_token\s*\=\s*([^;]*).*$)|^.*$/,"$1"); 
      const accessToken = localStorage.getItem('token'); // access Token

      try {
        const response = await api.post("/api/token/refresh", { accessToken, refreshToken });
          const newAccessToken = response.data.access_token;
          localStorage.setItem("token", newAccessToken);
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(error.config);
      } catch (refreshError) {
        if (refreshError.response.status === 401 && refreshError.response.data.message === "Refresh token is expired") {
          // 로그아웃 처리 및 로그인 페이지로 리다이렉트
          handleLogout();
        } else {
          console.error("토큰 재발급 중 오류 발생:", refreshError);
          return Promise.reject(refreshError);
        }
      }
    }else{
      // 다른 종류의 인증 오류
      console.error("인증 오류:", error.response.data.message);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// 로그아웃 처리 함수
const handleLogout = async (dispatch) => {
  const userId = localStorage.getItem("userId");

  localStorage.clear();
  await api.post(`/sse/logout/${userId}`);
  await api.post('/api/logout');

  window.location.href = "/login"; // 로그인 페이지로 리다이렉트
};

export default api;