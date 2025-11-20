import { Chess, type Color, type Square } from "chess.js";

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
    onStateChange?: (game: Chess) => void
}
class RemoteChessManager {
    private game?: Chess;
    color?: Color;
    
    private ws?: WebSocket;

    private _onStateChange: RemoteChessManagerArgs['onStateChange'];


    constructor({ onConnect, onStateChange }: RemoteChessManagerArgs) {
        this._onStateChange = onStateChange;

        // TODO - Use an externally defined URL.
        this.ws = new WebSocket('ws://localhost:3000/ws');
        this.ws.onopen = () => onConnect?.(this);

        this.ws.onmessage = e => {
            const msg: Message = JSON.parse(String(e.data));

			if (msg.type === MessageType.STATE) {
				this.updateGame(msg.content.fen);
			}
        };
    }


    createGame({ color }: CreateGameArgs) {
        if (this.ws?.readyState !== WebSocket.OPEN) return;
        
		this.updateGame();

        const params: Message = {
            type: MessageType.CREATE,
            content: {color}
        };
        this.ws?.send(JSON.stringify(params));
    }


    updateGame(fen?: string) {
        this.game = new Chess(fen);
        this._onStateChange?.(this.game);
    }


    move({ sourceSquare, targetSquare }: MoveArgs) {
        if (this.ws?.readyState !== WebSocket.OPEN) return false;
        if (!this.game) return false;

		if (sourceSquare === targetSquare) return false;

        try {
            this.game.move({
                from: sourceSquare,
                to: targetSquare
            });
        }
        catch {
            // The move was invalid, don't contact the server.
            return false;
        }
		this.updateGame(this.game?.fen());

        const params: Message = {
            type: MessageType.MOVE,
            content: {sourceSquare, targetSquare}
        };
        this.ws?.send(JSON.stringify(params));

        // Simulate the move until the server validates it.
        return true;
    }
}



export {
    type CreateGameArgs,
    type MoveArgs,

    RemoteChessManager
}