import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { getTenantDetailsFromToken } from "./api";
import { setUser } from "./redux/authSlice";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";

function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const token = localStorage.getItem("token");
  if (token && !user) {
    const userDetails = getTenantDetailsFromToken();
    if (userDetails) {
      dispatch(setUser(userDetails));
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/notes"
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/notes" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}