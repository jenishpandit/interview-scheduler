"use client";
import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Adjust path as per your project structure
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";


const noteSchema = z.object({
  note_text: z.string().min(1, "Note text is required"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface Note {
  id: number;
  note_text: string;
  interview_id: string;
}

const NoteManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  useEffect(() => {
    fetchNotes();
    const storedInterviewId = localStorage.getItem("interviewId");
    if (storedInterviewId) {
      setInterviewId(storedInterviewId);
    }
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get<Note[]>("/note");
      setNotes(response.data.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const onSubmit = async (data: NoteFormData) => {
    if (!interviewId) {
      console.error("Interview ID not set.");
      return;
    }

    const postData = {
      interview_id: interviewId,
      note_text: data.note_text,
    };

    try {
      const response = await axios.post<Note>("/note", postData);
      setNotes((prevNotes) => [...prevNotes, response.data.data]);
      reset();
      toast({
        title: "Note added successfully",
        className: "toast-success",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error adding note",
        className: "toast-error",
      });
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await axios.delete(`/note/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      toast({
        title: "Note deleted successfully",
        className: "toast-success",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error deleting note",
        className: "toast-error",
      });
    }
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <FaPlusCircle />
        </SheetTrigger>
        <SheetContent className="flex flex-col h-full">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-grow"
          >
            <SheetHeader />
            <div
              className="flex-grow overflow-y-auto"
              style={{ maxHeight: "500px" }}
            >
              <Table>
                <tbody>
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="text-nowrap">{note.note_text}</TableCell>
                        <TableCell>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            <FaTrash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>No notes found.</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="mt-auto">
              <SheetTitle>Add Notes</SheetTitle>
              <Input
                id="note_text"
                className="mt-4 w-full"
                placeholder="Add Notes"
                {...register("note_text")}
              />
              {errors.note_text && (
                <p className="text-red-500">{errors.note_text.message}</p>
              )}
              <Button className="w-full mt-6" type="submit">
                Add
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NoteManager;
