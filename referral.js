function generateRefId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let refId = '';
    for (let i = 0; i < 6; i++) {
        refId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return refId;
}
