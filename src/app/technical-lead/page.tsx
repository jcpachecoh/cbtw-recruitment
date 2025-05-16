"use client";

import React, { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  submittedAt: string;
  candidateStatus: string;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Technical Lead Dashboard
      </h1>
      <div className="p-4 bg-white shadow-lg rounded-lg min-h-[300px]">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
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
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.candidateStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.feedback || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="text-black  cursor-pointer font-semibold bg-yellow-200 px-4 py-2 rounded hover:opacity-80"
                        >
                          Start Interview
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalLeadPage;
