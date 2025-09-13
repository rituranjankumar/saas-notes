import React from "react";
import { useSelector } from "react-redux";
import NotesList from "./NotesList";

export default function UserDashboard() {
  const user = useSelector((state) => state.auth.user);

  if (!user || user.role !== 'member') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        {user.tenantSlug.toUpperCase()} Dashboard
        <p className="text-center text-gray-400 mb-6">Your Plan: <span className="font-semibold text-blue-300">{user.plan.toUpperCase()}</span></p>
      </h1>
      <NotesList isUserDashboard={true} />
    </div>
  );
}