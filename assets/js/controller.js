var playing = false
const speedInput = document.getElementById("speedInput")
const players = new Map()

function init(brk, titleContainerId, tracksContainerId) {
  // build DOM elements
  let breakTitle = document.getElementById(titleContainerId)
  breakTitle.innerHTML = ""
  let logo = document.createElement("img")
    logo.src = "./assets/img/yolande.png"
    logo.alt = "Logo de Yolande do Brasil"
    logo.height = "80"
    logo.style = "margin-right: 20px"
  breakTitle.appendChild(logo)
  let title = document.createElement("span")
    title.innerHTML = brk["name"]
  breakTitle.appendChild(title)
  let sign = document.createElement("img")
    sign.src = brk["sign"]
    sign.alt = "Signe du break " + brk["name"]
    sign.height = "100"
    sign.style = "margin-right: 20px"
  breakTitle.appendChild(sign)

  let trackList = document.getElementById(tracksContainerId)
  const tracks = brk["tracks"]
  tracks.forEach(function (track) {
    let trackDiv = document.createElement("div")
      trackDiv.classList.add("track")
      trackDiv.id = track["id"]
      let avatarDiv = document.createElement("div")
        avatarDiv.classList.add("avatar")
          let avatar = document.createElement("img")
          avatar.src = track["icon"]
          avatar.alt = track["id"]
          avatar.addEventListener("click", muter(track["id"]))
          avatar.width = "80"
          avatar.height = "80"
        avatarDiv.appendChild(avatar)
      trackDiv.appendChild(avatarDiv)
      let playerDiv = document.createElement("div")
        playerDiv.classList.add("player")
        playerDiv.id = track["id"] + "-player"
      trackDiv.appendChild(playerDiv)
    trackList.appendChild(trackDiv)
  })

  // initialize audio players
  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i]["id"]
    let player = WaveSurfer.create(
    {
      container: '#'+track+"-player",
      height: 80,
      waveColor: 'purple',
      progressColor: 'fuchsia',
      responsive: true,
      skipLength: 0.5
    });
    player.load(tracks[i]["audio"]);
    player.on('seek', function (progress) { seekTo(progress) })
    players.set(track, player)
  }
}

function play() {
  players.forEach(function (player, instrument) { player.play() })
  document.getElementById("playButton").src = "./assets/img/pause.png"
  playing = true
}

function pause() {
  players.forEach( function(player) { player.pause() })
  document.getElementById("playButton").src = "./assets/img/play.png"
  playing = false
}

function playPause() {
  if( !playing ) {
    play()
  }
  else {
    pause()
  }
}

function seekTo(progress) {
  players.forEach(function(player) {
    let currentProgress = player.getCurrentTime()/player.getDuration()
    if(Math.abs(currentProgress-progress) > 0.01) { // avoid recursive events
      player.seekTo(progress)
    }
  })
}

function stop() {
  pause()
  seekTo(0)
}

function skipBackward() {
  players.forEach(function(player){player.skipBackward()})
}

function skipForward() {
  players.forEach(function(player){player.skipForward()})
}

function setSpeed(speed) {
  players.forEach(function(player){player.setPlaybackRate(speed)})
}

function accelerate() {
  let speed = Number(speedInput.value)
  speedInput.value = speed + 0.1
  speedInput.dispatchEvent(new Event('change'))
}

function slowdown() {
  let speed = Number(speedInput.value)
  speedInput.value = speed - 0.1
  speedInput.dispatchEvent(new Event('change'))
}

function toggleMute(instrument) {
  let player = players.get(instrument)
  player.toggleMute()
  if(player.getMute()) {
    document.getElementById(instrument).classList.add("muted")
  } else {
    document.getElementById(instrument).classList.remove("muted")
  }
}

function muter(instrument) {
  return function(){ toggleMute(instrument) }
}

function handleKeypress(e) {
  switch(e.which) {
    case 32: // space
      playPause()
      e.preventDefault()
      break
    case 39: // right arrow
      skipForward()
      e.preventDefault()
      break
    case 37: // left arrow
      skipBackward()
      e.preventDefault()
      break
    case 38: // up arrow
      accelerate()
      e.preventDefault()
      break
    case 40: // down arrow
      slowdown()
      e.preventDefault()
      break
  }
}

document.addEventListener("keydown", handleKeypress);