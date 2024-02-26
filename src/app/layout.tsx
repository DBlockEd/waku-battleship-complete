"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import { LightNodeProvider } from "@waku/react";
import { Protocols } from "@waku/sdk";
import { bootstrap } from "@libp2p/bootstrap";



const inter = Inter({ subsets: ["latin"] });

// Define the list of static peers to bootstrap

// Set the Light Node options
// const NODE_OPTIONS = { defaultBootstrap: true };

const peers = [
  "/ip4/49.206.132.241/tcp/8000/ws/p2p/16Uiu2HAm9sQfeoR3fs13m8DRZvUE5AVjLqw8sFgZPa3ehu8tyzS4"
];
const NODE_OPTIONS = {
            libp2p: {
                peerDiscovery: [bootstrap({ list: peers })],
            },
        };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LightNodeProvider
      options={NODE_OPTIONS}
      protocols={[Protocols.Store, Protocols.Filter, Protocols.LightPush]}
    >
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </LightNodeProvider>
  );
}
