"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import axios from "../lib/axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    if (token) {
      router.push('/dashboard'); 
    }
  }, [router]);

  const onSubmit = async (values: any) => {
    try {
      const response = await axios.post('/auth/login', values);
      console.log(response);
      
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('id' ,response.data.data.user._id);
     
      
     
      toast({
        description: response.data.message,
        className: "toast-success",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('There was an error!', error);
      form.setError("password", { type: "manual", message: "Invalid email or password" });
    }
  };

  return (
    <main className="flex items-center justify-center mt-32">
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
