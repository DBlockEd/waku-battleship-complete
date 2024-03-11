'use client'
import { ContentPairProvider } from "@waku/react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Container from "../../components/Container";
import OpponentBoard from "../../components/OpponentBoard";
import PlayerBoard from "../../components/PlayerBoard";
import { Message, Player } from "../../types";
import { isGameReady } from "../../utils/gameUtils";

const Page = () => {
    const searchParams = useParams();
    const queryParams = useSearchParams();
    const username = queryParams.get('username');
    const [filterMessages, setFilterMessages] = useState([]);
    // setting id=0 for first message since its common for both the players
    const [messages, setMessages] = useState<Message[]>([{sender: Player.p1, message: 'joined', id: 0, timestamp: Date.now()}]);
    const roomId = searchParams.id as string;

    return (
        <ContentPairProvider contentTopic={`/waku-battlship/${roomId}`}>

        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-lg font-bold text-center">
            Welcome to room: <span className="text-blue-500">{searchParams.id}</span> created by <span className="text-green-500">{username}</span>
        </div>

        <div className="text-md text-gray-700 text-center">
            Share this room ID with your friend to start playing now
        </div>

        <Container player={Player.p1} messages={messages} setMessages={setMessages} />
        </div>

     
        </ContentPairProvider>
    )
}

export default Page;