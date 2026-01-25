import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Layout from "./Layout.jsx";
import Jobs from "./pages/Jobs.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import Register from "./pages/Register.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CompanyRoute from "./CompanyRoute.jsx";
import Company from "./pages/Company.jsx";
import CreateJob from "./pages/CreateJob.jsx";
import JobKnowledgeBase from "./pages/JobKnowledgeBase.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/register", element: <Register /> },
      { path: "/job", element: <Jobs /> },
      { path: "/feedback", element: <FeedbackPage /> },
      { path: "/profile/:username", element: <ProfilePage /> },
      {
        path: "/company",
        element: (
          <CompanyRoute>
            <Company />
          </CompanyRoute>
        )
      },
      {
        path: "/company/kb/:id",
        element: (
          <CompanyRoute>
            <JobKnowledgeBase />
          </CompanyRoute>
        )
      },
      {
        path: "/job/create", element: (
          <CompanyRoute>
            <CreateJob />
          </CompanyRoute>
        )
      }
    ],
  },
  {
    path: "/interview/:id",
    element: (
      <ProtectedRoute>
        <InterviewRoom />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
