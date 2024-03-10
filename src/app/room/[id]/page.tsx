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

        <div>
            this is a new room {searchParams.id} created by {username}
        </div>

        <Container player={Player.p1} messages={messages} setMessages={setMessages} />
        </ContentPairProvider>
    )
}

export default Page;