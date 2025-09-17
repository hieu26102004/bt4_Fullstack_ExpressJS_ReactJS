interface User {
  email: string;
  name: string;
  id: string;
}
import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/layout/header.context";
import Breadcrumb from "./components/layout/Breadcrumb";
import axios from "./util/axios.customize";
import { AuthContext } from "./components/context/auth.context";
import "./styles/products.css";


const App = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");
  const { setAuth, appLoading, setAppLoading } = context;

  const fetchAccount = async () => {
    try {
      // Check if there's a token in localStorage first
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token with backend
          const res = await axios.get("/api/v1/user");
          if ((res?.data as any)?.code === 0 && (res?.data as any)?.data) {
            const userData = (res.data as any).data;
            setAuth({
              isAuthenticated: true,
              user: {
                email: userData.email,
                name: userData.name,
                id: userData.id,
              },
            });
          } else {
            // Invalid response structure, clear auth
            localStorage.clear();
            setAuth({
              isAuthenticated: false,
              user: { email: '', name: '', id: '' }
            });
          }
        } catch (apiError: any) {
          console.error("Token verification failed:", apiError);
          
          // Check if it's a token outdated error
          if (apiError.tokenOutdated || apiError.response?.data?.code === "TOKEN_OUTDATED") {
            console.warn("Token is outdated, user needs to login again");
            localStorage.clear();
            setAuth({
              isAuthenticated: false,
              user: { email: '', name: '', id: '' }
            });
          } else {
            // Use saved user data if API fails but token exists (for offline scenarios)
            try {
              const user = JSON.parse(savedUser);
              setAuth({
                isAuthenticated: true,
                user: {
                  email: user.email || '',
                  name: user.name || '',
                  id: user._id || user.id || '',
                },
              });
            } catch (parseError) {
              console.error("Error parsing saved user:", parseError);
              localStorage.clear();
              setAuth({
                isAuthenticated: false,
                user: { email: '', name: '', id: '' }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  if (appLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Breadcrumb />
      <Outlet />
    </div>
  );
};

export default App;