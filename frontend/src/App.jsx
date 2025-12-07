import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. Import the Layout
import Layout from "./components/layout/Layout";

// 2. Import the Pages we created
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
// import Requests from "./pages/Requests";
import FileView from "./pages/FileView";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "./components/GoogleTranslate"; // The Chat Page
import Home from "./pages/Home";
import FTSOPrice from "./pages/FTSO";
import Pricing from "./pages/Pricing";  
import FDCAutoVerify from "./pages/FDC_Autoverify";

function App() {
  return (
    <>
    <div className="fixed bottom-6 right-6 z-50">
        {/* Widget is now rendered correctly outside the router logic */}
        <GoogleTranslate />
      </div>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#121212",
            color: "#fff",
            border: "1px solid #333",
            fontFamily: "monospace",
          },
        }}
      />
      <Routes>
        {/* Public Route: Login Screen */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes: Inside the Dashboard Layout */}
        <Route element={<Layout />}>
          {/* Default dashboard goes to Upload for now, or build a Stats page */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/files/:fileId" element={<FileView />} />{" "}
          {/* Dynamic Route for Chat */}
          {/* <Route path="/requests" element={<Requests />} /> */}
          <Route path="/FTSO" element={<FTSOPrice />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/FDCAutoVerify" element={<FDCAutoVerify />} />
          
        </Route>

        {/* Catch-all: Redirect to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
