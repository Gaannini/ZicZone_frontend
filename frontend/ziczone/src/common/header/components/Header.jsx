import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import header from "../assets/Header.png";
import "./../styles/Header.css";
import NonLogin from "./HeaderNonLogin";
import UserLogin from "./HeaderUserLogin";
import CompLogin from "./HeaderCompLogin";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../store/actions/userActions";
import { deleteAlarm } from "../../../store/actions/alarmActions";
import api from '../../config/axiosInstance';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState();
  const [userName, setUserName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setIsLoggedIn(true);
            fetchUserData(decodedToken);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Invalid token", error);
          setIsLoggedIn(false);
        }

      } else {
        setIsLoggedIn(false);
      }
    };
    checkToken();

  }, []);

  const fetchUserData = (decodedToken) => {
    const userId = decodedToken.userId;
    const userType = decodedToken.role;

    if (userType === "COMPANY") {
      api
        .get(`/api/main/companyUser/${userId}`)
        .then((res) => {
          setUserName(res.data.userName);
          setCompanyLogo(res.data.companyLogo);
          setUserRole(userType);
        })
        .catch((error) => {
          console.error("Error fetching company user data: ", error);
        });
    } else if (userType === "PERSONAL") {
      api
        .get(`/api/main/personalUser/${userId}`)
        .then((res) => {
          setUserName(res.data.userName);
          setUserRole(userType);
        })
        .catch((error) => {
          console.error("Error fetching personal user data: ", error);
        });
    }
  };

  const clearUserData = () => {
    setUserName("");
    setUserRole(null);
    setCompanyLogo("");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    if (userId && token && userRole === "PERSONAL") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        await api.post(
          `/sse/logout/${userId}`,
          {},
          {
            headers: {
              Authorization: token,
            },
          }
        );
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
    }
    await api.post('/api/logout');

    dispatch(logoutUser());
    dispatch(deleteAlarm());
    
    window.location.reload("/");
    setIsLoggedIn(false);
    clearUserData();
  };
  

  return (
    <div className="header">
      <nav className="header_nav">
        <div className="header_logo">
          <NavLink to="/">
            <img src={header} alt="Logo" />
          </NavLink>
        </div>
        <div className="header_nav_list">
          <div className="header_pick_zone">
            <div>
            {localStorage.getItem('userRole') === "COMPANY" ? (
                <NavLink to="/companypick" activeClassName="active">
                  PICK존
                </NavLink>
              ) : localStorage.getItem('userRole') === "PERSONAL" ? (
                <NavLink to="/personalpick" activeClassName="active">
                  PICK존
                </NavLink>
              ) : (
                <NavLink to="/personalpick">
                  PICK존
                </NavLink>
              )}

            </div>
          </div>
          <div className="header_help_zone">
            <div>
              <NavLink to="/helpzone" activeClassName="active">
                HELP존
              </NavLink>
            </div>
          </div>
          <div className="header_company_zone">
            <div>
              <NavLink to="/companyzone" activeClassName="active">
                COMPANY존
              </NavLink>
            </div>
          </div>
        </div>
        <div className="login_component_div">
          {isLoggedIn ? (
            userRole === "COMPANY" ? (
              <CompLogin
                userName={userName}
                companyLogo={companyLogo}
                onLogout={handleLogout}
              />
            ) : (
              <UserLogin userName={userName} onLogout={handleLogout} />
            )
          ) : (
            <NonLogin />
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
