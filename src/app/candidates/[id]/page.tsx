"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "../../lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import moment from 'moment';
import { FaEdit, FaTrash, FaPlusCircle } from "react-icons/fa";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Activity } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";


interface ICandidate {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type: string;
  resume: string;
  technology?: {
    technology_id: string;
    technology_name: string;
  };
}

interface IInterview {
  _id: string;
  interview_date: Date;
  interview_type: string;
  location: string;
}

const interviewSchema:any = z.object({
  interview_date: z.string().nonempty("Interview date is required"),
  interview_type: z.string().min(2, "Please choose an option"),
  location: z.string().nonempty("Please enter your location")
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

const CandidateDetailsPage = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<ICandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [editingInterview, setEditingInterview] = useState<IInterview | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    if (id) {
      fetchCandidateDetails(id as string);
      fetchInterviews(id as string);
    }
  }, [id]);

  const fetchCandidateDetails = async (candidateId: string) => {
    try {
      const response = await axios.get(`/candidate/${candidateId}`);
      const candidateData = response.data.data;
      setCandidate(candidateData);

    } catch (error) {
      console.error("Error fetching candidate details:", error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async (candidateId: string) => {
    try {
      const response = await axios.get(`/interview`);
      const interviewData = response.data.data;
      console.log(interviewData);
      
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setInterviews([]);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interview_date: "",
      interview_type: "",
      location: "",
    },
  });

  const onSubmit: SubmitHandler<InterviewFormValues> = async (data) => {
    if (editingInterview) {

      try {
        const response = await axios.put(`/interview/${editingInterview._id}`, {
          interview_date: data.interview_date,
          interview_type: data.interview_type,
          location: data.location,
        });
        console.log("Interview Updated:", response.data.data);
        toast({
          title: response.data.message,
          className: "toast-success",

        });
        setEditingInterview(null);
        reset();
        fetchInterviews(candidate._id);
      } catch (error) {
        console.error("Error updating interview:", error);

      }
    } else {
      
      try {
        const userId = localStorage.getItem('id'); 
        const response = await axios.post(`/interview`, {
          candidate_id: candidate._id,
          interview_date: data.interview_date,
          interview_type: data.interview_type,
          location: data.location,
          created_by: userId,
        });
        console.log("Interview Created:", response.data.data);
        toast({
          title: response.data.message,
          className: "toast-success",

        });
        reset();
        fetchInterviews(candidate._id);
      } catch (error) {
        console.error("Error creating interview:", error);
      }
    }
    setDialogOpen(false);
  };

  const handleEditInterview = (interview: IInterview) => {
    setEditingInterview(interview);
    setValue("interview_date", moment(interview.interview_date).format("YYYY-MM-DD"));
    setValue("interview_type", interview.interview_type);
    setValue("location", interview.location);
    setDialogOpen(true);
  };

  const handleDeleteInterview = (interviewId: string) => {
    setInterviewToDelete(interviewId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInterview = async () => {
    if (interviewToDelete) {
      try {
        const response = await axios.delete(`/interview/${interviewToDelete}`);
        toast({
          title: response.data.message,
          className: "toast-success",
        });
        fetchInterviews(candidate?._id);
      } catch (error) {
        console.error("Error deleting interview:", error);
      } finally {
        setDeleteDialogOpen(false);
        setInterviewToDelete(null);
      }
    }
  };

  const handleScheduleInterview = () => {
    setEditingInterview(null);
    reset();
    setDialogOpen(true);
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!candidate) {
    return <div className="flex justify-center items-center h-screen">Candidate not found.</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-8 text-left text-gray-800">Candidate Details</h1>
      <div className="shadow-md rounded-md p-3 border border-gray-300">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">First Name:</label>
            <p className="text-gray-900">{candidate.first_name}</p>
          </div>
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">Last Name:</label>
            <p className="text-gray-900">{candidate.last_name}</p>
          </div>
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">Email:</label>
            <p className="text-gray-900">{candidate.email}</p>
          </div>
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">Phone Number:</label>
            <p className="text-gray-900">{candidate.phone_number}</p>
          </div>
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">Technology:</label>
            <p className="text-gray-900">{candidate.technology?.technology_name}</p>
          </div>
          <div className="border-b p-4">
            <label className="block text-lg font-semibold">Job Type:</label>
            <p className="text-gray-900">{candidate.type}</p>
          </div>
          <div className="p-4">
            <label className="block text-lg font-semibold">Resume:</label>
            {candidate.resume && (
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-500 hover:bg-green-600">View Resume</Button>
              </Link>
            )}
          </div>
          <div className="p-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <label className="block text-md font-semibold">Set Interview Scedule:</label>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 " onClick={handleScheduleInterview}>Schedule Interview</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>{editingInterview ? "Edit Interview" : "Schedule Interview"}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4">
                    <label className="block text-lg font-semibold">Interview Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                      {...register("interview_date")}
                      defaultValue={watch("interview_date")}
                    />
                    {errors.interview_date && <p className="text-red-500">{errors.interview_date.message}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-semibold">Interview Type</label>
                    <Select
                      onValueChange={(value) => setValue("interview_type", value)}
                      value={watch("interview_type")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.interview_type && <p className="text-red-500">{errors.interview_type.message}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-semibold">Location</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      {...register("location")}
                      defaultValue={watch("location")}
                    />
                    {errors.location && <p className="text-red-500">{errors.location.message}</p>}
                  </div>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    {editingInterview ? "Update Interview" : "Schedule Interview"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Scheduled Interviews</h2>
        <div className="overflow-x-auto">
          {interviews.length === 0 ? (
            <p>No interviews scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 hover:bg-gray-200">
                  <TableHead>Date</TableHead>
                  <TableHead>Interview Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview._id}>
                    <TableCell>{moment(interview.interview_date).format("Do-MM-YYYY,h:mm:ss a")}</TableCell>
                    <TableCell>{interview.interview_type}</TableCell>
                    <TableCell>{interview.location}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger><FaPlusCircle /></DialogTrigger>
                        <DialogContent>
                          <label htmlFor="">Add Notes</label>
                         <Input placeholder="Add Notes"></Input>
                         <Button className="w-16 ml-96">Add</Button>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" className="text-blue-600 hover:text-blue-600" size="icon" onClick={() => handleEditInterview(interview)}>
                        <FaEdit />
                      </Button>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-red-600 hover:text-red-600" size="icon" onClick={() => handleDeleteInterview(interview._id)}>
                            <FaTrash />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete interview scedule</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteInterview}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
