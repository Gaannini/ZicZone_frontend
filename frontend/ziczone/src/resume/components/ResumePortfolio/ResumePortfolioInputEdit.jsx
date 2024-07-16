import React from 'react';
import useFileUpload from './../../hooks/useFileUpload';
import file_delete from "./../../assets/Delete.png";
import resume_delete from "./../../assets/Minus.png"

const ResumePortfolioInputEdit = ({ id, removeInput }) => {
    const {
        fileInputRef,
        fileName,
        handleButtonClick,
        handleFileChange,
        handleClearFile,
    } = useFileUpload();

    return (
        <div className="resume_portfolio_upload">
            <div className='portfolio_file_upload'>
                {fileName && <span className="portfolio_file_name">{fileName}</span>}
                {fileName && <img src={file_delete} alt="삭제" onClick={handleClearFile} style={{ cursor: 'pointer' }} />}
            </div>
            <button onClick={handleButtonClick} className="port_upload_button">
                파일첨부
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="portfolio_input_file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            <div className="port_delete" onClick={removeInput}>
                <img src={resume_delete} alt="delete" />
            </div>
        </div>
    );
};

export default ResumePortfolioInputEdit;
