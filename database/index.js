import { AsyncStorage } from 'react-native'

const getPage = (messages = [], perPage = 10, page = 1) => {
    const pages = messages.reduce((resultArray, item, index) => { 
        const chunkIndex = Math.floor(index/perPage)

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []
        }
        resultArray[chunkIndex].push(item)

        return resultArray
    }, [])
    return pages[(page - 1)]
}

export const store = async message => {
    const messages = await AsyncStorage.getItem('messages')
    const oldMessages = messages ? JSON.parse(messages.filter(message => message._id))  : []
    const listMessages = JSON.stringify([...oldMessages, message])
    await AsyncStorage.setItem('messages', listMessages)
}

export const getMessages = async (page, perPage) => {
    const messages = await AsyncStorage.getItem('messages')
    const messagesToSend = messages ? JSON.parse(messages) : []
    return {
        messages: messagesToSend.length > 0 ? getPage(messagesToSend.reverse(), perPage, page) : messagesToSend,
        page,
        perPage,
        totalPages: messagesToSend.length > perPage
            ? Math.floor(messagesToSend.length / perPage)
            : 1
    }
}