"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <>
    <nav className="hidden md:flex w-full h-20 sticky top-0 items-center justify-between px-10 border-b-2 border-gray-200 z-50 bg-white">
      <Link href="/" className="text-3xl font-bold">
        Phillip Reward Token Dapp
      </Link>
      <ConnectButton />
    </nav>

    <nav className="flex w-full h-20 sticky top-0 items-center justify-between px-6 border-b-2 border-gray-200 bg-white md:hidden">
      <Link href="/" className="text-2xl font-bold">
        PRT Dapp
      </Link>
      <ConnectButton />
    </nav>
    </>
  );
}
