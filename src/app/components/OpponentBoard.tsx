import { useContentPair, useFilterMessages, useLightPush, useWaku } from "@waku/react";
import React, { useEffect, useState } from "react";
import { Message, Player } from "../types";
import { decodeMessage, findLatestMessage, removeDuplicatesByKey } from "../utils";
import { createBoard, MoveMessage } from "../utils/gameUtils";

const OpponentBoard = (props: {
    filterMessages: any,
    node: any, 
    player: Player, 
    messages: Message[], 
    setMessages: any,
    encoder: any,
    decoder: any
}) => {

    const [board, setBoard] = useState(createBoard());
    const { decoder, encoder } = props;
    const [move, setMove] = useState<string>('');

    const { push } = useLightPush({ node: props.node, encoder });
    

    const handleHit = (hit: number) => {
        console.log(' i was called')
        const rowIndex = parseInt(move.split(',')[0]);
        const colIndex = parseInt(move.split(',')[1]);
        let newBoard = [...board];
        if (hit) {
            
            newBoard[rowIndex][colIndex] = 'hit';
        } else {
            newBoard[rowIndex][colIndex] = 'miss';
        }

        setBoard(newBoard);
    }

    const handleLatestMessage = (message: Message) => {
        console.log('latest message: ', message, props.player);
    
        if (Object.keys(message).includes('hit') && message.sender !== props.player) {
            handleHit(message.hit as number);
        }
        
      }


      const filteredMessagesDecoded = props.filterMessages.map(decodeMessage);
      console.log({filteredMessagesDecoded});

    useEffect(() => {
        
        const filteredMessagesDecoded = props.filterMessages.map(decodeMessage);
        console.log({filteredMessagesDecoded});
        const updatedMessages = [...props.messages, ...filteredMessagesDecoded] as Message[];

        const filteredUpdatedMessages = removeDuplicatesByKey(updatedMessages, 'id');
        props.setMessages(filteredUpdatedMessages);


        const latestMessage = findLatestMessage(filteredMessagesDecoded as Message[]);

        console.log({latestMessage})
        if (latestMessage) {
        filteredMessagesDecoded && handleLatestMessage(latestMessage);
        }
    
    }, [props.filterMessages])
    

    const sendMoveMesasge = async (rowIndex: number, colIndex: number) => {
        setMove(`${rowIndex},${colIndex}`);
        const protoMessage = MoveMessage.create({
            timestamp: Date.now(),
            sender: props.player,
            move: `${rowIndex},${colIndex}`,
            id: crypto.randomUUID()
          });   

          const serialisedMessage = MoveMessage.encode(protoMessage).finish();
          const timestamp = new Date();

          if (push) {
            const res = await push({
              payload: serialisedMessage,
              timestamp: timestamp,
            });
      
            if (res?.errors?.length && res?.errors?.length > 0) {
              alert('unable to connect to a stable node. please reload')
      
            } else {
                console.log('message sent successfully', res);
            }
          } else {
              console.log(' unable to send message')
          }
    }

    // if (isLoading) {
    //     return <div>
    //         loading opponent board
    //     </div>
    // }

    // if (error) {
    //     return (
    //         <div>
    //             error loading opponent board
    //         </div>
    //     )
    // }

    return (
        <div className="board">
            {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell === 1 ? "ship" : ""}`} // Use 'ship' class for cells with a ship
                onClick={() => {
                  sendMoveMesasge(rowIndex, colIndex)
                }}
              >
                  {Boolean(cell) && cell}
              </div>
            ))}
          </div>
        ))}

        </div>
    )


}

export default OpponentBoard;