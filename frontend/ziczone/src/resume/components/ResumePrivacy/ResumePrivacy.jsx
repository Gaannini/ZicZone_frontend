import React from "react";
import "./../../styles/ResumePrivacy.css";
import email from "./../../assets/Email.png";
import phone from "./../../assets/Phone.png";
import birthdate from "./../../assets/Birthdate.png";
import useUploadImage from "../../hooks/useUploadImage";

const ResumePrivacy = () => {
    const { imageSrc, isImageUploaded, handleImageChange, handleDeleteImage } = useUploadImage();

    const handleImageClick = () => {
        document.getElementById('imageInput').click();
    };

    return (
        <div className="resume_privacy">
            <div className="resume_privacy_left">
                <div className="resume_name">
                    <input type="text" placeholder="이름" />
                </div>
                <div className="resume_email">
                    <img src={email} alt="Email" />
                    <input type="text" placeholder="ziczone@email.com" />
                </div>
                <div className="resume_phone">
                    <img src={phone} alt="Phone" />
                    <input type="text" placeholder="010-0000-0000" />
                </div>
                <div className="resume_birthdate">
                    <img src={birthdate} alt="Birthdate" />
                    <input type="text" placeholder="YYYY년 MM월 DD일" />
                </div>
            </div>
            <div className="resume_privacy_right">
                <div className="resume_image" onClick={handleImageClick}>
                    <img src={imageSrc} alt="증명사진" />
                </div>
                <input
                    type="file"
                    id="imageInput"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {isImageUploaded && (
                    <div className="privacy_delete_btn">
                        <button onClick={handleDeleteImage}>사진 삭제하기</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResumePrivacy;
