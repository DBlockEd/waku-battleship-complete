"use client";

import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import {Protocols} from '@waku/sdk'
import { LightNodeProvider } from "@waku/react";

const peers = [
  "/ip4/49.206.132.241/tcp/8000/ws/p2p/16Uiu2HAm9sQfeoR3fs13m8DRZvUE5AVjLqw8sFgZPa3ehu8tyzS4",
];

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <LightNodeProvider
      options={{bootstrapPeers: peers}}
      protocols={[Protocols.Store, Protocols.Filter, Protocols.LightPush]}
    >
    <html lang="en">
      <body className={inter.className}>{children}</body>
      </html>
      </LightNodeProvider>
  );
}
