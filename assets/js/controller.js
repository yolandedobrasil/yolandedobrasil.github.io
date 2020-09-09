var playing = false
var repeat = false
const speedSlider = document.getElementById("speed-slider")
const players = new Map()

function init(brk, titleBlockId, tracksContainerId)
{
  document.getElementById("title-text").innerText = brk["name"]
  let sign = document.getElementById("title-img")
    sign.src = brk["sign"]
    sign.alt = "Signe du break " + brk["name"]

  let trackList = document.getElementById(tracksContainerId)
  const tracks = brk["tracks"]
  tracks.forEach(function (track) {
    let trackDiv = document.createElement("div")
      trackDiv.classList.add("track")
      trackDiv.id = track["id"]
      let avatarDiv = document.createElement("div")
        avatarDiv.classList.add("track-img-wrapper")
          let avatar = document.createElement("img")
          avatar.src = track["icon"]
          avatar.alt = track["id"]
          avatar.addEventListener("click", muter(track["id"]))
          avatar.classList.add("track-img")
        avatarDiv.appendChild(avatar)
      trackDiv.appendChild(avatarDiv)
      let playerDiv = document.createElement("div")
        playerDiv.classList.add("track-player")
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
    player.on('finish', function () {
      if(repeat) {
        player.play()
      }
      else {
        pause()
        reset()
      }
    })
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

function reset() {
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
  let speed = Number(speedSlider.value)
  speedSlider.value = speed + 0.1
  speedSlider.dispatchEvent(new Event('change'))
}

function slowdown() {
  let speed = Number(speedSlider.value)
  speedSlider.value = speed - 0.1
  speedSlider.dispatchEvent(new Event('change'))
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

function toggleRepeat() {
  repeat = !repeat
  if(repeat) {
    document.getElementById("repeat-button").classList.remove("muted")
  } else {
    document.getElementById("repeat-button").classList.add("muted")
  }
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
    case 66: // B key
      toggleRepeat()
      break
  }
}

document.addEventListener("keydown", handleKeypress);