"use client";
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader/Loader";
import { Candidate } from "../candidates/page";

interface InterviewResult {
  candidateId: string;
  results: {
    juniorGrade?: number;
    intermediateGrade?: number;
    seniorGrade?: number;
    finalGrade?: number;
    [key: string]: any;
  };
  updatedAt: string;
}

const InterviewResultsPage: React.FC = () => {
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resResults, resCandidates] = await Promise.all([
          fetch("/api/interviews"),
          fetch("/api/candidates"),
        ]);
        if (!resResults.ok)
          throw new Error("Failed to fetch interview results");
        if (!resCandidates.ok) throw new Error("Failed to fetch candidates");
        const dataResults = await resResults.json();
        const dataCandidates = await resCandidates.json();

        console.log("candisates", dataCandidates);
        setResults(dataResults.items || []);
        setCandidates(dataCandidates.data || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id.S === candidateId);
    console.log("🚀 ~ getCandidateName ~ candidate:", candidate);
    return candidate
      ? `${candidate.firstName?.S} ${candidate.lastName?.S}`
      : "";
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Results</h1>
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 w-2/6 text-left">Candidate Name</th>
                <th className="px-4 py-2 w-1/6 text-center">Junior Grade</th>
                <th className="px-4 py-2 w-1/6 text-center">
                  Intermediate Grade
                </th>
                <th className="px-4 py-2 w-1/6 text-center">Senior Grade</th>
                <th className="px-4 py-2 w-1/6 text-center">Final Grade</th>
                <th className="px-4 py-2 w-1/6 text-center">Pass Interview</th>
                <th className="px-4 py-2 w-2/6 text-center">Final Comments</th>
                <th className="px-4 py-2 w-2/6 text-center">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.candidateId} className="border-t">
                  <td className="px-4 py-2 w-2/6 text-left">
                    {getCandidateName(result.candidateId)}
                  </td>
                  <td className="px-4 py-2 w-1/6 text-center">
                    {result.results.juniorGrade?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-4 py-2 w-1/6 text-center">
                    {result.results.intermediateGrade?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-4 py-2 w-1/6 text-center">
                    {result.results.seniorGrade?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-4 py-2 w-1/6 text-center font-bold">
                    {result.results.finalGrade?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-4 py-2 w-1/6 text-center font-bold">
                    {result.results.passInterview ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 w-2/6 text-center text-xs text-gray-500">
                    {result.results.finalComments}
                  </td>
                  <td className="px-4 py-2 w-2/6 text-center text-xs text-gray-500">
                    {new Date(result.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InterviewResultsPage;
