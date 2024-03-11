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
        <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
            <h1 className="text-lg font-bold text-center">
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

{
            isGameReady(messages) &&
            <div className="grid grid-cols-1 gap-4">
                <h1 className="text-lg font-bold text-center">
                    Opponent Board
                </h1>

                <OpponentBoard encoder={encoder} decoder={decoder} filterMessages={filterMessages} node={node} messages={messages} setMessages={setMessages} player={player} />
            </div>
        }
        </div>

        
    

        <div style={{width: '300px'}} className=" mx-auto my-4 p-4 bg-gray-800 text-white rounded-lg shadow">

        <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Messages:</h3>

        <ul className="space-y-2 overflow-y-auto max-h-64">

                {messages.map((_message: Message, idx) => {
                    return (
                        <li key={idx} className={`flex items-center ${_message.sender === Player.p1 ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${_message.sender === Player.p1 ? 'bg-blue-500' : 'bg-green-500'} text-sm text-white py-2 px-4 rounded-lg max-w-xs`}>
                            <p className="font-bold">{_message.sender}</p>
                            <p>{_message.message}</p>
                        </div>
                    </li>
                    )
                })}
            </ul>
        </div>
        </div>
    )
}

export default Container;