import { Message, Player } from "../types";

const isGameReady = (gameMessages: Message[]): boolean => {

    const gameMessagesCleaned = gameMessages.map(
        (_gameMessage: Message) => (
            {sender: _gameMessage.sender, message: _gameMessage.message}
            )
        );

        console.log({gameMessagesCleaned});

    const playerP1Ready = gameMessagesCleaned.some(event => event.sender === "p1" && event.message === "ready");

    const playerP2Ready = gameMessagesCleaned.some(event => event.sender === "p2" && event.message === "ready");

    return playerP1Ready && playerP2Ready;    
}


export type Ship = {
    id: number;
    size: number;
    orientation: string;
    placed: boolean
}
const BOARD_SIZE = 10;

const createBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)); // Fill with 0 for empty cells


export {isGameReady, BOARD_SIZE, createBoard}