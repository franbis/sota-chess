import axios from "axios";

import type { Color, Square } from "chess.js";

import type { GameID, GameState, Game, CreateGameReqArgs } from '../../../../shared/chess/chess_data';



interface CreateGameArgs {
    color: Color
}


interface MoveArgs {
    sourceSquare: Square,
    targetSquare: Square
}


class RemoteChessManager {
    private id?: GameID;

    color?: Color;
    state?: GameState;
    awaitingValidation = false;


    get turn() {
        if (this.awaitingValidation) return;
        else return this.state?.fen?.split(' ')[1] as Color | undefined;
    }


    async createGame({ color }: CreateGameArgs) {
        const params: CreateGameReqArgs = {color};

        const resp = await axios.post('/game/create', {params});
        const data = resp.data as Game;
        this.id = data.id;
        this.state = data.state;

        this.color = color;

        return true;
    }


    async syncState() {
        const resp = await axios.get(`/game/state/${this.id}`);
        if (resp.data)
            this.state = resp.data as GameState;
    }


    async move({ sourceSquare, targetSquare }: MoveArgs) {
        this.awaitingValidation = true;
        const resp = await axios.post(`/game/state/${this.id}`);
        if (resp.data) {
            this.awaitingValidation = false;
            this.state = resp.data as GameState;
            return true;
        }
    }
}



export {
    type CreateGameArgs,
    type MoveArgs,

    RemoteChessManager
}