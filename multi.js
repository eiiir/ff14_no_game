// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { writeBatch, getFirestore, collection, query, getDocs, where, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkiQ3Smn3lW0sR8oMNwGMaX3yTabI6EdY",
    authDomain: "ff14-no-game.firebaseapp.com",
    projectId: "ff14-no-game",
    storageBucket: "ff14-no-game.appspot.com",
    messagingSenderId: "468477912076",
    appId: "1:468477912076:web:2264a9e37024a6565f7a29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const signaling = collection(db, "signaling");
const member = collection(db, "member");
/*
type signaling = {
    from: string,
    to: string,
    type: 'offer' | 'answer' | 'icecandidate',
    body: object,
}

type member = {
    timestamp: Date,
    name: string,
};
*/
window.MultiPlay = {
    peerConnections: new Map(),
    dataChannels: [],
    snapshotUnsubscribers: [],
    dataHandlers: [],
    seenSignalingIds: new Set(),
    currentUserName: undefined,

    join: async (userName) => {
        console.log("join");
        await window.MultiPlay.cleanup(userName);
        window.MultiPlay.currentUserName = userName;

        const members = await getDocs(member).then(async querySnapshot => {
            const deleteOldMembers = writeBatch(db);
            const activeMembers = [];
            querySnapshot.forEach(docSnapshot => {
                const data = docSnapshot.data();
                console.log(data.timestamp);
                const ageMillis = Date.now() - data.timestamp.seconds * 1000;
                if (ageMillis > 1000 * 60 * 60 * 24) {
                    // older than one day
                    deleteOldMembers.delete(docSnapshot.ref);
                } else {
                    activeMembers.push(data);
                }
            });
            await deleteOldMembers.commit();
            return activeMembers;
        });
        console.log(`fetched ${members.length} members`);

        const createPeerConnection = remoteUserName => {
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: ['stun:stun.l.google.com:19302'],
                    },
                ],
            });
            const dataChannel = peerConnection.createDataChannel(
                'dataChannel',
                {},
            );
            peerConnection.onicecandidate = event => {
                if (!event.candidate) {
                    return;
                }
                setDoc(doc(signaling), {
                    from: userName,
                    to: remoteUserName,
                    type: 'icecandidate',
                    body: JSON.stringify(event.candidate.toJSON()),
                });
            };
            peerConnection.ondatachannel = event => {
                const receiveChannel = event.channel;
                receiveChannel.onmessage = message => {
                    if (message.data) {
                        const parsedData = JSON.parse(message.data);
                        window.MultiPlay.dispatch(parsedData);
                    }
                };
            };

            window.MultiPlay.peerConnections.set(remoteUserName, peerConnection);
            window.MultiPlay.dataChannels.push(dataChannel);
            return peerConnection;
        }

        const offerBatch = writeBatch(db);
        const offerPrepares = [];
        members.forEach(member => {
            const peerConnection = createPeerConnection(member.name);
            console.log(peerConnection);
            const offerPrepare = peerConnection.createOffer()
                .then(offer => {
                    peerConnection.setLocalDescription(offer);
                    const docRef = doc(signaling);
                    console.log(offer);
                    console.log(JSON.stringify(offer));
                    offerBatch.set(docRef, {
                        from: userName,
                        to: member.name,
                        type: 'offer',
                        body: offer.toJSON(),
                    });
                });
            offerPrepares.push(offerPrepare);
        });
        await Promise.all(offerPrepares);
        await offerBatch.commit();
        await setDoc(doc(member), {
            name: userName,
            timestamp: new Date(),
        });
        const unsubscribe = onSnapshot(query(signaling, where('to', '==', userName)), querySnapshot => {
            const signalBatch = writeBatch(db);
            const batchPrepares = [];
            querySnapshot.forEach(docSnapshot => {
                if (!window.MultiPlay.seenSignalingIds.has(docSnapshot.id)) {
                    const data = docSnapshot.data();
                    console.log(`${userName}: ${JSON.stringify(data)}`);
                    const connection = window.MultiPlay.peerConnections.get(data.from);
                    if (data.type === 'offer') {
                        const newConnection = createPeerConnection(data.from);
                        const batchPrepare = newConnection.setRemoteDescription(data.body)
                            .then(() => newConnection.createAnswer())
                            .then(answer => {
                                signalBatch.set(doc(signaling), {
                                    from: userName,
                                    to: data.from,
                                    type: 'answer',
                                    body: answer.toJSON(),
                                });
                                return newConnection.setLocalDescription(answer);
                            });
                        batchPrepares.push(batchPrepare);
                    } else if (connection === undefined) {
                        console.error(`connection to ${data.from} does not exist`);
                    } else if (data.type === 'answer') {
                        connection.setRemoteDescription(data.body);
                    } else if (data.type === 'icecandidate') {
                        console.log('icec ' + JSON.stringify(data.body) + " " + typeof data.body);
                        connection.addIceCandidate(JSON.parse(data.body));
                    } else {
                        console.error(`unknown signaling message type: ${data.type}`);
                        console.info(`document: ${JSON.stringify(data)}`);
                    }
                }
                window.MultiPlay.seenSignalingIds.add(docSnapshot.id);
                signalBatch.delete(docSnapshot.ref);
            })
            Promise.all(batchPrepares)
                .then(() => signalBatch.commit());
        })
        window.MultiPlay.snapshotUnsubscribers.push(unsubscribe);
        return Promise.resolve();
    },

    broadcast: (data) => {
        window.MultiPlay.dataChannels.forEach(dataChannel => dataChannel.send(JSON.stringify(data)));
    },

    onData: (handler) => {
        window.MultiPlay.dataHandlers.push(handler);
        return () => {
            window.MultiPlay.dataHandlers = window.MultiPlay.dataHandlers.filter(h => h !== handler);
        };
    },

    dispatch: (data) => {
        window.MultiPlay.dataHandlers.forEach(handler => handler(data));
    },

    leave: async () => {
        await window.MultiPlay.cleanup(window.MultiPlay.currentUserName);
        window.MultiPlay.currentUserName = undefined;
    },

    cleanup: async (userName) => {
        const cleanupBatch = writeBatch(db);
        await getDocs(query(signaling, where('to', '==', userName)))
            .then(qs => {
                qs.forEach(ds => {
                    cleanupBatch.delete(ds.ref);
                });
            });
        await getDocs(query(member, where('name', '==', userName)))
            .then(qs => {
                qs.forEach(ds => {
                    cleanupBatch.delete(ds.ref);
                });
            });
        await cleanupBatch.commit();
        window.MultiPlay.snapshotUnsubscribers.forEach(unsubscribe => unsubscribe());
        window.MultiPlay.dataChannels.forEach(dataChannel => dataChannel.close());
        window.MultiPlay.peerConnections.forEach(peerConnection => peerConnection.close());
        window.MultiPlay.snapshotUnsubscribers = [];
        window.MultiPlay.dataChannels = [];
        window.MultiPlay.peerConnections.clear();
    },
}

window.addEventListener('load', () => {
    const nameInput = document.getElementById('multiplay-name');
    const joinButton = document.getElementById('multiplay-join');
    joinButton.disabled = false;
    joinButton.onclick = () => {
        window.MultiPlay.join(nameInput.value);
        joinButton.disabled = true;
        leaveButton.disabled = false;
        nameInput.disabled = true;
    };

    const leaveButton = document.getElementById('multiplay-leave');
    leaveButton.disabled = true;
    leaveButton.onclick = () => {
        window.MultiPlay.leave();
        leaveButton.disabled = true;
        joinButton.disabled = false;
        nameInput.disabled = false;
    };

    setInterval(() => {
        const playerDom = document.getElementById('player');
        const playerIconDom = document.getElementById("playerIcon");
        // console.log("sending: " + JSON.stringify({
        //     left: playerDom.style.left,
        //     top: playerDom.style.top,
        //     image: playerIconDom.src,
        //     name: nameInput.value,
        // }));
        window.MultiPlay.broadcast({
            left: playerDom.style.left,
            top: playerDom.style.top,
            image: playerIconDom.src,
            name: nameInput.value,
        });
    }, 100);

    window.MultiPlay.onData(data => {
        console.log("receiving: " + JSON.stringify(data));
        let remotePlayerDom = document.getElementById(`remotePlayer-${data.name}`);
        let remotePlayerIconDom = document.getElementById(`remotePlayerIcon-${data.name}`);
        console.log(remotePlayerDom);
        if (remotePlayerDom === null) {
            remotePlayerDom = document.createElement('div');
            remotePlayerDom.style = 'position:absolute;width:50px;height:50px;top:275px;left:275px;z-index:1000;';
            remotePlayerDom.id = `remotePlayer-${data.name}`;
            const innerDivDom = document.createElement('div');
            innerDivDom.style = 'position:relative';
            remotePlayerIconDom = document.createElement('img');
            remotePlayerIconDom.src = 'img/whm.png';
            remotePlayerIconDom.width = 50;
            remotePlayerIconDom.height = 50;
            remotePlayerIconDom.id = `remotePlayerIcon-${data.name}`;

            innerDivDom.appendChild(remotePlayerIconDom);
            remotePlayerDom.appendChild(innerDivDom);

            const fieldDom = document.getElementById('field');
            fieldDom.appendChild(remotePlayerDom);
            console.log("appending a new remote player element for " + data.name);
        }
        remotePlayerDom.style.left = data.left;
        remotePlayerDom.style.top = data.top;
        if (remotePlayerIconDom.src !== data.image) {
            remotePlayerIconDom.src = data.image;
        }
    })
})