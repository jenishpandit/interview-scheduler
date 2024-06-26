"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '../../lib/axios';
import Link from 'next/link';
import Image from 'next/image';

interface Candidate {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  technology_id: string;
  technology_name: string;
  type: string;
  resume: string;
}

const CandidateDetailsPage = () => {
  const { id } = useParams();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidateDetails(id as string);
    }
  }, [id]);

  const fetchCandidateDetails = async (candidateId: string) => {
    try {
      const response = await axios.get(`/candidate/read/${candidateId}`);
      const candidateData = response.data.data;

      const technologyResponse = await axios.get(`/technology/read/${candidateData.technology_id}`);
      const technologyName = technologyResponse.data.data.technology_name;

      setCandidate({
        ...candidateData,
        technology_name: technologyName,
      });
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!candidate) {
    return <div className="flex justify-center items-center h-screen">Candidate not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Candidate Details</h1>
      <div className="bg-gray-200 shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-lg font-semibold text-gray-700">First Name:</label>
            <p className="text-gray-900">{candidate.first_name}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Last Name:</label>
            <p className="text-gray-900">{candidate.last_name}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Email:</label>
            <p className="text-gray-900">{candidate.email}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Phone Number:</label>
            <p className="text-gray-900">{candidate.phone_number}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Technology:</label>
            <p className="text-gray-900">{candidate.technology_name}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Job Type:</label>
            <p className="text-gray-900">{candidate.type}</p>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Resume:</label>
            {candidate.resume && (
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`} target="_blank" rel="noopener noreferrer">
                <Image
                  src="/resume.png"
                  width={40}
                  height={40}
                  alt="Resume"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
