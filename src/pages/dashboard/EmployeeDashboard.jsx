import React from "react";
import EmployeeProgressStats from "../../components/dashboard/employeeProgressStats";
import EmployeeWorkDetails from "../../components/dashboard/employeeWorkDetails";
import CompletionTrendChart from "../../components/dashboard/performanceChart";
import { useAuth } from "../../hooks/useAuth";

const EmployeeDashboardPage = () => {
    const { user } = useAuth();
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const taskMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Employee Dashboard</h2>
            
            <div className="w-full grid grid-cols-7 gap-x-6 mt-3">
                <EmployeeProgressStats taskMonth={taskMonth} />
            </div>

            <div className="w-full mt-5">
                <CompletionTrendChart userId={user?._id} />
            </div>

            <div className="w-full mt-5">
                <EmployeeWorkDetails />
            </div>
        </div>
    );
};

export default EmployeeDashboardPage;
