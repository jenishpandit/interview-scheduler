"use client"
import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { CalendarIcon, Calendar } from 'lucide-react';

const schema = z.object({
    interviewType: z.string().min(2, "Please choose an option"),
    interviewDate: z.string().nonempty("Interview date is required")
});

type FormData = z.infer<typeof schema>;

const Page: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { interviewType: '' },
    });
    const [candidates, setCandidates] = useState<FormData[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [technologies, setTechnologies] = useState<any[]>([]);

    const fetchTechnologies = async () => {
        try {
            const response: AxiosResponse<any[]> = await axios.get(`/technology/readAll`);
            setTechnologies(response.data.data);
        } catch (error) {
            console.error('Error fetching technologies:', error);
        }
    };

    useEffect(() => {
        fetchTechnologies();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response: AxiosResponse<FormData[]> = await axios.get(`/candidate/readAll`);
            setCandidates(response.data.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const formData = {
                ...data,
                interviewDate: moment(date).format('YYYY-MM-DD HH:mm')
            };

            if (editCandidateId) {
                await axios.put(`/candidate/update/${editCandidateId}`, formData);
            } else {
                await axios.post(`/candidate/create`, formData);
            }

            fetchCandidates();
            reset();
            setIsDialogOpen(false);
            setEditCandidateId(null);
        } catch (error) {
            console.error('Error adding/updating candidate:', error);
        }
    };

    const deleteCandidate = async () => {
        if (candidateToDelete) {
            try {
                await axios.delete(`/candidate/delete/${candidateToDelete}`);
                fetchCandidates();
                setCandidateToDelete(null);
            } catch (error) {
                console.error('Error deleting candidate:', error);
            }
        }
    };

    const editCandidate = (id: string) => {
        const candidate = candidates.find((c) => c._id === id);
        if (candidate) {
            setEditCandidateId(id);
            setIsDialogOpen(true);
            setDate(new Date(candidate.interviewDate));
            setValue('interviewType', candidate.interviewType);
        }
    };

    const handleAddCandidate = () => {
        reset();
        setEditCandidateId(null);
        setIsDialogOpen(true);
        setCandidateToDelete(null);
    };

    return (
        <>
            <div className="flex border-b border-gray-300">
                <div className="w-1/2 p-4 flex items-start">
                    <h1 className="text-2xl font-bold">Interviews</h1>
                </div>

                <div className="w-1/2 p-4 flex flex-col items-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger className="btn btn-primary px-4 py-2 bg-slate-800 text-white p-2 rounded-xl" onClick={handleAddCandidate}>
                            + Add Interviews
                        </DialogTrigger>
                        <DialogContent className="p-6 rounded-lg shadow-lg overflow-scroll">
                            <DialogHeader>
                                <DialogTitle>{editCandidateId ? 'Edit Interview' : 'Add Interview'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="interviewType">Interview Type</Label>
                                        <Controller
                                            name="interviewType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Interview Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Online">Online</SelectItem>
                                                        <SelectItem value="Offline">Offline</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.interviewType && (
                                            <p className="text-sm text-red-600">{errors.interviewType.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="interviewDate">Interview Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? moment(date).format("") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
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

            <Table>
                <TableHeader className='bg-gray-200'>
                    <TableRow>
                        <TableHead>Interview Type</TableHead>
                        <TableHead>Interview Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate._id}>
                            <TableCell>{candidate.interviewType}</TableCell>
                            <TableCell>{moment(candidate.interviewDate).format("PPP")}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <FaEdit
                                        className=" text-xl text-blue-600 cursor-pointer"
                                        onClick={() => editCandidate(candidate._id)}
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <FaTrash className="text-red-500 text-xl cursor-pointer" onClick={() => setCandidateToDelete(candidate._id)} />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this interview?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={deleteCandidate}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default Page;
