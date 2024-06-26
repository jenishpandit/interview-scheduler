"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '../../lib/axios'; 
import { FaEye } from 'react-icons/fa';
import Link from 'next/link';

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
  const  { id } = useParams();

  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidateDetails(id as string);
    }
  }, [id]);

  const fetchCandidateDetails:any = async (candidateId: string) => {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Candidate Details</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="font-semibold">First Name:</label>
          <p>{candidate.first_name}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Last Name:</label>
          <p>{candidate.last_name}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Email:</label>
          <p>{candidate.email}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Phone Number:</label>
          <p>{candidate.phone_number}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Technology:</label>
          <p>{candidate.technology_name}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Type:</label>
          <p>{candidate.type}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Resume:</label>
          {candidate.resume && (
            <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`} target="_blank" rel="" className="text-blue-500 underline">
              <FaEye className='text-xl text-slate-800' />
          </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
