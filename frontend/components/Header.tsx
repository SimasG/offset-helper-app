import { Burger } from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);

  {
    return (
      <>
        {/* pointer-events-none */}
        <div
          className={
            openMenu
              ? `flex items-center justify-between mb-12 sm:mb-24 opacity-0`
              : `flex items-center justify-between mb-12 sm:mb-24`
          }
        >
          {/* Mobile */}
          <Burger
            opened={openMenu}
            color="#fff"
            className="z-50 block sm:hidden"
            onClick={() => {
              setOpenMenu(!openMenu);
            }}
          />
          {/* Tablet/Desktop */}
          <ul className="items-center justify-between hidden gap-6 sm:flex">
            <li className="text-sm text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
              <Link href="/">Home</Link>
            </li>
            <li className="text-sm text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
              <Link href="/calculator">Calculator</Link>
            </li>
          </ul>
          <div>
            <ConnectButton />
          </div>
        </div>
        {/* If mobile menu is opened */}
        {openMenu && (
          <div className="fixed inset-0 z-40 p-4 bg-black bg-opacity-90">
            <div className="flex flex-col justify-start gap-12">
              <div className="flex items-center justify-between">
                <Burger
                  opened={openMenu}
                  color="#fff"
                  className="cursor-pointer hamburger"
                  onClick={() => {
                    setOpenMenu(!openMenu);
                  }}
                />
                <div>
                  <ConnectButton />
                </div>
              </div>
              <div className="flex flex-col items-center w-full">
                <ul className="flex flex-col items-center justify-between gap-6 uppercase sm:hidden">
                  <li className="text-xl text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
                    <Link href="/">Home</Link>
                  </li>
                  <li className="text-xl text-white transition duration-1000 hover:duration-1000 hover:underline hover:underline-offset-4">
                    <Link href="/calculator">Calculate Emissions</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default Header;
