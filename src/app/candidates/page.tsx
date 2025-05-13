'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type SortField = 'name' | 'position' | 'submittedAt' | 'status' | 'recruiterName' | 'technicalLeadName';
type SortDirection = 'asc' | 'desc';

interface Candidate {
    id: { S: string };
    firstName: { S: string };
    lastName: { S: string };
    position: { S: string };
    linkedinUrl: { S: string };
    submittedAt: { S: string };
    status: { S: string };
    recruiterName: { S: string };
    technicalLeadName: { S: string };
    feedback?: { S: string };
}

const DEFAULT_STATUS = 'pending';
const VALID_STATUSES = ['pending', 'approved', 'rejected', 'interviewing'] as const;
type Status = typeof VALID_STATUSES[number];

const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'interviewing':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const CandidatesPage: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('submittedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch('/api/talent-acquisition');
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to fetch candidates');
                }

                setCandidates(result.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching candidates');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
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
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 px-4">
            <div className="container mx-auto mt-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Candidates List</h1>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'name') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('name');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Name
                                        {sortField === 'name' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'position') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('position');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Position
                                        {sortField === 'position' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'submittedAt') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('submittedAt');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Submitted
                                        {sortField === 'submittedAt' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'status') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('status');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Status
                                        {sortField === 'status' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'recruiterName') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('recruiterName');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Recruiter
                                        {sortField === 'recruiterName' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            if (sortField === 'technicalLeadName') {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField('technicalLeadName');
                                                setSortDirection('asc');
                                            }
                                        }}
                                    >
                                        Technical Lead
                                        {sortField === 'technicalLeadName' && (
                                            <span className="ml-2">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[...candidates]
                                    .sort((a, b) => {
                                        const direction = sortDirection === 'asc' ? 1 : -1;

                                        switch (sortField) {
                                            case 'name':
                                                return direction * (`${a.firstName.S} ${a.lastName.S}`)
                                                    .localeCompare(`${b.firstName.S} ${b.lastName.S}`);
                                            case 'position':
                                                return direction * a.position.S.localeCompare(b.position.S);
                                            case 'submittedAt':
                                                return direction * (new Date(a.submittedAt.S).getTime() -
                                                    new Date(b.submittedAt.S).getTime());
                                            case 'status':
                                                return direction * (a.status?.S || DEFAULT_STATUS)
                                                    .localeCompare(b.status?.S || DEFAULT_STATUS);
                                            case 'recruiterName':
                                                return direction * (a.recruiterName?.S || 'Unassigned')
                                                    .localeCompare(b.recruiterName?.S || 'Unassigned');
                                            case 'technicalLeadName':
                                                return direction * (a.technicalLeadName?.S || 'Unassigned')
                                                    .localeCompare(b.technicalLeadName?.S || 'Unassigned');
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
                                                <div className="text-sm text-gray-900">{candidate.position.S}</div>
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
                                                    {new Date(candidate.submittedAt.S).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                        value={candidate.status?.S || DEFAULT_STATUS}
                                                        onChange={async (e) => {
                                                            const newStatus = e.target.value as Status;
                                                            try {
                                                                const response = await fetch('/api/talent-acquisition', {
                                                                    method: 'PATCH',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                    },
                                                                    body: JSON.stringify({
                                                                        id: candidate.id.S,
                                                                        status: newStatus,
                                                                    }),
                                                                });

                                                                if (!response.ok) {
                                                                    throw new Error('Failed to update status');
                                                                }

                                                                // Update local state
                                                                setCandidates(prev => prev.map(c =>
                                                                    c.id.S === candidate.id.S
                                                                        ? { ...c, status: { S: newStatus } }
                                                                        : c
                                                                ));
                                                            } catch (err) {
                                                                console.error('Error updating status:', err);
                                                                alert('Failed to update status');
                                                            }
                                                        }}
                                                        className={`rounded-md text-sm font-medium ${getStatusColor(candidate.status.S)} border-0 focus:ring-2 focus:ring-indigo-500`}
                                                    >
                                                        {VALID_STATUSES.map(status => (
                                                            <option key={status} value={status}>
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {candidate.recruiterName?.S || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {candidate.technicalLeadName?.S || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {candidate.feedback?.S || '-'}
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
