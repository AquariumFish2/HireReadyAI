import React from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import DashboardStats from "../components/DashboardStats";
import DashboardCharts from "../components/DashboardCharts";
import DashboardJobsTable from "../components/DashboardJobsTable";
import { useEffect, useState } from "react";
import { fetchCurrentUserName } from "../services/dashboard.service";
import { useUser } from "@/features/auth/context/user.context";
export default function RecruiterDashboardPage() {
  const {
    jobs,
    stats,
    pipelineSummaryData,
    trendData,
    topJobsData,
    isLoading,
    error,
  } = useDashboardData();

  const { profile } = useUser();
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    async function loadName() {
      if (!profile?.id) return;

      try {
        const name = await fetchCurrentUserName(profile.id);
        setFullName(name);
      } catch (err) {
        console.error("Failed to fetch user name", err);
      }
    }

    loadName();
  }, [profile?.id]);
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-dark-amethyst-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 font-sans">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          Failed to load dashboard data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-1">
          {/* Top row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1
              className="text-3xl font-bold text-dark-amethyst-950 tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Dashboard
            </h1>

            {/* Welcome user badge */}
            <div className="px-4 py-2 rounded-full bg-dark-amethyst-50 border border-dark-amethyst-100 text-sm text-dark-amethyst-700 font-medium">
              Welcome,{" "}
              <span className="text-dark-amethyst-900 font-semibold">
                {fullName || "User"} !
              </span>{" "}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-dark-amethyst-400">
            Overview of your active job postings and applicants.
          </p>
        </div>

        <DashboardStats stats={stats} />

        {pipelineSummaryData && topJobsData.length > 0 && (
          <DashboardCharts
            pipelineSummaryData={pipelineSummaryData}
            trendData={trendData}
            topJobsData={topJobsData}
          />
        )}

        <DashboardJobsTable jobs={jobs} />
      </div>
    </div>
  );
}
