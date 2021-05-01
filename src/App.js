import React, { useState, useRef, useEffect } from 'react'
import Peer from 'simple-peer'
import styled from "styled-components"
import firebase from 'firebase/app'
import 'firebase/firestore'

function App() {
  const localVideo = useRef()
  const streamVideo = useRef()
  var peer = useRef()
  const [roomID, setRoomID] = useState()
  // var sdp = useRef()

  var firebaseConfig = {
    apiKey: "AIzaSyAGXPPSZkTQC0Qq5zoFmoDe3AdvbPBHYKE",
    authDomain: "test-7a393.firebaseapp.com",
    databaseURL: "https://test-7a393.firebaseio.com",
    projectId: "test-7a393",
    storageBucket: "test-7a393.appspot.com",
    messagingSenderId: "41585094071",
    appId: "1:41585094071:web:ea19b267f61bff39ac8c32"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  var firestore = firebase.firestore();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      peer.current = new Peer({
        initiator: window.location.hash === '#init',
        // config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
        trickle: false,
        stream: stream
      })

      peer.current.on('signal', (data) => {
        data.type == 'offer'
          ? sendOffer(data)
          : sendAnswer(data)
      })

      peer.current.on('stream', (data) => {
        streamVideo.current.srcObject = data
      })

      localVideo.current.srcObject = stream
    })
  }, [])

  const connect = () => {
    firestore.collection('rooms').doc(roomID).get().then(documentSnapshot => {
      peer.current.signal(JSON.parse(documentSnapshot.data().data))
    })
  }

  const sendOffer = (data) => {
    firestore.collection('rooms').add({ data: JSON.stringify(data) }).then(documentReference => {
      setRoomID(documentReference.id)
    })
  }

  const sendAnswer = (data) => {
    firestore.collection('rooms').doc(roomID).update({ data: JSON.stringify(data) })
  }

  return (
    <div className="App">
      {roomID}
      <br />
      <label>Room ID</label>
      <input type="text" onChange={e => setRoomID(e.target.value)} />
      {/* <label>SDP</label>
      <textarea ref={ref => sdp = ref} /> */}
      <button onClick={connect}>Connect</button>
      <br />
      <video ref={localVideo} autoPlay></video>
      <video ref={streamVideo} autoPlay></video>
    </div >
  );
}

export default App;
