import React from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Download,
  Calendar,
  ChevronDown,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReports() {
  const reports = [
    { id: 1, name: 'Monthly Revenue - March 2024', type: 'Financial', date: '2024-03-31', size: '2.4 MB' },
    { id: 2, name: 'Expert Performance Q1', type: 'Performance', date: '2024-03-31', size: '1.1 MB' },
    { id: 3, name: 'User Growth & Retention', type: 'Analytics', date: '2024-03-28', size: '3.5 MB' },
    { id: 4, name: 'Order Completion Rates', type: 'Operations', date: '2024-03-25', size: '0.8 MB' },
    { id: 5, name: 'Monthly Revenue - February 2024', type: 'Financial', date: '2024-02-29', size: '2.1 MB' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Reports & Analytics</h1>
            <p className="text-stone-500">Generate and download detailed system reports.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 size-4" /> Select Date Range
            </Button>
            <Button>
              <FileText className="mr-2 size-4" /> Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-stone-900 mb-2">Financial Reports</h3>
            <p className="text-sm text-stone-500 mb-4">Revenue, refunds, and payout summaries.</p>
            <Button variant="outline" size="sm" className="w-full">Generate Financial Report</Button>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-stone-900 mb-2">Operational Reports</h3>
            <p className="text-sm text-stone-500 mb-4">Order volume, completion times, and disputes.</p>
            <Button variant="outline" size="sm" className="w-full">Generate Ops Report</Button>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-stone-900 mb-2">User Analytics</h3>
            <p className="text-sm text-stone-500 mb-4">New signups, retention, and engagement.</p>
            <Button variant="outline" size="sm" className="w-full">Generate User Report</Button>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-lg text-stone-900">Recent Reports</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="mr-2 size-4" /> Filter
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Report Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Date Generated</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((report) => (
                  <tr key={report.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-900">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-stone-400" />
                        {report.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{format(new Date(report.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-stone-500">{report.size}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-[#5D4037] hover:bg-[#5D4037]/10 hover:text-[#5D4037]">
                        <Download className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
