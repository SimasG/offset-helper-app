import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header = () => {
  return (
    <div className="flex items-center justify-between mb-12 sm:mb-24">
      <ul>
        <li className="text-base text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
          <Link href="/calculate">Calculate Emissions</Link>
        </li>
      </ul>
      <div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
