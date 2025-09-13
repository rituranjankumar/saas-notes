import React from "react";
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 p-4 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} SaaS Notes. All rights reserved.</p>
      </div>
    </footer>
  );
}