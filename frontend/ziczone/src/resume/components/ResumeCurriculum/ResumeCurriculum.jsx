import React, { useEffect, useState } from "react";
import "./../../styles/ResumeCurriculum.css";
import plus_btn from "./../../assets/Plus_btn.png";
import ResumeCurriculumInputEdit from "./ResumeCurriculumInputEdit";
import useAddInput from "./../../hooks/useAddInput";

const ResumeCurriculum = ({ setCurriculum }) => {
    const [inputs, addInput, removeInput] = useAddInput();
    const [curriculumList, setCurriculumList] = useState([]);

    const updateCurriculum = (id, newCurriculum) => {
        setCurriculumList((prevList) => {
            const updatedList = prevList.map((curriculum) =>
                curriculum.id === id ? { ...curriculum, ...newCurriculum } : curriculum
            );
            if (!updatedList.find(curriculum => curriculum.id === id)) {
                updatedList.push({ id, ...newCurriculum });
            }
            return updatedList;
        });
    };

    const addCurriculumInput = () => {
        const id = addInput();
        setCurriculumList((prevList) => [...prevList, { id, startDate: "", endDate: "", course: "", institution: "" }]);
    };

    useEffect(() => {
        setCurriculum(curriculumList);
    }, [curriculumList, setCurriculum]);

    return (
        <div className="resume_curri">
            <div className="resume_curri_title">
                <p className="curri_title">교육이력</p>
                <div className="plus_button" onClick={addCurriculumInput}>
                    <img src={plus_btn} alt="Plus_btn" />
                </div>
            </div>
            <div className="resume_bar"></div>
            {inputs.map((id) => (
                <ResumeCurriculumInputEdit
                    key={id}
                    id={id}
                    removeInput={() => {
                        removeInput(id);
                        setCurriculumList((prevList) => 
                            prevList.filter((curriculum) => curriculum.id !== id)
                        );
                    }}
                    updateCurriculum={updateCurriculum}
                />
            ))}
        </div>
    );
};

export default ResumeCurriculum;
