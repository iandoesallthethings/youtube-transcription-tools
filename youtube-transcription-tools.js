// ==UserScript==
// @name         YTT: Youtube Transcription Tools
// @namespace    http://iandoesallthethings.com/
// @version      0.2
// @description  Set custom start points using quick key commands
// @author       Ian Edwards
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @match        http://www.youtube.com
// @match        https://www.youtube.com
// @match        http://www.youtube.com/watch?*
// @match        https://www.youtube.com/watch?*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==

// SUPER Hacky jQueryUI and CSS injection
const css = `
<link href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.min.css" rel="stylesheet" type="text/css" />
<style>
  table, .box {
    border-collapse: collapse;
    margin: 10px;
  }
  table, th, td, .box {
    border: 1px solid black;
    width: fit-content;
    padding: 5px;
    text-align: center;
  }
  .badge {
    color: white;
    background-color: #17a2b8;
    display: inline-block;
    padding: .25em .4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25rem;
  }
</style>
`

const dialogBoxHtml = `
<div id='dialog' title='Youtube Transcription Tools'>
  <h4>Cues</h4>
  <p>
    <span class='badge'>Shift + Cue Key</span>
    <span>: Set cue</span>
  </p>
  <p>
    <span class='badge'>Cue Key</span>
    <span>: jump to cue</span>
  </p>
  <table class='cuePointTable'>
    <tr id='cueLabelRow' />
    <tr id='cuePointRow' />
  </table>

  <h4>Playback Speed</h4>
  <p>
    <span class='badge'>A</span>
    <span class='badge'>S</span>
    <span class='badge'>D</span>
    <span>: Decrease, Reset, Increase playback speed</span>
  </p>
  <div class="box" id="currentPlaybackSpeed" />

  <h4>Misc</h4>
  <p><span class='badge'>\`</span>: Toggle menu </p>
</div>
`

// Setup
let ytplayer
const init = () => {
	// Check if we're not on a watch page
	if (!document.getElementById('movie_player')) {
		console.log('No player found.')
		return
	}

	ytplayer = document.getElementById('movie_player')
	// Inject Dom Stuff
	$('head').append(css)
	$('body').append(dialogBoxHtml)
	$('#dialog').dialog({
		width: 200,
		resizable: false,
		position: {
			my: 'left top',
			at: 'left top+60',
		},
		autoOpen: false,
	})

	updateDialog()
	console.log(`YTT Initialized`)
}

const updateDialog = () => {
	$('#currentPlaybackSpeed').empty()
	$('#currentPlaybackSpeed').append(ytplayer.getPlaybackRate())

	$('#cueLabelRow').empty()
	$('#cuePointRow').empty()
	for (let keyCode in cuePoints) {
		$('#cueLabelRow').append(`<td>${keyCode.slice(-1)[0]}</td>`)
		$('#cuePointRow').append(`<td>${Math.floor(cuePoints[keyCode])}</td>`)
	}
}

const toggleDialog = () =>
	$('#dialog').dialog('isOpen') ? $('#dialog').dialog('close') : $('#dialog').dialog('open')

// WIP: Saving cues to local storage per video :D
/*
localStorage.setItem("ytplayer", "Testing Local Storage from userscript! :D")
const currentVideo = () => new URLSearchParams(window.location.search).get('v')

const getLocalCues = () => localStorage.getItem(currentVideo())
const getLocalCue = (keyCode) => localStorage.getItem(currentVideo())[keycode]
const setLocalCue = (keyCode, timeCode) => {
  const oldCues = getLocalCues()
  oldCues[keyCode] = timeCode
  localStorage.setItem(currentVideo(), oldCues)
}
*/

const cuePoints = {
	KeyQ: 0,
	KeyW: 0,
	KeyE: 0,
	KeyR: 0,
}

const commands = {
	Backquote: () => toggleDialog(),
	KeyA: () => changeSpeed(-0.1),
	KeyS: () => setSpeed(1),
	KeyD: () => changeSpeed(0.1),
	cue: (event) => {
		if (cuePoints.hasOwnProperty(event.code))
			event.shiftKey ? saveCue(event.code) : recallCue(event.code)
	},
}

const saveCue = (keyCode) => (cuePoints[keyCode] = ytplayer.getCurrentTime())
const recallCue = (keyCode) => ytplayer.seekTo(cuePoints[keyCode])

const setSpeed = (speed) => ytplayer.setPlaybackRate(speed)
const changeSpeed = (amount) => ytplayer.setPlaybackRate(ytplayer.getPlaybackRate() + amount)

const handleKeyPress = (event) => {
	// Ignore if focused on a text box
	const textFields = ['search', 'contenteditable-root']
	const focus = $(':focus').attr('id')
	if (textFields.includes(focus)) return

	// Check for proper initialization; Retry if broken
	if (ytplayer === undefined) init()

	// Execute
	commands.hasOwnProperty(event.code) ? commands[event.code](event) : commands.cue(event) // Assumes anything else might be a cue

	// Redraw
	updateDialog()
}

// Do the things
document.addEventListener('keydown', handleKeyPress)
init()
