import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import moment from "moment";
import axios from "../app/lib/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
interface TodayInterviewProps {
    Gettecnology: any[];
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
    getInterview: any[];
  }
  import Link from 'next/link';
interface Technology {
  _id: string;
  name: string;
}

const TodayInterview: React.FC<TodayInterviewProps> = ({Gettecnology ,selectedTab,setSelectedTab ,getInterview }) => {
// console.log(selectedTab);

 
//   console.log(getinterview);
  const renderInterviews = (interviews: any[]) => {
    // console.log(interviews);
    
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-white">
            <TableHead className="font-bold">No.</TableHead>
            <TableHead className="font-bold">Interview Date</TableHead>
            <TableHead className="font-bold">Time</TableHead>
            <TableHead className="font-bold">Candidate Name</TableHead>
            <TableHead className="font-bold">Technology</TableHead>
            <TableHead className="font-bold">Job Type</TableHead>
            <TableHead className="font-bold">Interview Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.map((interview, index) => {
            const Technology = Gettecnology.find(
              (tech) => tech._id === interview.candidate_id.technology_id
            );
          console.log(Technology ,"==============");
          console.log(interview ,"_-------------------");
          
            return (
                  <TableRow key={interview._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {moment(interview.interview_date).format("MMMM DD, YYYY")}
                </TableCell>
                <TableCell>
                  {moment(interview.interview_date).format("h:mm:ss A")}
                </TableCell>
                <TableCell className="">
                <Link className="hover:underline" href={`/candidates/${interview.candidate_id._id}`}>
                {interview.candidate_id.first_name}{" "}
                {interview.candidate_id.last_name}
                </Link>
                </TableCell>
                <TableCell >
                  {Technology ? Technology.technology_name : "Unknown"}
                </TableCell>
                <TableCell>{interview.candidate_id.type}</TableCell>
                <TableCell>{interview.interview_type}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      {/* <Tabs defaultValue="Today">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="Today"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="Tomorrow"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Tomorrow
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Today">
          <Table>
            <TableHeader>
              <TableRow className=" hover:bg-white">
                <TableHead className="font-bold">No.</TableHead>
                <TableHead className="font-bold">Interview Date</TableHead>
                <TableHead className="font-bold">Time</TableHead>
                <TableHead className="font-bold">Canidate name </TableHead>
                <TableHead className="font-bold">Tecnologoy</TableHead>
                <TableHead className="font-bold">job type</TableHead>
                <TableHead className="font-bold">interview type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getinterview.map((e, index) => {
                const Technology = Gettecnology.find(
                  (tech) => tech._id === e.candidate_id.technology_id
                );
                console.log(Technology);

                return (
                  <TableRow key={e._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {moment(e.interview_date).format("MMMM DD, YYYY")}
                    </TableCell>
                    <TableCell>
                      {moment(e.interview_date).format("h:mm:ss A")}
                    </TableCell>
                    <TableCell>
                      {e.candidate_id.first_name +
                        " " +
                        e.candidate_id.last_name}
                    </TableCell>
                    <TableCell>
                      {Technology ? Technology.technology_name : "Unknown"}
                    </TableCell>
                    <TableCell>{e.candidate_id.type}</TableCell>
                    <TableCell>{e.interview_type}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="Tomorrow">Change your password here.</TabsContent>
      </Tabs> */}

<Tabs defaultValue="today">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="today"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              selectedTab === "today"
                ? "bg-background text-foreground shadow-sm"
                : "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            }`}
            onClick={() => setSelectedTab("today")}
          >
            today
          </TabsTrigger>
          <TabsTrigger
            value="tomorrow"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              selectedTab === "tomorrow"
                ? "bg-background text-foreground shadow-sm"
                : "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            }`}
            onClick={() => setSelectedTab("tomorrow")}
          >
            Tomorrow
          </TabsTrigger>
          <TabsTrigger
          value="upcoming"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            selectedTab === "upcoming"
              ? "bg-background text-foreground shadow-sm"
              : "disabled:pointer-events-none disabled:opacity-50"
          }`}
          onClick={() => setSelectedTab("upcoming")}
        >
          Upcoming
        </TabsTrigger>
        </TabsList>
        <TabsContent value="today">{renderInterviews(getInterview)}</TabsContent>
        <TabsContent value="tomorrow">{renderInterviews(getInterview)}</TabsContent>
        <TabsContent value="upcoming">{renderInterviews(getInterview)}</TabsContent>
      </Tabs>
    </>
  );
};

export default TodayInterview;
