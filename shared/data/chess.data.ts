// Algebric notations.
// Use char codes to allow reverse searching.

enum PieceNotation {
    PAWN = 112,
    ROOK = 114,
    KNIGHT = 110,
    BISHOP = 98,
    QUEEN = 113,
    KING = 107,
};

enum ColorNotation {
    WHITE = 119,
    BLACK = 98,
}

// Define literal string rather than an enum as coercion would be required
// when parsing the latter from a JSON string.
const MessageType = {
    // Server.
    STATE: 'state',
    // Client.
    CREATE: 'create',
    RESUME: 'resume',
    MOVE: 'move',
    CASTLE: 'castle',
    SURRENDER: 'surrender',
    //OFFER_DRAW: 'offer_draw',
} as const;



export {
    MessageType,

    PieceNotation,
    ColorNotation
}