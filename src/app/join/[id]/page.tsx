'use client'
import { ContentPairProvider } from "@waku/react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Container from "../../components/Container";
import { Message, Player } from "../../types";

const Page = () => {
    const searchParams = useParams();
    const queryParams = useSearchParams();
    const username = queryParams.get('username');
    const roomId = searchParams.id as string;
    const [messages, setMessages] = useState<Message[]>([{sender: Player.p1, message: 'joined', id: 0, timestamp: Date.now()}]);

    return (
        <ContentPairProvider contentTopic={`/waku-battlship/${roomId}`}>
            <div>
                Welcome, {username}
                you have joined the room {roomId}
            </div>

            <Container player={Player.p2} messages={messages} setMessages={setMessages} />
        </ContentPairProvider>
    )
};

export default Page;