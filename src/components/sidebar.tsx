import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaTachometerAlt, FaLaptopCode, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Button } from "./ui/button";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className={cn("fixed top-0 left-0 h-full w-64 bg-gray-800 text-white")}>
      <div className="flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-2 text-center font-serif">IS</h1>
        <span className="text-sm mb-4 text-center font-bold">Interview Scheduler</span>
        <hr className="h-px bg-gray-500 border-0 dark:bg-gray-700"></hr>
        <nav className="flex flex-col mt-6">
          <Link href="/dashboard">
            <div
              className={cn(
                "mb-4 p-2 flex items-center hover:bg-gray-700 rounded",
                pathname === "/dashboard" && "bg-gray-700"
              )}
            >
              <FaTachometerAlt className="mr-2" /> Dashboard
            </div>
          </Link>
          <Link href="/technology">
            <div
              className={cn(
                "mb-4 p-2 flex items-center hover:bg-gray-700 rounded",
                pathname === "/technology" && "bg-gray-700"
              )}
            >
              <FaLaptopCode className="mr-2" /> Technologies
            </div>
          </Link>
          <Link href="/candidates">
            <div
              className={cn(
                "mb-4 p-2 flex items-center hover:bg-gray-700 rounded",
                pathname.startsWith("/candidates") && "bg-gray-700"
              )}
            >
              <FaUser className="mr-2" /> Candidates
            </div>
          </Link>
        </nav>
      </div>
      <div className="p-4 sm:mt-52 mt-52 md:mt-52 lg:mt-52 xl:mt-80 ">
        <Button
          className="bg-slate-500 hover:bg-slate-600 text-white p-2 rounded w-full"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-2 text-lg" />
          <span className="font-bold">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
