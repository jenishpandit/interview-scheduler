"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).min(1, {
    message: "Email is required",
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/.*[!@#$%^&*(),.?":{}|<>].*/, {
      message: "Password must contain at least one special character",
    }),
});

export default function Page() {

  const router = useRouter()
 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

    
    useEffect(() => {
      const isAuthenticated = localStorage.getItem('token'); 
      if (isAuthenticated) {
        router.push('/dashboard'); 
      }
    }, []);

 
  const onSubmit = async (values: any) => {
    form.setValue("isSubmitting", true);
    try {
      const response = await axios.post(
        'http://localhost:4000/login',
        values,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      localStorage.setItem('token', response.data.token);
      console.log('token',response.data.token);
      
      console.log('Login successful:', response.data);
      router.push('/dashboard');
    } catch (error) {
      console.error('There was an error!', error.response.data);
      form.setError("password", { type: "manual", message: "Invalid email or password" });
    } finally {
      form.setValue("isSubmitting", false);
    }
  };
  

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input placeholder="Please Enter Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <FormControl>
                    <Input placeholder="Please Enter Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </Card>
    </main>
  );
}
