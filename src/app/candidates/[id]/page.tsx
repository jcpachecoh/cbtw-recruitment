"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionsTable, { Question } from "@/app/components/Questions/Questions";
import { react_node } from "@/app/utils/interview_questions/react-node";
import toast, { Toaster } from "react-hot-toast";

const CandidateInterview: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewResults, setInterviewResults] = useState<
    Record<string, Question>
  >({});
  const [passInterview, setPassInterview] = useState(false);
  const [finalComments, setFinalComments] = useState("");

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await fetch(`/api/candidates/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch candidate data");
        }
        const data = await response.json();
        setCandidate(data.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
        toast.error("Failed to load candidate data");
      }
    };

    if (params.id) {
      fetchCandidateData();
    }
  }, [params.id]);

  const handleGradeChange = async (
    questionId: string | number,
    grade: number
  ) => {
    setInterviewResults({
      ...interviewResults,
      [questionId]: { ...react_node[questionId as number], grade },
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const saveInterview = async () => {
    try {
      const seniorResults = Object.values(interviewResults).filter(
        (question) => question.Seniority === "Senior"
      );
      const juniorResults = Object.values(interviewResults).filter(
        (question) => question.Seniority === "Junior"
      );
      const intermediateResults = Object.values(interviewResults).filter(
        (question) => question.Seniority === "Intermediate"
      );
      const averageSeniorGrade =
        seniorResults.reduce((acc, question) => acc + question.grade!, 0) /
        seniorResults.length;
      const averageJuniorGrade =
        juniorResults.reduce((acc, question) => acc + question.grade!, 0) /
        juniorResults.length;
      const averageIntermediateGrade =
        intermediateResults.reduce(
          (acc, question) => acc + question.grade!,
          0
        ) / intermediateResults.length;
      const finalGrade =
        (averageSeniorGrade + averageJuniorGrade + averageIntermediateGrade) /
        3;

      const finalInterviewResults = {
        ...interviewResults,
        juniorGrade: averageJuniorGrade,
        intermediateGrade: averageIntermediateGrade,
        seniorGrade: averageSeniorGrade,
        finalGrade,
        passInterview,
        finalComments,
      };
      const [response, updateCandidateResponse] = await Promise.all([
        fetch("/api/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: params.id,
            results: finalInterviewResults,
          }),
        }),
        fetch(`/api/candidates/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: params.id,
            candidateStatus: passInterview ? "approved" : "rejected",
          }),
        }),
      ]);
      if (!response.ok) {
        throw new Error("Failed to save interview");
      }
      if (!updateCandidateResponse.ok) {
        throw new Error("Failed to update candidate");
      }
      toast.success("Interview saved!");
    } catch (error) {
      toast.error("Could not save interview.");
      console.error(error);
    }
  };

  if (
    candidate.candidateStatus === "approved" ||
    candidate.candidateStatus === "rejected"
  ) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Interview</h1>
        <p className="text-gray-600 mb-6">
          The interview for this candidate has already been saved with Status
          <span
            className={
              candidate.candidateStatus === "approved"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {" "}
            {candidate.candidateStatus}
          </span>
        </p>
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded shadow cursor-pointer"
        >
          ← Back
        </button>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded shadow cursor-pointer"
      >
        ← Back
      </button>
      <Toaster />
      <div className="flex flex-row w-full justify-between">
        <h1 className="text-3xl font-bold mb-6">Interview</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center mb-4 px-4 py-2 bg-yellow-200 hover:bg-opacity-80 text-black rounded shadow cursor-pointer gap-2"
        >
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>save-floppy</title>
            <desc>Created with Sketch Beta.</desc>
            <defs></defs>
            <g
              id="Page-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g
                id="Icon-Set"
                transform="translate(-152.000000, -515.000000)"
                fill="#000000"
              >
                <path
                  d="M171,525 C171.552,525 172,524.553 172,524 L172,520 C172,519.447 171.552,519 171,519 C170.448,519 170,519.447 170,520 L170,524 C170,524.553 170.448,525 171,525 L171,525 Z M182,543 C182,544.104 181.104,545 180,545 L156,545 C154.896,545 154,544.104 154,543 L154,519 C154,517.896 154.896,517 156,517 L158,517 L158,527 C158,528.104 158.896,529 160,529 L176,529 C177.104,529 178,528.104 178,527 L178,517 L180,517 C181.104,517 182,517.896 182,519 L182,543 L182,543 Z M160,517 L176,517 L176,526 C176,526.553 175.552,527 175,527 L161,527 C160.448,527 160,526.553 160,526 L160,517 L160,517 Z M180,515 L156,515 C153.791,515 152,516.791 152,519 L152,543 C152,545.209 153.791,547 156,547 L180,547 C182.209,547 184,545.209 184,543 L184,519 C184,516.791 182.209,515 180,515 L180,515 Z"
                  id="save-floppy"
                ></path>
              </g>
            </g>
          </svg>
          Save Interview
        </button>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal Container */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Confirm Save</h2>
                <p className="mb-6">
                  Are you sure you want to save this interview?
                </p>
                <div className="flex flex-col mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Final Comments
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    rows={4}
                    value={finalComments}
                    onChange={(e) => setFinalComments(e.target.value)}
                  />
                </div>
                <div className="flex flex-row mb-4 gap-2 items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Pass Interview
                  </label>
                  <div className="relative w-fit">
                    <button
                      type="button"
                      onClick={() => setPassInterview(!passInterview)}
                      aria-pressed={passInterview}
                      className={`relative flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        passInterview ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          passInterview ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded font-bold"
                    onClick={() => {
                      setShowModal(false);
                      saveInterview();
                    }}
                  >
                    Yes, Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <span className="font-bold text-gray-800">Candidate Name:</span>
          <span className="sm:col-span-2 text-gray-700">
            {candidate?.firstName} {candidate?.lastName}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <span className="font-bold text-gray-800">Position:</span>
          <span className="sm:col-span-2 text-gray-700">
            {candidate?.position}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <span className="font-bold text-gray-800">LinkedIn URL:</span>
          <a
            href={candidate?.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:col-span-2 text-blue-600 hover:underline break-words"
          >
            {candidate?.linkedinUrl}
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <span className="font-bold text-gray-800">Recruiter Feedback:</span>
          <span className="sm:col-span-2 text-gray-700">
            {candidate?.feedback}
          </span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[40vh]">
        <QuestionsTable
          questions={react_node}
          onGradeChange={handleGradeChange}
          title="Technical Interview Questions"
        />
      </div>
    </div>
  );
};

export default CandidateInterview;
