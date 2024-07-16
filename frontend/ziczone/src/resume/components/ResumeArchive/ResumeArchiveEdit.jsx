import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../../styles/ResumeArchive.css";
import ResumeArchiveInputEdit from "./ResumeArchiveInputEdit";

const ResumeArchiveEdit = ({ setArchive }) => {
    const userId = 7;
    const [archiveData, setArchiveData] = useState({
        git: '',
        notion: '',
        blog: ''
    });

    useEffect(() => {
        // 서버로부터 데이터 가져오기
        axios.get(`/api/resumes/${userId}`)
            .then(response => {
                const data = response.data.archive;
                setArchiveData({
                    git: data.arch_git,
                    notion: data.arch_notion,
                    blog: data.arch_blog
                });
                setArchive({
                    git: data.arch_git,
                    notion: data.arch_notion,
                    blog: data.arch_blog
                });
            })
            .catch(error => {
                console.error("Error fetching archive data", error);
            });
    }, [userId, setArchive]);

    const updateArchiveData = (newData) => {
        setArchiveData(prevData => {
            const updatedData = { ...prevData, ...newData };
            setArchive(updatedData);
            return updatedData;
        });
    };

    return (
        <div className="resume_archive">
            <div className="resume_archive_title">
                <p className="archive_title">아카이브</p>
            </div>
            <div className="resume_bar"></div>
            <ResumeArchiveInputEdit
                archiveData={archiveData}
                updateArchiveData={updateArchiveData}
            />
        </div>
    );
};

export default ResumeArchiveEdit;
