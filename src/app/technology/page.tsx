"use client";
import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
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
import { FaEdit , FaTrash} from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";


interface Technology {
  _id: string;
  technology_name: string;
}

const AddTechnologySchema = z.object({
  technology_name: z.string().nonempty("Technology is required"),
});

const Page: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingTechnology, setEditingTechnology] = useState<Technology | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [technologyToDelete, setTechnologyToDelete] = useState<Technology | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const { toast } = useToast();


  const form = useForm({
    resolver: zodResolver(AddTechnologySchema),
    defaultValues: {
      technology_name: "",
    },
  });

  const { handleSubmit, reset, formState: { errors }, setError: setFormError, clearErrors } = form;

  const fetchTechnologies = async () => {
    try {
      const response = await axios.get<{ data: Technology[] }>(`/technology`);
      console.log("Fetched technologies:", response.data.data);
      setTechnologies(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch technologies");
      toast({
        title:error?.response?.data?.message,
        className:'toast-warning'
       
      });
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const onSubmit = async (data: { technology_name: string }) => {
    try {
      const isDuplicate = technologies.some(
        (tech) => tech.technology_name.toLowerCase() === data.technology_name.toLowerCase()
      );

      if (isDuplicate) {
        setDuplicateError("Technology name already exists");
        setFormError("technology_name", { type: "manual", message: "Technology name already exists" });
        return;
      }

      if (editingTechnology) {
        await updateTechnology(data);
      } else {
        await addTechnology(data);
      }
      reset();
      setDialogOpen(false);
      setDuplicateError(null);
      clearErrors("technology_name");
      fetchTechnologies();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: error?.response?.data?.message,
         className:'toast-warning',
      });
    }
  };

  const addTechnology = async (data: { technology_name: string }) => {
    try {
      const response = await axios.post<{ data: Technology }>(
        `/technology`,
        { technology_name: data.technology_name }
      );
      console.log("Response after adding technology:", response.data.data);
      fetchTechnologies();
      toast({
        title: response.data.message,
        className:"toast-success",
      });
    } catch (error) {
      console.error("Error adding technology:", error);
      toast({
       title:error?.response?.data?.message,
       className:'toast-warning'
      });
    }
  };

  const updateTechnology = async (data: { technology_name: string }) => {
    if (!editingTechnology) return;

    try {
     const response =  await axios.put<{ data: Technology }>(
        `/technology/${editingTechnology._id}`,
        { technology_name: data.technology_name }
      );
      console.log("Response after update technology:", response.data.data);
      setEditingTechnology(null);
      fetchTechnologies();
      toast({
        title:response.data.message,
        className:"toast-success",

      });
    } catch (error) {
      console.error("Error updating technology:", error);
      setError("Failed to update technology");
      toast({
        title: error?.response?.data?.message,
        className:"toast-warning",
      });
    }
  };

  const handleDelete = async () => {
    if (!technologyToDelete) return;

    try {
     const response = await axios.delete(`/technology/${technologyToDelete._id}`);
      console.log("Response after delete technology:", response.data.data);
      setTechnologyToDelete(null);
      setDeleteDialogOpen(false);
      fetchTechnologies();
      toast({
        title: response.data.message,
        className:"toast-success",

      });
    } catch (error) {
      console.error("Error deleting technology:", error);
      toast({
        title: error?.response?.data?.message,
        className:"toast-warning",
      });
    }
  };

  const handleEdit = (technology: Technology) => {
    setEditingTechnology(technology);
    form.setValue("technology_name", technology.technology_name);
    setDialogOpen(true);
  };

  const handleAddTechnology = () => {
    reset();
    setEditingTechnology(null);
    setDialogOpen(true);
    setDuplicateError(null);
    clearErrors();
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 ">
        <h1 className="text-2xl font-bold text-gray-700">Technologies</h1>
        <Button className="primary text-white px-4 py-2 rounded-xl" onClick={handleAddTechnology}>+ Add Technology</Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">{editingTechnology ? "Edit Technology" : "Add Technology"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="technology_name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="block text-sm font-medium text-gray-700">Technology Name</Label>
                    <FormControl>
                      <Input className="mt-1 block w-full px-3 py-2  rounded-md shadow-sm sm:text-sm" placeholder="Add Technology Name" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1">{errors.technology_name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md">
                  {editingTechnology ? "Save" : "Add"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <div className=" rounded-xl ml-4 mt-4 border-4">
        <Table className="min-w-full ">
          <TableHead className="bg-gray-200 ">
          <TableRow className=''>
                        <TableCell className="hover:bg-gray-200">Technology Name</TableCell>

                    </TableRow>
                </TableHead >
                <TableHead className="bg-gray-200 ">
                    <TableRow className=''>

                        <TableCell className="hover:bg-gray-200">Action</TableCell>
                    </TableRow>
          </TableHead>
          <TableBody className="bg-white divide-y divide-gray-200">
            {technologies.length > 0 ? (
              technologies.map((technology) => (
                <TableRow key={technology._id}>
                  <TableCell className="px-16 py-4 whitespace-nowrap">{technology.technology_name}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="outline"  size="icon" className="px-3 py-1 rounded-md   text-blue-600" onClick={() => handleEdit(technology)}>
                      <FaEdit  className=" text-blue-600 hover:text-blue-600 text-lg" />
                    </Button>
                    <Button variant="outline"  size="icon" className="px-3 py-1 rounded-md  text-red-600 hover:text-red-600" onClick={() => { setTechnologyToDelete(technology); setDeleteDialogOpen(true); }}>
                      <FaTrash className="" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="px-6 py-4 text-center text-gray-500">No technologies available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {technologyToDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="hidden">Open Alert Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this technology?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button className="text-black" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">Delete</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default Page;
