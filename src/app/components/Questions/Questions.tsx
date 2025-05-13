'use client';

import React from 'react';
import Rating from '../Rating/Rating'; // Assuming Rating component is in this path

export interface Question {
    id: string | number; // Unique identifier for each question
    Type: string;
    Seniority: string;
    Topic: string;
    Question: string;
    grade?: number; // Optional initial grade
}

interface QuestionsTableProps {
    questions: Question[];
    onGradeChange: (questionId: string | number, grade: number) => void;
    title?: string;
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({ questions, onGradeChange, title }) => {
    if (!questions || questions.length === 0) {
        return <p className="text-gray-600">No questions available.</p>;
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white p-6">
            {title && <h2 className="text-2xl font-semibold mb-6 text-gray-700">{title}</h2>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seniority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Topic
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{question.Type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.Seniority}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.Topic}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 min-w-[300px] max-w-md break-words">{question.Question}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Rating
                                    initialRating={question.grade || 0}
                                    onRating={(grade) => onGradeChange(question.id, grade)}
                                    totalStars={5}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuestionsTable;
