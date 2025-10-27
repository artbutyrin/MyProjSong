let tg = window.Telegram.WebApp;
tg.expand(); // Розгорнути на весь екран
tg.ready(); // Повідомити Telegram що додаток готовий

// ========== НАЛАШТУВАННЯ ==========
        const lyrics = [
    ["And I can't see you here, wonderin' where i might", 1.9, "#ff6b9d"],
    ["It sort of feels like I'm runnin' out of time", 7.9, "#ffb3d9"],
    ["I haven't found all I was hopin' to find", 12.9, "#ff6b9d"],
    ["You said you gotta be up in the mornin'", 18.0, "#ffb3d9"],
    ["Gonna have an early night", 19.5, "#ff6b9d"],
    ["And you're startin' to bore me, baby", 21.0, "#ffb3d9"],
    ["Why'd you only call me when you're high?", 22.30, "#ff1744"],
];

// ========== ЕЛЕМЕНТИ DOM ==========
const audio = document.getElementById('audio');
const playButton = document.getElementById('playButton');
const lyricsContainer = document.getElementById('lyricsContainer');
const signature = document.getElementById('signature');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// ========== ЗМІННІ СТАНУ ==========
let currentLyricIndex = 0;
let isPlaying = false;

// ========== ФУНКЦІЇ ==========

/**
 * Запуск/пауза музики
 */
function togglePlayPause() {
    if (!isPlaying) {
        // Запуск музики
        audio.play()
            .then(() => {
                playButton.classList.add('playing');
                progressBar.classList.add('show');
                isPlaying = true;
                
                // Вібрація при старті
                triggerHaptic('high');
            })
            .catch(error => {
                console.error('Помилка відтворення:', error);
                showError('Не вдалося запустити музику. Спробуйте ще раз.');
            });
    } else {
        // Пауза
        audio.pause();
        playButton.classList.remove('playing');
        isPlaying = false;
        
        triggerHaptic('light');
    }
}

/**
 * Показ тексту у правильний час
 */
function showLyricsAtTime(currentTime) {
    // Перевірка чи є ще тексти для показу
    if (currentLyricIndex >= lyrics.length) {
        return;
    }
    
    const [text, time, color] = lyrics[currentLyricIndex];
    
    // Якщо настав час показати цей рядок
    if (currentTime >= time) {
        // Створення елемента рядка
        const lyricLine = document.createElement('div');
        lyricLine.className = 'lyric-line';
        lyricLine.style.color = color;
        lyricLine.textContent = text;
        
        // Додавання до контейнера
        lyricsContainer.appendChild(lyricLine);
        
        // Анімація появи
        setTimeout(() => {
            lyricLine.classList.add('active');
        }, 50);
        
        // Вібрація при появі тексту
        triggerHaptic('light');
        
        // Автоскрол до нового тексту
        lyricLine.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Перехід до наступного рядка
        currentLyricIndex++;
    }
}

/**
 * Оновлення прогресу відтворення
 */
function updateProgress() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = progress + '%';
    
    // Показ текстів
    showLyricsAtTime(audio.currentTime);
}

/**
 * Обробка завершення пісні
 */
function onSongEnd() {
    playButton.classList.remove('playing');
    isPlaying = false;
    signature.classList.add('show');
    
    // Великий вібро-фідбек в кінці
    triggerHaptic('success');
}

/**
 * Обробка помилок аудіо
 */
function onAudioError(e) {
    console.error('Помилка аудіо:', e);
    showError('Помилка завантаження аудіо. Переконайтеся що файл song.mp3 є в папці!');
}

/**
 * Вібрація Telegram
 */
function triggerHaptic(type) {
    if (!tg.HapticFeedback) return;
    
    switch(type) {
        case 'light':
        case 'medium':
        case 'heavy':
            tg.HapticFeedback.impactOccurred(type);
            break;
        case 'success':
        case 'warning':
        case 'error':
            tg.HapticFeedback.notificationOccurred(type);
            break;
    }
}

/**
 * Показ повідомлення про помилку
 */
function showError(message) {
    // Можна показати алерт або створити власне повідомлення
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

/**
 * Застосування теми Telegram (якщо доступно)
 */
function applyTelegramTheme() {
    if (!tg.themeParams) return;
    
    // Можна використати кольори теми Telegram
    // Наприклад:
    // document.body.style.backgroundColor = tg.themeParams.bg_color;
    
    // Але ми залишаємо свій дизайн для кращого вигляду
}

/**
 * Скидання плеєра (для перезапуску)
 */
function resetPlayer() {
    audio.currentTime = 0;
    currentLyricIndex = 0;
    lyricsContainer.innerHTML = '';
    signature.classList.remove('show');
    progressFill.style.width = '0%';
}

// ========== ОБРОБНИКИ ПОДІЙ ==========

// Кнопка Play/Pause
playButton.addEventListener('click', togglePlayPause);

// Оновлення часу відтворення
audio.addEventListener('timeupdate', updateProgress);

// Завершення пісні
audio.addEventListener('ended', onSongEnd);

// Помилки аудіо
audio.addEventListener('error', onAudioError);

// Клавіатурна навігація (пробіл = play/pause)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    }
});

// Подвійний клік для перезапуску
lyricsContainer.addEventListener('dblclick', () => {
    if (confirm('Перезапустити пісню?')) {
        resetPlayer();
        togglePlayPause();
    }
});

// ========== ІНІЦІАЛІЗАЦІЯ ==========

// Застосування теми Telegram
applyTelegramTheme();

// Лог для дебагу (можна видалити)
console.log('Song Player ініціалізовано!');
console.log('Telegram Web App:', tg.platform);
console.log('Кількість рядків тексту:', lyrics.length);

// Повідомлення Telegram що все готово
tg.ready();