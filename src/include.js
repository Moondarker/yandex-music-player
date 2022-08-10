const PLAY_BUTTON = '.player-controls__btn_play'
const ONE_M = 1000 * 1000

function q(selector) {
  return document.querySelector(selector)
}

class YandexMusicPlayer {
  constructor(externalAPI) {
    this.externalAPI = externalAPI
    this.initCallbacks()

    setInterval(() => {
      this.sendMetadata()
      this.hideAds()
    }, 1000)
  }

  initCallbacks() {
    window.ympAPI.play(() => this.externalAPI.togglePause(''))
    window.ympAPI.pause(() => this.externalAPI.togglePause('PAUSE'))
    window.ympAPI.playPause(() => q(PLAY_BUTTON).click())
    window.ympAPI.next(() => this.externalAPI.next())
    window.ympAPI.prev(() => this.externalAPI.prev())
    window.ympAPI.setPosition(position => this.externalAPI.setPosition(position / ONE_M))
  }

  sendMetadata() {
    const currentTrack = this.externalAPI.getCurrentTrack()

    if (!currentTrack) {
      return
    }

    const metadata = {
      trackId: currentTrack.link.substr(1),
      title: currentTrack.title,
      album: currentTrack.album.title,
      artists: currentTrack.artists.map(a => a.title),
      artUrl: `https://${currentTrack.cover.replace('%%', '300x300')}`,
      length: this.secondsToMicroSeconds(currentTrack.duration),
      seek: this.secondsToMicroSeconds(this.externalAPI.getProgress().position)
    }

    if (this.externalAPI.isPlaying()) {
      metadata.playbackStatus = 'Playing'
    } else {
      metadata.playbackStatus = 'Paused'
    }

    window.ympAPI.sendMetadata(metadata)
  }

  secondsToMicroSeconds(seconds) {
    return Math.round(seconds * ONE_M)
  }

  hideAds() {
    // Check for open pop-ups
    if (q('.deco-pane-secondary.deco_shadow-light')) {
      return
    }

    // Clicking by close button
    const CloseAdButtonClasses = ['.d-overhead__close button', '.payment-plus__header-close', '.pay-promo-close-btn']
    CloseAdButtonClasses.forEach((adClass) => {
      const equalizerIsOpen = q('.d-equalizer__popup').classList.contains('d-equalizer__popup_edit')
      const adButtonDom = q(adClass)
      if (adButtonDom && !equalizerIsOpen) {
        adButtonDom.click()
      }
    })

    // Hiding ads
    const hideAdClasses = ['.sidebar__placeholder', '.bar-below_plus', '.notify', '.bar__branding']
    hideAdClasses.forEach((adClass) => {
      const adDom = q(adClass)
      if (adDom) {
        adDom.style.display = 'none'
      }
    })

    // Hiding ads
    const playerWrapperClass = 'centerblock-wrapper'
    const plyDom = q(playerWrapperClass)
    if (plyDom) {
      plyDom.style.width = '100%'
    }

    // Fixing auto pause with ad
    const button = q('.crackdown-popup__close')
    if (button && !button.parentNode.parentNode.classList.contains('popup_hidden')) {
      button.click()
      q(PLAY_BUTTON).click()
    }
  }
}

const ympApp = new YandexMusicPlayer(window.externalAPI)
