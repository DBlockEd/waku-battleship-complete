export enum Player {
    p1 = 'p1',
    p2 = 'p2'
  }
  
  export type Message = {
    message: string;
    sender: Player;
    id: any;
  }
  