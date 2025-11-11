"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="w-full h-20 flex sticky top-0 items-center justify-between px-10 border-b-2 border-gray-200">
      <Link href="/" className="text-3xl font-bold">
        Phillip Reward Token Dapp
      </Link>
      <ConnectButton />
    </nav>
  );
}
