import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DynamicForm from "./DynamicForm";
import Login from "./Login";
import HistoryList from "./HistoryList";
import ProtectedRoute from "./ProtectedRoute";



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

      </Routes>
    </Router>
  );
}

export default App;
