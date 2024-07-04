"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "../../lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { FaEdit, FaTrash, FaPlusCircle } from "react-icons/fa";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Activity } from "lucide-react";
 
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
import NoteManager from "@/components/NoteManager";
import { MdOutlineEdit } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
 
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
  candidate_id:string
  interview_date: Date;
  interview_type: string;
  round: string;
  location: string;
  status: string;
}
 
const interviewSchema: any = z.object({
  interview_date: z.string().nonempty("Interview date is required"),
  interview_type: z.string().min(2, "Please choose an option"),
  round: z.string().min(4, "Please choose an option"),
  location: z.string().nonempty("Please enter your location"),
});
 
// let reinterviewSchema: any = z.object({
//   interview_date: z.string().nonempty("ReInterview date is required"),
// });
// type ReInterviewFormValues = z.infer<typeof reinterviewSchema>;
type InterviewFormValues = z.infer<typeof interviewSchema>;
 
const CandidateDetailsPage = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<ICandidate | null | any>(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [editingInterview, setEditingInterview] = useState<IInterview | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [RedialogOpen, setReDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(
    null
  );
  const [interviewId, setInterviewId] = useState<null | any>(null);
  const [candidateId, setcandidateId] = useState<null | any>(null);
  const [openNote, setOpenNote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>();
  const [selectedItem, setSelectedItem] = useState<IInterview | null>(null);
  const [newDate, setNewDate] = useState(null);
  // const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [sheduleinterview, setsheduleinterview] = useState<IInterview | null>(
    null
  );
 
  const { toast } = useToast();
 
  const handleReschedule = (interview: IInterview) => {
    // console.log(interview, "Reschedule clicked");
    setValue("round", interview.round);
    setValue("location", interview.location);
    setValue("interview_type", interview.interview_type);
    // setValue("interview_date", moment(interview.interview_date).format("YYYY-MM-DDTHH:mm"));
    setSelectedItem(interview);
    setsheduleinterview(interview);
    setReDialogOpen(true);
  };
 
  useEffect(() => {
    if (id) {
      fetchCandidateDetails(id as string);
      fetchInterviews(id as string);
    }
  }, [id]);
  console.log(selectedItem, ": dsdsfsfsfv");
 
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
      console.log(candidateId);
 
      const response = await axios.get(`/interview/${candidateId}`);
 
      console.log("response = ", response);
 
      const interviewData = response.data.data;
      console.log(interviewData);
 
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast({
        title: error?.response?.data?.message,
        className: "toast-success",
      });
      setInterviews([]);
    }
  };
 
  const {
    register,
    handleSubmit,
    formState: { errors},
    reset,
    setValue,
    watch,
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interview_date: "",
      interview_type: "",
      round: "",
      location: "",
    },
  });
 
 
  const OnResubmit: SubmitHandler<InterviewFormValues> = async (data) => {
    console.log("data" ,data);
   
    if (selectedItem) {
      try {
        console.log(selectedItem, ": selected item");
        const userId = localStorage.getItem("id");
        const response = await axios.post(`/interview`, {
          candidate_id: candidate._id,
          interview_date: data.interview_date,
          interview_type: selectedItem.interview_type,
          round: selectedItem.round,
          location: selectedItem.location,
          created_by: userId,
        });
        toast({
          title: response.data.message,
          className: "toast-success",
        });
        reset();
        setsheduleinterview(null);
        fetchInterviews(candidate._id);
      } catch (error) {
        console.error("Error updating interview:", error);
        toast({
          title: error?.response?.data?.message,
          className: "toast-warning",
        });
      }
    }
    setReDialogOpen(false);
  };
  const onSubmit: SubmitHandler<InterviewFormValues> = async (data) => {
    if (editingInterview) {
      try {
        const response = await axios.put(`/interview/${editingInterview._id}`, {
          interview_date: data.interview_date,
          interview_type: data.interview_type,
          round: data.round,
          location: data.location,
        });
        // console.log("Interview Updated:", response.data.data);
        toast({
          title: response.data.message,
          className: "toast-success",
        });
        setEditingInterview(null);
        reset();
        fetchInterviews(candidate._id);
      } catch (error) {
        console.error("Error updating interview:", error);
        toast({
          title: error?.response?.data?.message,
          className: "toast-warning",
        });
      }
    } else {
      try {
        const userId = localStorage.getItem("id");
        const response = await axios.post(`/interview`, {
          candidate_id: candidate._id,
          interview_date: data.interview_date,
          interview_type: data.interview_type,
          round: data.round,
          location: data.location,
          created_by: userId,
        });
        // console.log("Interview Created:", response.data.data);
        toast({
          title: response.data.message,
          className: "toast-success",
        });
        reset();
        fetchInterviews(candidate._id);
      } catch (error) {
        console.error("Error creating interview:", error);
        toast({
          title: error?.response?.data?.message,
          className: "toast-warning",
        });
      }
    }
    setReDialogOpen(false);
    setDialogOpen(false);
  };
 
  const handleEditInterview = (interview: IInterview) => {
    // console.log(interview,"Rdit ");
 
    setEditingInterview(interview);
    setSelectedItem(null)
    setValue(
      "interview_date",
      moment(interview.interview_date).format("YYYY-MM-DDTHH:mm")
    );
    setValue("interview_type", interview.interview_type);
    setValue("round", interview.round);
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
        toast({
          title: error?.response?.data?.message,
          className: "toast-warning",
        });
      } finally {
        setDeleteDialogOpen(false);
        setInterviewToDelete(null);
      }
    }
  };
 
  const handleScheduleInterview = () => {
    setSelectedItem(null)
    setEditingInterview(null);
    reset();
    setReDialogOpen(true);
    setDialogOpen(true);
  };
 
  const statusVariantMap = {
    create: "skyblue",
    reschedule: "grey",
    complete: "success",
    rejected: "destructive",
  };
 
  const handleStatusChange = async (
    interviewId: string,
    status: string,
    interview: IInterview
  ) => {
    if (status === "reschedule") {
      console.log("Hello world");
      handleReschedule(interview);
    }
 
    try {
      const response = await axios.put(`/interview/${interviewId}`, {
        status,
      });
 
      // console.log("Status Updated:", response.data);
      toast({
        title: "Status updated successfully",
        className: "toast-success",
      });
      fetchInterviews(candidate._id);
      setSelectedStatus(response.data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
 
  if (!candidate) {
    return (
      <div className="flex justify-center items-center h-screen">
        Candidate not found.
      </div>
    );
  }
 
  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-5 text-left text-gray-800 flex justify-between items-center">
        <span>Candidate Details</span>
        {candidate.resume && (
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="primary">
              View Resume
            </Button>
          </Link>
 
        )}
      </h1>
     
      <div className="shadow-md rounded-md w-96 border border-gray-300 m-4">
        <div className="grid gap-2">
          <div className="bg-gray-200 p-4">
            <label className="text-xl p-2 font-semibold ml-2" >Basic Info</label>
          </div>
          <div className="space-y-5 p-8">
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Full Name:</label>
              <label className="text-gray-900">{candidate.first_name} {candidate.last_name}</label>
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Gender:</label>
              <label className="text-gray-900">{candidate.gender}</label>
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Email:</label>
              <label className="text-gray-900">{candidate.email}</label>
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Phone Number:</label>
              <label className="text-gray-900">{candidate.phone_number}</label>
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Technology:</label>
              <label className="text-gray-900">{candidate.technology?.technology_name}</label>
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Job Type:</label>
              <label className="text-gray-900">{candidate.type}</label>
            </div>
          </div>
          <div className="">
            {selectedItem ? (
              <Dialog open={RedialogOpen} onOpenChange={setReDialogOpen}>
               
                <DialogTrigger asChild>
                  {/* <Button
                    className="bg-blue-500 hover:bg-blue-600 "
                    onClick={handleScheduleInterview}
                  >
                    Schedule Interview
                  </Button> */}
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Reschedule Interview</DialogTitle>
                  <form onSubmit={handleSubmit(OnResubmit)}>
                    <div className="mb-4">
                      <label className="block text-lg font-semibold">
                        Reschedule Interview Date
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-md p-2"
                        {...register("interview_date")}
                        defaultValue={watch("interview_date")}
                      />
                      {errors.interview_date &&
                      typeof errors.interview_date.message === "string" && (
                        <p className="text-red-500">
                          {errors.interview_date.message}
                        </p>
                      )}
                    </div>
                    {/* ================= Resedule no code che ======================= */}
                    {/* <div className="mb-4 "  >
                    <label className="block text-lg font-semibold ">
                      Interview Type
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setValue("interview_type", value)
                      }
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
                    {errors.interview_type &&
                      typeof errors.interview_type.message === "string" && (
                        <p className="text-red-500">
                          {errors.interview_type.message}
                        </p>
                      )}
                  </div>  
                  <div className="mb-4">
                    <label className="block text-lg font-semibold">
                      Round Type
                    </label>
                    <Select
                      onValueChange={(value) => setValue("round", value)}
                      value={watch("round")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical interview">
                          Technical Interview
                        </SelectItem>
                        <SelectItem value="practical interview">
                          Practical Interview
                        </SelectItem>
                        <SelectItem value="HR round">HR Round</SelectItem>
                        <SelectItem value="reschedule">Reschedule</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.round &&
                      typeof errors.round.message === "string" && (
                        <p className="text-red-500">{errors.round.message}</p>
                      )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-semibold">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      {...register("location")}
                      defaultValue={watch("location")}
                    />
                    {errors.location &&
                      typeof errors.location.message === "string" && (
                        <p className="text-red-500">
                          {errors.location.message}
                        </p>
                      )}
                  </div> */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Reschedule Interview
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               
                <DialogTrigger asChild>
                 
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>
                    {}
                   {editingInterview ? "Edit Schedule Interview" :"Schedule Interview"}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label className="block text-lg font-semibold">
                         Interview Date
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-md p-2"
                        {...register("interview_date")}
                        defaultValue={watch("interview_date")}
                      />
                      {errors.interview_date &&
                        typeof errors.interview_date.message === "string" && (
                          <p className="text-red-500">
                            {errors.interview_date.message}
                          </p>
                        )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-semibold ">
                        Interview Type
                      </label>
                      <Select
                        onValueChange={(value) =>
                          setValue("interview_type", value)
                        }
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
                      {errors.interview_type &&
                        typeof errors.interview_type.message === "string" && (
                          <p className="text-red-500">
                            {errors.interview_type.message}
                          </p>
                        )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-semibold">
                        Round Type
                      </label>
                      <Select
                        onValueChange={(value) => setValue("round", value)}
                        value={watch("round")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical interview">
                            Technical Interview
                          </SelectItem>
                          <SelectItem value="practical interview">
                            Practical Interview
                          </SelectItem>
                          <SelectItem value="HR round">HR Round</SelectItem>
                          <SelectItem value="reschedule">Reschedule</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.round &&
                        typeof errors.round.message === "string" && (
                          <p className="text-red-500">{errors.round.message}</p>
                        )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-semibold">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2"
                        {...register("location")}
                        defaultValue={watch("location")}
                      />
                      {errors.location &&
                        typeof errors.location.message === "string" && (
                          <p className="text-red-500">
                            {errors.location.message}
                          </p>
                        )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {
                     editingInterview
                        ? "Update Interview"
                        : "Schedule Interview"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
 
      {/* Interview */}
      <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex justify-between items-center">
          <span>Scheduled Interviews</span>
          <Button className="primary" onClick={handleScheduleInterview}>
            Schedule Interview
          </Button>
        </h2>
        <div className="overflow-x-auto rounded-xl  border-4 ml-3">
          {interviews.length === 0 ? (
            <p>No interviews scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 hover:bg-gray-200">
                  <TableHead>Date</TableHead>
                  <TableHead>Interview Type</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview._id}>
                    <TableCell>
                      {moment(interview.interview_date).format(
                        "Do-MM-YYYY,h:mm:ss a"
                      )}
                    </TableCell>
                    <TableCell>{interview.interview_type}</TableCell>
                    <TableCell>{interview.round}</TableCell>
                    <TableCell>{interview.location}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setOpenNote(true);
                          setInterviewId(interview._id);
                          setcandidateId(interview.candidate_id)
                        }}
                      >
                        <FaPlusCircle />
                      </Button>
                    </TableCell>
                    <TableCell className=" capitalize">
                      {" "}
                      <Badge variant={statusVariantMap[interview.status]}>
                        {interview.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
               
                </TableCell> */}
 
                    <TableCell className="space-x-2 text-right">
                      <Button className="bg-transparent hover:bg-transparent px-1">
                        <Select
                          onValueChange={(status) =>
                            handleStatusChange(interview._id, status, interview)
                          }
                          value={interview.status}
                          // open={statusDropdownOpen === interview._id}
                          onOpenChange={() =>
                            setStatusDropdownOpen(interview.status)
                          }
                        >
                          <SelectTrigger className="w-10 text-black">
                            {/* <MdOutlineEdit className="text-slate-950" /> */}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem
                              value="reschedule"
                              onClick={() => handleReschedule(interview)}
                            >
                              Rescheduled
                            </SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                      </Button>
                      <Button
                        variant="outline"
                        className="text-blue-600 hover:text-blue-600"
                        size="icon"
                        onClick={() => handleEditInterview(interview)}
                      >
                        <FaEdit />
                      </Button>
                      <AlertDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-600"
                            size="icon"
                            onClick={() => handleDeleteInterview(interview._id)}
                          >
                            <FaTrash />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Delete interview scedule
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={confirmDeleteInterview}
                            >
                              Delete
                            </AlertDialogAction>
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
 
      {interviewId && openNote && (
        <NoteManager
          interviewId={interviewId}
          candidateId={candidateId}
          openNote={openNote}
          setOpenNote={setOpenNote}
        />
      )}
    </div>
  );
};
 
export default CandidateDetailsPage;