  /* ── LANGUAGE CYCLE ── */
  const langs = ['🇺🇸 EN','🇵🇭 FIL','🇪🇸 ES','🇯🇵 JA'];
  let langIdx = 0;
  function cycleLang() {
    langIdx = (langIdx + 1) % langs.length;
    document.getElementById('langBtn').textContent = langs[langIdx];
  }

  /* ── PLAY BUTTON (simulated) ── */
  let playing = false;
  let muted = false;
  let progress = 0;
  let timer = null;

  function togglePlay() {
    playing = !playing;
    const btn = document.getElementById('playBtn');
    const ctrl = document.getElementById('ctrlPlayBtn');
    if (playing) {
      btn.textContent = '⏸';
      ctrl.textContent = '⏸';
      timer = setInterval(() => {
        progress = Math.min(progress + 0.5, 100);
        document.getElementById('progressFill').style.width = progress + '%';
        const sec = Math.round(progress * 21 / 100);
        document.getElementById('timeLabel').textContent = `${Math.floor(sec/60)}:${sec%60} / 0:21`;
        if (progress >= 100) { clearInterval(timer); playing = false; btn.textContent = '▶'; ctrl.textContent = '▶'; progress = 0; }
      }, 210);
    } else {
      btn.textContent = '▶';
      ctrl.textContent = '▶';
      clearInterval(timer);
    }
  }

  function toggleMute() {
    muted = !muted;
    document.querySelector('.video-controls .ctrl-btn:nth-child(2)').textContent = muted ? '🔇' : '🔊';
  }

  function seekVideo(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    progress = ((e.clientX - rect.left) / rect.width) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    const sec = Math.round(progress * 21 / 100);
    document.getElementById('timeLabel').textContent = `${Math.floor(sec/60)}:${sec%60} / 0:21`;
  }

  function toggleFullscreen() {
    const el = document.getElementById('appContainer');
    if (!document.fullscreenElement) {
      el.requestFullscreen && el.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }

  /* ── VIDEO PANEL FOCUS/EXPAND ── */
  const videoPanel = document.getElementById('videoPanel');
  const panelVideo = document.getElementById('panelVideo');
  const panelVideoSource = document.getElementById('panelVideoSource');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const customPlaceholderContent = document.getElementById('customPlaceholderContent');
  const noMatchPickerShell = document.getElementById('noMatchPickerShell');
  const customCenterContent = document.getElementById('customCenterContent');
  const avatarVideo = document.getElementById('avatarVideo');
  const avatarVideoSource = document.getElementById('avatarVideoSource');
  const mainContentPanel = document.querySelector('.main-content');
  const videoContent = document.getElementById('videoContent');
  const AVATAR_IDLE_VIDEO = 'assets/steady.mp4';
  const PANEL_DEFAULT_VIDEO = 'assets/clone16-q1-answer.mp4';
  const DEFAULT_SUBTITLE_TEXT = 'Crystal Prompter provides professional teleprompter solutions for studio, field, education, and creator workflows.';
  const CLONE16_INTRO_SLIDES = [
    {
      title: 'Equipped with a 16-inch Monitor',
      body: 'Standard teleprompter with a 16-inch, 500 cd, 16:9 monitor. Aspect ratio can be switched between 16:9 and 4:3, ideal for interviews and field reporting. Crysta'
    },
    {
      title: 'Built-in Flipboard Function',
      body: 'Integrated flipboard enables vertical and horizontal flips via external buttons. cry It is especially useful for PowerPoint presentations instead of scrolling scripts - ideal for interview subjects who prefer a non-scrolling display.'
    },
    {
      title: 'Dual-purpose Portability and Studio Use',
      body: 'Designed with a foldable structure for compact portability between locations. Crystal Prompter It can also serve as a secondary teleprompter in large studio setups, operating in dual mode with the main teleprompter for a more stable production system.'
    },
    {
      title: 'Durability and Robust Build',
      body: 'Since it\'s a portable device, Clone 16 is made of aluminum, ensuring it is both lightweight and durable. Crystal Prop It is resistant to damage during transport and assembly, with reinforced glass that significantly reduces the risk of breakage.'
    },
    {
      title: 'No Assembly Required',
      body: 'The one-body design eliminates complex setup and can be mounted on a tripod by anyone in under 3 minutes. It allows fast and easy preparation, suitable for both field interviews and studio shoots without complicated installation.'
    },
    {
      title: 'Versatile Usability',
      body: 'Originally designed for on-site interviews, it is also ideal for YouTube recordings, field reporting, or as a studio backup teleprompter. ystal When used alongside a main teleprompter, it can efficiently handle any shooting environment.'
    },
    {
      title: 'Integrated Teleprompter Script Software',
      body: 'Includes a custom-developed laptop software for convenient teleprompter operation. Also provides a web app version, allowing users to access saved scripts from any location. Crystal Prompter'
    },
    {
      title: 'Smartphone & Tablet Connectivity',
      body: 'Connects to laptops via HDMI, with wired smartphone or tablet connections also supported. With a wireless dongle, the teleprompter can connect to a smartphone or tablet for remote script editing and scroll speed control.'
    },
    {
      title: 'Wireless Remote for Script Control',
      body: 'Includes a custom wireless remote that connects to laptops, tablets, or smartphones. The performer can control scroll speed within approximately 10 meters, adjusting it freely to match their reading pace. Existing computer mice can also be used to control script scrolling speed.'
    }
  ];
  const CLONE16_READMORE_SLIDES = [
    {
      title: 'Portable and Precise Performance',
      body: 'Clone 16 is a portable teleprompter that connects to a laptop via HDMI, enabling faster and more stable on-set production, and delivering exceptional performance for precise interviews or detailed product descriptions.'
    },
    {
      title: 'Effortless Script Control and Wider View',
      body: 'Connecting directly to a laptop, Clone 16 enables instant script edits and smooth production, while its 16:9 widescreen replaces 17-inch 4:3 teleprompters for a broader, ideal view of long-form scripts.'
    }
  ];
  const CLONE16_READMORE_IMAGES = [
    'https://static.wixstatic.com/media/6e449d_382118eb051d49808586203b6c0e3c58~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_382118eb051d49808586203b6c0e3c58~mv2.png',
    'https://static.wixstatic.com/media/6e449d_a3b1d22a8e384b9ab1095d637658166b~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_a3b1d22a8e384b9ab1095d637658166b~mv2.png',
    'https://static.wixstatic.com/media/6e449d_5df4bf7712f746ee97f842e6b53c5aa0~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_5df4bf7712f746ee97f842e6b53c5aa0~mv2.png',
    'https://static.wixstatic.com/media/6e449d_f0e034a237a24143927fdf894d22cba5~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_f0e034a237a24143927fdf894d22cba5~mv2.png',
    'https://static.wixstatic.com/media/6e449d_7814393820b44771a88f1b162d52218c~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_7814393820b44771a88f1b162d52218c~mv2.png',
    'https://static.wixstatic.com/media/6e449d_210e2c1df9984c49aa76b381859f49d9~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_210e2c1df9984c49aa76b381859f49d9~mv2.png',
    'https://static.wixstatic.com/media/6e449d_7473831c2e24440eb2d254eb36283d06~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_7473831c2e24440eb2d254eb36283d06~mv2.png',
    'https://static.wixstatic.com/media/6e449d_aa4b967d615f497b92bcd107aa13e622~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_aa4b967d615f497b92bcd107aa13e622~mv2.png',
    'https://static.wixstatic.com/media/6e449d_24aee05e59e54fe28464d4bb6df153ce~mv2.png/v1/fit/w_2003,h_1034,q_90,enc_avif,quality_auto/6e449d_24aee05e59e54fe28464d4bb6df153ce~mv2.png'
  ];
  const CLONE16_COMPONENTS_IMAGES = [
    'https://static.wixstatic.com/media/d0630a_45d26962bbaa46ffb03bcdf6f9815d50~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_45d26962bbaa46ffb03bcdf6f9815d50~mv2.png',
    'https://static.wixstatic.com/media/d0630a_6a688dab52c24c7fbeafe7d62be720ff~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_6a688dab52c24c7fbeafe7d62be720ff~mv2.png',
    'https://static.wixstatic.com/media/d0630a_e76f9a93316b4d59b32813116f389fc8~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_e76f9a93316b4d59b32813116f389fc8~mv2.png',
    'https://static.wixstatic.com/media/d0630a_844515b0057a48bf9329f1c817010193~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_844515b0057a48bf9329f1c817010193~mv2.png',
    'https://static.wixstatic.com/media/d0630a_1305fdff77aa432b86a2d38d88cd2f69~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_1305fdff77aa432b86a2d38d88cd2f69~mv2.png',
    'https://static.wixstatic.com/media/d0630a_f472ef8fe8e6441993a84ca85707cc7e~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_f472ef8fe8e6441993a84ca85707cc7e~mv2.png',
    'https://static.wixstatic.com/media/d0630a_f0b3227187a44aedad2e2a975148de91~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_f0b3227187a44aedad2e2a975148de91~mv2.png',
    'https://static.wixstatic.com/media/d0630a_9c8b2a78d25c47bb8f58e452581e85e6~mv2.png/v1/fit/w_1164,h_844,q_90,enc_avif,quality_auto/d0630a_9c8b2a78d25c47bb8f58e452581e85e6~mv2.png'
  ];
  const CLONE16_IMAGES_FEATURE_SLIDES = [
    {
      kicker: 'Key Attractions',
      question: 'Looking for a portable teleprompter that\'s easy to set up on any shoot, yet simple and efficient to operate?',
      subtitle: 'The most convenient on-site portable teleprompter',
      body: [],
      image: 'https://static.wixstatic.com/media/d0630a_4f659d0837ff4a1799f19888e30af5ff~mv2.jpg/v1/crop/x_374,y_83,w_2320,h_1605/fill/w_892,h_618,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_30_edited.jpg'
    },
    {
      kicker: 'Key Attractions',
      question: '',
      subtitle: 'The most cost-effective mid-sized teleprompter',
      body: [],
      image: 'https://static.wixstatic.com/media/d0630a_b0445488a60a4e9892d7a75541f08d13~mv2.jpg/v1/crop/x_353,y_0,w_2440,h_1688/fill/w_892,h_618,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_29_edited.jpg'
    },
    {
      kicker: 'Key Attractions',
      question: 'Dreaming of becoming a high-earning YouTuber and need a compact yet powerful teleprompter?',
      subtitle: 'The most preferred teleprompter among top-earning YouTubers',
      body: [],
      image: 'https://static.wixstatic.com/media/d0630a_78dd6153efc746b8896ea3397f5f7272~mv2.jpg/v1/crop/x_374,y_83,w_2320,h_1605/fill/w_892,h_618,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_1_edited.jpg'
    }
  ];
  let videoPanelLocked = false;
  let clone16IntroSlideIndex = 0;
  let clone16IntroAutoplayTimer = null;
  let clone16ReadMoreSlideIndex = 0;
  let clone16ReadMoreImageIndex = 0;
  let clone16ReadMoreAutoplayTimer = null;
  let clone16ImagesFeatureSlideIndex = 0;
  let clone16ImagesFeatureAutoplayTimer = null;
  let clone16ComponentsImageIndex = 0;
  let clone16ComponentsAutoplayTimer = null;

  function setVideoPanelExpanded(expanded) {
    if (!mainContentPanel) return;
    mainContentPanel.classList.toggle('video-panel-expanded', expanded);
  }

  function setInitialVideoPanelHidden(hidden) {
    if (!mainContentPanel) return;
    mainContentPanel.classList.toggle('initial-no-video', hidden);
  }

  function setPlaceholderMode(mode) {
    if (!videoPlaceholder) return;
    if (mode === 'nomatch' || mode === 'custom') {
      videoPlaceholder.setAttribute('data-mode', mode);
      return;
    }
    videoPlaceholder.setAttribute('data-mode', 'intro');
  }

  function renderCustomPlaceholder(contentHtml) {
    if (!customPlaceholderContent || !videoPlaceholder) return;
    clearCustomCenterPanel();
    if (videoPanel) videoPanel.classList.remove('empty-panel-state');
    customPlaceholderContent.innerHTML = contentHtml;
    setPlaceholderMode('custom');
    setInitialVideoPanelHidden(true);
    stopPanelVideo();
  }

  function stopClone16IntroAutoplay() {
    if (clone16IntroAutoplayTimer) {
      window.clearInterval(clone16IntroAutoplayTimer);
      clone16IntroAutoplayTimer = null;
    }
  }

  function stopClone16ReadMoreAutoplay() {
    if (clone16ReadMoreAutoplayTimer) {
      window.clearInterval(clone16ReadMoreAutoplayTimer);
      clone16ReadMoreAutoplayTimer = null;
    }
  }

  function stopClone16ImagesFeatureAutoplay() {
    if (clone16ImagesFeatureAutoplayTimer) {
      window.clearInterval(clone16ImagesFeatureAutoplayTimer);
      clone16ImagesFeatureAutoplayTimer = null;
    }
  }

  function stopClone16ComponentsAutoplay() {
    if (clone16ComponentsAutoplayTimer) {
      window.clearInterval(clone16ComponentsAutoplayTimer);
      clone16ComponentsAutoplayTimer = null;
    }
  }

  function updateClone16IntroSlider() {
    const track = document.getElementById('clone16IntroTrack');
    if (!track) return;
    track.style.transform = `translateX(-${clone16IntroSlideIndex * 100}%)`;
  }

  function clearCustomCenterPanel() {
    stopClone16IntroAutoplay();
    if (customCenterContent) customCenterContent.innerHTML = '';
    if (videoContent) videoContent.classList.remove('custom-panel-active');
    if (videoPanel) videoPanel.classList.remove('empty-panel-state');
  }

  function renderEmptyCenterPanel() {
    if (!customCenterContent || !videoContent) return;
    if (videoPanel) videoPanel.classList.add('empty-panel-state');
    customCenterContent.innerHTML = '';
    videoContent.classList.add('custom-panel-active');
    setInitialVideoPanelHidden(false);
    stopPanelVideo();
  }

  function renderCustomCenterPanel(contentHtml) {
    if (!customCenterContent || !videoContent) return;
    if (videoPanel) videoPanel.classList.add('empty-panel-state');
    customCenterContent.innerHTML = contentHtml;
    videoContent.classList.add('custom-panel-active');
    setInitialVideoPanelHidden(false);
    stopPanelVideo();
  }

  function renderClone16IntroSlider() {
    clone16IntroSlideIndex = 0;
    renderCustomCenterPanel(`
      <div class="clone16-intro-slider" id="clone16IntroSlider">
        <div class="clone16-intro-track" id="clone16IntroTrack">
          ${CLONE16_INTRO_SLIDES.map((slide, index) => `
            <div class="clone16-intro-slide">
              <article class="clone16-intro-copy" aria-label="Clone 16 intro slide ${index + 1}">
                <span class="clone16-intro-label">Clone 16</span>
                <h3>${slide.title}</h3>
                <p>${slide.body}</p>
              </article>
            </div>
          `).join('')}
        </div>
      </div>
    `);

    const slider = document.getElementById('clone16IntroSlider');
    if (!slider) return;

    updateClone16IntroSlider();

    slider.addEventListener('mouseenter', () => {
      if (clone16IntroAutoplayTimer || CLONE16_INTRO_SLIDES.length <= 1) return;
      clone16IntroAutoplayTimer = window.setInterval(() => {
        clone16IntroSlideIndex = (clone16IntroSlideIndex + 1) % CLONE16_INTRO_SLIDES.length;
        updateClone16IntroSlider();
      }, 5000);
    });

    slider.addEventListener('mouseleave', () => {
      stopClone16IntroAutoplay();
    });
  }

  function getClone16ApplicationGalleryHtml() {
    return `
      <div class="application-gallery-grid clone16-inline-gallery">
        <div class="application-gallery-item large" tabindex="0" role="button" aria-label="Open Clone 16 application image 1">
          <img src="https://static.wixstatic.com/media/d0630a_35a6cb4b811c4ddb960e45b970c20e41~mv2.jpg/v1/fill/w_284,h_392,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.jpg" alt="Clone 16 application image 1" />
          <div class="application-gallery-caption">
            <strong>Darakwon Publisher</strong>
            <span>Application image</span>
          </div>
        </div>
        <div class="application-gallery-item" tabindex="0" role="button" aria-label="Open Clone 16 application image 2">
          <img src="https://static.wixstatic.com/media/d0630a_221e63cfeb6743ab9373699001470a76~mv2.jpg/v1/crop/x_89,y_0,w_4446,h_3468/fill/w_245,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.jpg" alt="Clone 16 application image 2" />
          <div class="application-gallery-caption">
            <strong>Darakwon Publisher</strong>
            <span>Application image</span>
          </div>
        </div>
        <div class="application-gallery-item" tabindex="0" role="button" aria-label="Open Clone 16 application image 3">
          <img src="https://static.wixstatic.com/media/d0630a_221e63cfeb6743ab9373699001470a76~mv2.jpg/v1/crop/x_89,y_0,w_4446,h_3468/fill/w_245,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.jpg" alt="Clone 16 application image 3" />
          <div class="application-gallery-caption">
            <strong>Darakwon Publisher</strong>
            <span>Application image</span>
          </div>
        </div>
        <div class="application-gallery-item" tabindex="0" role="button" aria-label="Open Clone 16 application image 4">
          <img src="https://static.wixstatic.com/media/d0630a_4e3390b8436d4386ab5e848389e3088f~mv2.jpg/v1/crop/x_77,y_0,w_3846,h_3000/fill/w_245,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Byeokje%20Global%20Culinary%20Research%20Institute_121522.jpg" alt="Clone 16 application image 4" />
          <div class="application-gallery-caption">
            <strong>Byeokje Global Culinary Research Institute</strong>
            <span>Application image</span>
          </div>
        </div>
        <div class="application-gallery-item" tabindex="0" role="button" aria-label="Open Clone 16 application image 5">
          <img src="https://static.wixstatic.com/media/d0630a_de6c72aa4a714bb9bfd19c34f4fdc679~mv2.png/v1/crop/x_0,y_63,w_600,h_468/fill/w_245,h_191,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Byeokje%20Global%20Culinary%20Research%20Institute_121522.png" alt="Clone 16 application image 5" />
          <div class="application-gallery-caption">
            <strong>Byeokje Global Culinary Research Institute</strong>
            <span>Application image</span>
          </div>
        </div>
      </div>
    `;
  }

  function playPanelVideo(src, autoplay = false) {
    if (!panelVideo || !panelVideoSource) return;
    clearCustomCenterPanel();
    if (videoPanel) videoPanel.classList.remove('empty-panel-state');
    const nextSrc = src || PANEL_DEFAULT_VIDEO;
    if (panelVideoSource.getAttribute('src') !== nextSrc) {
      panelVideo.pause();
      panelVideoSource.setAttribute('src', nextSrc);
      panelVideo.load();
    }
    panelVideo.currentTime = 0;
    if (!autoplay) return;
    const playPromise = panelVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function stopPanelVideo() {
    if (!panelVideo) return;
    panelVideo.pause();
    panelVideo.currentTime = 0;
  }

  if (videoPanel && panelVideo) {
    videoPanel.addEventListener('mouseenter', () => {
      if (!videoPanelLocked) setVideoPanelExpanded(true);
    });
    videoPanel.addEventListener('mouseleave', () => {
      if (!videoPanelLocked) setVideoPanelExpanded(false);
    });
    panelVideo.addEventListener('play', () => {
      videoPanelLocked = true;
      setVideoPanelExpanded(true);
    });
    const resetVideoPanelSize = () => {
      videoPanelLocked = false;
      setVideoPanelExpanded(false);
    };
    panelVideo.addEventListener('pause', resetVideoPanelSize);
    panelVideo.addEventListener('ended', resetVideoPanelSize);
  }

  /* ── MIC ── */
  let micActive = false;
  const micBtn = document.getElementById('micBtn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechRec = SpeechRecognition ? new SpeechRecognition() : null;

  if (speechRec) {
    speechRec.lang = 'en-US';
    speechRec.interimResults = false;
    speechRec.maxAlternatives = 1;
    speechRec.onresult = (e) => {
      const transcript = (e.results?.[0]?.[0]?.transcript || '').trim();
      if (!transcript) return;
      document.getElementById('userInput').value = transcript;
      sendMessage(transcript);
    };
    speechRec.onerror = () => {
      micActive = false;
      if (micBtn) micBtn.style.background = 'rgba(255,255,255,0.12)';
    };
    speechRec.onend = () => {
      micActive = false;
      if (micBtn) micBtn.style.background = 'rgba(255,255,255,0.12)';
    };
  }

  function toggleMic() {
    if (!speechRec) {
      if (infoCard) {
        infoCard.innerHTML = `
          <h3>Microphone Not Supported</h3>
          <p>Your browser does not support speech recognition. Please type your question.</p>
        `;
      }
      return;
    }
    if (micActive) {
      speechRec.stop();
      return;
    }
    micActive = true;
    if (micBtn) micBtn.style.background = 'rgba(255,80,80,0.4)';
    speechRec.start();
  }

  /* ── ATTACH FILE ── */
  function attachFile() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.onchange = (e) => {
      if (e.target.files[0]) {
        document.getElementById('userInput').value = `[File: ${e.target.files[0].name}]`;
      }
    };
    inp.click();
  }

  /* ── CHAT ── */
  const infoCard = document.getElementById('infoCard');
  const bottomArea = document.querySelector('.bottom-area');
  const inputArea = document.querySelector('.input-area');
  const quickActions = document.getElementById('quickActions');
  const quickActionButtons = Array.from(document.querySelectorAll('.action-chip'));
  const cardsPanel = document.querySelector('.cards-panel');
  const appContainer = document.getElementById('appContainer');
  const assistantPanel = document.querySelector('.assistant-panel');
  const avatarBox = document.querySelector('.avatar-box');
  const bottomCards = document.querySelector('.bottom-cards');
  const card2 = document.getElementById('card2');
  const card3 = document.getElementById('card3');
  const subtitleStrip = document.getElementById('subtitleStrip');

  function isLayoutLocked() {
    return Boolean(appContainer && appContainer.classList.contains('layout-locked'));
  }

  function setSubtitleStripText(text = '') {
    if (!subtitleStrip) return;
    subtitleStrip.textContent = text;
  }

  function syncCueSeriesAvatarHeight() {
    if (!appContainer || !assistantPanel || !avatarBox || !infoCard || !cardsPanel) return;
    if (isLayoutLocked()) {
      assistantPanel.style.height = '';
      avatarBox.style.height = '';
      cardsPanel.style.height = '';
      infoCard.style.height = '';
      return;
    }
    if (!appContainer.classList.contains('cue-series-mode')) {
      assistantPanel.style.height = '';
      avatarBox.style.height = '';
      cardsPanel.style.height = '';
      infoCard.style.height = '';
      return;
    }
    if (appContainer.classList.contains('clone16-action-layout')) {
      assistantPanel.style.height = '';
      avatarBox.style.height = '';
      cardsPanel.style.height = '';
      infoCard.style.height = '';
      return;
    }

    const infoCardHeight = Math.round(infoCard.getBoundingClientRect().height);
    if (!infoCardHeight) return;

    assistantPanel.style.height = `${infoCardHeight}px`;
    avatarBox.style.height = '100%';
    cardsPanel.style.height = `${infoCardHeight}px`;
    infoCard.style.height = '100%';
  }

  function scheduleCueSeriesAvatarHeightSync() {
    window.requestAnimationFrame(syncCueSeriesAvatarHeight);
  }

  function setCueSeriesMode(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('cue-series-mode', enabled);
    if (!subtitleStrip || !bottomArea || !inputArea) {
      scheduleCueSeriesAvatarHeightSync();
      return;
    }
    if (isLayoutLocked()) {
      if (subtitleStrip.parentElement !== bottomArea) {
        bottomArea.insertBefore(subtitleStrip, inputArea);
      }
      scheduleCueSeriesAvatarHeightSync();
      return;
    }
    if (enabled) {
      if (subtitleStrip.parentElement !== bottomArea) {
        bottomArea.insertBefore(subtitleStrip, inputArea);
      }
      scheduleCueSeriesAvatarHeightSync();
      return;
    }
    if (subtitleStrip.parentElement !== appContainer) {
      appContainer.insertBefore(subtitleStrip, bottomArea);
    }
    scheduleCueSeriesAvatarHeightSync();
  }

  function setClone16ActionLayout(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('clone16-action-layout', enabled);
    scheduleCueSeriesAvatarHeightSync();
  }

  function createPlaceholderImage(label) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#382653" />
            <stop offset="100%" stop-color="#7f68bf" />
          </linearGradient>
        </defs>
        <rect width="640" height="420" rx="30" fill="url(#bg)" />
        <rect x="48" y="48" width="544" height="324" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
        <text x="320" y="188" text-anchor="middle" fill="white" font-size="42" font-family="Arial, sans-serif" font-weight="700">${label}</text>
        <text x="320" y="236" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="22" font-family="Arial, sans-serif">Crystal Prompter</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createProduct(definition) {
    const images = definition.images && definition.images.length
      ? definition.images
      : [createPlaceholderImage(definition.name), createPlaceholderImage(`${definition.name} Setup`)];
    const defaultVideoBody = definition.videoSrc
      ? `${definition.name} demo content is loaded in the center panel. Press play to preview the product video.`
      : `No dedicated ${definition.name} video is configured yet. Use Images or Specification for now.`;

    return {
      key: definition.key,
      name: definition.name,
      aliases: definition.aliases,
      summary: {
        title: definition.name,
        body: definition.summary,
        bodyHtml: definition.summaryHtml || ''
      },
      images,
      video: {
        src: definition.videoSrc || '',
        title: definition.videoTitle || `${definition.name} Video`,
        body: definition.videoBody || defaultVideoBody
      },
      specification: {
        title: `${definition.name} Specification`,
        body: definition.specification
      },
      installation: {
        title: `${definition.name} Installation`,
        body: definition.installation
      },
      buyNow: {
        title: `Buy ${definition.name}`,
        body: definition.buyNow || `Contact Crystal Prompter for ${definition.name} pricing, availability, and ordering details.`
      }
    };
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    try {
      const parsedUrl = new URL(url, window.location.href);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');

      if (hostname === 'youtu.be') {
        const id = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
      }

      if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
        if (parsedUrl.pathname.startsWith('/shorts/')) {
          const id = parsedUrl.pathname.split('/')[2];
          return id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
        }

        if (parsedUrl.pathname === '/watch') {
          const id = parsedUrl.searchParams.get('v');
          return id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
        }

        if (parsedUrl.pathname.startsWith('/embed/')) {
          return `https://www.youtube.com${parsedUrl.pathname}${parsedUrl.search || '?rel=0'}`;
        }
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  const PRODUCT_DEFINITIONS = [
    {
      key: 'clone16',
      name: 'Clone 16',
      aliases: ['clone 16', 'clone16', 'clone', 'c16', 'c 16', 'crystal prompter clone 16'],
      summary: 'A portable teleprompter that connects to a laptop via HDMI for faster, more stable production. Ideal for interviews and product shoots, it allows instant script editing and smooth control. Its 16:9 widescreen display offers a wider view, replacing traditional 17-inch 4:3 models.',
      summaryHtml: `Portable interview teleprompter equipped with<br><br>a 16-inch, 500 cd/m², 16:9 monitor<br><br><strong>Portable and Precise Performance</strong><br><br>Clone 16 is a portable teleprompter that connects to a laptop via HDMI, enabling faster and more stable on-set production, and delivering exceptional performance for precise interviews or detailed product descriptions.<br><br><strong>Effortless Script Control and Wider View</strong><br><br>Connecting directly to a laptop, Clone 16 enables instant script edits and smooth production, while its 16:9 widescreen replaces 17-inch 4:3 teleprompters for a broader, ideal view of long-form scripts.`,
      images: [
        'https://static.wixstatic.com/media/d0630a_acccc6e0ffa84500bef7d1952b5e3ee6~mv2.png/v1/crop/x_7,y_80,w_587,h_462/fill/w_329,h_259,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/website%20(10).png'
      ],
      videoSrc: 'https://www.youtube.com/shorts/IJlVE8LUHZ0',
      videoTitle: 'Clone 16 - Introduction',
      specification: 'Clone 16 uses a 16:9 widescreen display, laptop HDMI workflow, and smooth script control for studio and field production.',
      installation: 'Mount the prompter, align the camera and lens, connect the laptop via HDMI, then load the script and begin prompting.'
    },
    {
      key: 'cue24',
      name: 'Cue 24',
      aliases: ['cue24', 'cue 24'],
      summary: 'Cue 24 is a Cue Series teleprompter configured for 24-inch class prompting workflows, balancing readability, stable framing, and efficient studio operation.',
      summaryHtml: `Cue 24 delivers larger-format prompting with a stable, easy-to-read workflow for studio and presenter setups.`,
      images: [
        'https://static.wixstatic.com/media/d0630a_a36e5bf9e50449b294ec877e9525391c~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/c%2024.png',
        'https://static.wixstatic.com/media/d0630a_a36e5bf9e50449b294ec877e9525391c~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/c%2024.png'
      ],
      specification: 'Cue 24 focuses on larger-screen prompting, stable framing, and a workflow suited for presenter, lesson, and studio production.',
      installation: 'Set the Cue 24 frame on the support, align the monitor and camera, then connect the script source and fine-tune the viewing angle.'
    },
    {
      key: 'cue27',
      name: 'Cue 27',
      aliases: ['cue27', 'cue 27'],
      summary: 'Cue 27 is a Cue Series teleprompter designed for larger and more readable prompting in professional presentation and studio environments.',
      summaryHtml: `Cue 27 is built for smooth larger-format prompting with dependable readability and stable production framing.`,
      specification: 'Cue 27 prioritizes large-format readability, stable support, and a prompting workflow suitable for professional presentation and studio use.',
      installation: 'Mount the Cue 27 frame on the support, align the monitor and camera, then connect the script source and adjust the viewing angle.'
    },
    {
      key: 'cue32',
      name: 'Cue 32',
      aliases: ['cue32', 'cue 32'],
      summary: 'Cue 32 is the largest Cue Series option for demanding prompting setups that need a broad reading area and dependable production stability.',
      summaryHtml: `Cue 32 is designed for high-visibility prompting where a larger reading area and stable studio workflow are essential.`,
      specification: 'Cue 32 emphasizes maximum readability, stable framing, and a robust prompting workflow for professional production environments.',
      installation: 'Assemble the Cue 32 frame on the support, align the display and camera system, then connect the script source and finalize the prompting angle.'
    },
    {
      key: 'adamas19',
      name: 'Adamas 19',
      aliases: ['adamas 19', 'adamas19'],
      summary: 'Adamas 19 is a compact professional teleprompter designed for readable prompting, stable support, and efficient production use in a 19-inch class format.',
      specification: 'Adamas 19 emphasizes compact professional prompting, stable framing, and dependable readability for controlled production setups.',
      installation: 'Mount Adamas 19 on the support, align the camera and display, then connect the script source and adjust the reading angle.'
    },
    {
      key: 'adamas22',
      name: 'Adamas 22',
      aliases: ['adamas 22', 'adamas22'],
      summary: 'Adamas 22 is a mid-size teleprompter option built for balanced readability, stable operation, and practical integration into studio and presentation workflows.',
      specification: 'Adamas 22 focuses on mid-size readability, stable prompting support, and efficient use across presenter and studio environments.',
      installation: 'Attach Adamas 22 to the support system, align the monitor and camera, then connect the prompt source and fine-tune the viewing position.'
    },
    {
      key: 'adamas24',
      name: 'Adamas 24',
      aliases: ['adamas 24', 'adamas24'],
      summary: 'Adamas 24 is a larger Adamas teleprompter model designed for broad script visibility, dependable support, and professional presentation workflows.',
      specification: 'Adamas 24 prioritizes larger-format readability, stable support hardware, and a prompting workflow suited to professional use.',
      installation: 'Secure Adamas 24 on the support frame, align the camera and display system, then connect the script source and finalize the prompting angle.'
    },
    {
      key: 'framer24',
      name: 'Framer 24',
      aliases: ['framer 24', 'framer24'],
      summary: 'Framer 24 is a practical teleprompter built for modern camera framing, balanced readability, and steady prompting performance in a 24-inch class setup.',
      images: [
        'https://static.wixstatic.com/media/d0630a_6b6a273d89914d5b937926477ea10668~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/Fr%2032.png',
        'https://static.wixstatic.com/media/d0630a_6b6a273d89914d5b937926477ea10668~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/Fr%2032.png'
      ],
      specification: 'Framer 24 is designed for framing flexibility, practical production setups, and clear presenter-to-camera eye contact.',
      installation: 'Attach Framer 24 to the support system, align the monitor and camera, then connect the script source before use.'
    },
    {
      key: 'framer27',
      name: 'Framer 27',
      aliases: ['framer 27', 'framer27'],
      summary: 'Framer 27 expands the Framer line with a larger viewing area while preserving stable support, framing control, and smooth prompting performance.',
      specification: 'Framer 27 focuses on larger-format framing flexibility, stable prompting support, and reliable presenter eye-line control.',
      installation: 'Mount Framer 27 on the support, align the display and camera, then connect the script source and adjust the final viewing angle.'
    },
    {
      key: 'framer32',
      name: 'Framer 32',
      aliases: ['framer 32', 'framer32', 'framer series'],
      summary: 'Framer 32 is the largest Framer model, built for spacious script visibility, practical framing control, and dependable professional prompting workflows.',
      specification: 'Framer 32 prioritizes large-format framing, readable prompting, and stable presenter-to-camera eye contact in production setups.',
      installation: 'Assemble Framer 32 on the support frame, align the monitor and camera system, then connect the script source and finalize the prompting position.'
    },
    {
      key: 'folder22n',
      name: 'Folder 22N',
      aliases: ['folder 22n', 'folder22n'],
      summary: 'Folder 22N is a folding teleprompter solution designed for fast deployment, compact transport, and dependable script delivery.',
      specification: 'Folder 22N prioritizes foldable transport, quick assembly, and a stable prompting frame suited for field production.',
      installation: 'Unfold the frame, secure the monitor and camera position, then connect the script source and adjust the viewing angle.'
    },
    {
      key: 'lessonQ24',
      name: 'LessonQ 24',
      aliases: ['lesson q 24', 'lessonq24', 'lessonq 24'],
      summary: 'LessonQ 24 is designed for teaching, lecture capture, and presenter-led educational content where clear eye contact matters in a 24-inch class setup.',
      specification: 'LessonQ 24 focuses on lecture use, steady prompting readability, and a workflow optimized for teaching environments.',
      installation: 'Position LessonQ 24 with your teaching monitor or camera setup, connect the script source, and adjust the prompting height for the presenter.'
    },
    {
      key: 'lessonQ27',
      name: 'LessonQ 27',
      aliases: ['lesson q 27', 'lessonq27', 'lessonq 27'],
      summary: 'LessonQ 27 is built for lecture capture and presenter-led educational content that benefits from a larger and more readable prompting area.',
      specification: 'LessonQ 27 prioritizes larger-format lecture readability, stable support, and dependable prompting for teaching environments.',
      installation: 'Mount LessonQ 27 on the support system, align the display and camera, then connect the script source and adjust the presenter eyeline.'
    },
    {
      key: 'lessonQ32',
      name: 'LessonQ 32',
      aliases: ['lesson q 32', 'lessonq32', 'lessonq 32'],
      summary: 'LessonQ 32 is a larger teaching teleprompter option designed for lecture delivery where maximum script visibility is important.',
      specification: 'LessonQ 32 emphasizes broad reading visibility, stable classroom or studio support, and a workflow suited to educational production.',
      installation: 'Assemble LessonQ 32 on the support, align the monitor and camera system, then connect the script source and finalize the viewing angle.'
    },
    {
      key: 'lessonQ43',
      name: 'LessonQ 43',
      aliases: ['lesson q 43', 'lessonq43', 'lessonq 43'],
      summary: 'LessonQ 43 is the largest LessonQ option for large-scale lecture, training, and presentation workflows that require maximum readability.',
      specification: 'LessonQ 43 is designed around large-format educational prompting, robust support, and dependable readability in demanding teaching environments.',
      installation: 'Secure LessonQ 43 on the support frame, align the display and camera system, then connect the script source and adjust the final reading position.'
    },
    {
      key: 'mime24',
      name: 'Mime 24',
      aliases: ['mime 24', 'mime24'],
      summary: 'Mime 24 is a monitor-oriented prompting solution designed for clean display workflows, stable viewing, and practical use in controlled production spaces.',
      specification: 'Mime 24 emphasizes clear monitor integration, stable reading visibility, and dependable use in structured production environments.',
      installation: 'Position Mime 24 on the support, route the display feed, secure the hardware, and align the viewing position before use.'
    },
    {
      key: 'mime27',
      name: 'Mime 27',
      aliases: ['mime 27', 'mime27'],
      summary: 'Mime 27 provides a larger monitor-based prompting experience while maintaining clean display routing and steady prompting support.',
      specification: 'Mime 27 focuses on larger-format monitor prompting, stable support hardware, and clear viewing in controlled production setups.',
      installation: 'Mount Mime 27 on the support system, connect the display feed, then secure and align the viewing position.'
    },
    {
      key: 'mime32',
      name: 'Mime 32',
      aliases: ['mime 32', 'mime32', 'mime series'],
      summary: 'Mime 32 is the largest Mime model, built for wide reading visibility, stable display integration, and dependable prompting in professional spaces.',
      specification: 'Mime 32 prioritizes broad monitor readability, stable viewing support, and reliable prompting for larger production environments.',
      installation: 'Assemble Mime 32 on the support, route the display connection, secure the hardware, and finalize the reading position.'
    },
    {
      key: 'speech19',
      name: 'Speech 19',
      aliases: ['speech 19', 'speech19'],
      summary: 'Speech 19 is a compact speech teleprompter model designed for direct presenter delivery, readable prompting, and efficient setup.',
      specification: 'Speech 19 centers on compact speech prompting, stable support, and practical readability for presenter-facing workflows.',
      installation: 'Position Speech 19 on the support, align it with the presenter setup, then connect the script source and adjust the reading angle.'
    },
    {
      key: 'speech22',
      name: 'Speech 22',
      aliases: ['speech 22', 'speech22'],
      summary: 'Speech 22 provides a larger speech prompting format for presentations that need clear script visibility and stable stage or studio support.',
      specification: 'Speech 22 emphasizes larger speech readability, dependable hardware support, and smooth prompting for presentation environments.',
      installation: 'Secure Speech 22 on the support hardware, connect the script source, and adjust the final reading position for the presenter.'
    },
    {
      key: 'speech24',
      name: 'Speech 24',
      aliases: ['speech 24', 'speech24'],
      summary: 'Speech 24 is a larger speech teleprompter option intended for highly visible presenter prompting with dependable support and readable delivery.',
      specification: 'Speech 24 focuses on broad presenter readability, stable support hardware, and a workflow suited to stage or studio prompting.',
      installation: 'Assemble Speech 24 on the support frame, connect the script source, and align the unit for comfortable presenter reading.'
    },
    {
      key: 'tab12',
      name: 'Tab 12',
      aliases: ['tab 12', 'tab12'],
      summary: 'Tab 12 is a compact teleprompter designed around tablet-based prompting for portable and fast-moving content production.',
      specification: 'Tab 12 is optimized for tablet prompting, compact transport, and quick deployment in small-space productions.',
      installation: 'Mount the tablet holder, align the camera and reflective glass, then load the script app and adjust the reading angle.'
    },
    {
      key: 'ultra43',
      name: 'Ultra 43',
      aliases: ['ultra 43', 'ultra43'],
      summary: 'Ultra 43 is a large-format professional teleprompter designed for demanding workflows that need broad readability and robust support.',
      specification: 'Ultra 43 prioritizes large-screen readability, strong support hardware, and dependable prompting for professional production teams.',
      installation: 'Assemble Ultra 43 on the support frame, secure the display and camera system, then balance the unit and connect the script feed.'
    },
    {
      key: 'ultra55',
      name: 'Ultra 55',
      aliases: ['ultra 55', 'ultra55', 'ultra series'],
      summary: 'Ultra 55 is the largest Ultra model, built for maximum script visibility, robust support, and high-end studio prompting environments.',
      specification: 'Ultra 55 emphasizes maximum readability, heavy-duty support, and production reliability in large-format professional setups.',
      installation: 'Secure Ultra 55 on the support structure, align the display and camera system, then connect the prompt feed and finalize the balance.'
    },
    {
      key: 'flex15',
      name: 'Flex 15',
      aliases: ['flex 15', 'flex15'],
      summary: 'Flex 15 is a flexible mid-size prompting solution designed for adaptable camera setups and efficient production use.',
      specification: 'Flex 15 is centered on flexible mounting, mid-size readability, and efficient integration with standard video workflows.',
      installation: 'Attach Flex 15 to the support, align the display and camera, then connect the script source and fine-tune the framing.'
    },
    {
      key: 'rotunda15',
      name: 'Rotunda 15',
      aliases: ['rotunda 15', 'rotunda15'],
      summary: 'Rotunda 15 is a compact professional teleprompter designed for smooth operation and neat integration into creator setups.',
      specification: 'Rotunda 15 focuses on compact professional prompting, balanced readability, and simple integration into content rigs.',
      installation: 'Set the Rotunda 15 frame on the support, align the camera, then connect the display or script source and adjust the eyeline.'
    },
    {
      key: 'olleson18',
      name: 'Ollesson 18',
      aliases: ['olleson 18', 'olleson18', 'ollesson 18', 'ollesson18'],
      summary: 'Ollesson 18 is an 18-inch class prompting solution made for presenters who need a larger script view with dependable setup.',
      specification: 'Ollesson 18 is designed around a larger reading area, stable support, and reliable prompting for presentation environments.',
      installation: 'Assemble the Ollesson 18 frame, secure the monitor and camera, then connect the prompt source and finalize the viewing angle.'
    },
    {
      key: 'plate',
      name: 'Plate',
      aliases: ['plate'],
      summary: 'Plate is a supporting teleprompter component designed to stabilize and simplify mounting for production workflows.',
      specification: 'Plate centers on support stability, mounting compatibility, and dependable use in modular teleprompter systems.',
      installation: 'Position the plate on the designated support points, lock the hardware in place, and attach the compatible production components.'
    },
    {
      key: 'electricPedestal',
      name: 'Electric Pedestal',
      aliases: ['electric pedestal'],
      summary: 'Electric Pedestal is a motorized support system designed for smooth vertical adjustment and stable studio camera or teleprompter workflows.',
      specification: 'Electric Pedestal focuses on controlled height adjustment, steady support, and practical integration into studio production environments.',
      installation: 'Position the electric pedestal on the studio floor, secure the mounted equipment, connect power, and verify smooth lift operation before use.'
    },
    {
      key: 'ep30k',
      name: 'EP 30K',
      aliases: ['ep 30k', 'ep30k'],
      summary: 'EP 30K is an electric pedestal model designed for smooth height control, steady operation, and reliable support in studio production workflows.',
      specification: 'EP 30K emphasizes controlled motorized lift movement, stable equipment support, and dependable day-to-day studio operation.',
      installation: 'Set EP 30K in position, mount the compatible equipment, connect power, and test the lift range before production use.'
    },
    {
      key: 'ep40k',
      name: 'EP 40K',
      aliases: ['ep 40k', 'ep40k'],
      summary: 'EP 40K is a motorized pedestal solution built for controlled height adjustment and stable studio support across professional workflows.',
      specification: 'EP 40K focuses on smooth pedestal movement, stable mounted support, and practical use in demanding studio environments.',
      installation: 'Place EP 40K on the studio floor, secure the mounted system, connect power, and verify balanced lift movement.'
    },
    {
      key: 'ep50k',
      name: 'EP 50K',
      aliases: ['ep 50k', 'ep50k'],
      summary: 'EP 50K is an electric pedestal model intended for steady vertical movement, reliable support, and professional studio equipment handling.',
      specification: 'EP 50K prioritizes controlled elevation, stable support hardware, and dependable operation for professional studio setups.',
      installation: 'Position EP 50K, attach the compatible mounted equipment, power the system, and confirm smooth lift performance.'
    },
    {
      key: 'ep60k',
      name: 'EP 60K',
      aliases: ['ep 60k', 'ep60k'],
      summary: 'EP 60K is a high-capability electric pedestal designed for smooth lift adjustment, stable support, and reliable studio production performance.',
      specification: 'EP 60K emphasizes strong motorized support, steady vertical control, and dependable use in heavier-duty studio workflows.',
      installation: 'Install EP 60K in the intended studio position, secure the mounted system, connect power, and test the full movement range before operation.'
    }
  ];

  const PRODUCTS = Object.fromEntries(
    PRODUCT_DEFINITIONS.map((definition) => [definition.key, createProduct(definition)])
  );

  const PRODUCT_ALIAS_MAP = PRODUCT_DEFINITIONS.map((definition) => ({
    key: definition.key,
    aliases: definition.aliases.map((alias) => alias.toLowerCase())
  }));

  let currentProductKey = 'clone16';
  let lastConfirmedProductKey = 'clone16';
  let hasExplicitProductSelection = false;
  let infoCardAutoScrollTimer = null;
  let infoCardAutoScrollDelayTimer = null;
  let introInfoCardSlideIndex = 0;
  let introInfoCardSliderTimer = null;

  const INTRO_INFO_CARD_SLIDES = [
    'https://static.wixstatic.com/media/d0630a_b3967fcd9d96450693cdb31d09cf6fcd~mv2.png/v1/fit/w_754,h_250,q_90,enc_avif,quality_auto/d0630a_b3967fcd9d96450693cdb31d09cf6fcd~mv2.png',
    'https://static.wixstatic.com/media/d0630a_68b9c39bdc094c6a930e4f196cd9bd01~mv2.png/v1/fit/w_754,h_250,q_90,enc_avif,quality_auto/d0630a_68b9c39bdc094c6a930e4f196cd9bd01~mv2.png',
    'https://static.wixstatic.com/media/d0630a_6a06acf81a724deeb88e2e94060eeb6b~mv2.png/v1/fit/w_754,h_250,q_90,enc_avif,quality_auto/d0630a_6a06acf81a724deeb88e2e94060eeb6b~mv2.png',
    'https://static.wixstatic.com/media/d0630a_1e5da76aa11c4a1196d4e119311c7c4b~mv2.png/v1/fit/w_754,h_250,q_90,enc_avif,quality_auto/d0630a_1e5da76aa11c4a1196d4e119311c7c4b~mv2.png'
  ];

  const INTRO_INFO_CARD_DETAILS = [
    {
      number: '01',
      title: 'High Brightness and Clear Display',
      body: 'Optimal 700-1000 cd/m2 brightness and large 24-32" screens ensure crisp, legible text and reduced eye strain.'
    },
    {
      number: '02',
      title: 'Built-in Screen Flip Function',
      body: 'Internal flip board with external buttons allows flexible orientation for any recording setup.'
    },
    {
      number: '03',
      title: 'Lightweight, Stable, and Safe',
      body: 'Durable, portable frame with secure construction for vibration-free, safe operation.'
    },
    {
      number: '04',
      title: 'Best Value in Its Class',
      body: 'Premium professional performance at an affordable price - no unnecessary parts, just essential features.'
    },
    {
      number: '05',
      title: 'Modular, Tool-Free Assembly',
      body: 'Simplified three-section design lets anyone set up or disassemble the teleprompter in minutes.'
    },
    {
      number: '06',
      title: 'Beginner-Friendly Design',
      body: 'Intuitive operation for everyone - from students to YouTubers - no technical expertise required.'
    }
  ];

  const INFO_TEXT = {
    aboutUs: {
      title: '',
      bodyHtml: `
        <section class="about-card-embed" aria-label="About Us">
          <div class="about-shell">
            <div class="about-copy-panel">
              <h1>About Us</h1>
              <h2>Crystal Prompter Co., Ltd.</h2>
              <p class="about-lead">
                Established in 2017, Crystal Prompter develops professional teleprompters
                and electric pedestal solutions for studio, field, education, and creator
                workflows with a focus on reliability, clarity, and practical production use.
              </p>
              <div class="about-pill-row" aria-label="Company highlights">
                <span class="about-pill">Since 2017</span>
                <span class="about-pill">Korea-based production</span>
                <span class="about-pill">Studio to creator setups</span>
              </div>
            </div>
            <div class="about-social-panel" aria-label="Crystal Prompter social links">
              <p class="about-social-label">Follow Us :</p>
              ${getSocialLinksHtml()}
            </div>
          </div>
        </section>
      `
    }
  };

  function getBuyNowInfoHtml(product) {
    return `
      <strong>How to buy ${product.name}</strong><br><br>
      1. Choose the product model and intended setup.<br>
      2. Prepare your quantity, delivery country, and preferred production use.<br>
      3. Contact Crystal Prompter through the official social channels shown in About Us to request pricing and availability.<br>
      4. Confirm the final configuration, accessories, and shipping arrangement before payment.<br><br>
      <strong>Recommended details to send</strong><br>
      Product name, camera or monitor setup, required accessories, target delivery location, and schedule.<br><br>
      <strong>Note</strong><br>
      Pricing and final order terms depend on the selected model and configuration.
    `;
  }

  function getBuyNowCardHtml(product) {
    return `
      <section class="buy-now-card-embed" aria-label="Buy ${escapeHtml(product.name)}">
        <div class="buy-now-card-copy">
          <h3 class="what-we-do-title">What We Do?</h3>
          <p class="what-we-do-intro">We provide high-quality teleprompters designed to support clear and confident delivery for broadcasting, education, live events, and more.</p>
          <div class="what-we-do-grid">
            <article class="what-we-do-card">
              <h4>Design and Manufacture Teleprompters</h4>
              <p>We create mid-size and large studio teleprompters for creators of all levels.</p>
            </article>
            <article class="what-we-do-card">
              <h4>Simplified Professional Equipment</h4>
              <p>Modular, intuitive designs make professional-quality broadcasting, online teaching, and video production easy.</p>
            </article>
            <article class="what-we-do-card">
              <h4>Versatile Applications</h4>
              <p>Ideal for students, YouTubers, online instructors, and professional studios.</p>
            </article>
            <article class="what-we-do-card">
              <h4>Domestic Production and Quality Control</h4>
              <p>All components are produced and standardized in Korea for consistency, durability, and reliability.</p>
            </article>
          </div>
          <div class="buy-now-card-guide">${getBuyNowInfoHtml(product)}</div>
        </div>
        <div class="buy-now-card-form-shell">
          <div class="buy-now-card-form-header">
            <h4>Buy Now Form</h4>
            <p>Complete the details below to request ${escapeHtml(product.name)} pricing and availability.</p>
          </div>
          ${getBuyNowFormHtml(product)}
        </div>
      </section>
    `;
  }

  function getBuyNowFormHtml(product) {
    return `
      <form class="buy-now-form" onsubmit="event.preventDefault()">
        <label class="buy-now-field">
          <span>First Name :</span>
          <input type="text" name="firstName" />
        </label>
        <label class="buy-now-field">
          <span>Last Name :</span>
          <input type="text" name="lastName" />
        </label>
        <label class="buy-now-field">
          <span>Phone Number :</span>
          <input type="tel" name="phoneNumber" />
        </label>
        <label class="buy-now-field">
          <span>Email :</span>
          <input type="email" name="email" />
        </label>
        <label class="buy-now-field">
          <span>Address :</span>
          <input type="text" name="address" />
        </label>
        <label class="buy-now-field">
          <span>Select Item :</span>
          <select name="selectItem">
            ${PRODUCT_DEFINITIONS.map((definition) => `
              <option value="${definition.name}"${definition.key === currentProductKey ? ' selected' : ''}>${definition.name}</option>
            `).join('')}
          </select>
        </label>
        <label class="buy-now-field">
          <span>Quantity :</span>
          <input type="number" name="quantity" min="1" value="1" />
        </label>
        <label class="buy-now-field buy-now-field-textarea">
          <span>Details :</span>
          <textarea name="details" rows="4"></textarea>
        </label>
      </form>
    `;
  }

  function getProductUnifiedInfoHtml(product, extraHtml = '') {
    const summaryHtml = product.summary.bodyHtml || escapeHtml(product.summary.body);
    const extraSection = extraHtml
      ? `<div class="product-unified-summary product-unified-summary-extra">${extraHtml}</div>`
      : '';
    return `
      <section class="product-unified-card" aria-label="${escapeHtml(product.name)} overview">
        <div class="product-unified-visual">
          <div class="product-unified-stage">
            <span class="product-unified-badge">Featured Product</span>
            <img src="${product.images[0]}" alt="${escapeHtml(product.name)} image 1" class="product-unified-image product-unified-image-main" />
            <img src="${product.images[1]}" alt="${escapeHtml(product.name)} image 2" class="product-unified-image product-unified-image-secondary" />
          </div>
        </div>
        <div class="product-unified-copy">
          <div class="product-unified-copy-intro">
            <p class="product-unified-kicker">${escapeHtml(product.name)} Overview</p>
            <p class="product-unified-lead">Professional teleprompter presentation with organized product visuals and readable content blocks.</p>
          </div>
          <div class="product-unified-summary">${summaryHtml}</div>
          ${extraSection}
        </div>
      </section>
    `;
  }

  function getClone16ProductVisualHtml(product, options = {}) {
    const showSecondaryImage = options.showSecondaryImage !== false && Boolean(product.images[1]);
    return `
      <div class="clone16-card-visual">
        <span class="clone16-card-badge">Clone 16</span>
        <img src="${product.images[0]}" alt="${escapeHtml(product.name)} primary product image" class="clone16-card-image clone16-card-image-primary" />
        ${showSecondaryImage ? `<img src="${product.images[1]}" alt="${escapeHtml(product.name)} secondary product image" class="clone16-card-image clone16-card-image-secondary" />` : ''}
      </div>
    `;
  }

  function getClone16MetricPillsHtml(items) {
    return `
      <div class="clone16-card-metrics">
        ${items.map((item) => `<span class="clone16-card-metric">${escapeHtml(item)}</span>`).join('')}
      </div>
    `;
  }

  function getClone16InfoCardHtml({
    product,
    kicker,
    title,
    lead,
    sectionHtml,
    metrics = [],
    showSecondaryImage = true,
    showLead = true,
    showSummary = true,
    cardClass = '',
    showHero = true
  }) {
    const summaryHtml = product.summary.bodyHtml || escapeHtml(product.summary.body);
    const metricsHtml = metrics.length ? getClone16MetricPillsHtml(metrics) : '';
    const leadHtml = showLead && lead ? `<p class="clone16-card-lead">${escapeHtml(lead)}</p>` : '';
    const summaryBlock = showSummary ? `<div class="clone16-card-summary">${summaryHtml}</div>` : '';
    const heroHtml = showHero
      ? `
        <div class="clone16-card-hero">
          <div class="clone16-card-copy">
            <p class="clone16-card-kicker">${escapeHtml(kicker)}</p>
            <h4 class="clone16-card-heading">${escapeHtml(title)}</h4>
            ${leadHtml}
            ${metricsHtml}
            ${summaryBlock}
          </div>
          ${getClone16ProductVisualHtml(product, { showSecondaryImage })}
        </div>
      `
      : '';
    return `
      <section class="clone16-card${cardClass ? ` ${escapeHtml(cardClass)}` : ''}" aria-label="${escapeHtml(title)}">
        ${heroHtml}
        ${sectionHtml}
      </section>
    `;
  }

  function getClone16ImagesInfoHtml(product) {
    return getClone16InfoCardHtml({
      product,
      kicker: 'Images Info Card',
      title: 'Application Images',
      lead: 'Product photos and real installation shots are arranged inside one responsive card for fast review.',
      metrics: ['16-inch monitor', '16:9 / 4:3', 'Portable setup'],
      sectionHtml: `
        <section class="clone16-card-panel clone16-card-panel-gallery" aria-label="Clone 16 image gallery">
          <div class="clone16-card-section-header">
            <h5>Image Gallery</h5>
            <p>Configured product shots and live-use examples without moving outside the main info card.</p>
          </div>
          ${getClone16ApplicationGalleryHtml()}
        </section>
      `
    });
  }

  function getClone16VideoInfoHtml(product) {
    const videoTitle = escapeHtml(product.video.title);
    const rawVideoSrc = product.video.src || PANEL_DEFAULT_VIDEO;
    const youtubeEmbedSrc = getYouTubeEmbedUrl(rawVideoSrc);
    const videoSrc = escapeHtml(rawVideoSrc);
    const safeYoutubeEmbedSrc = escapeHtml(youtubeEmbedSrc);
    return getClone16InfoCardHtml({
      product,
      kicker: 'Clone 16 Video',
      title: 'Clone 16 - Introduction',
      metrics: ['16-inch display', '500 cd/m²', '16:9 monitor'],
      cardClass: 'clone16-card-video-mode',
      showHero: false,
      showSecondaryImage: false,
      showLead: false,
      showSummary: false,
      sectionHtml: `
        <section class="clone16-video-layout" aria-label="Clone 16 video content">
          <div class="clone16-card-panel clone16-card-panel-video clone16-video-showcase">
            <div class="clone16-video-showcase-header">
              <div class="clone16-video-showcase-header-bar">
                <div class="clone16-card-section-header clone16-video-section-header">
                  <span class="clone16-video-kicker-chip">Clone 16 Video</span>
                  <h5>${videoTitle}</h5>
                </div>
              </div>
              <div class="clone16-video-meta" aria-label="Clone 16 video highlights">
                <span>16-inch display</span>
                <span>500 cd/m²</span>
                <span>16:9 monitor</span>
                <span>HDMI workflow</span>
              </div>
            </div>
            <div class="clone16-video-card clone16-video-stage">
              ${safeYoutubeEmbedSrc
                ? `<iframe class="clone16-inline-video clone16-inline-video-embed" src="${safeYoutubeEmbedSrc}" title="${videoTitle}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
                : `<video class="clone16-inline-video" controls playsinline preload="metadata">
                    <source src="${videoSrc}" type="video/mp4" />
                  </video>`}
            </div>
            <div class="clone16-video-stage-footer">
              <div class="clone16-video-stat-list" aria-label="Clone 16 video quick benefits">
                <span class="clone16-video-stat-pill">Portable prompting</span>
                <span class="clone16-video-stat-pill">Clear long-form reading</span>
                <span class="clone16-video-stat-pill">Fast script updates</span>
              </div>
              ${safeYoutubeEmbedSrc
                ? `<a class="clone16-video-open-link" href="${videoSrc}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>`
                : ''}
            </div>
          </div>
          <aside class="clone16-card-panel clone16-card-panel-notes clone16-video-sidepanel">
            <div class="clone16-card-section-header clone16-video-notes-header">
              <span class="clone16-video-kicker-chip">Quick specs</span>
              <h5>Core format</h5>
            </div>
            <div class="clone16-video-spec-grid" aria-label="Clone 16 video specs">
              <article class="clone16-video-spec-card">
                <strong>16"</strong>
                <span>Display</span>
              </article>
              <article class="clone16-video-spec-card">
                <strong>500</strong>
                <span>cd/m²</span>
              </article>
              <article class="clone16-video-spec-card">
                <strong>16:9</strong>
                <span>Monitor</span>
              </article>
              <article class="clone16-video-spec-card">
                <strong>HDMI</strong>
                <span>Input</span>
              </article>
            </div>
          </aside>
        </section>
      `
    });
  }

  function renderClone16VideoInfoCard() {
    const product = PRODUCTS.clone16;
    if (!product || !infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove(
      'image-card',
      'info-card-show-scrollbar',
      'info-card-slide-enter',
      'cue-series-intro-card',
      'info-card-empty-state',
      'no-match-info-state',
      'clone16-intro-info-state',
      'clone16-readmore-info-state',
      'clone16-images-info-state'
    );
    infoCard.innerHTML = getClone16VideoInfoHtml(product);
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function getClone16SpecificationTableHtml() {
    return `
      <div class="placeholder-spec-table-wrap">
        <table class="placeholder-spec-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Overall Structure</td><td>Folding Type (adjustable angle)</td></tr>
            <tr><td>Panel Size</td><td>156</td></tr>
            <tr><td>Monitor Active Area</td><td>W 560mm x H 490mm</td></tr>
            <tr><td>Resolution</td><td>1280 x 720</td></tr>
            <tr><td>Aspect Ratio</td><td>16:9, 4:3</td></tr>
            <tr><td>Monitor Brightness</td><td>400 cds</td></tr>
            <tr><td>Input Signal</td><td>HDMI/DVI/DP</td></tr>
            <tr><td>Screen Flip</td><td>Panel Built-in Board / Flip Button</td></tr>
            <tr><td>Input Power</td><td>12V SA Power Adapter</td></tr>
            <tr><td>Prompter Glass</td><td>Ultra-low iron/Tempered glass / Special coating/2mm</td></tr>
            <tr><td>Camera Plate</td><td>3-level Height Adjustment</td></tr>
            <tr><td>Body Plate</td><td>1/4, 3/8 tap hole (can be connected to various tripods)</td></tr>
            <tr><td>Body &amp; Hood</td><td>Aluminum 2.5mm (standard)</td></tr>
            <tr><td>Body &amp; Hood Surface Treatment</td><td>Black, Matte, Sanding. Anodizing, Insulation Treatment</td></tr>
            <tr><td>Lens Cover Cloth</td><td>Special anti-reflective fiber material</td></tr>
            <tr><td>Body Lens Hole Size</td><td>Width 270mm x Height 235mm</td></tr>
            <tr><td>Wireless Speed Control Remote</td><td>SW Play &amp; Stop, speed control within 10m range</td></tr>
            <tr><td>Product Folding Size</td><td>W 410mm x D 380mm x H 210mm</td></tr>
            <tr><td>Product Body Size</td><td>W 410mm x D 260mm x H 310mm (excluding plate)</td></tr>
            <tr><td>Product Overall Size</td><td>W 410mm x D 520mm x H 310mm</td></tr>
            <tr><td>Product Overall Weight</td><td>6.98 kg</td></tr>
            <tr><td>Hard Case</td><td>Wood &amp; Plastic combination (optional purchase)</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function getClone16SpecificationInfoHtml(product) {
    return getClone16InfoCardHtml({
      product,
      kicker: 'Specification Info Card',
      title: 'Technical Specification',
      lead: 'The full specification table is grouped with the product summary so the content reads as one clean technical card.',
      metrics: ['1280 x 720', 'HDMI / DVI / DP', '6.98 kg'],
      showSecondaryImage: false,
      sectionHtml: `
        <section class="clone16-spec-layout" aria-label="Clone 16 specification details">
          <aside class="clone16-card-panel clone16-card-panel-notes">
            <div class="clone16-card-section-header">
              <h5>Key Points</h5>
              <p>${escapeHtml(product.specification.body)}</p>
            </div>
            <ul class="clone16-card-list">
              <li>16-inch widescreen display with switchable 16:9 and 4:3 aspect ratios.</li>
              <li>Built-in screen flip support for flexible prompting orientation.</li>
              <li>Aluminum body and foldable structure for transport and repeat setup.</li>
            </ul>
          </aside>
          <div class="clone16-card-panel clone16-card-panel-spec">
            <div class="clone16-card-section-header">
              <h5>Specification Table</h5>
              <p>Scrollable on small screens without breaking the card layout.</p>
            </div>
            ${getClone16SpecificationTableHtml()}
          </div>
        </section>
      `
    });
  }

  function getClone16SpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="Clone 16 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">Clone 16 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openClone16Brochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openClone16MobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
            <div class="clone16-spec-image-meta" aria-label="Clone 16 specification highlights">
              <span>16-inch</span>
              <span>500 cd/m²</span>
              <span>16:9</span>
            </div>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://static.wixstatic.com/media/d0630a_079ce8e28dcb4f42b37249321d11a02d~mv2.png/v1/fill/w_971,h_1174,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016.png"
              alt="Clone 16 specifications"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getCue24SpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="Cue 24 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">Cue 24 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openCue24Brochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openCue24MobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://static.wixstatic.com/media/d0630a_b47696bb2b2c47e8a2584ee5906edb07~mv2.png/v1/fill/w_488,h_574,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Cue%2024.png"
              alt="Cue 24 technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getCue27SpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="Cue 27 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">Cue 27 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openCue27Brochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openCue27MobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://static.wixstatic.com/media/d0630a_1157c76add834be68349f813012f85bb~mv2.png/v1/fill/w_492,h_586,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Cue%2027.png"
              alt="Cue 27 technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getCue32SpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="Cue 32 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">Cue 32 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openCue32Brochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openCue32MobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://static.wixstatic.com/media/d0630a_5f68de7b66ec46f591254ac8dbd89e07~mv2.png/v1/fill/w_481,h_568,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Cue%2032.png"
              alt="Cue 32 technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getFolder22NSpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="Folder 22N specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">Folder 22N Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openFolder22NBrochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openFolder22NMobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://static.wixstatic.com/media/d0630a_30ab1fb89a614b6bbb9bd1d66ca814f5~mv2.png/v1/fill/w_490,h_595,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/FOLDER%2022N.png"
              alt="Folder 22N technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getLessonQSpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="LessonQ 24 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">LessonQ 24 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openLessonQBrochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openLessonQMobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://www.dropbox.com/scl/fi/tzbgc3ysxfr1evns2x28m/LessonQ-24.png?rlkey=lmqfpoh748aeyyiee1jt4gak9&raw=1"
              alt="LessonQ 24 technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function getLessonQ27SpecificationImageInfoHtml() {
    return `
      <section class="clone16-spec-image-card" aria-label="LessonQ 27 specifications">
        <div class="clone16-spec-image-card-header">
          <div class="clone16-spec-image-header-copy">
            <p class="clone16-spec-image-eyebrow">LessonQ 27 Specification</p>
            <h3 class="clone16-spec-image-kicker">Specifications</h3>
          </div>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-desktop"
            onclick="openLessonQ27Brochure()"
          >Click Here to view Brochure -&gt;&gt;</button>
          <button
            type="button"
            class="clone16-spec-brochure-link clone16-spec-brochure-link-mobile"
            onclick="openLessonQ27MobileBrochure()"
          >Click Here to view Mobile -&gt;&gt;</button>
        </div>
        <div class="clone16-spec-image-shell">
          <div class="clone16-spec-image-titlebar">
            <span class="clone16-spec-image-title">Technical Sheet</span>
          </div>
          <div class="clone16-spec-image-frame">
            <img
              src="https://1drv.ms/i/c/94a3066e2e4acdae/IQTn8Ukz2fevTqYg9kwqoMbpAXUZ-dYoZfoLwb-hMU6mBA0"
              alt="LessonQ 27 technical sheet"
              class="clone16-spec-image-asset"
            />
          </div>
        </div>
      </section>
    `;
  }

  function renderClone16SpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getClone16SpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderCue24SpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getCue24SpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderCue27SpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getCue27SpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderCue32SpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getCue32SpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderFolder22NSpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getFolder22NSpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderLessonQSpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getLessonQSpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderLessonQ27SpecificationInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-spec-image-state');
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getLessonQ27SpecificationImageInfoHtml();
    updateClone16BrochureButtonState();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function renderProductInstallationInfoCard(product = getCurrentProduct()) {
    if (!product || !infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove(
      'image-card',
      'info-card-empty-state',
      'no-match-info-state',
      'clone16-intro-info-state',
      'clone16-readmore-info-state',
      'clone16-images-info-state',
      'clone16-spec-image-state'
    );
    infoCard.classList.toggle('info-card-show-scrollbar', true);
    infoCard.innerHTML = getProductInstallationInfoHtml(product);
    updateClone16InstallationDesktopOnlyVisibility();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function isClone16BrochureDesktopViewport() {
    return window.matchMedia('(min-width: 961px)').matches;
  }

  function isClone16BrochureMobileViewport() {
    return !isClone16BrochureDesktopViewport();
  }

  function updateClone16BrochureButtonState() {
    const isDesktop = isClone16BrochureDesktopViewport();
    const desktopButton = document.querySelector('.clone16-spec-brochure-link-desktop');
    const mobileButton = document.querySelector('.clone16-spec-brochure-link-mobile');

    if (desktopButton) {
      desktopButton.disabled = !isDesktop;
      desktopButton.setAttribute('aria-disabled', String(!isDesktop));
      desktopButton.title = isDesktop
        ? 'Open brochure in popup window'
        : 'Brochure popup is available on desktop only.';
    }

    if (mobileButton) {
      mobileButton.disabled = isDesktop;
      mobileButton.setAttribute('aria-disabled', String(isDesktop));
      mobileButton.title = isDesktop
        ? 'Mobile brochure popup is available on mobile only.'
        : 'Open mobile brochure in popup window';
    }
  }

  function openClone16Brochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQBnSJjY-rlRT6Wmyx55p0L_AS2z4vts_iKVEOCphq3lfa4?e=J4zOL0';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'clone16Brochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openClone16MobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQB0zquiExYtS6pXzWZiKyIeAUZNSMLVaXsfRhA6mzQL3RE?e=6cZiPD';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'clone16MobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openCue24Brochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQBkgJKicHuqSLBmTbEfBCs5AW8x20nYsojSWPYcYUTA0wA?e=Gh2OjJ';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue24Brochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openCue24MobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQAQFXNvfCPtSaAsU2XkoBr8AUnN_haULdmOMZF-vwNx63c?e=pfT1gl';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue24MobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openCue27Brochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQB9g6TUOFA4R419pkVb8QzDAe9HMik-Oq2BqUoGuAGgkZ4?e=Fbnn9j';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue27Brochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openCue27MobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQDbD-xVaj-eQq0GUq-EIXwyAbxgsNElxPcqfZpX8IIoNao?e=nBvqiu';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue27MobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openCue32Brochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQAl3FQepTdKRoplovpLzAmHAVmSHlpbyx9zsdZHeJr-JKk?e=xNXpyN';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue32Brochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openCue32MobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQAsMmcmo9wuT5Rsawn5uTmXAcXptcUsIG5F7jFCvMwWS7E?e=XsbrM9';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'cue32MobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openFolder22NBrochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQALPzR2XTHmTppru2Q9RvfbAdfvmFJwRRqEDJF3FWETY4Q?e=XnhhU0';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'folder22nBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openFolder22NMobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQDsbg_Yx7XBTLZdZa2S5CfTAW_3kHf963OFPIZWIwbsECk?e=kl0wcZ';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'folder22nMobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openLessonQBrochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQDW1DD_lM8EQbJNkOYGkgM1AV1iQ48qdhvDdzSEn67UMw0?e=VpEksU';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'lessonQBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openLessonQMobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQA3ayi96WxESoNG2T0mHxkiAfbKzNhw9-Ox90N3RsMNzhg?e=jhUgV0';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'lessonQMobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  function openLessonQ27Brochure() {
    if (!isClone16BrochureDesktopViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQRUzYa6_0XoTpnMbXHXvlAgAePL9yEyTjKav0clYYsesMw';
    const popupWidth = Math.max(720, Math.floor(window.outerWidth * 0.5));
    const popupHeight = Math.max(760, Math.floor(window.outerHeight * 0.88));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'lessonQ27Brochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the brochure.');
  }

  function openLessonQ27MobileBrochure() {
    if (!isClone16BrochureMobileViewport()) {
      return;
    }

    const brochureUrl = 'https://1drv.ms/b/c/94a3066e2e4acdae/IQBn2IpYenEaToIw6GYTENldAX6Xx5mbSNXqZEikfpFijSU?e=fccbsm';
    const popupWidth = Math.max(320, Math.floor(window.outerWidth * 0.92));
    const popupHeight = Math.max(520, Math.floor(window.outerHeight * 0.78));
    const popupLeft = window.screenX + Math.max(0, Math.floor((window.outerWidth - popupWidth) / 2));
    const popupTop = window.screenY + Math.max(0, Math.floor((window.outerHeight - popupHeight) / 2));
    const popup = window.open(
      brochureUrl,
      'lessonQ27MobileBrochure',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
      return;
    }

    window.alert('Please allow pop-up windows to view the mobile brochure.');
  }

  const CLONE16_WINDOWS_KOREAN_DOWNLOAD_URL = 'https://github.com/Soojung-Kang/Crystal-Teleprompter-Releases/releases/download/v2.6.2/CrystalPrompter-KR-Setup-2.6.2-win.exe?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExcWx3b1hHMlh0UlI3dENZcHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6sOeMLD-o-eH2JASZnGp9JfTAwxJMq0taUVtlhXb7tmIWRtgne0IqBIld1Fg_aem_kImVGf3YRIpmPaTK92X-cw';
  const CLONE16_INSTALLATION_GUIDE_EMBED_URL = 'https://www.youtube.com/embed/qAH4Op5iGHk?si=DF932_xennbuwvz4&autoplay=1&rel=0&playsinline=1';
  const CLONE16_MAC_SILICON_GLOBAL_DOWNLOAD_URL = 'https://github.com/Soojung-Kang/Crystal-Teleprompter-Releases/releases/download/v2.6.2/CrystalPrompter-Global-2.6.2-mac-arm64.dmg?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExcWx3b1hHMlh0UlI3dENZcHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6EfZztpL6zGDy2qfjjKoaC6hkQzD0VbpadQuYD8S3LJqFOa84sPfJiT-O2NA_aem_rhEs--noUKMf0Ud1m15R9Q';
  const CLONE16_MAC_INTEL_GLOBAL_DOWNLOAD_URL = 'https://github.com/Soojung-Kang/Crystal-Teleprompter-Releases/releases/download/v2.6.2/CrystalPrompter-Global-2.6.2-mac-x64.dmg?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExcWx3b1hHMlh0UlI3dENZcHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6DcejeudtCn6t4TWKi0cGmV2C01BJ3RvRCqYdAwV1MK-luD4LwpGIeROF-dw_aem_qkCIguxHtqEdCafs7ToN8w';
  const CLONE16_MAC_INSTALLATION_GUIDE_EMBED_URL = 'https://www.youtube.com/embed/hck8hsSO3FQ?si=Foi7e6_3OsfA9qwb&autoplay=1&rel=0&playsinline=1';

  function isClone16MobileOrTabletClient() {
    const userAgent = navigator.userAgent || '';
    const maxTouchPoints = Number(navigator.maxTouchPoints || 0);
    return /android|iphone|ipad|ipod|mobile|tablet|silk|kindle|playbook/i.test(userAgent)
      || (/macintosh/i.test(userAgent) && maxTouchPoints > 1);
  }

  function isClone16WindowsDesktopClient() {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.userAgentData?.platform || navigator.platform || '';
    const isWindows = /windows/i.test(userAgent) || /^win/i.test(platform);
    const isDesktopViewport = window.matchMedia('(min-width: 1025px)').matches;
    return isWindows && !isClone16MobileOrTabletClient() && isDesktopViewport;
  }

  function isClone16MacDesktopClient() {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.userAgentData?.platform || navigator.platform || '';
    const isMac = /macintosh|mac os x/i.test(userAgent) || /^mac/i.test(platform);
    const isDesktopViewport = window.matchMedia('(min-width: 1025px)').matches;
    return isMac && !isClone16MobileOrTabletClient() && isDesktopViewport;
  }

  function updateClone16InstallationDesktopOnlyVisibility() {
    const windowsDesktopElements = document.querySelectorAll('[data-clone16-windows-desktop-only]');
    const macDesktopElements = document.querySelectorAll('[data-clone16-mac-desktop-only]');
    const showWindowsDesktop = isClone16WindowsDesktopClient();
    const showMacDesktop = isClone16MacDesktopClient();

    windowsDesktopElements.forEach((element) => {
      element.hidden = !showWindowsDesktop;
      element.setAttribute('aria-hidden', String(!showWindowsDesktop));
    });

    macDesktopElements.forEach((element) => {
      element.hidden = !showMacDesktop;
      element.setAttribute('aria-hidden', String(!showMacDesktop));
    });
  }

  function playClone16InstallationEmbed(button) {
    const shell = button?.closest('.clone16-install-video-shell');
    if (!shell) return;
    const embedUrl = shell.getAttribute('data-embed-src');
    if (!embedUrl) return;
    shell.classList.add('is-playing');
    shell.innerHTML = `
      <h5 class="clone16-install-video-heading">Installation Guide Video</h5>
      <iframe
        class="clone16-install-video-embed"
        width="560"
        height="315"
        src="${escapeHtml(embedUrl)}"
        title="Installation Guide Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    `;
  }

  function getProductInstallationInfoHtml(product) {
    const downloadUrl = escapeHtml(CLONE16_WINDOWS_KOREAN_DOWNLOAD_URL);
    const guideVideoEmbedUrl = escapeHtml(CLONE16_INSTALLATION_GUIDE_EMBED_URL);
    const macSiliconDownloadUrl = escapeHtml(CLONE16_MAC_SILICON_GLOBAL_DOWNLOAD_URL);
    const macIntelDownloadUrl = escapeHtml(CLONE16_MAC_INTEL_GLOBAL_DOWNLOAD_URL);
    const macGuideVideoEmbedUrl = escapeHtml(CLONE16_MAC_INSTALLATION_GUIDE_EMBED_URL);
    return getClone16InfoCardHtml({
      product,
      kicker: 'Installation Info Card',
      title: 'Installation',
      showHero: false,
      showLead: false,
      showSummary: false,
      metrics: [],
      sectionHtml: `
        <section class="clone16-install-layout" aria-label="${escapeHtml(product.name)} installation resources">
          <div class="clone16-card-panel clone16-card-panel-notes">
            <div class="clone16-install-desktop-stack" data-clone16-windows-desktop-only hidden aria-hidden="true">
              <a
                class="clone16-install-download-link"
                href="${downloadUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >Windows 64bit Global version</a>
              <div class="clone16-install-video-shell">
                <h5 class="clone16-install-video-heading">Installation Guide Video</h5>
                <iframe
                  class="clone16-install-video-embed"
                  width="560"
                  height="315"
                  src="${guideVideoEmbedUrl}"
                  title="Installation Guide Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
            <div class="clone16-install-desktop-stack" data-clone16-mac-desktop-only hidden aria-hidden="true">
              <a
                class="clone16-install-download-link"
                href="${macSiliconDownloadUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >Mac Silicon Global version</a>
              <a
                class="clone16-install-download-link"
                href="${macIntelDownloadUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >Mac Intel Global version</a>
              <div class="clone16-install-video-shell" data-embed-src="${macGuideVideoEmbedUrl}">
                <h5 class="clone16-install-video-heading">Installation Guide Video</h5>
                <button
                  type="button"
                  class="clone16-install-video-launch"
                  onclick="playClone16InstallationEmbed(this)"
                  aria-label="Play installation guide video"
                >
                  <span class="clone16-install-video-launch-icon" aria-hidden="true"></span>
                </button>
              </div>
            </div>
          </div>
        </section>
      `
    });
  }

  const PRODUCT_SHOWCASE_META = {
    clone16: 'Clone 16 | Portable HDMI Teleprompter',
    cue24: 'Cue 24 | Cue Series Teleprompter',
    cue27: 'Cue 27 | Cue Series Teleprompter',
    cue32: 'Cue 32 | Cue Series Teleprompter',
    adamas19: 'Adamas 19 | Adamas Prompt Line',
    adamas22: 'Adamas 22 | Adamas Prompt Line',
    adamas24: 'Adamas 24 | Adamas Prompt Line',
    framer24: 'Framer 24 | Framer Prompt Line',
    framer27: 'Framer 27 | Framer Prompt Line',
    framer32: 'Framer 32 | Framer Prompt Line',
    folder22n: 'Foldable Prompt System',
    lessonQ24: 'LessonQ 24 | Education Prompt Line',
    lessonQ27: 'LessonQ 27 | Education Prompt Line',
    lessonQ32: 'LessonQ 32 | Education Prompt Line',
    lessonQ43: 'LessonQ 43 | Education Prompt Line',
    mime24: 'Mime 24 | Monitor Prompt Line',
    mime27: 'Mime 27 | Monitor Prompt Line',
    mime32: 'Mime 32 | Monitor Prompt Line',
    speech19: 'Speech 19 | Speech Prompt Line',
    speech22: 'Speech 22 | Speech Prompt Line',
    speech24: 'Speech 24 | Speech Prompt Line',
    tab12: 'Compact Tablet Prompt System',
    ultra43: 'Ultra 43 | Large-format Prompt Line',
    ultra55: 'Ultra 55 | Large-format Prompt Line',
    flex15: 'Flexible Mid-size Prompt System',
    rotunda15: 'Compact Creator Prompt System',
    olleson18: '18-inch Presentation Prompt System',
    plate: 'Mounting and Support Component',
    electricPedestal: 'Electric Pedestal | Motorized Studio Support',
    ep30k: 'EP 30K | Electric Pedestal Line',
    ep40k: 'EP 40K | Electric Pedestal Line',
    ep50k: 'EP 50K | Electric Pedestal Line',
    ep60k: 'EP 60K | Electric Pedestal Line'
  };

  const PRODUCT_INTRO_IMAGE_MAP = {
    tab12: {
      src: 'assets/Tab 12 - Intro.png',
      alt: 'Tab 12 - Intro'
    }
  };

  function getProductSummaryStripText(product) {
    if (!product || !product.summary || !product.summary.body) return '';
    if (product.key === 'clone16') {
      return 'The Clone 16 teleprompter is designed for portable, reliable prompting in studio and on-location workflows.';
    }
    const text = product.summary.body.trim();
    return text.length > 120 ? `${text.slice(0, 117).trimEnd()}...` : text;
  }

  function shouldUseShowcaseLayout(productKey, section = 'summary') {
    return Boolean(PRODUCTS[productKey]);
  }

  function getProductShowcaseHtml(product) {
    const summaryHtml = product.summary.bodyHtml || escapeHtml(product.summary.body);
    const showcaseMeta = PRODUCT_SHOWCASE_META[product.key] || '';
    return `
      <section class="cue-series-showcase" aria-label="Cue Series showcase">
        <div class="cue-series-showcase-copy">
          <p class="cue-series-kicker">Our Top Picks For You</p>
          <p class="cue-series-subtitle">Explore Our Latest Recommended Products</p>
          <span class="cue-series-accent" aria-hidden="true"></span>
          <h4 class="cue-series-title">${escapeHtml(product.name)}</h4>
          ${showcaseMeta ? `<p class="cue-series-models">${escapeHtml(showcaseMeta)}</p>` : ''}
          <div class="cue-series-summary">${summaryHtml}</div>
        </div>
        <div class="cue-series-showcase-visual">
          <div class="cue-series-image-shell cue-series-image-shell-hero">
            <img src="${product.images[0]}" alt="${escapeHtml(product.name)} product image" class="cue-series-image cue-series-image-hero" />
          </div>
        </div>
      </section>
    `;
  }

  const scriptedFaq = [
    ...PRODUCT_DEFINITIONS.map((definition) => ({
      id: `product_${definition.key}`,
      label: definition.name,
      productKey: definition.key,
      phrases: [
        definition.name.toLowerCase(),
        ...definition.aliases.map((alias) => alias.toLowerCase()),
        ...definition.aliases.map((alias) => `show ${alias.toLowerCase()}`),
        ...definition.aliases.map((alias) => `select ${alias.toLowerCase()}`),
        ...definition.aliases.map((alias) => `what is ${alias.toLowerCase()}`)
      ],
      keywords: definition.name.toLowerCase().split(/[\s]+/).filter(Boolean)
    })),
    {
      id: 'about_us',
      label: 'About Us',
      phrases: [
        'about us',
        'who is crystal prompter',
        'what is crystal prompter',
        'about crystal prompter'
      ],
      keywords: ['about', 'company', 'us', 'crystal', 'prompter']
    },
    {
      id: 'product_list',
      label: 'Product List',
      phrases: [
        'product list',
        'products list',
        'list of products',
        'show product list',
        'show products',
        'show me products',
        'all products',
        'products',
        'catalog',
        'product loist'
      ],
      keywords: ['product', 'products', 'list', 'listing', 'catalog']
    },
    {
      id: 'images',
      label: 'Images',
      phrases: [
        'image',
        'images',
        'img',
        'imgs',
        'show images',
        'show me images',
        'product images',
        'picture',
        'pictures',
        'pic',
        'pics',
        'photos',
        'gallery'
      ],
      keywords: ['image', 'images', 'img', 'imgs', 'photo', 'photos', 'gallery', 'picture', 'pic', 'pics']
    },
    {
      id: 'videos',
      label: 'Videos',
      phrases: [
        'video',
        'videos',
        'vid',
        'vids',
        'vido',
        'vidos',
        'vdo',
        'vdos',
        'vedio',
        'vedios',
        'vdeo',
        'vdeos',
        'show videos',
        'show me videos',
        'show video',
        'play video',
        'play videos',
        'video demo',
        'videos demo',
        'product video'
      ],
      keywords: ['video', 'videos', 'vid', 'vids', 'vido', 'vidos', 'vdo', 'vdos', 'vedio', 'vedios', 'vdeo', 'vdeos', 'demo', 'play', 'intro', 'introduction']
    },
    {
      id: 'specification',
      label: 'Specification',
      phrases: [
        'spec',
        'specs',
        'specification',
        'specifications',
        'specification details',
        'spec details',
        'technical spec',
        'technical specs',
        'tech spec',
        'tech specs',
        'spc',
        'specfication',
        'specfications',
        'spefication',
        'spefications',
        'spesification',
        'spesifications',
        'what are the specifications'
      ],
      keywords: ['spec', 'specs', 'spc', 'specification', 'specifications', 'specfication', 'specfications', 'spefication', 'spefications', 'spesification', 'spesifications', 'detail', 'details', 'technical', 'tech']
    },
    {
      id: 'installation',
      label: 'Installation',
      phrases: [
        'instal',
        'installation',
        'installations',
        'install',
        'instalation',
        'instalations',
        'installation guide',
        'install guide',
        'how to install',
        'setup',
        'set up',
        'setups',
        'set up guide',
        'setup guide',
        'config',
        'configuration',
        'how to set up'
      ],
      keywords: ['install', 'instal', 'installation', 'installations', 'instalation', 'instalations', 'setup', 'set', 'guide', 'config', 'configuration', 'mount', 'connect', 'hdmi']
    },
    {
      id: 'buy_now',
      label: 'Buy Now',
      phrases: [
        'buy now',
        'buy',
        'how to buy',
        'purchase',
        'order now'
      ],
      keywords: ['buy', 'purchase', 'order', 'price', 'contact', 'sales']
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSocialLinksHtml() {
    return `
      <div class="social-strip" aria-label="Crystal Prompter social media">
        <a class="social-icon-button" href="https://www.facebook.com/crystalprompter/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#1877F2"/>
            <path fill="#fff" d="M13.5 20v-6.3h2.1l.3-2.5h-2.4V9.7c0-.7.2-1.2 1.2-1.2h1.3V6.3c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.3v1.7H8.8v2.5H11V20h2.5z"/>
          </svg>
        </a>
        <a class="social-icon-button" href="https://www.instagram.com/crystalprompter_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#feda75"/>
                <stop offset="35%" stop-color="#fa7e1e"/>
                <stop offset="60%" stop-color="#d62976"/>
                <stop offset="82%" stop-color="#962fbf"/>
                <stop offset="100%" stop-color="#4f5bd5"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagramGradient)"/>
            <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="4" fill="none" stroke="#fff" stroke-width="1.7"/>
            <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" stroke-width="1.7"/>
            <circle cx="17" cy="7.4" r="1.2" fill="#fff"/>
          </svg>
        </a>
        <a class="social-icon-button" href="https://www.youtube.com/@i_crystal_river" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF0000"/>
            <path d="M10 9.2v5.6l5-2.8-5-2.8z" fill="#fff"/>
          </svg>
        </a>
        <a class="social-icon-button" href="https://www.tiktok.com/@crystal_prompter" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#25F4EE" d="M14.4 3.5v2.1c.8.8 1.8 1.3 2.9 1.5V10c-1.1-.1-2-.5-2.9-1.1v5.2a4.9 4.9 0 1 1-4.9-4.9c.2 0 .5 0 .7.1v2.7a2.3 2.3 0 1 0 1.6 2.2V3.5h2.6z"/>
            <path fill="#FE2C55" d="M15 3.5c.2 1.1.8 2.1 1.7 2.8.4.3.9.6 1.5.8v2.6c-.9-.1-1.7-.3-2.4-.7v5.1a4.9 4.9 0 1 1-6-4.8v2.8a2.3 2.3 0 1 0 2.5 2.2V3.5H15z" opacity="0.9"/>
            <path fill="#111" d="M14.8 2.6c.2 1.2.9 2.3 1.8 3 .8.6 1.7 1 2.7 1.1v2.6c-1.2 0-2.3-.3-3.3-.9v5.5a5.4 5.4 0 1 1-6.2-5.3v2.8a2.6 2.6 0 1 0 3.3 2.5V2.6h1.7z"/>
          </svg>
        </a>
      </div>
    `;
  }

  function playInfoCardAnimation(animationName) {
    if (!infoCard) return;
    infoCard.classList.remove('info-card-slide-enter');
    if (animationName !== 'slide') return;
    void infoCard.offsetWidth;
    infoCard.classList.add('info-card-slide-enter');
  }

  function setInfoCardText(title, body, useHtml = false, options = {}) {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    const includeSocial = Boolean(options.includeSocial);
    const animation = options.animation || '';
    const contentClass = animation === 'slide' ? ' info-card-content-slide-enter' : '';
    infoCard.classList.toggle('info-card-show-scrollbar', Boolean(options.showScrollbar));
    const formattedBody = useHtml ? body : escapeHtml(body);
    const titleHtml = title ? `<h3>${escapeHtml(title)}</h3>` : '';
    const bodyHtml = useHtml
      ? `<div class="info-card-body">${formattedBody}</div>`
      : `<p class="info-card-body">${formattedBody}</p>`;
    infoCard.innerHTML = `
      <div class="info-card-content${contentClass}">
        ${titleHtml}
        ${bodyHtml}
        ${includeSocial ? `<div class="info-card-social-wrap">${getSocialLinksHtml()}</div>` : ''}
      </div>
    `;
    resetInfoCardAutoScroll();
    playInfoCardAnimation(animation);
    scheduleCueSeriesAvatarHeightSync();
    if (infoCard && infoCard.matches(':hover')) restartInfoCardAutoScroll();
  }

  function clearInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.innerHTML = '';
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function showEmptyInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('info-card-empty-state');
    infoCard.innerHTML = '<div class="info-card-empty-shell" aria-hidden="true"></div>';
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function getInitialInfoCardHtml() {
    return `
      <section class="initial-info-card" aria-label="Multimedia Content">
        <div class="initial-info-card-copy-block">
          <p class="initial-info-card-label">Multimedia Content</p>
          <p class="initial-info-card-description">Ask a question or choose a quick action to display the related multimedia materials here.</p>
        </div>
        <div class="initial-info-card-hint" aria-label="Multimedia hint">
          <span class="initial-info-card-gallery" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="presentation">
              <rect x="7" y="11" width="34" height="24" rx="6" />
              <path d="M15 28l6-7 5 5 4-4 6 6" />
              <circle cx="18" cy="18" r="2.5" />
            </svg>
          </span>
          <p class="initial-info-card-copy">If you select a question,</p>
          <p class="initial-info-card-copy">related multimedia materials are displayed.</p>
        </div>
      </section>
    `;
  }

  function getClone16IntroInfoCardHtml(product) {
    return `
      <section class="product-intro-info-card clone16-product-intro-card" aria-label="${escapeHtml(product.name)} intro">
        <div class="product-intro-info-card-copy">
          <div class="product-intro-info-card-copy-main">
            <div class="product-intro-info-card-title-block">
              <h3 class="product-intro-info-card-title">Clone 16</h3>
              <p class="product-intro-info-card-lead">Portable HDMI teleprompter</p>
            </div>
          </div>
          <div class="product-intro-info-card-specline" aria-label="Clone 16 quick specs">
            <span>16-inch display</span>
            <span>500 cd/m²</span>
            <span>16:9 monitor</span>
          </div>
          <div class="product-intro-info-card-metric-grid" aria-label="Clone 16 key metrics">
            <article class="product-intro-info-card-metric">
              <strong>16"</strong>
              <span>Display</span>
            </article>
            <article class="product-intro-info-card-metric">
              <strong>HDMI</strong>
              <span>Input</span>
            </article>
            <article class="product-intro-info-card-metric">
              <strong>16:9</strong>
              <span>View</span>
            </article>
          </div>
          <div class="product-intro-info-card-footer">
            <button type="button" class="product-intro-read-more" onclick="showClone16IntroReadMore()">Read More</button>
          </div>
        </div>
        <div class="product-intro-info-card-visual" aria-hidden="true">
          <div class="product-intro-info-card-image-shell">
            <span class="product-intro-info-card-visual-label">Clone 16</span>
            <span class="product-intro-info-card-visual-orbit product-intro-info-card-visual-orbit-a"></span>
            <span class="product-intro-info-card-visual-orbit product-intro-info-card-visual-orbit-b"></span>
            <div class="product-intro-info-card-floating-specs">
              <span class="product-intro-info-card-floating-spec">Portable</span>
              <span class="product-intro-info-card-floating-spec">HDMI</span>
              <span class="product-intro-info-card-floating-spec">Ready</span>
            </div>
            <div class="product-intro-info-card-image-wrap">
              <img src="${product.images[0]}" alt="${escapeHtml(product.name)} featured image" class="product-intro-info-card-image" />
              ${product.images[1] ? `<img src="${product.images[1]}" alt="${escapeHtml(product.name)} secondary image" class="product-intro-info-card-image product-intro-info-card-image-secondary" />` : ''}
            </div>
            <span class="product-intro-info-card-visual-floor" aria-hidden="true"></span>
          </div>
        </div>
      </section>
    `;
  }

  function renderClone16IntroInfoCard() {
    const product = PRODUCTS.clone16;
    if (!product || !infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-intro-info-state');
    infoCard.innerHTML = getClone16IntroInfoCardHtml(product);
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function getClone16ImagesFeatureInfoCardHtml() {
    return `
      <section class="clone16-images-feature-card" aria-label="Clone 16 key attractions">
        <div class="clone16-images-feature-slides">
          ${CLONE16_IMAGES_FEATURE_SLIDES.map((slide, index) => `
            <article class="clone16-images-feature-slide${index === 0 ? ' active' : ''}" aria-label="Clone 16 key attraction ${index + 1}">
              <div class="clone16-images-feature-copy">
                <p class="clone16-images-feature-kicker">Clone 16 Images</p>
                <h3 class="clone16-images-feature-title">${escapeHtml(slide.subtitle || slide.question || 'Clone 16')}</h3>
                <div class="clone16-images-feature-specs" aria-label="Clone 16 image specs">
                  <span>16-inch display</span>
                  <span>500 cd/m²</span>
                  <span>16:9 monitor</span>
                </div>
                <div class="clone16-images-feature-meta" aria-label="Clone 16 image slide info">
                  <span class="clone16-images-feature-meta-item">View ${index + 1}</span>
                  <span class="clone16-images-feature-meta-item">Portable setup</span>
                </div>
              </div>
              <div class="clone16-images-feature-visual" aria-hidden="true">
                <span class="clone16-images-feature-visual-tag">Preview ${index + 1}</span>
                <img src="${slide.image}" alt="Clone 16 key attraction image ${index + 1}" class="clone16-images-feature-image" />
              </div>
            </article>
          `).join('')}
        </div>
        <div class="clone16-images-feature-footer" aria-label="Clone 16 image shortcuts">
          <button type="button" class="clone16-images-feature-link" onclick="showClone16ApplicationsInfoCard()">Applications</button>
          <button type="button" class="clone16-images-feature-link" onclick="showClone16ComponentsInfoCard()">Components and Parts</button>
        </div>
      </section>
    `;
  }

  function updateClone16ImagesFeatureSlides() {
    if (!infoCard) return;
    const slides = Array.from(infoCard.querySelectorAll('.clone16-images-feature-slide'));
    if (!slides.length) return;
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === clone16ImagesFeatureSlideIndex);
    });
  }

  function renderClone16ImagesFeatureInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    clone16ImagesFeatureSlideIndex = 0;
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state');
    infoCard.classList.add('clone16-images-info-state');
    infoCard.innerHTML = getClone16ImagesFeatureInfoCardHtml();
    updateClone16ImagesFeatureSlides();
    if (CLONE16_IMAGES_FEATURE_SLIDES.length > 1) {
      clone16ImagesFeatureAutoplayTimer = window.setInterval(() => {
        clone16ImagesFeatureSlideIndex = (clone16ImagesFeatureSlideIndex + 1) % CLONE16_IMAGES_FEATURE_SLIDES.length;
        updateClone16ImagesFeatureSlides();
      }, 5000);
    }
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function getClone16ApplicationsInfoCardHtml() {
    return `
      <section class="clone16-subview-card clone16-subview-applications" aria-label="Clone 16 applications">
        <div class="clone16-subview-applications-topbar">
          <div class="clone16-subview-header clone16-subview-applications-copy">
            <p class="clone16-subview-kicker">Applications</p>
            <h3 class="clone16-subview-title">Clone 16 in real-world production</h3>
            <div class="clone16-applications-specline" aria-label="Clone 16 application categories">
              <span>Education</span>
              <span>Publishing</span>
              <span>Culinary</span>
              <span>Studio</span>
            </div>
          </div>
          <button type="button" class="clone16-subview-back-button clone16-subview-back-button-below" onclick="showClone16ImagesFeatureInfoCard()">
            <span aria-hidden="true">←</span>
            <span>Back to Images</span>
          </button>
        </div>
        <div class="clone16-subview-gallery-shell">
          ${getClone16ApplicationGalleryHtml()}
        </div>
      </section>
    `;
  }

  function renderClone16ApplicationsInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state');
    infoCard.classList.add('clone16-images-info-state');
    infoCard.innerHTML = getClone16ApplicationsInfoCardHtml();
    bindClone16ApplicationsGallery();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function getClone16ApplicationsPreviewInfoCardHtml(imageSrc, imageAlt) {
    return `
      <section class="clone16-subview-card clone16-subview-application-preview" aria-label="Clone 16 application image preview">
        <div class="clone16-subview-header-top">
          <button type="button" class="clone16-subview-back-button" onclick="showClone16ApplicationsInfoCard()">
            <span aria-hidden="true">←</span>
            <span>Back to Applications</span>
          </button>
        </div>
        <div class="clone16-application-preview-stage">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" class="clone16-application-preview-image" />
        </div>
      </section>
    `;
  }

  function renderClone16ApplicationImagePreview(imageSrc, imageAlt) {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state');
    infoCard.classList.add('clone16-images-info-state');
    infoCard.innerHTML = getClone16ApplicationsPreviewInfoCardHtml(imageSrc, imageAlt);
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function bindClone16ApplicationsGallery() {
    if (!infoCard) return;
    const tiles = Array.from(infoCard.querySelectorAll('.clone16-subview-applications .application-gallery-item'));
    if (!tiles.length) return;

    const openPreview = (tile) => {
      const image = tile.querySelector('img');
      if (!image) return;
      renderClone16ApplicationImagePreview(image.currentSrc || image.src, image.alt || 'Clone 16 application image');
    };

    tiles.forEach((tile) => {
      tile.addEventListener('click', () => {
        openPreview(tile);
      });
      tile.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openPreview(tile);
      });
    });
  }

  function updateClone16ComponentsImages() {
    if (!infoCard) return;
    const frames = Array.from(infoCard.querySelectorAll('.clone16-components-gallery-frame'));
    if (!frames.length) return;
    frames.forEach((frame, index) => {
      frame.classList.toggle('active', index === clone16ComponentsImageIndex);
    });
    const counter = infoCard.querySelector('.clone16-components-gallery-counter');
    if (counter) {
      counter.textContent = `${clone16ComponentsImageIndex + 1} / ${frames.length}`;
    }
  }

  function getClone16ComponentsInfoCardHtml() {
    return `
      <section class="clone16-subview-card clone16-subview-components" aria-label="Clone 16 components and parts">
        <div class="clone16-components-topbar">
          <div class="clone16-components-heading">
            <p class="clone16-subview-kicker">Components and Parts</p>
            <h3 class="clone16-subview-title">Clone 16 Component System</h3>
            <div class="clone16-components-specline" aria-label="Clone 16 component highlights">
              <span>Aluminum frame</span>
              <span>Portable build</span>
              <span>Camera ready</span>
            </div>
          </div>
          <button type="button" class="clone16-subview-back-button clone16-components-back-button" onclick="showClone16ImagesFeatureInfoCard()">
            <span aria-hidden="true">←</span>
            <span>Back to Images</span>
          </button>
        </div>
        <div class="clone16-components-overview">
          <div class="clone16-components-gallery" aria-label="Clone 16 highlighted component preview">
            <div class="clone16-components-gallery-header">
              <span class="clone16-components-gallery-badge">Preview</span>
              <span class="clone16-components-gallery-counter">1 / ${CLONE16_COMPONENTS_IMAGES.length}</span>
            </div>
            ${CLONE16_COMPONENTS_IMAGES.map((imageSrc, index) => `
              <figure class="clone16-components-gallery-frame${index === 0 ? ' active' : ''}">
                <img src="${imageSrc}" alt="Clone 16 component preview image ${index + 1}" class="clone16-components-gallery-image" />
              </figure>
            `).join('')}
          </div>
          <div class="clone16-components-wall" aria-label="Clone 16 components gallery">
            ${CLONE16_COMPONENTS_IMAGES.map((imageSrc, index) => `
              <figure class="clone16-components-tile" tabindex="0" role="button" aria-label="Open Clone 16 component image ${index + 1}" data-component-index="${index}">
                <span class="clone16-components-tile-index">Part ${index + 1}</span>
                <img src="${imageSrc}" alt="Clone 16 component image ${index + 1}" class="clone16-components-tile-image" />
              </figure>
            `).join('')}
          </div>
        </div>
        <div class="clone16-components-lightbox" hidden aria-hidden="true">
          <button type="button" class="clone16-components-lightbox-close" aria-label="Close image preview">×</button>
          <div class="clone16-components-lightbox-stage">
            <img src="" alt="" class="clone16-components-lightbox-image" />
            <div class="clone16-components-lightbox-magnifier" aria-hidden="true"></div>
          </div>
        </div>
      </section>
    `;
  }

  function bindClone16ComponentsMagnifier() {
    if (!infoCard) return;
    const section = infoCard.querySelector('.clone16-subview-components');
    const tiles = Array.from(infoCard.querySelectorAll('.clone16-components-tile'));
    const lightbox = infoCard.querySelector('.clone16-components-lightbox');
    const lightboxStage = infoCard.querySelector('.clone16-components-lightbox-stage');
    const lightboxImage = infoCard.querySelector('.clone16-components-lightbox-image');
    const lightboxLens = infoCard.querySelector('.clone16-components-lightbox-magnifier');
    const closeButton = infoCard.querySelector('.clone16-components-lightbox-close');
    if (!section || !tiles.length || !lightbox || !lightboxStage || !lightboxImage || !lightboxLens || !closeButton) return;

    const openLightbox = (image) => {
      const popupWidth = Math.max(640, Math.round(window.screen.availWidth * 0.5));
      const popupHeight = Math.max(420, Math.round(window.screen.availHeight * 0.5));
      const popupLeft = Math.max(0, Math.round((window.screen.availWidth - popupWidth) / 2));
      const popupTop = Math.max(0, Math.round((window.screen.availHeight - popupHeight) / 2));
      const popup = window.open(
        '',
        'clone16-components-preview',
        `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},resizable=yes,scrollbars=no`
      );

      if (popup && !popup.closed) {
        const imageSrc = image.currentSrc || image.src;
        const imageAlt = image.alt || 'Clone 16 component image preview';
        popup.document.open();
        popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(imageAlt)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      padding: 16px;
      background: radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 22%), #11161b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .preview-shell {
      width: 100%;
      height: calc(100vh - 32px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 24px;
      background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(242,245,246,0.94));
      box-shadow: 0 20px 36px rgba(0,0,0,0.28);
      padding: 14px;
      overflow: hidden;
    }
    .preview-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .preview-back {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: #1b3e44;
      color: #fff;
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 10px 18px rgba(27,62,68,0.2);
    }
    .preview-helper {
      margin: 0;
      color: #5e676d;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-align: right;
    }
    .preview-stage {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      background: linear-gradient(180deg, rgba(249,250,251,0.98), rgba(235,239,241,0.94));
      overflow: hidden;
      touch-action: none;
    }
    img {
      position: relative;
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 18px 24px rgba(24,33,41,0.14));
    }
    .preview-lens {
      position: absolute;
      left: 0;
      top: 0;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      pointer-events: none;
      border: 2px solid rgba(255,255,255,0.92);
      box-shadow: 0 14px 24px rgba(16,24,40,0.28), inset 0 0 0 1px rgba(17,17,17,0.08);
      background-repeat: no-repeat;
      background-color: rgba(255,255,255,0.55);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 160ms ease;
    }
    .preview-lens.is-visible {
      opacity: 1;
    }
    @media (max-width: 720px) {
      body {
        padding: 10px;
      }
      .preview-shell {
        height: calc(100vh - 20px);
        padding: 10px;
        gap: 10px;
        border-radius: 18px;
      }
      .preview-toolbar {
        align-items: flex-start;
        flex-direction: column;
      }
      .preview-helper {
        text-align: left;
      }
      .preview-lens {
        width: 180px;
        height: 180px;
      }
    }
  </style>
</head>
<body>
  <div class="preview-shell">
    <div class="preview-toolbar">
      <button type="button" class="preview-back" id="previewBack">Back to Parts</button>
      <p class="preview-helper">Hover or drag on the image to use the magnifier.</p>
    </div>
    <div class="preview-stage" id="previewStage">
      <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" id="previewImage" />
      <div class="preview-lens" id="previewLens" aria-hidden="true"></div>
    </div>
  </div>
  <script>
    (function () {
      const stage = document.getElementById('previewStage');
      const image = document.getElementById('previewImage');
      const lens = document.getElementById('previewLens');
      const backButton = document.getElementById('previewBack');
      const zoom = 2.6;
      let metrics = null;

      const clamp = function (value, min, max) {
        return Math.min(Math.max(value, min), max);
      };

      const updateMetrics = function () {
        const rect = stage.getBoundingClientRect();
        const naturalWidth = image.naturalWidth || 1;
        const naturalHeight = image.naturalHeight || 1;
        const stageRatio = rect.width / Math.max(rect.height, 1);
        const imageRatio = naturalWidth / naturalHeight;
        let width;
        let height;
        let left;
        let top;

        if (imageRatio > stageRatio) {
          width = rect.width;
          height = width / imageRatio;
          left = 0;
          top = (rect.height - height) / 2;
        } else {
          height = rect.height;
          width = height * imageRatio;
          top = 0;
          left = (rect.width - width) / 2;
        }

        metrics = { rect: rect, width: width, height: height, left: left, top: top };
        lens.style.backgroundImage = 'url("${escapeHtml(imageSrc)}")';
        lens.style.backgroundSize = (width * zoom) + 'px ' + (height * zoom) + 'px';
      };

      const hideLens = function () {
        lens.classList.remove('is-visible');
      };

      const showLens = function (clientX, clientY) {
        if (!metrics) updateMetrics();
        const pointerX = clientX - metrics.rect.left;
        const pointerY = clientY - metrics.rect.top;
        const insideImage =
          pointerX >= metrics.left &&
          pointerX <= metrics.left + metrics.width &&
          pointerY >= metrics.top &&
          pointerY <= metrics.top + metrics.height;

        if (!insideImage) {
          hideLens();
          return;
        }

        const lensHalfWidth = lens.offsetWidth / 2;
        const lensHalfHeight = lens.offsetHeight / 2;
        const lensX = clamp(pointerX, lensHalfWidth, metrics.rect.width - lensHalfWidth);
        const lensY = clamp(pointerY, lensHalfHeight, metrics.rect.height - lensHalfHeight);
        const relativeX = (pointerX - metrics.left) / metrics.width;
        const relativeY = (pointerY - metrics.top) / metrics.height;
        const backgroundX = -((relativeX * metrics.width * zoom) - lensHalfWidth);
        const backgroundY = -((relativeY * metrics.height * zoom) - lensHalfHeight);

        lens.style.left = lensX + 'px';
        lens.style.top = lensY + 'px';
        lens.style.backgroundPosition = backgroundX + 'px ' + backgroundY + 'px';
        lens.classList.add('is-visible');
      };

      backButton.addEventListener('click', function () {
        window.close();
      });

      stage.addEventListener('mousemove', function (event) {
        showLens(event.clientX, event.clientY);
      });
      stage.addEventListener('mouseleave', hideLens);
      stage.addEventListener('touchstart', function (event) {
        if (!event.touches.length) return;
        const touch = event.touches[0];
        showLens(touch.clientX, touch.clientY);
      }, { passive: true });
      stage.addEventListener('touchmove', function (event) {
        if (!event.touches.length) return;
        const touch = event.touches[0];
        showLens(touch.clientX, touch.clientY);
      }, { passive: true });
      stage.addEventListener('touchend', hideLens);
      image.addEventListener('load', updateMetrics);
      window.addEventListener('resize', updateMetrics);
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') window.close();
      });
      if (image.complete) updateMetrics();
    }());
  </script>
</body>
</html>`);
        popup.document.close();
        popup.focus();
        return;
      }

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'Clone 16 component image preview';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      section.classList.add('components-lightbox-open');
      lightbox.classList.add('mobile-fullscreen');
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.src = '';
      lightboxImage.alt = '';
      section.classList.remove('components-lightbox-open');
      lightboxStage.classList.remove('magnifier-active');
      lightbox.classList.remove('mobile-fullscreen');
    };

    const updateLens = (clientX, clientY) => {
      const rect = lightboxImage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      lightboxLens.style.backgroundImage = `url("${lightboxImage.currentSrc || lightboxImage.src}")`;
      lightboxLens.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      lightboxLens.style.left = `${x}px`;
      lightboxLens.style.top = `${y}px`;
    };

    tiles.forEach((tile) => {
      const tileIndex = Number(tile.dataset.componentIndex || '0');
      const setPreview = () => {
        clone16ComponentsImageIndex = Number.isFinite(tileIndex) ? tileIndex : 0;
        updateClone16ComponentsImages();
      };
      tile.addEventListener('mouseenter', setPreview);
      tile.addEventListener('focus', setPreview);
      tile.addEventListener('click', () => {
        setPreview();
        const image = tile.querySelector('.clone16-components-tile-image');
        if (image) openLightbox(image);
      });

      tile.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setPreview();
          const image = tile.querySelector('.clone16-components-tile-image');
          if (image) openLightbox(image);
        }
      });
    });

    let activePointerId = null;

    const showLens = () => lightboxStage.classList.add('magnifier-active');
    const hideLens = () => {
      lightboxStage.classList.remove('magnifier-active');
      activePointerId = null;
    };

    lightboxStage.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && !lightbox.hidden) {
        showLens();
        updateLens(event.clientX, event.clientY);
      }
    });

    lightboxStage.addEventListener('pointermove', (event) => {
      if (lightbox.hidden) return;
      if (event.pointerType === 'mouse' || activePointerId === event.pointerId) {
        showLens();
        updateLens(event.clientX, event.clientY);
        if (event.pointerType !== 'mouse') event.preventDefault();
      }
    });

    lightboxStage.addEventListener('pointerleave', hideLens);

    lightboxStage.addEventListener('pointerdown', (event) => {
      if (lightbox.hidden) return;
      activePointerId = event.pointerId;
      showLens();
      updateLens(event.clientX, event.clientY);
      if (event.pointerType !== 'mouse') event.preventDefault();
    });

    lightboxStage.addEventListener('pointerup', hideLens);
    lightboxStage.addEventListener('pointercancel', hideLens);

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    section.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  function renderClone16ComponentsInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    clone16ComponentsImageIndex = 0;
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-readmore-info-state');
    infoCard.classList.add('clone16-images-info-state');
    infoCard.innerHTML = getClone16ComponentsInfoCardHtml();
    updateClone16ComponentsImages();
    bindClone16ComponentsMagnifier();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  window.showClone16ApplicationsInfoCard = renderClone16ApplicationsInfoCard;
  window.showClone16ComponentsInfoCard = renderClone16ComponentsInfoCard;
  window.showClone16ImagesFeatureInfoCard = renderClone16ImagesFeatureInfoCard;
  window.openClone16Brochure = openClone16Brochure;
  window.openClone16MobileBrochure = openClone16MobileBrochure;
  window.openCue24Brochure = openCue24Brochure;
  window.openCue24MobileBrochure = openCue24MobileBrochure;
  window.openCue27Brochure = openCue27Brochure;
  window.openCue27MobileBrochure = openCue27MobileBrochure;
  window.openCue32Brochure = openCue32Brochure;
  window.openCue32MobileBrochure = openCue32MobileBrochure;
  window.openFolder22NBrochure = openFolder22NBrochure;
  window.openFolder22NMobileBrochure = openFolder22NMobileBrochure;
  window.openLessonQBrochure = openLessonQBrochure;
  window.openLessonQMobileBrochure = openLessonQMobileBrochure;
  window.openLessonQ27Brochure = openLessonQ27Brochure;
  window.openLessonQ27MobileBrochure = openLessonQ27MobileBrochure;
  window.playClone16InstallationEmbed = playClone16InstallationEmbed;
  window.addEventListener('resize', updateClone16BrochureButtonState);
  window.addEventListener('resize', updateClone16InstallationDesktopOnlyVisibility);

  function getClone16ReadMoreInfoCardHtml() {
    return `
      <section class="clone16-readmore-card" aria-label="Clone 16 overview">
        <div class="clone16-readmore-card-hero">
          <div class="clone16-readmore-display-showcase" aria-label="Clone 16 display illustration">
            <div class="clone16-readmore-laptop">
              <div class="clone16-readmore-laptop-screen">
                <span class="clone16-readmore-laptop-camera" aria-hidden="true"></span>
                <span class="clone16-readmore-screen-guide clone16-readmore-screen-guide-top" aria-hidden="true"></span>
                <span class="clone16-readmore-screen-guide clone16-readmore-screen-guide-bottom" aria-hidden="true"></span>
                <span class="clone16-readmore-screen-size">16"</span>
              </div>
              <div class="clone16-readmore-laptop-base" aria-hidden="true"></div>
            </div>
          </div>
          <div class="clone16-readmore-card-summary">
            <div class="clone16-readmore-feature-list" aria-label="Clone 16 quick specs">
              <div class="clone16-readmore-feature-item">
                <span class="clone16-readmore-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8"></rect>
                    <path d="M9.5 19.5h5"></path>
                    <path d="M12 16v3.5"></path>
                  </svg>
                </span>
                <span class="clone16-readmore-feature-text">16-inch display</span>
              </div>
              <div class="clone16-readmore-feature-item">
                <span class="clone16-readmore-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path d="M12 3.5v3"></path>
                    <path d="M12 17.5v3"></path>
                    <path d="M4.9 6.4l2.1 2.1"></path>
                    <path d="M17 18.5l2.1 2"></path>
                    <path d="M3.5 12h3"></path>
                    <path d="M17.5 12h3"></path>
                    <path d="M4.9 17.6l2.1-2.1"></path>
                    <path d="M17 5.5l2.1-2"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                </span>
                <span class="clone16-readmore-feature-text">500 cd/m²</span>
              </div>
              <div class="clone16-readmore-feature-item">
                <span class="clone16-readmore-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <rect x="3.5" y="6" width="17" height="12" rx="2"></rect>
                    <path d="M6.5 10.5h11"></path>
                    <path d="M6.5 13.5h11"></path>
                  </svg>
                </span>
                <span class="clone16-readmore-feature-text">16:9 monitor</span>
              </div>
            </div>
          </div>
        </div>
        <div class="clone16-readmore-card-stage">
          <p class="clone16-readmore-stage-label">Product Highlights</p>
          <div class="clone16-readmore-slides" aria-live="polite">
            ${CLONE16_READMORE_SLIDES.map((slide, index) => `
              <article class="clone16-readmore-slide${index === 0 ? ' active' : ''}" aria-label="Clone 16 detail ${index + 1}">
                <h4 class="clone16-readmore-slide-title">${escapeHtml(slide.title)}</h4>
                <p class="clone16-readmore-slide-body">${escapeHtml(slide.body)}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function updateClone16ReadMoreSlides() {
    if (!infoCard) return;
    const slides = Array.from(infoCard.querySelectorAll('.clone16-readmore-slide'));
    if (!slides.length) return;
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === clone16ReadMoreSlideIndex);
    });
  }

  function updateClone16ReadMoreImages() {
    if (!infoCard) return;
    const frames = Array.from(infoCard.querySelectorAll('.clone16-readmore-gallery-frame'));
    if (!frames.length) return;
    frames.forEach((frame, index) => {
      frame.classList.toggle('active', index === clone16ReadMoreImageIndex);
    });
  }

  function bindClone16ReadMoreGalleryHover() {
    if (!infoCard) return;
    const card = infoCard.querySelector('.clone16-readmore-card');
    const gallery = infoCard.querySelector('.clone16-readmore-card-gallery');
    if (!card || !gallery) return;

    const expandGallery = () => card.classList.add('gallery-expanded');
    const collapseGallery = () => card.classList.remove('gallery-expanded');

    gallery.addEventListener('mouseenter', expandGallery);
    gallery.addEventListener('mouseleave', collapseGallery);
    gallery.addEventListener('focusin', expandGallery);
    gallery.addEventListener('focusout', collapseGallery);
    gallery.addEventListener('click', (event) => {
      event.stopPropagation();
      card.classList.toggle('gallery-expanded');
    });
    infoCard.addEventListener('click', (event) => {
      if (gallery.contains(event.target)) return;
      collapseGallery();
    });
  }

  function renderClone16ReadMoreInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    clone16ReadMoreSlideIndex = 0;
    clone16ReadMoreImageIndex = 0;
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'no-match-info-state', 'clone16-intro-info-state', 'clone16-images-info-state');
    infoCard.classList.add('clone16-readmore-info-state');
    infoCard.innerHTML = getClone16ReadMoreInfoCardHtml();
    updateClone16ReadMoreSlides();
    updateClone16ReadMoreImages();
    bindClone16ReadMoreGalleryHover();
    if (CLONE16_READMORE_SLIDES.length > 1) {
      clone16ReadMoreAutoplayTimer = window.setInterval(() => {
        clone16ReadMoreSlideIndex = (clone16ReadMoreSlideIndex + 1) % CLONE16_READMORE_SLIDES.length;
        clone16ReadMoreImageIndex = (clone16ReadMoreImageIndex + 1) % CLONE16_READMORE_IMAGES.length;
        updateClone16ReadMoreSlides();
        updateClone16ReadMoreImages();
      }, 5000);
    }
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function showClone16IntroReadMore() {
    const product = PRODUCTS.clone16;
    if (!product) return;
    setProductSummaryMode(false);
    setDetailFocusMode(true);
    setInfoCardOnlyMode(false);
    setBuyNowMode(false);
    setCueSeriesMode(true);
    setClone16ActionLayout(false);
    setCardsPanelHidden(false);
    setQuickActionsMode('all');
    setQuickActionsHidden(false);
    setSubtitleStripText(getProductSummaryStripText(product));
    renderClone16ReadMoreInfoCard();
  }

  function getProductSelectionButtons(root = document) {
    return Array.from(root.querySelectorAll('.placeholder-product-item.available'));
  }

  function bindProductSelectionButtons(root = document) {
    const buttons = getProductSelectionButtons(root);
    buttons.forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const productKey = button.dataset.product || 'clone16';
        const selectionMode = button.dataset.selectionMode || 'select';
        if (selectionMode === 'preview') {
          currentProductKey = productKey;
          renderNoMatchInfoCard();
          return;
        }
        selectProduct(productKey, { showQuickActions: true });
      });
    });
  }

  function getProductSelectionBadge(productKey, productName) {
    const badgeMap = {
      clone16: 'C16',
      cue24: 'C24',
      cue27: 'C27',
      cue32: 'C32',
      adamas19: 'A19',
      adamas22: 'A22',
      adamas24: 'A24',
      framer24: 'F24',
      framer27: 'F27',
      framer32: 'F32',
      folder22n: '22N',
      lessonQ24: 'L24',
      lessonQ27: 'L27',
      lessonQ32: 'L32',
      lessonQ43: 'L43',
      mime24: 'M24',
      mime27: 'M27',
      mime32: 'M32',
      speech19: 'S19',
      speech22: 'S22',
      speech24: 'S24',
      tab12: 'T12',
      ultra43: 'U43',
      ultra55: 'U55',
      flex15: 'F15',
      rotunda15: 'R15',
      olleson18: 'O18',
      plate: 'PL',
      electricPedestal: 'EP',
      ep30k: 'E30',
      ep40k: 'E40',
      ep50k: 'E50',
      ep60k: 'E60'
    };
    return badgeMap[productKey] || productName.slice(0, 2).toUpperCase();
  }

  function getNoMatchPickerHeaderHtml() {
    return `
      <div class="no-match-picker-header">
        <h3 class="no-match-picker-title">Select a Product</h3>
        <p class="no-match-picker-subtitle">Please choose one of the products below to continue.</p>
      </div>
    `;
  }

  function getNoMatchPickerGridHtml() {
    return `
      <div class="placeholder-product-grid no-match-picker-grid">
        ${PRODUCT_DEFINITIONS.map((definition) => `
          <button class="placeholder-product-item available no-match-picker-item" type="button" data-product="${definition.key}" data-selection-mode="preview">
            <span class="no-match-picker-item-badge" aria-hidden="true">${getProductSelectionBadge(definition.key, definition.name)}</span>
            <span class="no-match-picker-item-label">${escapeHtml(definition.name)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function getNoMatchPickerPanelHtml() {
    return `
      <div class="no-match-picker-panel" aria-label="Product selection">
        ${getNoMatchPickerHeaderHtml()}
        ${getNoMatchPickerGridHtml()}
      </div>
    `;
  }

  function renderNoMatchPicker() {
    if (!noMatchPickerShell) return;
    noMatchPickerShell.innerHTML = getNoMatchPickerPanelHtml();
    bindProductSelectionButtons(noMatchPickerShell);
    updatePlaceholderProductSelection();
  }

  function getNoMatchInfoCardHtml() {
    const selectedProduct = PRODUCTS[currentProductKey] || PRODUCTS.clone16;
    const selectedBadge = getProductSelectionBadge(selectedProduct.key, selectedProduct.name);
    return `
      <section class="no-match-info-card" aria-label="No matching result">
        <div class="no-match-picker-column" aria-label="Product selection">
          ${getNoMatchPickerHeaderHtml()}
          ${getNoMatchPickerGridHtml()}
        </div>
        <aside class="no-match-info-card-sidebar" aria-label="Selected product">
          <div class="no-match-info-card-toolbar">
            <button class="no-match-info-card-control" type="button" data-nomatch-action="cancel" aria-label="Go back">&#8592;</button>
            <button class="no-match-info-card-control" type="button" data-nomatch-action="cancel" aria-label="Close selection">&#10005;</button>
          </div>
          <div class="no-match-info-card-selection">
            <span class="no-match-info-card-selection-badge" aria-hidden="true">${selectedBadge}</span>
            <span class="no-match-info-card-selection-label">${escapeHtml(selectedProduct.name)}</span>
          </div>
          <div class="no-match-info-card-spacer" aria-hidden="true"></div>
          <div class="no-match-info-card-actions">
            <button class="no-match-action-btn no-match-action-btn-cancel" type="button" data-nomatch-action="cancel">Cancel</button>
            <button class="no-match-action-btn no-match-action-btn-continue" type="button" data-nomatch-action="continue">Continue</button>
          </div>
        </aside>
      </section>
    `;
  }

  function renderNoMatchInfoCard() {
    if (!infoCard) return;
    stopClone16ReadMoreAutoplay();
    stopClone16ImagesFeatureAutoplay();
    stopClone16ComponentsAutoplay();
    infoCard.classList.remove('image-card', 'info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card', 'info-card-empty-state', 'clone16-intro-info-state', 'clone16-readmore-info-state', 'clone16-images-info-state');
    infoCard.classList.add('no-match-info-state');
    infoCard.innerHTML = getNoMatchInfoCardHtml();
    bindProductSelectionButtons(infoCard);
    bindNoMatchActionButtons(infoCard);
    updatePlaceholderProductSelection();
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function restoreDefaultExperience() {
    currentProductKey = 'clone16';
    lastConfirmedProductKey = 'clone16';
    hasExplicitProductSelection = false;
    applyAboutStyleLayout(DEFAULT_SUBTITLE_TEXT);
    setInfoCardText('', getInitialInfoCardHtml(), true);
    setQuickActionsMode('all');
    setQuickActionsHidden(false);
    updatePlaceholderProductSelection();
  }

  function bindNoMatchActionButtons(root = document) {
    const buttons = Array.from(root.querySelectorAll('[data-nomatch-action]'));
    buttons.forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const action = button.dataset.nomatchAction || '';
        if (action === 'continue') {
          selectProduct(currentProductKey || 'clone16', { showQuickActions: true });
          return;
        }
        if (hasExplicitProductSelection && PRODUCTS[lastConfirmedProductKey]) {
          selectProduct(lastConfirmedProductKey, { showQuickActions: true });
          return;
        }
        restoreDefaultExperience();
      });
    });
  }

  function stopInfoCardAutoScroll() {
    if (infoCardAutoScrollTimer) {
      window.clearInterval(infoCardAutoScrollTimer);
      infoCardAutoScrollTimer = null;
    }
    if (infoCardAutoScrollDelayTimer) {
      window.clearTimeout(infoCardAutoScrollDelayTimer);
      infoCardAutoScrollDelayTimer = null;
    }
  }

  function stopIntroInfoCardSlider() {
    if (introInfoCardSliderTimer) {
      window.clearInterval(introInfoCardSliderTimer);
      introInfoCardSliderTimer = null;
    }
  }

  function updateIntroInfoCardSlider() {
    const slides = Array.from(document.querySelectorAll('.intro-info-slide'));
    if (!slides.length) return;
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === introInfoCardSlideIndex);
    });
  }

  function startIntroInfoCardSlider() {
    stopIntroInfoCardSlider();
    if (INTRO_INFO_CARD_SLIDES.length <= 1) return;
    introInfoCardSliderTimer = window.setInterval(() => {
      introInfoCardSlideIndex = (introInfoCardSlideIndex + 1) % INTRO_INFO_CARD_SLIDES.length;
      updateIntroInfoCardSlider();
    }, 5000);
  }

  function renderIntroInfoCardSlider() {
    if (!infoCard) return;
    stopInfoCardAutoScroll();
    introInfoCardSlideIndex = 0;
    infoCard.innerHTML = `
      <div class="intro-info-slider" aria-label="Crystal Prompter intro slider">
        <div class="intro-info-slider-title">Our Top Picks For You</div>
        ${INTRO_INFO_CARD_SLIDES.map((src, index) => `
          <div class="intro-info-slide${index === 0 ? ' active' : ''}">
            <img src="${src}" alt="Crystal Prompter intro slide ${index + 1}" />
          </div>
        `).join('')}
        <div class="intro-info-detail-shell" aria-hidden="true">
          <div class="intro-info-detail-trigger"></div>
          <aside class="intro-info-detail-card">
            ${INTRO_INFO_CARD_DETAILS.map((item) => `
              <article class="intro-info-detail-item">
                <span class="intro-info-detail-number">${item.number}</span>
                <h4>${item.title}</h4>
                <p>${item.body}</p>
              </article>
            `).join('')}
          </aside>
        </div>
      </div>
    `;
    updateIntroInfoCardSlider();
    startIntroInfoCardSlider();
  }

  function resetInfoCardAutoScroll() {
    stopInfoCardAutoScroll();
    if (infoCard) infoCard.scrollTop = 0;
  }

  function restartInfoCardAutoScroll() {
    stopInfoCardAutoScroll();
  }

  if (infoCard) {
    infoCard.addEventListener('mouseenter', stopInfoCardAutoScroll);
    infoCard.addEventListener('mouseleave', stopInfoCardAutoScroll);
  }

  function getCurrentProduct() {
    return PRODUCTS[currentProductKey] || PRODUCTS.clone16;
  }

  function renderImageCard(card, src, alt) {
    if (!card) return;
    card.className = 'info-card image-card';
    card.innerHTML = `<img src="${src}" alt="${alt}" />`;
  }

  function renderMainInfoImageCard(src, alt, className = '') {
    if (!infoCard) return;
    infoCard.classList.remove('info-card-show-scrollbar', 'info-card-slide-enter', 'cue-series-intro-card');
    infoCard.classList.add('image-card');
    if (className) infoCard.classList.add(className);
    infoCard.innerHTML = `<img src="${src}" alt="${escapeHtml(alt)}" />`;
    resetInfoCardAutoScroll();
    scheduleCueSeriesAvatarHeightSync();
  }

  function showDefaultBottomCards(images, productName) {
    if (bottomCards) bottomCards.classList.remove('about-us-social-mode', 'merged-empty-mode');
    if (card2 && images[0]) renderImageCard(card2, images[0], `${productName} image 1`);
    if (card3 && images[1]) renderImageCard(card3, images[1], `${productName} image 2`);
  }

  function showAboutUsSocialCard() {
    if (bottomCards) {
      bottomCards.classList.remove('merged-empty-mode');
      bottomCards.classList.add('about-us-social-mode');
    }
    if (card2) {
      card2.className = 'info-card social-card';
      card2.innerHTML = getSocialLinksHtml();
    }
  }

  function showMergedEmptyBottomCard() {
    if (!bottomCards || !card2 || !card3) return;
    bottomCards.classList.remove('about-us-social-mode');
    bottomCards.classList.add('merged-empty-mode');
    card2.className = 'info-card empty-merged-card';
    card2.innerHTML = '';
    card3.className = 'info-card image-card';
    card3.innerHTML = '';
  }

  function clearBottomInfoCards() {
    if (!bottomCards || !card2 || !card3) return;
    bottomCards.classList.remove('about-us-social-mode', 'merged-empty-mode');
    card2.className = 'info-card image-card';
    card2.innerHTML = '';
    card3.className = 'info-card image-card';
    card3.innerHTML = '';
  }

  function updatePlaceholderProductSelection() {
    const buttons = getProductSelectionButtons();
    if (!buttons.length) return;
    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.product === currentProductKey);
    });
  }

  function requiresExplicitProductSelection(action) {
    return ['images', 'videos', 'specification', 'installation'].includes(action);
  }

  function canUseProductDependentAction(action) {
    return !requiresExplicitProductSelection(action) || hasExplicitProductSelection;
  }

  function setQuickActionsMode(mode = 'all') {
    if (!quickActionButtons.length) return;
    const isLimitedMode = mode === 'nomatch' || mode === 'limited';
    const allowedActions = isLimitedMode
      ? new Set(['about_us', 'product_list', 'buy_now'])
      : null;

    if (bottomArea) {
      bottomArea.classList.toggle('nomatch-actions-layout', isLimitedMode);
    }

    quickActionButtons.forEach((button) => {
      const action = button.dataset.action || '';
      const shouldShow = !allowedActions || allowedActions.has(action);
      button.style.display = shouldShow ? '' : 'none';
      button.disabled = shouldShow ? !canUseProductDependentAction(action) : false;
      button.setAttribute('aria-disabled', button.disabled ? 'true' : 'false');
    });
  }

  function setQuickActionsHidden(hidden) {
    if (!quickActions) return;
    quickActions.classList.toggle('hidden', hidden);
    if (hidden && bottomArea) {
      bottomArea.classList.remove('nomatch-actions-layout');
    }
  }

  function setCardsPanelHidden(hidden) {
    if (!cardsPanel) return;
    cardsPanel.classList.toggle('response-hidden', hidden);
  }

  function setIntroEmptyState(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('intro-empty-state', enabled);
    if (enabled) {
      clearInfoCard();
      return;
    }
    stopIntroInfoCardSlider();
  }

  function setDetailFocusMode(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('detail-focus-mode', enabled);
  }

  function setInfoCardOnlyMode(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('info-card-only-mode', enabled);
  }

  function setBuyNowMode(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('buy-now-mode', enabled);
  }

  function setProductSummaryMode(enabled) {
    if (!appContainer) return;
    appContainer.classList.toggle('product-summary-mode', enabled);
  }

  function applyAboutStyleLayout(subtitleText = '', options = {}) {
    const showEmptyCard = options.showEmptyCard !== false;
    stopAvatarVideo();
    setIntroEmptyState(false);
    setDetailFocusMode(true);
    setInfoCardOnlyMode(false);
    setBuyNowMode(false);
    setProductSummaryMode(false);
    setCueSeriesMode(true);
    setClone16ActionLayout(false);
    setCardsPanelHidden(false);
    setQuickActionsMode('all');
    setQuickActionsHidden(true);
    clearCustomCenterPanel();
    setInitialVideoPanelHidden(true);
    setPlaceholderMode('intro');
    stopPanelVideo();
    showMergedEmptyBottomCard();
    setSubtitleStripText(subtitleText);
    if (showEmptyCard) {
      showEmptyInfoCard();
    }
  }

  function selectProduct(productKey, options = {}) {
    const product = PRODUCTS[productKey];
    if (!product) return;

    currentProductKey = productKey;
    lastConfirmedProductKey = productKey;
    hasExplicitProductSelection = true;
    setIntroEmptyState(false);
    setDetailFocusMode(false);
    setInfoCardOnlyMode(false);
    setBuyNowMode(false);
    setProductSummaryMode(true);
    setCueSeriesMode(shouldUseShowcaseLayout(productKey, 'summary'));
    setClone16ActionLayout(false);
    if (options.setPlaceholderMode !== false) {
      setPlaceholderMode('intro');
    }
    setCardsPanelHidden(false);
    updatePlaceholderProductSelection();
    clearCustomCenterPanel();
    setInitialVideoPanelHidden(true);
    stopPanelVideo();
    showMergedEmptyBottomCard();
    setSubtitleStripText(getProductSummaryStripText(product));
    if (productKey === 'clone16') {
      renderClone16IntroInfoCard();
    } else {
      clearInfoCard();
    }

    if (options.showQuickActions && quickActions) {
      setQuickActionsMode('all');
      setQuickActionsHidden(false);
    }
  }

  function showCurrentProductImages() {
    const product = getCurrentProduct();
    applyAboutStyleLayout(getProductSummaryStripText(product));
    if (product.key === 'clone16') {
      renderClone16ImagesFeatureInfoCard();
    }
  }

  function showCurrentProductVideo() {
    const product = getCurrentProduct();
    applyAboutStyleLayout(getProductSummaryStripText(product));
    if (product.key === 'clone16') {
      renderClone16VideoInfoCard();
    }
  }

  function showCurrentProductText(section) {
    const product = getCurrentProduct();
    if (section === 'specification') {
      applyAboutStyleLayout(getProductSummaryStripText(product));
      if (product.key === 'clone16') {
        renderClone16SpecificationInfoCard();
        return;
      }
      if (product.key === 'cue24') {
        renderCue24SpecificationInfoCard();
        return;
      }
      if (product.key === 'cue27') {
        renderCue27SpecificationInfoCard();
        return;
      }
      if (product.key === 'cue32') {
        renderCue32SpecificationInfoCard();
        return;
      }
      if (product.key === 'folder22n') {
        renderFolder22NSpecificationInfoCard();
        return;
      }
      if (product.key === 'lessonQ24') {
        renderLessonQSpecificationInfoCard();
        return;
      }
      if (product.key === 'lessonQ27') {
        renderLessonQ27SpecificationInfoCard();
        return;
      }
      return;
    }
    if (section === 'installation') {
      applyAboutStyleLayout(getProductSummaryStripText(product));
      renderProductInstallationInfoCard(product);
      return;
    }
    if (section === 'buy_now') {
      applyAboutStyleLayout(`Complete the form below to request ${product.name} pricing and availability.`);
    }
  }

  {
    const initialProductButtons = getProductSelectionButtons();
    if (initialProductButtons.length) {
      bindProductSelectionButtons();
    }
    updatePlaceholderProductSelection();
  }

  function applyMatchedResponse(match) {
    if (!match) return;

    if (requiresExplicitProductSelection(match.id) && !hasExplicitProductSelection) {
      applyAboutStyleLayout('Please select a product first to open Images, Videos, Specification, or Installation.');
      renderNoMatchPicker();
      setPlaceholderMode('nomatch');
      renderNoMatchInfoCard();
      return;
    }

    setIntroEmptyState(false);
    setDetailFocusMode(false);
    setInfoCardOnlyMode(false);
    setBuyNowMode(false);
    setProductSummaryMode(false);
    setPlaceholderMode('intro');
    restoreAvatarIdleVideo();
    setQuickActionsMode('all');
    setCardsPanelHidden(false);

    if (match.id.startsWith('product_')) {
      stopAvatarVideo();
      setInitialVideoPanelHidden(true);
      selectProduct(match.productKey || 'clone16', { showQuickActions: true });
      return;
    }
    if (match.id === 'about_us') {
      applyAboutStyleLayout('Crystal Prompter provides professional teleprompter solutions for studio, field, education, and creator workflows.', { showEmptyCard: false });
      setInfoCardText(INFO_TEXT.aboutUs.title, INFO_TEXT.aboutUs.bodyHtml, true);
    }
    if (match.id === 'product_list') {
      applyAboutStyleLayout('Browse the available Crystal Prompter models and select one to continue.');
      renderNoMatchPicker();
      setPlaceholderMode('nomatch');
      renderNoMatchInfoCard();
    }
    if (match.id === 'images') showCurrentProductImages();
    if (match.id === 'videos') showCurrentProductVideo();
    if (match.id === 'specification') showCurrentProductText('specification');
    if (match.id === 'installation') showCurrentProductText('installation');
    if (match.id === 'buy_now') {
      setQuickActionsMode('all');
      setQuickActionsHidden(true);
      showCurrentProductText('buy_now');
    }
  }

  function normalizeQuestion(text) {
    return text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  function tokenMatches(token, keyword) {
    if (token === keyword) return true;
    if (token.length >= 4 && keyword.length >= 4) {
      if (token.includes(keyword) || keyword.includes(token)) return true;
      if (Math.abs(token.length - keyword.length) <= 1 && editDistance(token, keyword) <= 1) return true;
    }
    return false;
  }

  function compactNormalizedText(text) {
    return normalizeQuestion(text).replace(/\s+/g, '');
  }

  function phrasePartsMatchTokens(tokens, phrase) {
    const parts = normalizeQuestion(phrase).split(' ').filter(Boolean);
    if (!parts.length) return false;
    return parts.every((part) => tokens.some((token) => tokenMatches(token, part)));
  }

  function scorePhraseAgainstText(normalized, compact, tokens, phrase) {
    const normalizedPhrase = normalizeQuestion(phrase);
    if (!normalizedPhrase) return 0;

    const compactPhrase = normalizedPhrase.replace(/\s+/g, '');
    if (normalized.includes(normalizedPhrase) || compact.includes(compactPhrase)) {
      return 4;
    }

    if (phrasePartsMatchTokens(tokens, normalizedPhrase)) {
      return 3;
    }

    return 0;
  }

  function detectProductKeyFromText(rawText) {
    const normalized = normalizeQuestion(rawText);
    const compact = compactNormalizedText(rawText);
    const tokens = normalized.split(' ').filter(Boolean);
    let bestKey = '';
    let bestScore = -1;

    for (const product of PRODUCT_ALIAS_MAP) {
      let score = 0;
      for (const alias of product.aliases) {
        score = Math.max(score, scorePhraseAgainstText(normalized, compact, tokens, alias));
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = product.key;
      }
    }

    return bestScore >= 3 ? bestKey : '';
  }

  function getActionFaqItems() {
    return scriptedFaq.filter((item) => ['images', 'videos', 'specification', 'installation', 'buy_now'].includes(item.id));
  }

  function detectActionFromText(rawText) {
    const normalized = normalizeQuestion(rawText);
    const compact = compactNormalizedText(rawText);
    const tokens = normalized.split(' ').filter(Boolean);
    let best = null;
    let bestScore = -1;

    for (const item of getActionFaqItems()) {
      let score = 0;
      for (const phrase of item.phrases) {
        score = Math.max(score, scorePhraseAgainstText(normalized, compact, tokens, phrase));
      }
      for (const keyword of item.keywords) {
        if (tokens.some((token) => tokenMatches(token, keyword))) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (bestScore < 3) return null;
    return best;
  }

  function matchScriptedQuestion(rawQuestion) {
    const normalized = normalizeQuestion(rawQuestion);
    const tokens = normalized.split(' ').filter(Boolean);
    if (!tokens.length) return null;

    if (new Set(['images', 'videos', 'specification', 'installation', 'buy now']).has(normalized)) {
      return null;
    }

    const detectedProductKey = detectProductKeyFromText(rawQuestion);
    const detectedAction = detectActionFromText(rawQuestion);
    if (detectedProductKey && detectedAction) {
      return {
        ...detectedAction,
        productKey: detectedProductKey
      };
    }

    let best = null;
    let bestScore = -1;

    for (const item of scriptedFaq) {
      let score = 0;
      for (const phrase of item.phrases) {
        if (normalized.includes(phrase)) score += 4;
      }
      for (const keyword of item.keywords) {
        if (tokens.some((token) => tokenMatches(token, keyword))) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (bestScore < 3) return null;
    return best;
  }

  function restoreAvatarIdleVideo() {
    if (!avatarVideo || !avatarVideoSource) return;
    avatarVideo.pause();
    avatarVideoSource.src = AVATAR_IDLE_VIDEO;
    avatarVideo.load();
    avatarVideo.currentTime = 0;
    avatarVideo.muted = true;
    avatarVideo.loop = true;
    const idlePlay = avatarVideo.play();
    if (idlePlay && typeof idlePlay.catch === 'function') idlePlay.catch(() => {});
  }

  function stopAvatarVideo() {
    if (!avatarVideo || !avatarVideoSource) return;
    avatarVideo.pause();
    avatarVideoSource.src = AVATAR_IDLE_VIDEO;
    avatarVideo.load();
    avatarVideo.currentTime = 0;
    avatarVideo.muted = true;
    avatarVideo.loop = false;
    avatarVideo.onended = null;
  }

  function sendMessage(text) {
    const input = document.getElementById('userInput');
    const msg = text || input.value.trim();
    if (!msg) return;
    input.value = '';
    setIntroEmptyState(false);
    const detectedProductKey = detectProductKeyFromText(msg);
    if (detectedProductKey && PRODUCTS[detectedProductKey]) {
      currentProductKey = detectedProductKey;
      lastConfirmedProductKey = detectedProductKey;
      hasExplicitProductSelection = true;
      updatePlaceholderProductSelection();
      showDefaultBottomCards(PRODUCTS[detectedProductKey].images, PRODUCTS[detectedProductKey].name);
    }
    setInitialVideoPanelHidden(false);
    setQuickActionsMode('all');
    setQuickActionsHidden(false);

    const match = matchScriptedQuestion(msg);
    if (!match) {
      applyAboutStyleLayout('Please select a product to continue.');
      renderNoMatchPicker();
      setPlaceholderMode('nomatch');
      renderNoMatchInfoCard();
      return;
    }
    applyMatchedResponse(match);
  }

  function quickAction(label) {
    const actionButton = quickActionButtons.find((button) => (button.dataset.action || '').toLowerCase() === label.toLowerCase().replace(/\s+/g, '_'));
    if (actionButton && actionButton.disabled) return;
    const actionId = actionButton?.dataset.action || '';
    if (!actionId) return;
    document.getElementById('userInput').value = '';
    applyMatchedResponse({
      id: actionId,
      label
    });
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ── SETTINGS ── */
  function openSettings() { document.getElementById('settingsModal').classList.add('active'); }
  function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }

  function applySettings() {
    const name = document.getElementById('settingName').value || 'Assistant';
    const lang = document.getElementById('settingLang').value;
    const color = document.getElementById('settingColor').value;

    const assistantNameEl = document.getElementById('assistantName');
    if (assistantNameEl) assistantNameEl.textContent = name;
    document.getElementById('langBtn').textContent = lang === 'EN' ? '🇺🇸 EN' : lang === 'FIL' ? '🇵🇭 FIL' : lang === 'ES' ? '🇪🇸 ES' : '🇯🇵 JA';

    const app = document.getElementById('appContainer');
    app.style.background = `linear-gradient(135deg, ${adjustColor(color,-30)} 0%, ${color} 40%, ${adjustColor(color,30)} 100%)`;

    closeSettings();
  }

  function adjustColor(hex, amount) {
    let r = parseInt(hex.slice(1,3),16);
    let g = parseInt(hex.slice(3,5),16);
    let b = parseInt(hex.slice(5,7),16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `rgb(${r},${g},${b})`;
  }

  resetInfoCardAutoScroll();
  renderNoMatchPicker();
  if (appContainer) {
    restoreDefaultExperience();
  }
  window.addEventListener('resize', syncCueSeriesAvatarHeight);
