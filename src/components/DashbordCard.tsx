import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface DashboardCardProps {
  title: string;
  value: number | undefined;
  Icon: any;
}
const DashbordCard: React.FC<DashboardCardProps> = ({ title, value, Icon }) => {
  return (
    <Card>
      <CardHeader className=" flex p-6 flex-row items-center justify-between space-y-0 pb-3">
        <CardDescription className="tracking-tighter text-sm font-medium text-black">
          {title}
        </CardDescription>
        {Icon}
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl font-bold">{value}</CardTitle>
      </CardContent>
    </Card>
  );
};

export default DashbordCard;
