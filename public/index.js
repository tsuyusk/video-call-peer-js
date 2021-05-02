(async () => {
  let areVideosOn = true;
  const switchVideos = document.getElementById('switch-videos');

  const videosGrid = document.getElementById('videos-grid');

  let peerId;
  let peer;
  const peers = {};
  const socket = io();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  turnOnVideoCall();

  switchVideos.addEventListener('click', () => {
    if (!areVideosOn) {
      areVideosOn = true;

      socket.emit('join room', peerId);
      const currentUserVideo = document.createElement('video');
      addStreamToVideoElement(currentUserVideo, stream);
      return;
    }

    socket.emit('user disabled videos');

    videosGrid.innerHTML = '';
    
    clearPeers();
    areVideosOn = false;
  });

  function turnOnVideoCall() {
    peer = new Peer(undefined, {
      host: '/',
      port: '3001',
    });

    peer.on('open', id => {
      peerId = id;
      socket.emit('join room', id);
    });

    const currentUserVideo = document.createElement('video');

    addStreamToVideoElement(currentUserVideo, stream);
  
    peer.on('call', call => {
      peers[call.peer] = call;
      call.answer(stream);
      const video = document.createElement('video');
  
      call.on('stream', userThatCalledStream => {
        addStreamToVideoElement(video, userThatCalledStream);
      });
  
      call.on('close', () => {
        videosGrid.removeChild(video);
      });
    });
    
    socket.on('user connected', id => {
      if (id === peerId) return;

      const call = peer.call(id, stream);
      const video = document.createElement('video');
  
      call.on('stream', calledUserStream => {
        addStreamToVideoElement(video, calledUserStream);
      });
  
      call.on('close', () => {
        videosGrid.removeChild(video);
      });
  
      peers[id] = call;
    });
  
    socket.on('user disconnected', id => {
      if (peers[id]) {
        peers[id].close();
      }
    });
  }

  function addStreamToVideoElement(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });

    videosGrid.appendChild(video);
  }

  function clearPeers() {
    Object.keys(peers).map(key => {
      delete peers[key];
    });
  }
})();
