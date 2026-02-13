import App from "@/App";
import RootLayout from "@/layouts/RootLayout";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />
      },
      /*
      {
        a /foo route
        path: "foo",
        element: <Bar/>,
      }
      */
    ]
  }
])
