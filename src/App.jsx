import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrainingsPage from "./pages/TrainingsPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProgressPage from "./pages/ProgressPage";
import TrainingPlansPage from "./pages/TrainingPlansPage";
import ProfilePage from "./pages/ProfilePage";
import CoachAthletesPage from "./pages/CoachAthletesPage";
import MyTrainingsPage from "./pages/MyTrainingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/trainings" element={<TrainingsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/training-plans" element={<TrainingPlansPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/coach/athletes" element={<CoachAthletesPage />} />
        <Route path="/my-trainings" element={<MyTrainingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
