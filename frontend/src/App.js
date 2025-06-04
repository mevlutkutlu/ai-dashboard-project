import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DynamicForm from "./DynamicForm";
import Login from "./Login";
import HistoryList from "./HistoryList";
import ProtectedRoute from "./ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import AdminTemplates from "./pages/AdminTemplates"; // 👈 bu satırı ekle

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/history" element={<HistoryList />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard/:templateId"
          element={
            <ProtectedRoute>
              <DynamicForm />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
      </Routes>
    </Router>
  );
}

export default App;
