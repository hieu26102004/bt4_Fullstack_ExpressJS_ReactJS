interface User {
  email: string;
  name: string;
  id: string;
}
import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/layout/header.context";
import axios from "./util/axios.customize";
import { AuthContext } from "./components/context/auth.context";
import "./styles/products.css";


const App = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");
  const { setAuth, appLoading, setAppLoading } = context;

  const fetchAccount = async () => {
    try {
      const res = await axios.get<User>("http://localhost:3001/api/user");
      if (res?.data?.email) {
        setAuth({
          isAuthenticated: true,
          user: {
            email: res.data.email,
            name: res.data.name,
            id: res.data.id,
          },
        });
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
      <Outlet />
    </div>
  );
};

export default App;