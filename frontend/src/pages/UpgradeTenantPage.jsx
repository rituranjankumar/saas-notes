import React, { useEffect } from "react";
import { upgradeTenant, getTenantDetailsFromToken } from "../api";
import toast from "react-hot-toast";

export default function UpgradeTenantPage() {
  const user = getTenantDetailsFromToken();
  
   
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tenant Upgrade Status</h1>
      <p className="mb-4">
        This page confirms the upgrade for your tenant.
      </p>
      {user?.plan === "pro" && (
        <p className="text-green-400 font-semibold">Your tenant is already on the Pro plan!</p>
      )}
      {user?.plan === "free" && (
        <p className="text-yellow-400 font-semibold">You can upgrade to the Pro plan from the Admin Dashboard.</p>
      )}
    </div>
  );
}