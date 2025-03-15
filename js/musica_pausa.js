let isPaused = false;
let isMusicOn = localStorage.getItem("isMusicOn") === "true";
let gameLoop;

const tracks = [
    "assets/audio/Dr. Dre - The Next Episode (Official Music Video) ft. Snoop Dogg, Kurupt, Nate Dogg.mp3",
    "assets/audio/Don Cheto - El Tatuado (Video Letra Oficial).mp3",
    "assets/audio/Cutting Crew - (I Just) Died In Your Arms (Official Music Video).mp3"
];
let currentTrackIndex = 0;

if (!window.backgroundMusic) {
    window.backgroundMusic = new Audio();
    window.backgroundMusic.loop = false;  // Desactivamos el loop aquí, ya que manejaremos la secuencia manualmente
    window.backgroundMusic.volume = 0.5;
    window.backgroundMusic.muted = false;

    // Comprobamos si es la primera vez que se abre la página
    if (sessionStorage.getItem('isNewSession') === 'true') {
        playTrack(currentTrackIndex);  // Reproduce la primera canción
    } else {
        // Si no es la primera vez, reanudamos desde el último punto
        const savedTime = localStorage.getItem("musicTime");
        if (savedTime) {
            window.backgroundMusic.currentTime = parseFloat(savedTime);
        }
        playTrack(currentTrackIndex);  // Reproduce la canción actual
    }

    // Almacenar el estado para indicar que ya se ha abierto la página antes
    sessionStorage.setItem('isNewSession', 'false');
    
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("musicTime", window.backgroundMusic.currentTime);  // Guarda el tiempo actual de la canción
    });
}

function playTrack(trackIndex) {
    window.backgroundMusic.src = tracks[trackIndex];
    window.backgroundMusic.play().catch(() => {
        console.log("El navegador bloqueó la reproducción automática. Se activará al hacer clic.");
    });
    window.backgroundMusic.onended = () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;  // Cambia a la siguiente pista, y vuelve a la primera al llegar al final
        playTrack(currentTrackIndex);  // Reproduce la siguiente pista
    };
}

function goHome() {
    window.location.href = "menu.html";
}

function exitGame() {
    Swal.fire({
        title: 'Juego terminado',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        customClass: {
            confirmButton: 'custom-confirm-button'
        }
    });
}

function toggleSettings() {
    const settingsMenu = document.getElementById('settingsMenu');
    settingsMenu.classList.toggle('active');
}

function togglePause() {
    isPaused = !isPaused;
    const playPauseIcon = document.getElementById('playPauseIcon');
    if (isPaused) {
        playPauseIcon.classList.remove('bx-play');
        playPauseIcon.classList.add('bx-pause');
        Swal.fire({
            title: 'Juego pausado',
            iconHtml: '<i class="fas fa-pause"></i>',  
            confirmButtonText: 'Continuar',
            customClass: {
                popup: 'custom-popup', 
                title: 'custom-title', // Personaliza el título
                confirmButton: 'custom-confirm-button' // Aplica la clase personalizada al botón de confirmación
            }
        });        
        cancelAnimationFrame(gameLoop); // Detiene el juego
    } else {
        playPauseIcon.classList.remove('bx-pause');
        playPauseIcon.classList.add('bx-play');
        Swal.fire({
            title: 'Juego reanudado',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
            customClass: {
                popup: 'custom-popup'
            }
        });
        gameLoop = requestAnimationFrame(updateGame); 
    }
}

function toggleMusic() {
    isMusicOn = !isMusicOn;
    localStorage.setItem("isMusicOn", isMusicOn);
    const musicIcon = document.getElementById('musicIcon');
    if (isMusicOn) {
        musicIcon.classList.remove('strikethrough-music');
        Swal.fire({
            title: 'Música activada',
            iconHtml: '<i class="fas fa-volume-up"></i>', 
            timer: 1000,
            showConfirmButton: false,
            customClass: {
                popup: 'custom-popup'
            }
        });
        window.backgroundMusic.play();
    } else {
        musicIcon.classList.add('strikethrough-music');
        Swal.fire({
            title: 'Música desactivada',
            iconHtml: '<i class="fas fa-volume-mute"></i>',  
            timer: 1000,
            showConfirmButton: false,
            customClass: {
                popup: 'custom-popup'
            }
        });
        window.backgroundMusic.pause();
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length; // Go to the next track, loop back if at the end
    playTrack(currentTrackIndex); // Play the new track
    Swal.fire({
        title: 'Canción cambiada',
        text: 'La siguiente canción está ahora sonando',
        icon: 'success',
        confirmButtonText: 'Continuar',
        customClass: {
            popup: 'custom-popup',
            title: 'custom-title',
            confirmButton: 'custom-confirm-button'
        }
    });
}
