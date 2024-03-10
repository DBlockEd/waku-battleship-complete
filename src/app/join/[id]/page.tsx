'use client'
import { ContentPairProvider } from "@waku/react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import PlayerBoard from "../../components/PlayerBoard";
import { Message, Player } from "../../types";

const Page = () => {
    const searchParams = useParams();
    const queryParams = useSearchParams();
    const username = queryParams.get('username');
    const roomId = searchParams.id as string;

    const [messages, setMessages] = useState<Message[]>([{sender: Player.p1, message: 'joined', id: 0}]);
    return (
        <ContentPairProvider contentTopic={`/waku-battlship/${roomId}`}>
                <div>
                    Welcome, {username}
                    you have joined the room {roomId}
                    <PlayerBoard player={Player.p2} messages={messages} setMessages={setMessages} roomId={parseInt(roomId)} />
                </div>

                <div>
            Messages: 
            <ul>
                {messages.map((_message: Message, idx) => {
                    return <li key={idx}>{_message.sender}: {_message.message} </li>
                })}
            </ul>
        </div>
        </ContentPairProvider>
    )
};

export default Page;