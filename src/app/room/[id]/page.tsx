'use client'
import { ContentPairProvider } from "@waku/react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import PlayerBoard from "../../components/PlayerBoard";
import { Message, Player } from "../../types";
import { isGameReady } from "../../utils/gameUtils";

const Page = () => {
    const searchParams = useParams();
    const queryParams = useSearchParams();
    const username = queryParams.get('username');
    
    // setting id=0 for first message since its common for both the players
    const [messages, setMessages] = useState<Message[]>([{sender: Player.p1, message: 'joined', id: 0}]);
    const roomId = searchParams.id as string;

    console.log({isGameReady: isGameReady(messages)});

    return (
        <ContentPairProvider contentTopic={`/waku-battlship/${roomId}`}>
        <div>
            this is a new room {searchParams.id} created by {username}
            <h1>
                Your Board
            </h1>
            <PlayerBoard player={Player.p1} messages={messages} setMessages={setMessages} roomId={parseInt(roomId)} />
        </div>

        {
            isGameReady(messages) &&
            <div>
                <h1>
                    Opponent Board
                </h1>
            </div>
        }
    

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
}

export default Page;