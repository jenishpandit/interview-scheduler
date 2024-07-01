"use client"
import React, { useState, useEffect } from 'react';

import axios from '../lib/axios'; 
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FaPlusCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableCell, TableHead, TableRow } from '@/components/ui/table';

interface Note {
  id: number;
  note_text: string;
}

const NoteManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]); 
  const [newNote, setNewNote] = useState<string>('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get<Note[]>('/note');
      setNotes(response.data.data); 
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await axios.post<Note>('/note', { note_text: newNote });
      setNotes(prevNotes => [...prevNotes, response.data.data]); 
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleUpdateNote = async (id: number, updatedText: string) => {
    try {
      await axios.put(`/note/${id}`, { note_text: updatedText });
      setNotes(prevNotes =>
        prevNotes.map(note => (note.id === id ? { ...note, note_text: updatedText } : note))
      ); 
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await axios.delete(`/note/${id}`);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id)); 
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger><FaPlusCircle /></DialogTrigger>
        <DialogContent>
          <label htmlFor="newNote">Add Notes</label>
          <Input id="newNote" placeholder="Add Notes" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
          <Button className="w-16 ml-2" onClick={handleAddNote}>Add</Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Note Text</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <tbody>
          {notes.length > 0 ? (
            notes.map(note => (
              <TableRow key={note.id}>
                <TableCell>{note.note_text}</TableCell>
                <TableCell>
                  <Button onClick={() => handleUpdateNote(note._id, 'Updated text')}>Update</Button>
                  <Button onClick={() => handleDeleteNote(note._id)}>Delete</Button>
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
  );
};

export default NoteManager;
