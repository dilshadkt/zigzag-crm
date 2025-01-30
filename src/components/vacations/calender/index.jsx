import React from "react";

const EmployeeSchedule = () => {
  const employees = [
    "Oscar Holloway",
    "Evan Yates",
    "Lola Zimmerman",
    "Tyler Curry",
    "Sadie Wolfe",
    "Sean Gibbs",
    "Corey Watts",
    "Theodore Shaw",
    "Edwin Austin",
    "Thomas Cummings",
    "Augusta Gordon",
  ];

  const statusSections = ["Sick Leave", "Work remotely", "Vacation"];

  return (
    <div className="container mx-auto max-w-4xl p-6 font-sans">
      {/* Main Title */}
      <h1 className="text-2xl font-bold mb-8">First month (September)</h1>

      {/* Employees Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Employees</h2>

        {/* Q Schedule */}
        <div className="mb-6">
          <div className="font-bold mb-2">Q</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
            {Array.from({ length: 27 }, (_, i) => (
              <div key={i + 1} className="flex gap-1">
                <span>{i + 1}.</span>
                <span>Tue Wed Thu Fri</span>
              </div>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <ul className="list-disc list-inside space-y-1">
          {employees.map((employee) => (
            <li key={employee}>{employee}</li>
          ))}
        </ul>
      </section>

      {/* Status Sections */}
      <div className="flex gap-8 border-t pt-4">
        {statusSections.map((section) => (
          <div key={section} className="flex-1">
            <h3 className="font-semibold mb-2">{section}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Approved</li>
              <li>Pending</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSchedule;
