import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import TripListing from "./pages/TripListing";
import CreateTrip from "./pages/CreateTrip";
import BuildItinerary from "./pages/BuildItinerary";
import TripDetail from "./pages/TripDetail";
import Discover from "./pages/Discover";
import Community from "./pages/Community";
import GlobalCalendar from "./pages/GlobalCalendar";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicTrip from "./pages/PublicTrip";
import NavBar from "./components/NavBar";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center font-mono text-sm text-ink/60">
      Loading route…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public/:shareToken" element={<PublicTrip />} />

        <Route path="/" element={<Protected><Landing /></Protected>} />
        <Route path="/trips" element={<Protected><TripListing /></Protected>} />
        <Route path="/trips/new" element={<Protected><CreateTrip /></Protected>} />
        <Route path="/trips/:id/build" element={<Protected><BuildItinerary /></Protected>} />
        <Route path="/trips/:id" element={<Protected><TripDetail /></Protected>} />
        <Route path="/discover" element={<Protected><Discover /></Protected>} />
        <Route path="/community" element={<Protected><Community /></Protected>} />
        <Route path="/calendar" element={<Protected><GlobalCalendar /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}
