function arrBuffToB64(b: ArrayBuffer) {
    let binary = '';
    
    const bytes = new Uint8Array(b);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++)
        binary += String.fromCharCode(bytes[i]);

    return btoa(binary);
}


function b64ToArrBuff(b: string): ArrayBuffer {
    const binary = atob(b);
    
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        bytes[i] = binary.charCodeAt(i);

    return bytes.buffer;
}



export {
    arrBuffToB64,
    b64ToArrBuff
}