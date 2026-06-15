/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import confEngineLogo from "../assets/spark.engine.svg";

function Navbar({ children }) {
  return (
    <nav className="flex flex-none justify-between items-center py-2 px-6 bg-white shadow z-10 relative">
      <div className="flex gap-4 items-center">
        <Link
          to="/"
          className="flex flex-row text-blue-950 text-xl font-semibold"
        >
          <img src={confEngineLogo} alt="conf.engine logo" width="160rem" />
        </Link>
      </div>
      <div className="flex gap-4 items-center">{children}</div>
    </nav>
  );
}

export default Navbar;
