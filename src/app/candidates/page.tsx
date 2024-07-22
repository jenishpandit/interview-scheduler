"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaEdit, FaEye, FaFileUpload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import axios from "../lib/axios";
import { AxiosResponse } from "axios";
import { useToast } from "@/components/ui/use-toast";
import MultipleSelector from "@/components/ui/multiple-selector";
import { Search } from "lucide-react";
import { ImSpinner6 } from "react-icons/im";
// import useDebounce from "@/hooks/useDebounce";
import * as _ from "lodash";

const schema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number cannot exceed 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  resume: z
    .any()
    .refine((files) => {
      if (typeof files === "string") {
        return true;
      }
      return files && files.length === 1;
    }, "Please choose a file")
    .refine((files) => {
      if (typeof files === "string") {
        return true;
      }
      return files?.[0]?.size <= 5 * 1024 * 1024;
    }, "File size should be less than 5MB"),
  type: z.string().min(2, "Please choose an option"),
  gender: z.string().min(3, "Please choose an option"),
  job_role: z.string(),
  skills: z.array(z.string()),
});

const defaultValues: any = {
  _id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  resume: "",
  type: "",
  gender: "",
  job_role: "",
  skills: "",
};

type FormData = z.infer<typeof schema>;

// Candidate Home Page
const Page: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<FormData[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobRole, setJobrole] = useState<string[]>([]);
  const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(
    null
  );
  const [resumeFile, setResumeFile] = useState<string | File | null>(null);
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState<boolean>(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //handle input change
  const handleInputChange = (event: any) => {
    setSearching(true);
    setQuery(event.target.value);
  };

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
    const results: string[] = jobRole.filter((item) =>
      item.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setSearchResults(results);
  };

  //fetch Technologies data
  const fetchTechnologies = async () => {
    try {
      const response: AxiosResponse<any> = await axios.get(`/technology?limit=0`);
      setTechnologies(response.data.data.data);
    } catch (error: any) {
      console.error("Error fetching technologies:", error);
      toast({
        title: error?.response?.data?.message,
        className: "toast-warning",
      });
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  //fetch Candidate Data
  const fetchCandidates = async () => {
    try {
      const response: AxiosResponse<any> = await axios.get(
        `/candidate?filters=${query}&page=${currentPage}`
      );
      setCandidates(response.data.data.candidates);
      setSearching(false)
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      toast({
        title: error?.response?.data?.message,
        className: "toast-warning",
      });
    }
  };

  useEffect(() => {
    if (query) {
      debounceFunctionForSearch();
      return () => debounceFunctionForSearch.cancel();
    } else {
      fetchCandidates();
    }
  }, [query ,currentPage]);

  const debounceFunctionForSearch = _.debounce(async () => {
    await fetchCandidates();
    setSearching(false);
  }, 500);


  //fetch Role
  const fetchRole = async () => {
    try {
      const res = await axios.get("/candidate/roles");
      // console.log(res.data.data);
      setJobrole(res.data.data);
      setSearchResults(res.data.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  //Candidate Data Add
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("phone_number", data.phone_number);
      formData.append("type", data.type);
      formData.append("gender", data.gender);
      data.skills.forEach((skill) => {
        formData.append("skills[]", skill);
      });

      formData.append("job_role", data.job_role);

      if (typeof data.resume !== "string") {
        formData.append("resume", data.resume[0]);
      }

      if (editCandidateId) {
        const response = await axios.put(
          `/candidate/${editCandidateId}`,
          formData,
          {
            headers: {
              "Content-Type": "form-data",
            },
          }
        );
        toast({
          title: response.data.message,
          className: "toast-success",
        });
      } else {
        const response = await axios.post(`/candidate`, formData, {
          headers: {
            "Content-Type": "form-data",
          },
        });
        toast({
          title: response.data.message,
          className: "toast-success",
        });
      }

      fetchCandidates();
      reset();
      setIsDialogOpen(false);
      setEditCandidateId(null);
    } catch (error: any) {
      console.error("Error adding/updating candidate:", error);
      toast({
        title: error?.response?.data?.message,
        className: "toast-warning",
      });
    }
  };

  //Delete Candidate Data
  const deleteCandidate = async () => {
    if (candidateToDelete) {
      try {
        const response = await axios.delete(`/candidate/${candidateToDelete}`);
        toast({
          title: response.data.message || "Candidate deleted successfully",
          className: "toast-success",
        });
        fetchCandidates();
        setCandidateToDelete(null);
      } catch (error: any) {
        console.error("Error deleting candidate:", error);
        toast({
          title: error?.response?.data?.message,
          className: "toast-warning",
        });
      }
    }
  };

  //edit Candidate Data
  const editCandidate = (id: string) => {
    const candidate = candidates.find((c: any) => c._id === id);
    if (candidate) {
      setValue("first_name", candidate.first_name);
      setValue("last_name", candidate.last_name);
      setValue("email", candidate.email);
      setValue("phone_number", candidate.phone_number);
      setValue("type", candidate.type);
      setValue("gender", candidate.gender);
      setValue("skills", candidate.skills);
      setValue("job_role", candidate.job_role);
      setValue("resume", candidate.resume);
      setResumeFile(candidate.resume);
      setEditCandidateId(id);
      setIsDialogOpen(true);
    }
  };

  //handle Candidate Data
  const handleAddCandidate = () => {
    reset();
    setEditCandidateId(null);
    setResumeFile(null);
    setIsDialogOpen(true);
    setCandidateToDelete(null);
  };

  //Delete Resume
  const handleDeleteResume = () => {
    setResumeFile(null);
    setValue("resume", null);
  };

  const handlePageChange = (page:any) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <>
      <div className="flex ">
        <div className="w-1/2 p-4 flex items-start">
          <h1 className="text-2xl font-bold">Candidates</h1>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0 flex items-center">
          {searching ? (
            <div className="absolute left-1 animate-spin">
              <ImSpinner6 className="w-8 text-[16px]" />
            </div>
          ) : (
            <Search className="absolute left-2.5 top-2.5 h-[50px] w-4 text-muted-foreground" />
          )}
          <Input
            value={query}
            onChange={handleInputChange}
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-9 md:w-[200px] lg:w-[290px] active:outline-none focus:outline-none focus-visible:shadow-none focus-visible:ring-1 focus-visible:ring-offset-0"
            // disabled={searching} // Disable input when searching
          />
        </div>
        <div className=" p-4 flex flex-col items-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              className="btn btn-primary px-4 py-2 bg-slate-800 text-white p-2 rounded-xl"
              onClick={handleAddCandidate}
            >
              + Add Candidate
            </DialogTrigger>
            <DialogContent className="p-6 rounded-lg shadow-lg ">
              <DialogHeader>
                <DialogTitle>
                  {editCandidateId ? "Edit Candidate" : "Add Candidate"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 h-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      {...register("first_name")}
                      placeholder="Enter First Name"
                      className="mt-1"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-600">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      {...register("last_name")}
                      placeholder="Enter Last Name"
                      className="mt-1"
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-600">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      {...register("email")}
                      placeholder="Enter Email"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <Input
                      {...register("phone_number")}
                      placeholder="Enter Phone Number"
                      className="mt-1"
                    />
                    {errors.phone_number && (
                      <p className="text-sm text-red-600">
                        {errors.phone_number.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender Type</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="others">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                  {/* <div>
                    <Label htmlFor="technology_id">Technology</Label>
                    <Controller
                      name="technology_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a technology" />
                          </SelectTrigger>
                          <SelectContent>
                            {technologies.map((tech) => (
                              <SelectItem key={tech._id} value={tech._id}>
                                {tech.technology_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.technology_id && (
                      <p className="text-sm text-red-600">
                        {errors.technology_id.message}
                      </p>
                    )}
                  </div> */}
                 
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Job Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WFH">WFH</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <p className="text-sm text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    {/* <Label htmlFor="job_role">Job Role</Label>
                    <Controller
                      name="job_role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Job Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobRole.map((data,index) => (
                              <SelectItem key={index} value={data} >
                                {data}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    /> */}
                    {/* {errors.job_role && (
                      <p className="text-sm text-red-600">
                        {errors.job_role.message}
                      </p>
                    )} */}
                    <Label htmlFor="job_role">Job Role</Label>
                    <Controller
                      name="job_role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Job Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <Input
                              type="text"
                              placeholder="Search job roles"
                              value={searchTerm}
                              onChange={handleChange}
                            />
                            {searchResults.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.job_role && (
                      <p className="text-sm text-red-600">
                        {errors.job_role.message}
                      </p>
                    )}
                  </div>
                  </div>
                {/* </div> */}
                <div>
                <div className="mb-4">
                    <Label htmlFor="skills">Skills</Label>
                    <Controller
                      name="skills"
                      control={control}
                      render={({ field }) => (
                        <div className="flex">
                          <MultipleSelector
                            className=""
                            placeholder="Skills Select..."
                            defaultOptions={technologies.map((role) => ({
                              value: role._id,
                              label: role.technology_name,
                            }))}
                            onChange={(selected) => {
                              // Update the selected values in the form state
                              field.onChange(selected.map((s) => s.value));
                            }}
                            value={
                              Array.isArray(field.value)
                                ? field.value.map((value) => ({
                                    value: value,
                                    label:
                                      technologies.find(
                                        (tech) => tech._id === value
                                      )?.technology_name || value,
                                  }))
                                : []
                            }
                            emptyIndicator={
                              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                no results found.
                              </p>
                            }
                          />
                        </div>
                      )}
                    />
                    {errors.skills && (
                      <p className="text-red-500">{errors.skills.message}</p>
                    )}
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resume
                  </label>
                  {resumeFile ? (
                    <div className="flex items-center">
                      {typeof resumeFile === "string" ? (
                        <Link
                          href={`${process.env.NEXT_PUBLIC_API_URL}/${resumeFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          <FaFileUpload className="text-gray-600 mr-2 text-2xl" />
                        </Link>
                      ) : (
                        <span>{resumeFile.name}</span>
                      )}
                      <Button
                        variant="secondary"
                        className="ml-2 hover:bg-gray-200"
                        onClick={handleDeleteResume}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      {...register("resume")}
                      className="mt-1"
                    />
                  )}
                  {errors.resume &&
                    typeof errors.resume.message === "string" && (
                      <p className="text-sm text-red-600">
                        {errors.resume.message}
                      </p>
                    )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="btn btn-primary">
                    {editCandidateId ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl m-4 border-4 mr-2">
        <Table className="">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Candidate Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Role</TableHead>
              <TableHead>Job Type</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate: any) => (
              <TableRow key={candidate._id}>
                <TableCell>
                  {candidate.first_name} {candidate.last_name}
                </TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell className=" capitalize">
                  {candidate.job_role}
                </TableCell>
                <TableCell>{candidate.type}</TableCell>
                <TableCell>
                  {candidate.resume && (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      <Image
                        src="/resume.png"
                        width={30}
                        height={40}
                        alt=""
                        className="ml-2"
                      />
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-blue-600 hover:text-blue-600"
                    >
                      <FaEdit
                        className=" "
                        onClick={() => editCandidate(candidate._id)}
                      />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-600"
                          size="icon"
                        >
                          <FaTrash
                            onClick={() => setCandidateToDelete(candidate?._id)}
                          />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete this candidate?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={deleteCandidate}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/candidates/${candidate._id}`} passHref>
                    <FaEye className="text-2xl text-slate-800" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination className=" justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)}  />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink href="#" isActive={currentPage === index + 1} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export default Page;
