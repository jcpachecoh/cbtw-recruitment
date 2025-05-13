'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type Inputs = {
  firstName: string;
  lastName: string;
  position: string;
  linkedinUrl: string;
  feedback: string;
};

const positionOptions = [
  { value: '', label: 'Select a position' },
  { value: 'frontend-developer', label: 'Frontend Developer' },
  { value: 'backend-developer', label: 'Backend Developer' },
  { value: 'fullstack-developer', label: 'Fullstack Developer' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
  { value: 'qa-engineer', label: 'QA Engineer' },
  { value: 'ui-ux-designer', label: 'UI/UX Designer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'technical-lead', label: 'Technical Lead' },
];

const TalentAdquisionPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Inputs>();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState<string>('');

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setSubmissionStatus('submitting');
    setSubmissionMessage('Submitting your application...');
    try {
      const response = await fetch('/api/talent-acquisition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus('success');
        setSubmissionMessage(result.message || 'Form submitted successfully!');
        reset(); // Reset form fields
        console.log('Form submitted successfully:', result.data);
        // Optionally, redirect or show a success message that stays longer
        setTimeout(() => {
            setSubmissionStatus('idle');
            setSubmissionMessage('');
        }, 5000); // Clear message after 5 seconds
      } else {
        setSubmissionStatus('error');
        setSubmissionMessage(result.message || 'Error submitting form. Please try again.');
        console.error('Error submitting form:', result.message);
      }
    } catch (error) {
      setSubmissionStatus('error');
      setSubmissionMessage('An unexpected error occurred. Please try again.');
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Talent Acquisition Form</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-8 shadow-xl rounded-lg space-y-6">

        {submissionStatus !== 'idle' && (
          <div className={`p-4 rounded-md text-sm ${
            submissionStatus === 'success' ? 'bg-green-100 text-green-700' :
            submissionStatus === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700' // submitting
          }`}>
            {submissionMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="firstName"
              {...register("firstName", { required: 'First name is required' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="lastName"
              {...register("lastName", { required: 'Last name is required' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            id="position"
            {...register("position", { required: 'Position is required' })}
            className={`mt-1 block w-full px-3 py-2 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white`}
          >
            {positionOptions.map(option => (
              <option key={option.value} value={option.value} disabled={option.value === ''}>{option.label}</option>
            ))}
          </select>
          {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>}
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
          <input
            id="linkedinUrl"
            type="url"
            {...register("linkedinUrl", {
              required: 'LinkedIn URL is required',
              pattern: {
                value: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                message: 'Invalid LinkedIn Profile URL'
              }
            })}
            className={`mt-1 block w-full px-3 py-2 border ${errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
            placeholder="https://www.linkedin.com/in/yourprofile"
          />
          {errors.linkedinUrl && <p className="mt-1 text-xs text-red-600">{errors.linkedinUrl.message}</p>}
        </div>

        <div>
          <label htmlFor="Feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
          <textarea
            id="feedback"
            rows={4}
            {...register("feedback")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
            placeholder="Tell us more about the candidate..."
          />
        </div>

        <div>
          <button
            type="submit" disabled={submissionStatus === 'submitting'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TalentAdquisionPage;
