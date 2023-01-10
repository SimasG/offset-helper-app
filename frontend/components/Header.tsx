import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);

  console.log("openMenu:", openMenu);

  {
    return openMenu ? (
      <div>Mobile Menu</div>
    ) : (
      <div className="flex items-center justify-between mb-12 sm:mb-24">
        {/* Mobile */}
        <button
          className="block sm:hidden"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        {/* Tablet/Desktop */}
        <ul className="items-center justify-between hidden gap-6 sm:flex">
          <li className="text-sm text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
            <Link href="/">Home</Link>
          </li>
          <li className="text-sm text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
            <Link href="/calculate">Calculate Emissions</Link>
          </li>
        </ul>
        <div>
          <ConnectButton />
        </div>
      </div>
    );
  }
};

export default Header;
