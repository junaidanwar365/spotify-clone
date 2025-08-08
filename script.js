let currentSong= new Audio();
let songs;
let currFolder;
//songtime function
function secTomin(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUl=document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML="";
    for (const song of songs) {
        
        songUl.innerHTML+=`<li><img class="invert music" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
                                <div>Junaid</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert music" src="img/play.svg" alt="">
                            </div> </li>`;
    }
    
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            let songTitle = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songTitle + ".mp3");
            // playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()+".mp3")
        })
    });
    return songs;
}
//play music
const playMusic = (track, pause = false) => {
    // Stop current playback and reset
    currentSong.pause();
    currentSong.currentTime = 0;
    
    // Load new source
    currentSong.src = `/${currFolder}/` + track;
    
    // Reset UI
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    document.querySelector(".circle").style.left = "0%";
    
    // Set initial button state based on pause parameter
    play.src = pause ? "img/play.svg" : "img/pause.svg";
    
    // Remove previous event listeners to prevent duplicates
    currentSong.oncanplaythrough = null;
    
    // Wait for audio to be ready
    currentSong.oncanplaythrough = () => {
        if (!pause) {
            currentSong.play()
                .then(() => {
                    play.src = "img/pause.svg";
                })
                .catch(e => {
                    console.error("Playback failed:", e);
                    play.src = "img/play.svg";
                });
        }
    };
};

async function displayAlbums() {
    // console.log("displaying albums")
    let a = await fetch(`/song/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/song") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/song/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/song/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //load album
    Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        
        songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
        
        // Load song in paused state
        playMusic(songs[0], true);
        
        // Set button to show it's ready to play
        currentSong.oncanplaythrough = () => {
            play.src = "img/play.svg";
        };
    });
});
    
   
}
async function main(){
    await getSongs("song/Anuv");
    // console.log(songs);
    playMusic(songs[0],true)
    
    await displayAlbums()

    //play button
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="img/pause.svg"
        }else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    //previous button
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log((currentSong.src.split("/").slice(-1)[0]))
        // console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

     // Add an event listener to next
     next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime,currentSong.duration)
        document.querySelector(".songtime").innerHTML=`${secTomin(currentSong.currentTime)}/${secTomin(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*99+"%";
        let circle=document.querySelector(".circle").style.left
        if(circle=="99%"){
            play.src="img/play.svg"
        }
    })
    //seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent=e.offsetX/e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left= percent +"%";
        currentSong.currentTime=((currentSong.duration) * percent) /100
       
    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".header").classList.add("hidden-header");
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
        document.querySelector(".header").classList.remove("hidden-header");
    })
    //volume event
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("Setting volume to", e.target.value, "/ 100")
        let volume= parseInt(e.target.value) / 100
        currentSong.volume =  volume
        if (volume == 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }else{
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
     // Add event listener to mute the track
     document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
    
}
main()