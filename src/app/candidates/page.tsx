"use client"
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaEdit, FaEye, FaFileUpload, FaTrash } from "react-icons/fa";
import Image from 'next/image';


import Link from 'next/link';
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
import axios from '../lib/axios';
import { AxiosResponse } from 'axios';
import { useToast } from "@/components/ui/use-toast";


const schema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(10, "Phone number cannot exceed 10 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    resume: z
        .any()
        .refine((files) => {
            if (typeof files === 'string') {
                return true;
            }
            return files && files.length === 1;
        }, "Please choose a file")
        .refine((files) => {
            if (typeof files === 'string') {
                return true;
            }
            return files?.[0]?.size <= 5 * 1024 * 1024;
        }, "File size should be less than 5MB"),
    jobType: z.string().min(2, "Please choose an option"),
    gender: z.string().min(3, "Please choose an option"),
    technology_id: z.string().min(1, "Please choose an option"),
});

const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: '',
    jobType: '',
    gender:'',
    technology_id: '',
}

type FormData = z.infer<typeof schema>;

const Page: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });
    const [candidates, setCandidates] = useState<FormData[]>([]);
    const [technologies, setTechnologies] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<string | File | null>(null);
    const { toast } = useToast();


    const fetchTechnologies = async () => {
        try {
            const response: AxiosResponse<any> = await axios.get(`/technology`);
            setTechnologies(response.data.data);
            
        } catch (error) {
            console.error('Error fetching technologies:', error);
            toast({
                title: error?.response?.data?.message,
                className:"toast-warning",
                
            });
        }
    };

    useEffect(() => {
        fetchTechnologies();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response: AxiosResponse<FormData[]> = await axios.get(`/candidate`);
            setCandidates(response.data.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast({
                title: error?.response?.data?.message,
                className:"toast-warning",
                
            });
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const formData = new FormData();
            formData.append('first_name', data.firstName);
            formData.append('last_name', data.lastName);
            formData.append('email', data.email);
            formData.append('phone_number', data.phone);
            formData.append('technology_id', data.technology_id);
            formData.append('type', data.jobType);
            formData.append('gender', data.gender);

            if (typeof data.resume !== 'string') {
                formData.append('resume', data.resume[0]);
            }

            if (editCandidateId) {
              const response = await axios.put(`/candidate/${editCandidateId}`, formData, {
                    headers: {
                        'Content-Type': 'form-data',
                    },
                });
                toast({
                    title: response.data.message,
                    className:"toast-success",
                });
            } else {
             const response  = await axios.post(`/candidate`, formData, {
                    headers: {
                        'Content-Type': 'form-data',
                    },
                });
                toast({
                    title: response.data.message,
                    className:"toast-success",
                });
            }
            

            fetchCandidates();
            reset();
            setIsDialogOpen(false);
            setEditCandidateId(null);
        } catch (error) {
            console.error('Error adding/updating candidate:', error);
            toast({
                title: error?.response?.data?.message,
                className:"toast-warning",
            });
        }
    };

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
            } catch (error) {
                console.error('Error deleting candidate:', error);
                toast({
                    title: error?.response?.data?.message,
                    className: "toast-warning",
                });
            }
        }
    };
    

    const editCandidate = (id: string) => {
        const candidate = candidates.find((c) => c._id === id);
        if (candidate) {
            setValue('firstName', candidate.first_name);
            setValue('lastName', candidate.last_name);
            setValue('email', candidate.email);
            setValue('phone', candidate.phone_number);
            setValue('technology_id', candidate.technology._id);
            setValue('jobType', candidate.type);
            setValue('gender', candidate.gender);
            setValue('resume', candidate.resume);
            setResumeFile(candidate.resume);
            setEditCandidateId(id);
            setIsDialogOpen(true);
        }
    };

    const handleAddCandidate = () => {
        reset();
        setEditCandidateId(null);
        setResumeFile(null);
        setIsDialogOpen(true);
        setCandidateToDelete(null);
    };

    const handleDeleteResume = () => {
        setResumeFile(null);
        setValue('resume', null);
    };

    return (
        <>
            <div className="flex ">
                <div className="w-1/2 p-4 flex items-start">
                    <h1 className="text-2xl font-bold">Candidates</h1>
                </div>

                <div className="w-1/2 p-4 flex flex-col items-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger className="btn btn-primary px-4 py-2 bg-slate-800 text-white p-2 rounded-xl" onClick={handleAddCandidate}>
                            + Add Candidate
                        </DialogTrigger>
                        <DialogContent className="p-6 rounded-lg shadow-lg ">
                            <DialogHeader>
                                <DialogTitle>{editCandidateId ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <Input
                                            {...register("firstName")}
                                            placeholder="Enter First Name"
                                            className="mt-1"
                                        />
                                        {errors.firstName && (
                                            <p className="text-sm text-red-600">{errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <Input
                                            {...register("lastName")}
                                            placeholder="Enter Last Name"
                                            className="mt-1"
                                        />
                                        {errors.lastName && (
                                            <p className="text-sm text-red-600">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <p className="text-sm text-red-600">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone
                                        </label>
                                        <Input
                                            {...register("phone")}
                                            placeholder="Enter Phone Number"
                                            className="mt-1"
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
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
                                            <p className="text-sm text-red-600">{errors.technology_id.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="jobType">Job Type</Label>
                                        <Controller
                                            name="jobType"
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
                                        {errors.jobType && (
                                            <p className="text-sm text-red-600">{errors.jobType.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Interview Type</Label>
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
                                                        <SelectItem  value="female">Female</SelectItem>
                                                        <SelectItem  value="others">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.jobType && (
                                            <p className="text-sm text-red-600">{errors.jobType.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Resume
                                    </label>
                                    {resumeFile ? (
                                        <div className="flex items-center">
                                            {typeof resumeFile === 'string' ? (
                                                <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${resumeFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                    <FaFileUpload className="text-gray-600 mr-2 text-2xl" />
                                                </Link>
                                            ) : (
                                                <span>{resumeFile.name}</span>
                                            )}
                                            <Button variant="secondary" className="ml-2 hover:bg-gray-200" onClick={handleDeleteResume}>
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
                                    {errors.resume && typeof errors.resume.message === "string" && (
                                        <p className="text-sm text-red-600">{errors.resume.message}</p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" className="btn btn-primary">
                                        {editCandidateId ? 'Update' : 'Add'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
            <div className='overflow-x-auto rounded-xl m-4 border-4 mr-2'>
            <Table className=''>

                <TableHeader className='bg-gray-200'>
                    <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Technology</TableHead>
                        <TableHead>Job Type</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>View</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate._id}>
                            <TableCell>{candidate.first_name}</TableCell>
                            <TableCell>{candidate.last_name}</TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.phone_number}</TableCell>
                            <TableCell>{candidate.gender}</TableCell>
                            <TableCell>{candidate.technology.technology_name}</TableCell>
                            <TableCell>{candidate.type}</TableCell>
                            <TableCell>
                                {candidate.resume && (
                                    <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        <Image
                                            src="/resume.png"
                                            width={30}
                                            height={40}
                                            alt=""
                                            className='ml-2'

                                        />
                                    </Link>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline"  size="icon" className="text-blue-600 hover:text-blue-600"><FaEdit
                                        className=" "
                                        onClick={() => editCandidate(candidate._id)}
                                    /></Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="text-red-600 hover:text-red-600" size="icon">
                                            <FaTrash  onClick={() => setCandidateToDelete(candidate?._id)} />
                                            </Button>
                                           
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this candidate?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={deleteCandidate}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Link href={`/candidates/${candidate._id}`} passHref>
                                    <FaEye className='text-2xl text-slate-800' />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </>
    );
};

export default Page;
