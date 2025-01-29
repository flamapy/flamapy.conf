/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import flamapyLogo from "../assets/flamapy_horizontal_logo_white.svg";

function Navbar({ children }) {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-white shadow">
      <div className="flex gap-4 items-center">
        <Link
          to="/"
          className="flex flex-rowtext-blue-950 text-xl font-semibold"
        >
          <img src={flamapyLogo} alt="Flamapy logo" width="140rem" />
          conf
        </Link>
      </div>
      <div className="flex gap-4 items-center">{children}</div>
    </nav>
  );
}

export default Navbar;
