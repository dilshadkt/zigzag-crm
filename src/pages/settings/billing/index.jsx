import React from "react";
import { useGetServerUsage } from "../../../api/hooks";
import { 
  MdCloudQueue, 
  MdStorage, 
  MdReceipt, 
  MdUpdate, 
  MdMonitorHeart,
  MdOutlineLocationOn,
  MdPayment,
  MdPayments,
  MdHistory,
  MdTrendingUp
} from "react-icons/md";
import { FiCpu } from "react-icons/fi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

const Billing = () => {
  const { data: usageData, isLoading, error } = useGetServerUsage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
        Failed to load billing information. Please try again later.
      </div>
    );
  }

  const { ec2, s3, billing } = usageData || {};

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MdPayments className="text-lg text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Billing & Server Usage</h2>
            <p className="text-xs text-gray-500">Monitor your AWS infrastructure and monthly hosting costs in INR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EC2 Server Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="flexBetween">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flexCenter text-orange-500">
                  <MdCloudQueue size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">AWS EC2 Instance</h3>
                  <p className="text-[10px] text-gray-400">Application Backend</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full border border-green-100">
                {ec2?.status || "Running"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <FiCpu size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{ec2?.instanceType}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <MdReceipt size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Est. Cost</span>
                </div>
                <p className="text-sm font-semibold text-blue-600">₹{ec2?.monthlyEstimatedCost}/mo</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <MdMonitorHeart size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">CPU Usage</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{ec2?.cpuUsage}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <MdMonitorHeart size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Memory</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{ec2?.memoryUsage}</p>
              </div>
            </div>
          </div>

          {/* S3 Storage Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="flexBetween">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flexCenter text-blue-500">
                  <MdStorage size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">AWS S3 Storage</h3>
                  <p className="text-[10px] text-gray-400">Media & Assets</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-100">
                Active
              </div>
            </div>

            <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl">
              <div className="flexBetween mb-2">
                  <span className="text-xs text-blue-800 font-medium">Storage Utilization</span>
                  <span className="text-xs text-blue-800 font-bold">{s3?.storageUsed}</span>
              </div>
              <div className="w-full bg-blue-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[35%]"></div>
              </div>
              <p className="text-[10px] text-blue-600 mt-2 italic font-medium">
                  Est. Cost: ₹{s3?.monthlyEstimatedCost}/mo
              </p>
            </div>

            <div className="mt-auto pt-4 text-center">
              <button className="text-primary text-[10px] font-bold hover:underline">
                Public IP: {ec2?.publicIp}
              </button>
            </div>
          </div>

          {/* Monthly Cost Graph */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flexBetween mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flexCenter text-purple-600">
                  <MdTrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Monthly Cost Breakdown (INR)</h3>
                  <p className="text-[10px] text-gray-400">Historical billing for the last 6 months</p>
                </div>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billing?.costHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 9 }} 
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 9 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={50}
                    domain={[0, 'dataMax + 200']}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '10px',
                      padding: '8px'
                    }}
                    formatter={(value) => [`₹${value}`, 'Cost']}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={24}>
                    {billing?.costHistory?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === billing.costHistory.length - 1 ? '#3F8CFF' : '#E2E8F0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Simple List Breakdown */}
          <div className="lg:col-span-2 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h3 className="text-[11px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-tight">
              <MdHistory size={14} className="text-gray-400" />
              Recent History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {billing?.costHistory?.map((item, idx) => (
                <div key={idx} className="bg-white px-3 py-2 rounded-lg flexBetween border border-gray-100 shadow-sm">
                  <span className="text-[11px] font-bold text-gray-600">{item.month}</span>
                  <span className="text-[11px] font-black text-gray-900">₹{item.cost}</span>
                </div>
              )).reverse()}
            </div>
          </div>

          {/* Current Month Overview Card */}
          <div className="lg:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl text-white">
            <div className="flexBetween flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flexCenter backdrop-blur-md">
                  <MdPayment size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Estimated Monthly Total</h3>
                  <p className="text-gray-400 text-sm">Combining EC2, S3, and Data Transfer in INR</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">₹{billing?.monthlyTotal}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Due {new Date(billing?.nextBillingDate).toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
