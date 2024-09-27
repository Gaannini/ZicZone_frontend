import React, { useEffect, useState } from "react";
import "./../../styles/loginform.css";
import check from "../../assets/check.png";

import useEmailVerification from "../../../join/hooks/useEmailAuth";
import usePasswordValidation from "../../../join/hooks/usePasswordValidation";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux"; // Redux dispatch 훅 import
import { subscribeToSSE, initAlarm } from "../../../store/actions/alarmActions";
import { setUser } from "../../../store/actions/userActions";
import api from "../../../common/config/axiosInstance";

const LoginForm = ({
  title,
  explain1,
  explain2,
  input1,
  input2,
  links,
  setCurrentForm,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Redux dispatch 훅 사용

  //로그인
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginFail, setLoginFail] = useState("");

  //비밀번호 찾기(이메일인증)
  const {
    email: authEmail,
    inputCode: authCode,
    isSend,
    isAuth,
    timeLeft,
    handleEmailChange,
    handleCodeChange,
    sendVerificationEmail,
    verifyAuthCode,
    formatTime,
  } = useEmailVerification("login");

  const {
    password: newPassword,
    confirmPassword,
    isPasswordValid,
    isConfirmValid,
    isChangePassword,
    handlePasswordChange,
    handleConfirmChange,
    changePassword,
  } = usePasswordValidation("login", authEmail);

  useEffect(() => {
    if (isAuth === "auth_success") {
      setCurrentForm("changepassword");
    }
  }, [isAuth, setCurrentForm]);

  const handleInputChange = (value) => (e) => {
    value(e.target.value);
  };

  const saveToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;
      const userId = decodedToken.userId;
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      return { userId, token, role };
    } catch (error) {
      console.error("토큰 디코딩 중 오류 발생:", error);
    }
  };

  //로그인 요청
  const Login = async () => {
    try {
      const response = await api.post("/api/login", {
        email,
        password,
      });

      if (response.status===200) {
        const {access_token, refresh_token} = response.data;

        if(access_token&&refresh_token){
          const user = saveToken(access_token); // accessToken은 localStorage에 저장
          document.cookie = `refresh_token=${refresh_token}; HttpOnly`;
          // document.cookie = `refresh_token=${refresh_token};`;

          if (user) {
            // 구독 및 초기화 작업 수행
            dispatch(setUser(user));
            dispatch(subscribeToSSE(user.userId, access_token));
            dispatch(initAlarm(user.userId, access_token));
          }
        }
        
        setLoginFail("");
        navigate("/");

      } else {
        console.log("로그인 실패:", response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("로그인 실패: 이메일이나 비밀번호가 일치하지 않습니다.");
        setLoginFail("loginworng");
      } else {
        console.error("로그인 오류:", error);
        setLoginFail("loginerror");
      }
    }
  };

  

  // 엔터 키를 눌렀을 때 로그인 함수 호출
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      Login();
    }
  };

  return (
    <div className="rightbox_login">
      {/* 로고 */}
      <img
        className="zzlogo_login"
        src={`${process.env.PUBLIC_URL}/logo.png`}
        alt="직존로고"
      />

      {/* 간단소개 */}
      <p className="explain_login">
        {explain1}
        <br />
        {explain2}
      </p>

      {/* Input(2개) */}
      <input
        className="input_login"
        type={input1.type}
        placeholder={input1.placeholder}
        value={
          title === "login"
            ? email
            : title === "emailauth"
            ? authEmail
            : newPassword
        }
        onChange={
          title === "login"
            ? handleInputChange(setUserEmail)
            : title === "emailauth"
            ? handleEmailChange
            : handlePasswordChange
        }
        onKeyDown={title === "login" ? handleKeyDown : null} // 여기에 추가
      />
      <input
        className="input_login"
        type={input2.type}
        placeholder={input2.placeholder}
        value={
          title === "login"
            ? password
            : title === "emailauth"
            ? authCode
            : confirmPassword
        }
        onChange={
          title === "login"
            ? handleInputChange(setPassword)
            : title === "emailauth"
            ? handleCodeChange
            : handleConfirmChange
        }
        onKeyDown={title === "login" ? handleKeyDown : null} // 여기에 추가
      />

      {/* 타이머 */}
      {isSend === "send_success" && isAuth !== "auth_success" && (
        <p className="timer_login">{formatTime(timeLeft)}</p>
      )}

      {/* 비밀번호 체크 */}
      <img
        className="check1_login"
        src={check}
        alt=""
        style={{ visibility: isPasswordValid ? "visible" : "hidden" }}
      />
      <img
        className="check2_login"
        src={check}
        alt=""
        style={{ visibility: isConfirmValid ? "visible" : "hidden" }}
      />

      {/* 비밀번호 찾기 | 회원가입 */}
      <div className="links_login">
        <p className={links.className} onClick={links.onClick}>
          {links.text}
        </p>
        <p>|</p>
        <p className="joinbtn_login" onClick={() => navigate("/signup")}>
          회원가입
        </p>
      </div>
      {/* 경고메세지 -> 필요시에만 나타나게 */}
      <p className="warningmsg_login login_success">
        {title === "emailauth" && isAuth === "auth_expired"
          ? "인증시간이 만료되었습니다"
          : title === "emailauth" && isAuth === "auth_wrong"
          ? "인증번호가 다릅니다"
          : title === "emailauth" && isSend === "empty_email"
          ? "가입되지 않은 이메일입니다"
          : title === "emailauth" && isSend === "send_fail"
          ? "이메일 전송에 실패하였습니다"
          : title === "emailauth" && isSend === "send_error"
          ? "오류가 발생했습니다"
          : title === "emailauth" && isSend === "invalid_email"
          ? "유효하지 않은 이메일 형식입니다"
          : title === "emailauth" && isSend === "send_success"
          ? "인증번호가 전송되었습니다"
          : title === "changepassword" && !isPasswordValid
          ? "8~16자 영문, 숫자, 특수기호를 포함해주세요"
          : title === "changepassword" && !isConfirmValid
          ? "비밀번호가 일치하지않습니다."
          : title === "changepassword" && isChangePassword === "changeSuccess"
          ? "비밀번호가 변경되었습니다"
          : title === "changepassword" && isChangePassword === "changeFail"
          ? "비밀번호 변경이 실패하였습니다"
          : title === "login" && loginFail === "loginworng"
          ? "다시 입력해주세요"
          : title === "login" && loginFail === "loginerror"
          ? "로그인 오류가 발생했습니다"
          : ""}
      </p>

      {/* 로그인버튼 */}
      <button
        className="loginbtn_login"
        type="submit"
        onClick={
          title === "login"
            ? Login
            : title === "emailauth" && isSend !== "send_success"
            ? sendVerificationEmail
            : title === "emailauth" && isSend === "send_success"
            ? verifyAuthCode
            : changePassword
        }
      >
        {title === "login"
          ? "로 그 인"
          : title === "emailauth" && isSend !== "send_success"
          ? "인증번호 받기"
          : title === "emailauth" && isSend === "send_success"
          ? "인증하기"
          : "비밀번호 변경"}
      </button>
    </div>
  );
};

export default LoginForm;
