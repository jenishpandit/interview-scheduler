"use client"
import React, { useState, useEffect } from 'react';
import axios from '../../src/app/lib/axios';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'; // Adjust path as per your project structure
import { FaPlusCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEdit, FaEye, FaFileUpload, FaTrash } from "react-icons/fa";
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const noteSchema = z.object({
    note_text: z.string().min(1, 'Note text is required'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteManagerProps {
    interviewId: string;
    openNote: boolean;
    setOpenNote: (note: boolean) => void;
}

const NoteManager = ({ interviewId, openNote, setOpenNote }: NoteManagerProps) => {
    const [notes, setNotes] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<NoteFormData>({
        resolver: zodResolver(noteSchema),
    });

    useEffect(() => {
        if (interviewId) fetchNotes();
    }, [interviewId]);


    const fetchNotes = async () => {
        try {
            const response = await axios.get(`/note/${interviewId}`);
            setNotes(response.data.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const onSubmit = async (data: NoteFormData) => {
        if (!interviewId) {
            console.error('Interview ID not set.');
            return;
        }

        const postData = {
            interview_id: interviewId,
            note_text: data.note_text,
        };

        try {
            const response = await axios.post('/note', postData);
            if (response.data.code === 200) {
                fetchNotes();
            }
            reset();
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    return (
        <Sheet open={openNote} onOpenChange={() => setOpenNote(false)}>
            <SheetContent className="flex flex-col h-full">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow">
                    <SheetHeader>
                    </SheetHeader>
                    <div className="flex-grow overflow-y-auto" style={{ maxHeight: '500px' }}>
                        <Table>
                            <tbody>
                                {notes.length > 0 ? (
                                    notes.map(note => (
                                        <TableRow className='border-none' key={note._id} >
                                            <TableCell className='text-right'><Badge className='text-base rounded-md bg-gray-200 text-black hover:bg-gray-200'>{note.note_text}</Badge></TableCell>
                                            {/* <TableCell>
                                                    <Button variant="outline" size="icon" onClick={() => handleUpdateNote(note.id, 'Updated text')}><FaEdit /></Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDeleteNote(note._id)}><FaTrash /></Button>
                                                </TableCell> */}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={1}>No notes found.</TableCell>
                                    </TableRow>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    <div className="mt-auto">
                        <Textarea

                            id="note_text"
                            className="mt-4 w-full"
                            placeholder="Add Notes"
                            {...register('note_text')}
                        />
                        {errors.note_text && <p className="text-red-500">{errors.note_text.message}</p>}
                        <Button className="w-full mt-6" type="submit">
                            Add
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default NoteManager;
