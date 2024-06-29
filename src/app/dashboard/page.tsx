"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Cpu, Laptop, User } from "lucide-react";
import axios from "../lib/axios";
import DashbordCard from "@/components/DashbordCard";

type DashboardData = {
  candidateTotal: number;
  technologyTotal: number;
  interviewTotal: number;
};
const page = () => {
  const [dashboard, SetDashboard] = useState<DashboardData | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get<{ data: DashboardData }>("/dashboard/total");
      console.log("Fetched data:", res.data);
      SetDashboard(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center p-4 pt-6 border-b border-gray-300">
        <h1 className="text-2xl font-bold text-gray-700">Dashboard</h1>
      </div>
      <div className="Total_View p-3">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          <DashbordCard
            title="Candidate Total"
            value={dashboard?.candidateTotal}
            Icon={<User />}
          ></DashbordCard>
          <DashbordCard
            title="Technology Total"
            value={dashboard?.technologyTotal}
            Icon={<Cpu />}
          ></DashbordCard>
          <DashbordCard
            title="interview Total"
            value={dashboard?.interviewTotal}
            Icon={<Laptop />}
          ></DashbordCard>
        </div>
      </div>
    </>
  );
};

export default page;
