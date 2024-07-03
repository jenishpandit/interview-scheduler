"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarRoutes = ["/login"];

  return (
    <div className="flex h-screen">
      {!noSidebarRoutes.includes(pathname) && (
        <div className="w-full md:w-1/3 lg:w-64  text-white p-5 overflow-x-hidden">
          <Sidebar />
        </div>
      )}
      <div className={`w-full ${noSidebarRoutes.includes(pathname) ? '' : ' w-auto md:w-2/3 lg:w-[90%]'} p-5 overflow-y-auto`}>
        <div className={inter.className}>
          {children}
        </div>
      </div>
    </div>
  );
}
