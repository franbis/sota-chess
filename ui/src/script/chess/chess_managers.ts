import type { Color, Square } from "chess.js";

import type { GameStateMsgContent, Message } from '../../../../shared/types/chess.types';
import { MessageType } from "../../../../shared/data/chess.data";



interface CreateGameArgs {
    color: Color
}


interface MoveArgs {
    sourceSquare: Square,
    targetSquare: Square
}


interface RemoteChessManagerArgs {
    onConnect?: (instance: RemoteChessManager) => void
    onStateChange?: (state: GameStateMsgContent) => void
}
class RemoteChessManager {
    private ws?: WebSocket;
    private awaitingValidation = false;

    fen?: string;
    color?: Color;


    constructor({ onConnect, onStateChange }: RemoteChessManagerArgs) {
        // TODO - Use an externally defined URL.
        this.ws = new WebSocket('ws://localhost:3000/ws');

        this.ws.onopen = () => onConnect?.(this);
        
        this.ws.onmessage = e => {
            const msg: Message = JSON.parse(String(e.data));

			if (msg.type === MessageType.STATE) {
				this.fen = msg.content.fen;
                // TODO.
                onStateChange?.(msg.content);
			}
        };
    }


    get turn() {
        if (this.awaitingValidation) return;
        else return this.fen?.split(' ')[1] as Color | undefined;
    }


    createGame({ color }: CreateGameArgs) {
        if (this.ws?.readyState !== WebSocket.OPEN) return;

        const params: Message = {
            type: MessageType.CREATE,
            content: {color}
        };

        this.ws?.send(JSON.stringify(params));
    }


    move({ sourceSquare, targetSquare }: MoveArgs) {
        if (this.ws?.readyState !== WebSocket.OPEN) return;

        const params: Message = {
            type: MessageType.MOVE,
            content: {sourceSquare, targetSquare}
        };

        this.ws?.send(JSON.stringify(params));
    }
}



export {
    type CreateGameArgs,
    type MoveArgs,

    RemoteChessManager
}