// ==UserScript==
// @name         YTT: Youtube Transcription Tools
// @namespace    http://iandoesallthethings.com/
// @version      0.2
// @description  Set custom start points using quick key commands
// @author       Ian Edwards
// @match        http://www.youtube.com
// @match        https://www.youtube.com
// @match        http://www.youtube.com/watch?*
// @match        https://www.youtube.com/watch?*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==
// SUPER Hacky jQueryUI and CSS injection
$('head').append(
    '<link ' +
      'href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.min.css" ' +
      'rel="stylesheet" type="text/css">' +
      `
  <style>
  table {
    border-collapse: collapse;
    margin: 10px;
  }
  table, th, td {
    border: 1px solid black;
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
  </style>
  `
  )
  const ytplayer = document.getElementById('movie_player')
  const jumpKeys = {
    KeyQ: 0,
    KeyW: 0,
    KeyE: 0,
    KeyR: 0
  }
  const handleKeyPress = event => {
    if (document.activeElement.id == 'contenteditable-root') return
    if (document.activeElement.id == 'search') return
    if (event.code === 'Backquote')
      $('#dialog').dialog('isOpen')
        ? $('#dialog').dialog('close')
        : $('#dialog').dialog('open')
    if (Object.keys(jumpKeys).includes(event.code)) {
      event.shiftKey
        ? (jumpKeys[event.code] = ytplayer.getCurrentTime())
        : ytplayer.seekTo(jumpKeys[event.code])
    }
    if (event.code === "KeyA") ytplayer.setPlaybackRate(ytplayer.getPlaybackRate() - 0.1)
    if (event.code === "KeyS") ytplayer.setPlaybackRate(1)
    if (event.code === "KeyD") ytplayer.setPlaybackRate(ytplayer.getPlaybackRate() + 0.1)
    updateDialog()
  }
  const updateDialog = () => {
    $('#currentPlaybackSpeed').empty()
    $('#currentPlaybackSpeed').append(`
      <table><tr><td>${ytplayer.getPlaybackRate()}</td></tr></table>
    `)
    $('#jumpKeys').empty()
    $('#jumpKeys').append(`
    <table class='jumpKeyTable'>
      <tr>
         <td>Q</td>
         <td>W</td>
         <td>E</td>
         <td>R</td>
      </tr>
      <tr>
        <td>${Math.floor(jumpKeys.KeyQ)}</td>
        <td>${Math.floor(jumpKeys.KeyW)}</td>
        <td>${Math.floor(jumpKeys.KeyE)}</td>
        <td>${Math.floor(jumpKeys.KeyR)}</td>
      </tr>
    </table>
  `)
  }
  // Attach dialog to page
  $('body').append(`
  <div id='dialog' title='Youtube Transcription Tools'>
    <h4>Cues</h4>
    <p><span class='badge'>Shift + Cue Key</span>: Set cue</p>
    <p><span class='badge'>Cue Key</span>: jump to cue</p>
    <div id='jumpKeys'></div>
    <h4>Playback Speed</h4>
    <p><span class='badge'>A</span><span class='badge'>S</span><span class='badge'>D</span>: Decrease, Reset, Increase playback speed</p>
    <div id="currentPlaybackSpeed"></div>
    <h4>Misc</h4>
    <p><span class='badge'>\`</span>: Toggle menu </p>
  </div>
  `)
  $(function() {
    $('#dialog').dialog({
      width: 200,
      resizable: false,
      position: {
        my: 'left top',
        at: 'left top+60'
      },
      autoOpen: false
    })
    updateDialog()
  })
  document.addEventListener('keydown', handleKeyPress)
  console.log(`TYY Initialized`)