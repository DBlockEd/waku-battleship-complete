"use client";

import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import {Protocols} from '@waku/sdk'
import { ContentPairProvider, LightNodeProvider } from "@waku/react";

const peers = [
  "/dns4/node-01.do-ams3.waku.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkykgaECHswi3YKJ5dMLbq2kPVCo89fcyTd38UcQD6ej5W",
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
      <ContentPairProvider contentTopic={"/my-app/2/chatroom-1/proto"}>
    <html lang="en">
      <body className={inter.className}>{children}</body>
        </html>
      </ContentPairProvider>
      </LightNodeProvider>
  );
}
