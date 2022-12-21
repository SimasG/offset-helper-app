import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="flex items-center justify-end gap-4">
      <Link href="https://twitter.com/simmygrade">
        <Image
          src="/socials/twitter.png"
          alt="Twitter logo"
          width={22}
          height={22}
          className="transition ease-in-out opacity-25 cursor-pointer color-red-400 delay-50 hover:opacity-50"
        />
      </Link>
      <Link href="https://github.com/SimasG/offset-helper-app">
        <Image
          src="/socials/github-mark-white.png"
          alt="Github logo"
          width={22}
          height={22}
          className="transition ease-in-out opacity-25 cursor-pointer delay-50 hover:opacity-50"
        />
      </Link>
    </div>
  );
};

export default Footer;
