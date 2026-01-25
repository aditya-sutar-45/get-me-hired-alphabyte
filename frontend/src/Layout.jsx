import { Outlet } from "react-router-dom";
import Navbar from "./components/General/Navbar";

function Layout() {
  return (
    <>
      <Navbar />
      <main className="w-dvw pt-[5vh]">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
