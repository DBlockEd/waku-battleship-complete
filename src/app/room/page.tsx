'use client'

import { useRouter } from "next/navigation";
import React, { useState } from "react";

function generateThreeDigitNumber(): number {
    // Generate a number between 0 (inclusive) and 1 (exclusive),
    // multiply it by 900 to get a range of 0 to 899,
    // add 100 to shift the range to 100 to 999,
    // and use Math.floor to remove any decimal places.
    return Math.floor(Math.random() * 900 + 100);
  }

const Page = () => {
    const [username, setUsername] = useState<string>('');
    const [room, setRoom] = useState<string>('');
    const router = useRouter();

    return(
        <div>
            <div>
            <input placeholder="enter username" type="text" value={username} onChange={e => setUsername(e?.target?.value)} />
            </div>
        <div>
            
            <button disabled={!Boolean(username)} onClick={() => {router.push(`/room/${generateThreeDigitNumber()}?username=${username}`)}}>
                create a new room
            </button>

            
        </div>

        <div>
            <input type="string" value={room} onChange={e => setRoom(e?.target?.value)} />

            <button disabled={!Boolean(room) || !Boolean(username)} onClick={() => {router.push(`/join/${generateThreeDigitNumber()}?username=${username}`)}}>
                join this room
            </button>
        </div>
        </div>
        
    )
};

export default Page;