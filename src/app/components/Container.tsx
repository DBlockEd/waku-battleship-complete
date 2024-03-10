'use client'
import React from "react";
import { useContentPair, useFilterMessages, useWaku } from "@waku/react";

import { isGameReady } from "../utils/gameUtils";
import PlayerBoard from "./PlayerBoard";
import { Message, Player } from "../types";
import OpponentBoard from "./OpponentBoard";


const Container = (props: {
    messages: Message[], 
    setMessages: any
    player: Player
}) => {
    const {messages, setMessages} = props;
    const {player} = props;

    // waku dependencies
  const { node, isLoading, error } = useWaku();
  const { decoder, encoder } = useContentPair();
  const { messages: filterMessages } = useFilterMessages({ node, decoder });
  
  // end waku dependencies
    return (
        <>
        <div>
            <h1>
                Your Board
            </h1>
            <PlayerBoard 
                player={player} 
                messages={messages} 
                setMessages={setMessages} 
                filterMessages={filterMessages}
                encoder={encoder}
                decoder={decoder}
                node={node}
                isLoading={isLoading}
                error={error}
            />
        </div>

        {
            isGameReady(messages) &&
            <div>
                <h1>
                    Opponent Board
                </h1>

                <OpponentBoard encoder={encoder} decoder={decoder} filterMessages={filterMessages} node={node} messages={messages} setMessages={setMessages} player={player} />
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
        </>
    )
}

export default Container;