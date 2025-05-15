"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type Column = {
  key:
    | "name"
    | "position"
    | "linkedin"
    | "submittedAt"
    | "status"
    | "recruiterName"
    | "technicalLeadName"
    | "feedback";
  label: string;
  sortable?: boolean;
};

type SortField = Column["key"];
type SortDirection = "asc" | "desc";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
}

interface Candidate {
  id: { S: string };
  firstName: { S: string };
  lastName: { S: string };
  position: { S: string };
  linkedinUrl: { S: string };
  submittedAt: { S: string };
  status: { S: string };
  recruiterId: { S: string };
  technicalLeadId: { S: string };
  feedback?: { S: string };
}

const DEFAULT_STATUS = "pending";
const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "interviewing",
] as const;
type Status = (typeof VALID_STATUSES)[number];

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "interviewing":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const COLUMNS: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "position", label: "Position", sortable: true },
  { key: "linkedin", label: "LinkedIn" },
  { key: "submittedAt", label: "Submitted At", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "recruiterName", label: "Recruiter", sortable: true },
  { key: "technicalLeadName", label: "Technical Lead", sortable: true },
  { key: "feedback", label: "Feedback" },
];

const SortableHeader: React.FC<{
  column: Column;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}> = ({ column, sortField, sortDirection, onSort }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
    }`}
    onClick={() => column.sortable && onSort(column.key)}
  >
    <div className="flex items-center space-x-1">
      <span>{column.label}</span>
      {column.sortable && sortField === column.key && (
        <span className="text-gray-400">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </div>
  </th>
);

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("submittedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users first
        const usersResponse = await fetch("/api/users");
        const usersResult = await usersResponse.json();

        if (!usersResponse.ok) {
          throw new Error(usersResult.message || "Failed to fetch users");
        }

        setUsers(usersResult.data || []);

        // Then fetch candidates
        const candidatesResponse = await fetch("/api/talent-acquisition");
        const candidatesResult = await candidatesResponse.json();

        if (!candidatesResponse.ok) {
          throw new Error(
            candidatesResult.message || "Failed to fetch candidates"
          );
        }

        setCandidates(candidatesResult.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="container mx-auto mt-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="container mx-auto mt-8">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const openModalCandidate = (
    e: React.MouseEvent<HTMLButtonElement>,
    candidate: Candidate
  ) => {
    e.preventDefault();
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleTechnicalLeadChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!selectedCandidate) return;

    setSelectedCandidate({
      ...selectedCandidate,
      technicalLeadId: { S: e.target.value },
    });
  };

  const updateCandidate = async () => {
    if (!selectedCandidate) return;

    try {
      const response = await fetch("/api/talent-acquisition", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedCandidate.id.S,
          technicalLeadId: selectedCandidate.technicalLeadId.S,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update candidate");
      }

      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id.S === selectedCandidate.id.S
            ? { ...c, technicalLeadId: selectedCandidate.technicalLeadId }
            : c
        )
      );

      toast.success("Technical lead updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating candidate:", err);
      toast.error("Failed to update candidate");
    }
  };

  const technicalLeads = users.filter(
    (user) => user.userType === "Technical Lead"
  );
  return (
    <div className="min-h-screen pt-16 px-4">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: "#22c55e",
              color: "#fff",
            },
          },
          error: {
            duration: 3000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
        }}
      />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Candidates List
        </h1>

        {isModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Container */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full mx-4">
                <h2 className="text-xl font-bold mb-6 text-center">
                  Candidate Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>
                      {selectedCandidate?.firstName.S}{" "}
                      {selectedCandidate?.lastName?.S}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Position:</p>
                    <p>{selectedCandidate?.position.S}</p>
                  </div>

                  <div>
                    <p className="font-semibold">LinkedIn:</p>
                    <a
                      href={selectedCandidate?.linkedinUrl.S}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline break-words"
                    >
                      {selectedCandidate?.linkedinUrl.S}
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Submitted At:</p>
                    <p>{selectedCandidate?.submittedAt.S}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Status:</p>
                    <p>{selectedCandidate?.status.S}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Recruiter:</p>
                    <p>{getUserName(selectedCandidate?.recruiterId.S)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="font-semibold">Technical Lead:</p>
                    {technicalLeads.length > 0 ? (
                      <select
                        className="mt-1 border border-gray-300 rounded px-2 py-1 w-full max-w-xs"
                        name="technicalLead"
                        value={selectedCandidate?.technicalLeadId?.S || ""}
                        onChange={handleTechnicalLeadChange}
                      >
                        <option value="">Select Technical Lead</option>
                        {technicalLeads.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="block mt-1">
                        No technical lead selected
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="font-semibold">Feedback:</p>
                    <p>{selectedCandidate?.feedback?.S}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-200 hover:opacity-80 text-black py-2 px-4 rounded"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-yellow-200 hover:opacity-80 text-black py-2 px-4 rounded"
                    onClick={updateCandidate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {COLUMNS.map((column) => (
                    <SortableHeader
                      key={column.key}
                      column={column}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={(field) => {
                        if (field === sortField) {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField(field);
                          setSortDirection("asc");
                        }
                      }}
                    />
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...candidates]
                  .sort((a, b) => {
                    const direction = sortDirection === "asc" ? 1 : -1;

                    switch (sortField) {
                      case "name":
                        return (
                          direction *
                          `${a.firstName.S} ${a.lastName.S}`.localeCompare(
                            `${b.firstName.S} ${b.lastName.S}`
                          )
                        );
                      case "position":
                        return (
                          direction * a.position.S.localeCompare(b.position.S)
                        );
                      case "submittedAt":
                        return (
                          direction *
                          (new Date(a.submittedAt.S).getTime() -
                            new Date(b.submittedAt.S).getTime())
                        );
                      case "status":
                        return (
                          direction *
                          (a.status?.S || DEFAULT_STATUS).localeCompare(
                            b.status?.S || DEFAULT_STATUS
                          )
                        );
                      case "recruiterName":
                        return (
                          direction *
                          getUserName(a.recruiterId.S).localeCompare(
                            getUserName(b.recruiterId.S)
                          )
                        );
                      case "technicalLeadName":
                        return (
                          direction *
                          getUserName(a.technicalLeadId.S).localeCompare(
                            getUserName(b.technicalLeadId.S)
                          )
                        );
                      default:
                        return 0;
                    }
                  })
                  .map((candidate) => (
                    <tr key={candidate.id.S} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.firstName.S} {candidate.lastName.S}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {candidate.position.S}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {candidate.linkedinUrl?.S && (
                          <a
                            href={candidate.linkedinUrl.S}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Profile
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(
                            candidate.submittedAt.S
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={candidate.status?.S || DEFAULT_STATUS}
                          onChange={async (e) => {
                            const newStatus = e.target.value as Status;
                            try {
                              const response = await fetch(
                                "/api/talent-acquisition",
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    id: candidate.id.S,
                                    status: newStatus,
                                  }),
                                }
                              );

                              if (!response.ok) {
                                throw new Error("Failed to update status");
                              }

                              // Update local state
                              setCandidates((prev) =>
                                prev.map((c) =>
                                  c.id.S === candidate.id.S
                                    ? { ...c, status: { S: newStatus } }
                                    : c
                                )
                              );
                              toast.success("Status updated successfully");
                            } catch (err) {
                              console.error("Error updating status:", err);
                              toast.error("Failed to update status");
                            }
                          }}
                          className={`rounded-md text-sm font-medium ${getStatusColor(
                            candidate.status.S
                          )} border-0 focus:ring-2 focus:ring-indigo-500`}
                        >
                          {VALID_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getUserName(candidate.recruiterId.S)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getUserName(candidate.technicalLeadId.S)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {candidate.feedback?.S || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                            onClick={(e) => openModalCandidate(e, candidate)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
