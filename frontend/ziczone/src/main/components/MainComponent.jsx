import React, { useEffect, useState } from "react";
import "../styles/MainMain.css";
import HelpZone from "./HelpZone";
import CompanySilde from "./CompanySilde";
import NoLoginBannerSlide from "./NoLoginBannerSlide";
import LoginBannerUserCard from "./LoginBannerUserCard";
import axios from "axios";
import personalMImage from "../../common/card/assets/personal_m_image.png";
import personalFImage from "../../common/card/assets/personal_f_image.png";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MainPickCard from "./MainPickCard";
import PickCard from "../../common/card/components/PickCard";
import Layout from "../../common/layout/layout";
import BoardItem from "../../helpzone/components/BoardItem";

const NoLoginMainComponent = ({ board }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [pickCards, setPickCards] = useState([]);
  const [helpZones, sethelpZones] = useState([]);
  const [filterType, setFilterType] = useState("latest");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(8);
  const [banner, setBanner] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/pickcards")
      .then((response) => {
        setPickCards(response.data);
      })
      .catch((error) => {
        console.error("Error fetching pick cards: ", error);
      });

    axios
      //엔드포인트로 GET요청, 파라미터를 함께 보냄
      .get("/api/user/board/filter", {
        params: {
          filterType,
          page,
          size,
        },
      })
      .then((res) => {
        // 응답 데이터는 res.data.dtoList에 있고 이 데이터를 helpZones 상태에 저장함
        sethelpZones(res.data.dtoList);
        console.log("헬프존 api ", res.data);
      })
      .catch((error) => {
        console.error("Error help", error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true);
          setUserInfo(decodedToken); // 토큰에서 필요한 사용자 정보 설정
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Invalid token", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false); // 토큰이 없으면 로그아웃 상태로 설정
    }
  }, []);

  const userId = localStorage.getItem("userId");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleCardClick = (userId) => {
    navigate(`/pickzone/${isLoggedIn ? "loggedInPersonalId" : "personalId"}`);
  };

  return (
    <Layout>
      <div className="main_container">
        {isLoggedIn ? <LoginBannerUserCard /> : <NoLoginBannerSlide />}
        <div className="pickzone">
          <h1>PICK 존</h1>
          <div className="user_card_container">
            {pickCards.slice(0, 4).map((pick, index) => {
              const userImage =
                pick.gender === "MALE" ? personalMImage : personalFImage;
              return (
                <MainPickCard
                  key={index}
                  companyId={pick.companyId}
                  personalId={pick.personalId}
                  userId={pick.userId}
                  userName={pick.userName}
                  userIntro={pick.userIntro}
                  gender={userImage}
                  jobName={pick.jobName}
                  personalCareer={pick.personalCareer}
                  techUrl={pick.techUrl}
                  scrap={pick.scrap}
                  onClick={() => handleCardClick(pick.userId)}
                  berryPoint={pick.berryPoint}
                />
              );
            })}
          </div>
        </div>
        <div className="helpzone">
          <h1>HELP 존</h1>
          {helpZones.slice(0, 5).map((board) => (
            <BoardItem key={board.corrId} board={board} userId={userId} />
          ))}
        </div>
        <div className="company_slide">
          <h1>직존과 함께하는 기업</h1>
          <CompanySilde />
        </div>
      </div>
    </Layout>
  );
};

export default NoLoginMainComponent;
