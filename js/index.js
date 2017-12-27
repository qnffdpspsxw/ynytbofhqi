var switchPlayButtonIcon = (isPlaying) => {
    var playButton = e(".class-span-play")
    var classList = playButton.classList
    if (isPlaying) {
        classList.add("icon-zanting")
        classList.remove("icon-bofang")
        return
    }
    classList.add("icon-bofang")
    classList.remove("icon-zanting")
}

var musicPlayEvent = (audioPlayer) => {
    audioPlayer.play()
    switchPlayButtonIcon(true)
}

var musicPauseEvent = (audioPlayer) => {
    audioPlayer.pause()
    switchPlayButtonIcon(false)
}

var getChannelIdFromDataSet = () => {
    var musicInfoDiv = e(".class-div-musicInfo")
    var id = musicInfoDiv.dataset.channelId
    return id
}

var changePlayerSound = (isSound) => {
    var musicPlayer = e("audio")
    if (isSound) {
        var barSelector = e(".class-span-inSoundbar")
        var volumeNum = Number(barSelector.dataset.volume)
        musicPlayer.volume = volumeNum
        return
    }
    musicPlayer.volume = 0
}

var switchSoundIcon = (element) => {
    var state = element.dataset.state
    if (state == "open") {
        element.classList.remove("icon-yinliang")
        element.classList.add("icon-jinying")
        element.dataset.state = "close"
        changePlayerSound(false)
        return
    }
    element.classList.remove("icon-jinying")
    element.classList.add("icon-yinliang")
    changePlayerSound(true)
    element.dataset.state = "open"
}

var autoEvent = (musicPlayer, inProgressBar) => {
    setInterval(() => {
        var length = musicPlayer.currentTime / musicPlayer.duration * 100
        inProgressBar.style.width = `${length}%`
    }, 500)
}

var changeLoopButtonState = (loopButton) => {
    var state = loopButton.dataset.state
    if (state == "close") {
        loopButton.classList.add("class-span-loop-start")
        loopButton.dataset.state = "open"
        return
    }
    loopButton.classList.remove("class-span-loop-start")
    loopButton.dataset.state = "close"
}

var bindLyrcButtonEvent = () => {
    var lyrcButton = e(".class-span-lyrics")
    var lyrcDiv = e(".class-div-lyricView")
    bindEvent(lyrcButton, "click", function(event) {
        var self = event.target
        if (self.style.color == "grey") {
            self.style.color = "black"
            lyrcDiv.style.display = "block"
        } else {
            self.style.color = "grey"
            lyrcDiv.style.display = "none"
        }
    })
}

var bindLoopButtonEvent = () => {
    var loopButton = e(".class-span-loop")
    bindEvent(loopButton, "click", function(event) {
        var self = event.target
        changeLoopButtonState(self)
    })
}

var barMouseDownEvent = (musicPlayer, outProgressBar, inProgressBar) => {
    bindEvent(outProgressBar, "mousedown", function(event) {
        var offset = event.offsetX
        var rangeX = offset / 400
        musicPlayer.currentTime = musicPlayer.duration * rangeX
    })
}

var bindProgressBarEvent = () => {
    var musicPlayer = e("audio")
    var inProgressBar = e(".class-span-inProgressbar")
    var outProgressBar = e(".class-span-outProgressbar")
    autoEvent(musicPlayer, inProgressBar)
    barMouseDownEvent(musicPlayer, outProgressBar, inProgressBar)
}

var bindSoundBarEvent = () => {
    var inSoundBar = e(".class-span-inSoundbar")
    var outSoundBar = e(".class-span-outSoundbar")
    bindEvent(outSoundBar, "mousedown", function(event) {
        var offset = event.offsetX
        inSoundBar.style.width = `${offset}.px`
        var soundButton = e(".class-span-sound")
        var soundState = soundButton.dataset.state
        if (soundState == "open") {
            var musicPlayer = e("audio")
            var num = offset / 80
            musicPlayer.volume = num
            inSoundBar.dataset.volume = num
        }
    })
}

var bindSoundButtonEvent = () => {
    var soundButton = e(".class-span-sound")
    bindEvent(soundButton, "click", function(event) {
        var self = event.target
        switchSoundIcon(self)
    })
}

var bindPlayerEndEvent = () => {
    var audioPlayer = e("audio")
    bindEvent(audioPlayer, "ended", function(event) {
        var state = e(".class-span-loop").dataset.state
        if (state == "open") {
            audioPlayer.currentTime = 0
            musicPlayEvent(audioPlayer)
            return
        }
        var id = getChannelIdFromDataSet()
        requestMusic(id)
        switchPlayButtonIcon(false)
        clearInterval(audioPlayer.dataset.currentTimeId)
    })
}

var bindPlayButtonEvent = () => {
    var playButton = e(".class-span-play")
    bindEvent(playButton, "click", function(event) {
        var audioPlayer = e("audio")
        var isPausing = audioPlayer.paused
        if (isPausing) {
            musicPlayEvent(audioPlayer)
            return
        }
        musicPauseEvent(audioPlayer)
    })
}

var bindNextSongEvent = () => {
    var nextSongButton = e(".class-span-next")
    bindEvent(nextSongButton, "click", function(event) {
        var id = getChannelIdFromDataSet()
        requestMusic(id)
    })
}

var autoChangeCurrentTime = (self, currentSelector, durationSelector) => {
    var durationTime = self.duration
    durationSelector.innerHTML = transFloatToTime(durationTime)
    var currentTimeId = setInterval(function() {
        var currentTime = transFloatToTime(self.currentTime)
        currentSelector.innerHTML = currentTime
    }, 1000)
    self.dataset.currentTimeId = currentTimeId
}

var bindMusicCanPlayEvent = () => {
    var musicPlayer = e("audio")
    var currentSelector = e("#id-span-currentTime")
    var durationSelector = e("#id-span-duration")
    bindEvent(musicPlayer, "canplay", function(event) {
        var self = event.target
        autoChangeCurrentTime(self, currentSelector, durationSelector)
    })
}

var autoChangeLyr = () => {
    var player = e("audio")
    setInterval(() => {
        var lyrUl = e(".class-ul-lyric")
        var liHeight = getIndexChild(lyrUl, 5).clientHeight - 3
        var liArray = lyrUl.children
        for (var i = 0; i < liArray.length - 1; i++) {
            var item = liArray[i]
            var currentTime = item.dataset.time
            var nextTime = liArray[i + 1].dataset.time
            var playerTime = player.currentTime
            if ((playerTime > currentTime) && (currentTime < nextTime)) {
                removeAllClass("active")
                item.classList.add("active")
                lyrUl.style.top = `${-(liHeight * (i - 2))}px`
            }
        }
    }, 100)
}

var renderLyric = (result) => {
    var lyrLi = ""
    for (var i = 0; i < result.length; i++) {
        var item = result[i]
        lyrLi += `<li data-time=${item[0]}>${item[1]}</li>`
    }
    var lyrUl = e(".class-ul-lyric")
    lyrUl.innerHTML = lyrLi
    autoChangeLyr()
}

var handleLyric = (line) => {
    var result = []
    var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g
    for (var i = 0; i < line.length; i++) {
        var item = line[i]
        var time = item.match(timeReg)
        if (!time) {
            continue
        }
        var value = item.replace(timeReg, "")
        for (var j = 0; j < time.length; j++) {
            var t = time[j].slice(1, -1).split(":")
            var timeNum = parseInt(t[0], 10) * 60 + parseFloat(t[1])
            result.push([timeNum, value])
        }
    }
    result.sort((a, b) => {
        return a[0] - b[0]
    })
    return result
}

var failToGetLyric = () => {
    var lyricUl = e(".class-ul-lyric")
    lyricUl.innerHTML = "<li>本歌曲展示没有歌词</li>"
}

var setLyric = (response) => {
    removeAllChild(".class-ul-lyric")
    var line = response.lyric.split("\n")
    var result = handleLyric(line)
    renderLyric(result)
}

var getLyric = (sid) => {
    var newRequest = {
        method: "POST",
        url: `http://api.jirengu.com/fm/getLyric.php?&sid=${sid}`,
        callback: (response) => {
            if (response != "error") {
                setLyric(response)
                return
            }
            failToGetLyric()
        }
    }
    ajax(newRequest)
}

var setMusicPlayer = (song) => {
    var url = song.url
    var audioPlayer = e("audio")
    var musicName = e(".class-p-musicName")
    var musicAuthor = e(".class-p-author")
    var musicDiv = e(".class-div-picture")
    audioPlayer.src = url
    musicName.innerHTML = song.title
    musicAuthor.innerHTML = song.artist
    musicDiv.style.backgroundImage = `url(${song.picture})`
    musicPlayEvent(audioPlayer)
    getLyric(song.sid)
}

var requestMusic = (channelId) => {
    var musicRequest = {
        url: `http://api.jirengu.com/fm/getSong.php?channel=${channelId}`,
        method: "GET",
        callback: (response) => {
            var song = response.song[0]
            setMusicPlayer(song)
        }
    }
    ajax(musicRequest)
}

var getRandomChannel = (response) => {
    var channelArray = response.channels
    var randomChannel = Math.floor(Math.random() * channelArray.length)
    var item = channelArray[randomChannel]
    var channelName = item.name
    var channelId = item.channel_id
    return {
        name: channelName,
        id: channelId,
    }
}

var getMusicSource = () => {
    var channelRequest = {
        url: "http://api.jirengu.com/fm/getChannels.php",
        method: "GET",
        callback: (response) => {
            var singleChannel = getRandomChannel(response)
            var musicInfoDiv = e(".class-div-musicInfo")
            musicInfoDiv.dataset.channelId = singleChannel.id
            requestMusic(singleChannel.id)
        }
    }
    ajax(channelRequest)
}

var bindPlayEvents = () => {
    bindPlayButtonEvent()
    bindPlayerEndEvent()
    bindNextSongEvent()
}

var bindSoundEvents = () => {
    bindSoundButtonEvent()
    bindSoundBarEvent()
}

var bindEvents = () => {
    bindMusicCanPlayEvent()
    bindPlayEvents()
    bindSoundEvents()
    bindProgressBarEvent()
    bindLoopButtonEvent()
    bindLyrcButtonEvent()
}

var __main = () => {
    getMusicSource()
    bindEvents()
}

__main()
