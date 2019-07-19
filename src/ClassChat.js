import Expo from 'expo';
import React from 'react'
import { AsyncStorage, View, Text, TouchableOpacity, Image, CameraRoll } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import Socket from 'socket.io-client'

import { store, getMessages } from '../database'
import {ImagePicker, Permissions, Constants} from 'expo';

import { RNS3 } from "react-native-aws3";

const ws = Socket('https://senac-shopping-list-api.herokuapp.com', {
  transports: ['websocket'],
  jsonp: false
})
const myId = "mc";

class Chat extends React.Component {

    state = {
        imgUri: null,
        messages: [],
        page: 1,
        totalPages: 1,
        isLoading: false,
        itemName: "",
        perPage: 10
    };

    componentDidMount() {
        this.getPermissionAsync();
    }

    getPermissionAsync = async () => {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
      }

    componentWillMount() {
        this.clear();
        ws.connect()
        ws.on('message', message => {
            console.log(message)
            this.setMessage(message)
            if (myId !== message.user._id) {
                this.setState({
                    messages: GiftedChat.append(this.state.messages, [message])
                });
            }
        })
        this.listMessages();
    }

    clear = async () => {
        await AsyncStorage.clear()
    }
    
    setMessage = async message => {
        await store(message)
    }

    loadNextPage = () => {
        this.setState({
            isLoading: true
        });

        this.setState({
            page: this.state.page + 1
        }, () => {
            this.listMessages();
        })
    }

    listMessages = async () => {
        
        const messagesList = await getMessages(this.state.page, this.state.perPage)
        console.log('messages list', messagesList)

        this.setState({
            totalPages: messagesList.totalPages
        });
        
        this.setState({
            isLoading: false
        });

        this.setState({
            messages: GiftedChat.prepend(this.state.messages, messagesList.messages)
        });

    }

    setMessage = async message => {
        await store(message)
    }

    _onTakePic = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        });
    
        console.log(result);
    
        const file = {
            url: result.uri,
            name: `teste.png`
        };
    RNS3.put(file, options)
        .progress(event => {
            console.log(`percent: ${event.percent}`);
        })
        .then(response => {
            console.log(response, "response from rns3");

        });
        
        const namedMessage = [
            {
                user: {_id: myId, name: myId},
                image: result.uri,
                messageType: 'image'
            }
        ]

        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, namedMessage),
        }))

        ws.emit('message', namedMessage[0])    

    }

    onSend(messages = []) {
        console.log(messages)


        const namedMessage = [
            {
                ...messages[0],
                user: {_id: myId, name: myId},
                image: 'data:image/png;base64,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',
                messageType: 'image'
            }
        ]

        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, namedMessage),
        }))

        ws.emit('message', namedMessage[0])        
    }

    render () {
        const rightButtonConfig = {
            title: 'Add photo',
            handler: () => this.handleAddPicture(),
        };
        return (
            <View style={{ flex: 1 }}>
            
            <GiftedChat
                isLoadingEarlier={this.state.isLoading}
                loadEarlier={this.state.page < this.state.totalPages}
                onLoadEarlier={this.loadNextPage}
                renderAvatar={null}
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                renderUsernameOnMessage

                renderActions={() => {
                    return (
                        <TouchableOpacity
                            onPress={this._onTakePic}>
                            <Text >Take</Text>
                        </TouchableOpacity>
                    );
                }}

                user={{
                    _id: myId,
                }}
            />
            </View>
        )
    }
}

export default Chat