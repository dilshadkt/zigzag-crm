import React from "react";

const TableHeader = ({ title, icon }) => {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center gap-2">
        {icon}
        {title}
        <div className="flex flex-col">
          <svg
            className="w-3 h-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <svg
            className="w-3 h-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </th>
  );
};

const EmployeeRow = ({ employee }) => {
  return (
    <tr className="bg-white border-b border-gray-200 hover:bg-gray-50">
      {/* Employee Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {employee.name}
            </div>
            <div className="text-sm text-gray-500">{employee.id}</div>
          </div>
        </div>
      </td>

      {/* Clock-in & Out */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-orange-600 font-medium">
            {employee.clockIn}
          </span>
          <div className="flex items-center">
            <div className="w-8 h-px bg-gray-300 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <span className="text-gray-500 text-sm">{employee.duration}</span>
          <div className="flex items-center">
            <div className="w-8 h-px bg-gray-300 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <span className="text-orange-600 font-medium">
            {employee.clockOut}
          </span>
        </div>
      </td>

      {/* Overtime */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {employee.overtime || "-"}
      </td>

      {/* Picture */}
      <td className="px-6 py-4 whitespace-nowrap">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {employee.picture}
        </a>
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {employee.location}
        </a>
      </td>

      {/* Note */}
      <td className="px-6 py-4 text-sm text-gray-900">{employee.note}</td>
    </tr>
  );
};

const AttendanceTable = () => {
  const employees = [
    {
      name: "Bagus Fikri",
      id: "39486846",
      clockIn: "10:02 AM",
      clockOut: "07:00 PM",
      duration: "8h 58m",
      overtime: "2h 12m",
      picture: "bagus_profil...",
      location: "Jl. Jendral Sudirma...",
      note: "Discussed mutual value proposi...",
    },
    {
      name: "Sarah Johnson",
      id: "39486847",
      clockIn: "09:15 AM",
      clockOut: "06:30 PM",
      duration: "9h 15m",
      overtime: "1h 15m",
      picture: "sarah_profil...",
      location: "Jl. Merdeka Selatan...",
      note: "Team meeting and project review...",
    },
    {
      name: "Michael Chen",
      id: "39486848",
      clockIn: "08:45 AM",
      clockOut: "05:45 PM",
      duration: "9h 00m",
      overtime: "-",
      picture: "michael_profil...",
      location: "Jl. Thamrin No. 10...",
      note: "Client presentation completed...",
    },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader
                title="Employee Name"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Clock-in & Out"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Overtime"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Picture"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Location"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Note"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee, index) => (
              <EmployeeRow key={index} employee={employee} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
