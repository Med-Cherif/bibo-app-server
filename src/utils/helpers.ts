

export const sortChats = (chats: any[]) => {
    
    let n = chats.length
    for (let i = 1; i < n; i++) {
        let current = chats[i]
        let y = i - 1

        while ((y > -1) && new Date(`${current.lastMessage.createdAt}`).getTime() > new Date(`${chats[y].lastMessage.createdAt}`).getTime()) {
            chats[y + 1] = chats[y]
            y--;
        }
        chats[y + 1] = current
    }

    return chats
}