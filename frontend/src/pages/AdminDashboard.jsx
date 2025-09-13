import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMembers, updateMemberRole, upgradeUserPlan } from "../api";
import { setUser } from "../redux/authSlice";
import toast from "react-hot-toast";
import NotesList from "./NotesList";

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMembers();
    }
  }, [user]);

  async function fetchMembers() {
    try {
      const res = await getMembers(user.tenantSlug, token);
      setMembers(res.data.members);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch members");
    }
  }

  async function handleChangeRole(memberId, newRole) {
    try {
      const res = await updateMemberRole(memberId, newRole, token);
      const updatedMembers = members.map(m => m._id === memberId ? res.data.user : m);
      setMembers(updatedMembers);
      
      if (user.id === memberId) {
        dispatch(setUser({ ...user, role: newRole }));
      }
      toast.success("Member role updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  }

  async function handleUpgradePlan(memberId) {
    try {
      const res = await upgradeUserPlan(memberId, token);
      const updatedMembers = members.map(m => m._id === memberId ? res.data.user : m);
      setMembers(updatedMembers);

      if (user.id === memberId) {
        dispatch(setUser({ ...user, plan: 'pro' }));
      }
      toast.success("User plan upgraded to Pro!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upgrade failed");
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  console.log("members",members)
  console.log("user",user)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">
        {user.tenantSlug.toUpperCase()} Admin Dashboard
      </h1>
      <p className="text-center text-gray-400 mb-6">Your Plan: <span className="font-semibold text-blue-300">{user.plan.toUpperCase()}</span></p>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Member Management</h2>
        <div className="grid grid-cols-1 gap-4">
          {members.map(member => (
            <div key={member._id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-white">{member.email}</p>
                <p className="text-sm text-gray-400">Role: {member.role} | Plan: {member.plan.toUpperCase()}</p>
              </div>
              <div className="flex space-x-2">
                {member.plan === 'free' && (
                  <button
                    onClick={() => handleUpgradePlan(member._id)}
                    className="py-1 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                )}
                {member._id !== user.id && (
                  <button
                    onClick={() => handleChangeRole(member._id, member.role === 'admin' ? 'member' : 'admin')}
                    className="py-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
                  >
                    {member.role === 'admin' ? 'Degrade to Member' : 'Promote to Admin'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <NotesList />
    </div>
  );
}