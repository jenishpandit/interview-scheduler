"use client";
import React, { useEffect, useState } from "react";
import { Cpu, Laptop, User } from "lucide-react";
import axios from "../lib/axios";
import DashbordCard from "@/components/dashbordCard";
import TodayInterview from "@/components/interview";
import moment from "moment";
import { useRouter } from "next/navigation";

type DashboardData = {
  candidateTotal: number;
  technologyTotal: number;
  interviewTotal: number;
};
interface IInterview {
  id: string;
  interview_date: Date;
  interview_type: string;
  location: string;
}
interface Technology {
  _id: string;
  name: string;
} 
const page = () => {
  const router = useRouter();
  const [dashboard, SetDashboard] = useState<DashboardData | null>(null);
  const [getinterview, setInterview] = useState<IInterview[]>([]);
  const [Gettecnology, setTechnologies] = useState<Technology[]>([]);
  const [selectedTab, setSelectedTab] = useState("today");

  // useEffect(() => {
    // const token = localStorage.getItem('token'); 
    // if (!token) {
  
    //   router.push('/login'); 
    // }
  // }, [router]);
  const fetchDashboard = async () => {
    try {
      const res = await axios.get<{ data: DashboardData }>("/dashboard/total");
      // console.log("Fetched data:", res.data);
      SetDashboard(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);
  const InterviewFetch = async (tab:any) => {
    try {
      let endpoint:string;
      // if (tab === "Today") {
      //   endpoint = "/interview?date=today";
      // }
      const res = await axios.get(`/interview?filter=${tab}`);
      
      setInterview(res.data.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };
  useEffect(() => {
    InterviewFetch(selectedTab);
  }, [selectedTab]);

  const fetchTechnology = async () => {
    try {
      const res = await axios.get("/technology");
      // console.log("Fetched data tech:", res.data.data);
      setTechnologies(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchTechnology();
  }, []);

  useEffect(() => {// Update filtered interviews when tab changes
  }, [selectedTab, getinterview]);

console.log(getinterview);
  //  console.log("=======",getinterview)
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
      <div className="Today_interview ">
        <TodayInterview
         getInterview={getinterview}
          Gettecnology={Gettecnology}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </div>
    </>
  );
};

export default page;
