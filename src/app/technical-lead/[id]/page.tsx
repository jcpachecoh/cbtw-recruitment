'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import QuestionsTable from '../../components/Questions/Questions';
import { react_node } from '../interview_questions/react-node';

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}


const TechnicalLeadPage: React.FC = () => {
  const { id } = useParams();
  
    const handleGradeChange = (questionId: string | number, grade: number) => {
        console.log(`Question ${questionId} graded as ${grade}`);
    };

    const technologies: Tab[] = [
        {
            id: 'react',
            label: 'React - Node',
            content: (
                <QuestionsTable
                    questions={react_node}
                    onGradeChange={handleGradeChange}
                />
            ),
        },
        {
            id: 'nextjs',
            label: 'Next.js',
            content: (
                <div>
                    <h3 className="text-xl font-semibold mb-2">Next.js Framework</h3>
                    <p>Details about Next.js features like SSR, SSG, API routes, routing, image optimization, and more.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Server-Side Rendering (SSR) and Static Site Generation (SSG)</li>
                        <li>File-system based routing (App Router / Pages Router)</li>
                        <li>API Routes</li>
                        <li>Built-in CSS and Sass support, and support for any CSS-in-JS library</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'nodejs',
            label: 'Node.js',
            content: (
                <div>
                    <h3 className="text-xl font-semibold mb-2">Node.js Backend</h3>
                    <p>Information on building backend services with Node.js, Express.js, database integrations (e.g., PostgreSQL, MongoDB), ORMs (e.g., Prisma, Sequelize).</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Event-driven, non-blocking I/O model</li>
                        <li>Express.js framework for building web applications</li>
                        <li>NPM (Node Package Manager)</li>
                        <li>Asynchronous programming with Promises and async/await</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'typescript',
            label: 'TypeScript',
            content: (
                <div>
                    <h3 className="text-xl font-semibold mb-2">TypeScript</h3>
                    <p>Benefits of using TypeScript, static typing, interfaces, generics, and how it integrates with React/Node.js projects.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Static typing for JavaScript</li>
                        <li>Improved code quality and maintainability</li>
                        <li>Better tooling and autocompletion</li>
                        <li>Gradual adoption</li>
                    </ul>
                </div>
            ),
        },
    ];

    const [activeTab, setActiveTab] = useState<string>(technologies[0].id);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Technical Lead Dashboard</h1>
            <div className="flex border-b border-gray-300 mb-6">
                {technologies.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-6 text-center font-medium text-base leading-5 rounded-t-lg 
                        ${activeTab === tab.id
                                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="p-4 bg-white shadow-lg rounded-lg min-h-[300px]">
                {technologies.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default TechnicalLeadPage;
