import { Chess, type Color, type Square } from "chess.js";

import type { GameState, GameStateMsgContent, Message } from '../../../../shared/types/chess.types';
import { MessageType } from "../../../../shared/data/chess.data";

import { b64ToArrBuff } from '../../../../shared/script/utils/b64_utils';



interface CreateGameArgs {
    color: Color
}


interface MoveArgs {
    sourceSquare: Square,
    targetSquare: Square
}


interface RemoteChessManagerArgs {
    onConnect?: (instance: RemoteChessManager) => void
    onStateChange?: (state?: GameState) => void
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
				this.updateGameState(msg.content);
			}

			if (msg.type === MessageType.EXPLANATION) {
                const arrBuff = b64ToArrBuff(msg.content.audioBufferB64);

                const blob = new Blob([arrBuff], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);

                const audio = new Audio(url);
                audio.play();
			}
        };
    }


    get checkedColor() {
        return this.game?.isCheck() ? this.game?.turn() : null;
    }


    createGame({ color }: CreateGameArgs) {
        if (this.ws?.readyState !== WebSocket.OPEN) return;
        
		this.updateGameState();

        const params: Message = {
            type: MessageType.CREATE,
            content: {color}
        };
        this.ws?.send(JSON.stringify(params));
    }


    updateGameState(state?: GameState) {
        // 'skipValidation' must be 'true', otherwise no moves can be done
        // if there are invalid positions or pieces.
		this.game = new Chess(state?.fen, {skipValidation: true});
        this._onStateChange?.(state);
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
		this.updateGameState({
            fen: this.game.fen(),
            lastMove: {sourceSquare, targetSquare},
            isCheck: this.game.isCheck(),
            isCheckmate: this.game.isCheckmate()
        });

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