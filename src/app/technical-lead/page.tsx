"use client";

import React, { useState, useEffect } from "react";
import QuestionsTable from "../components/Questions/Questions";
import { react_node } from "./interview_questions/react-node";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  submittedAt: string;
  status: string;
  recruiterId: string;
  feedback: string;
  technicalLeadId: string;
}

const TechnicalLeadPage: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(
          `/api/technical-lead/candidates?technicalLeadId=${user.id}`
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch candidates");
        }
        setCandidates(result.data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        toast.error("Failed to fetch candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [user?.id]);

  console.log(candidates);

  const handleGradeChange = (questionId: string | number, grade: number) => {
    console.log(`Question ${questionId} graded as ${grade}`);
  };

  const technologies: Tab[] = [
    {
      id: "candidates",
      label: "My Candidates",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">My Assigned Candidates</h3>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No candidates assigned yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LinkedIn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={candidate.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Profile
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            candidate.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : candidate.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {candidate.feedback}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "react",
      label: "React - Node",
      content: (
        <QuestionsTable
          questions={react_node}
          onGradeChange={handleGradeChange}
        />
      ),
    },
    {
      id: "nextjs",
      label: "Next.js",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-2">Next.js Framework</h3>
          <p>
            Details about Next.js features like SSR, SSG, API routes, routing,
            image optimization, and more.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Server-Side Rendering (SSR) and Static Site Generation (SSG)
            </li>
            <li>File-system based routing (App Router / Pages Router)</li>
            <li>API Routes</li>
            <li>
              Built-in CSS and Sass support, and support for any CSS-in-JS
              library
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "nodejs",
      label: "Node.js",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-2">Node.js Backend</h3>
          <p>
            Information on building backend services with Node.js, Express.js,
            database integrations (e.g., PostgreSQL, MongoDB), ORMs (e.g.,
            Prisma, Sequelize).
          </p>
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
      id: "typescript",
      label: "TypeScript",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-2">TypeScript</h3>
          <p>
            Benefits of using TypeScript, static typing, interfaces, generics,
            and how it integrates with React/Node.js projects.
          </p>
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Technical Lead Dashboard
      </h1>
      <div className="flex border-b border-gray-300 mb-6">
        {technologies.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 text-center font-medium text-base leading-5 rounded-t-lg 
                        ${
                          activeTab === tab.id
                            ? "border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white shadow-lg rounded-lg min-h-[300px]">
        {technologies.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TechnicalLeadPage;
