import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
// import WorkspacePage from "./pages/WorkspacePage"; // plus tard

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/workspace/:id" element={<WorkspacePage />} /> */}
      </Routes>
    </Router>
  );
}
