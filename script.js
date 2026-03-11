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
  const customCenterContent = document.getElementById('customCenterContent');
  const avatarVideo = document.getElementById('avatarVideo');
  const avatarVideoSource = document.getElementById('avatarVideoSource');
  const mainContentPanel = document.querySelector('.main-content');
  const videoContent = document.getElementById('videoContent');
  const AVATAR_IDLE_VIDEO = 'assets/steady.mp4';
  const PANEL_DEFAULT_VIDEO = 'assets/clone16-q1-answer.mp4';
  const PANEL_ABOUT_US_VIDEO = 'assets/crystal-prompter-introduction.mp4';
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
  let videoPanelLocked = false;
  let clone16IntroSlideIndex = 0;
  let clone16IntroAutoplayTimer = null;

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

  function renderClone16ApplicationImagesPlaceholder() {
    renderCustomCenterPanel(`
      <div class="placeholder-application-card">
        <h3>Application Images</h3>
        <div class="application-gallery-grid">
          <div class="application-gallery-item large">
            <img src="https://static.wixstatic.com/media/d0630a_35a6cb4b811c4ddb960e45b970c20e41~mv2.jpg/v1/fill/w_284,h_392,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.jpg" alt="Clone 16 application image 1" />
            <div class="application-gallery-caption">
              <strong>Darakwon Publisher</strong>
              <span>Application image</span>
            </div>
          </div>
          <div class="application-gallery-item">
            <img src="https://static.wixstatic.com/media/d0630a_ed0a7b8d61304f97a46954614a41b444~mv2.png/v1/crop/x_0,y_197,w_3468,h_2705/fill/w_245,h_191,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.png" alt="Clone 16 application image 2" />
            <div class="application-gallery-caption">
              <strong>Darakwon Publisher</strong>
              <span>Application image</span>
            </div>
          </div>
          <div class="application-gallery-item">
            <img src="https://static.wixstatic.com/media/d0630a_221e63cfeb6743ab9373699001470a76~mv2.jpg/v1/crop/x_89,y_0,w_4446,h_3468/fill/w_245,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Darakwon%20Publisher_032123.jpg" alt="Clone 16 application image 3" />
            <div class="application-gallery-caption">
              <strong>Darakwon Publisher</strong>
              <span>Application image</span>
            </div>
          </div>
          <div class="application-gallery-item">
            <img src="https://static.wixstatic.com/media/d0630a_4e3390b8436d4386ab5e848389e3088f~mv2.jpg/v1/crop/x_77,y_0,w_3846,h_3000/fill/w_245,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Byeokje%20Global%20Culinary%20Research%20Institute_121522.jpg" alt="Clone 16 application image 4" />
            <div class="application-gallery-caption">
              <strong>Byeokje Global Culinary Research Institute</strong>
              <span>Application image</span>
            </div>
          </div>
          <div class="application-gallery-item">
            <img src="https://static.wixstatic.com/media/d0630a_de6c72aa4a714bb9bfd19c34f4fdc679~mv2.png/v1/crop/x_0,y_63,w_600,h_468/fill/w_245,h_191,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Clone%2016_teleprompter_Byeokje%20Global%20Culinary%20Research%20Institute_121522.png" alt="Clone 16 application image 5" />
            <div class="application-gallery-caption">
              <strong>Byeokje Global Culinary Research Institute</strong>
              <span>Application image</span>
            </div>
          </div>
        </div>
      </div>
    `);
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
  const quickActions = document.getElementById('quickActions');
  const quickActionButtons = Array.from(document.querySelectorAll('.action-chip'));
  const cardsPanel = document.querySelector('.cards-panel');
  const infoCardTitle = infoCard ? infoCard.querySelector('h3') : null;
  const infoCardBody = infoCard ? infoCard.querySelector('p') : null;
  const bottomCards = document.querySelector('.bottom-cards');
  const card2 = document.getElementById('card2');
  const card3 = document.getElementById('card3');
  const placeholderProductButtons = Array.from(document.querySelectorAll('.placeholder-product-item.available'));

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
        title: `${definition.name} Video`,
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

  const PRODUCT_DEFINITIONS = [
    {
      key: 'clone16',
      name: 'Clone 16',
      aliases: ['clone 16', 'clone16', 'crystal prompter clone 16'],
      summary: 'A portable teleprompter that connects to a laptop via HDMI for faster, more stable production. Ideal for interviews and product shoots, it allows instant script editing and smooth control. Its 16:9 widescreen display offers a wider view, replacing traditional 17-inch 4:3 models.',
      summaryHtml: `Portable interview teleprompter equipped with<br><br>a 16-inch, 500 cd/m², 16:9 monitor<br><br><strong>Portable and Precise Performance</strong><br><br>Clone 16 is a portable teleprompter that connects to a laptop via HDMI, enabling faster and more stable on-set production, and delivering exceptional performance for precise interviews or detailed product descriptions.<br><br><strong>Effortless Script Control and Wider View</strong><br><br>Connecting directly to a laptop, Clone 16 enables instant script edits and smooth production, while its 16:9 widescreen replaces 17-inch 4:3 teleprompters for a broader, ideal view of long-form scripts.`,
      images: [
        'https://static.wixstatic.com/media/d0630a_acccc6e0ffa84500bef7d1952b5e3ee6~mv2.png/v1/crop/x_7,y_80,w_587,h_462/fill/w_329,h_259,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/website%20(10).png',
        'https://static.wixstatic.com/media/6e449d_64393b62a0dc48588a1be12f6e6c56ba~mv2.png/v1/fill/w_193,h_399,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Mime%2032_3.png'
      ],
      videoSrc: 'assets/clone16-video.mp4',
      specification: 'Clone 16 uses a 16:9 widescreen display, laptop HDMI workflow, and smooth script control for studio and field production.',
      installation: 'Mount the prompter, align the camera and lens, connect the laptop via HDMI, then load the script and begin prompting.'
    },
    {
      key: 'cueSeries',
      name: 'Cue Series',
      aliases: ['cue series', 'cue24', 'cue 24'],
      summary: 'Cue Series is built for larger-format prompting workflows, giving creators and studios a more stable and readable teleprompter setup.',
      images: [
        'https://static.wixstatic.com/media/d0630a_a36e5bf9e50449b294ec877e9525391c~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/c%2024.png',
        'https://static.wixstatic.com/media/d0630a_a36e5bf9e50449b294ec877e9525391c~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/c%2024.png'
      ],
      specification: 'Cue Series focuses on larger screen prompting, stable framing, and a workflow suited for presenters, lessons, and studio-style production.',
      installation: 'Set the frame on the support, align the monitor and camera, then connect your script source and fine-tune the viewing angle.'
    },
    {
      key: 'framerSeries',
      name: 'Framer Series',
      aliases: ['framer series', 'framer32', 'framer 32'],
      summary: 'Framer Series offers a practical prompter setup for modern camera framing, balancing usability, portability, and clear prompting performance.',
      images: [
        'https://static.wixstatic.com/media/d0630a_6b6a273d89914d5b937926477ea10668~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/Fr%2032.png',
        'https://static.wixstatic.com/media/d0630a_6b6a273d89914d5b937926477ea10668~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/Fr%2032.png'
      ],
      specification: 'Framer Series is designed for framing flexibility, practical production setups, and clear presenter-to-camera eye contact.',
      installation: 'Attach the Framer unit to the support system, align the monitor and camera, then connect the script source before use.'
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
      key: 'lessonQ',
      name: 'Lesson Q',
      aliases: ['lesson q', 'lessonq'],
      summary: 'Lesson Q is designed for teaching, lecture capture, and presenter-led educational content where clear eye contact matters.',
      specification: 'Lesson Q focuses on lecture use, steady prompting readability, and a workflow optimized for teaching environments.',
      installation: 'Position Lesson Q with your teaching monitor or camera setup, connect the script source, and adjust the prompting height for the presenter.'
    },
    {
      key: 'mimeSeries',
      name: 'Mime Series',
      aliases: ['mime series', 'mime27', 'mime 27', 'mime32', 'mime 32'],
      summary: 'Mime Series is a monitor-oriented prompting solution for productions that need a clean display workflow and stable prompting support.',
      specification: 'Mime Series emphasizes clear monitor integration, stable viewing, and a configuration suited to controlled production spaces.',
      installation: 'Place the Mime Series monitor unit, route the display feed, secure the support hardware, then align the viewing position.'
    },
    {
      key: 'ultraSeries',
      name: 'Ultra Series',
      aliases: ['ultra series', 'ultra'],
      summary: 'Ultra Series is built for demanding professional prompting workflows that need a larger, more premium presentation setup.',
      specification: 'Ultra Series prioritizes large-format readability, robust support, and production reliability for professional users.',
      installation: 'Assemble the Ultra Series frame, secure the display and camera system, then balance the unit and connect the script feed.'
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
  let infoCardAutoScrollTimer = null;
  let infoCardAutoScrollDelayTimer = null;

  const INFO_TEXT = {
    aboutUs: {
      title: 'About Us',
      bodyHtml: `Crystal Prompter Co., Ltd.<br><br>established in 2017, is a leading broadcast equipment company specializing in prompters and electric pedestals. With continuous innovation and technical expertise, we deliver high-quality solutions focused on customer satisfaction`
    }
  };

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
      id: 'images',
      label: 'Images',
      phrases: [
        'images',
        'show images',
        'show me images',
        'product images',
        'photos',
        'gallery'
      ],
      keywords: ['image', 'images', 'photo', 'photos', 'gallery', 'picture']
    },
    {
      id: 'videos',
      label: 'Videos',
      phrases: [
        'videos',
        'show videos',
        'show me videos',
        'video demo',
        'product video'
      ],
      keywords: ['video', 'videos', 'demo', 'play', 'introduction']
    },
    {
      id: 'specification',
      label: 'Specification',
      phrases: [
        'specification',
        'specifications',
        'specs',
        'what are the specifications'
      ],
      keywords: ['spec', 'specs', 'specification', 'details']
    },
    {
      id: 'installation',
      label: 'Installation',
      phrases: [
        'installation',
        'install',
        'how to install',
        'setup',
        'how to set up'
      ],
      keywords: ['install', 'installation', 'setup', 'mount', 'connect', 'hdmi']
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

  function setInfoCardText(title, body, useHtml = false) {
    if (!infoCardTitle || !infoCardBody) return;
    infoCardTitle.textContent = title;
    if (useHtml) {
      infoCardBody.innerHTML = body;
      resetInfoCardAutoScroll();
      if (infoCard && infoCard.matches(':hover')) restartInfoCardAutoScroll();
      return;
    }
    infoCardBody.textContent = body;
    resetInfoCardAutoScroll();
    if (infoCard && infoCard.matches(':hover')) restartInfoCardAutoScroll();
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

  function resetInfoCardAutoScroll() {
    stopInfoCardAutoScroll();
    if (infoCard) infoCard.scrollTop = 0;
  }

  function restartInfoCardAutoScroll() {
    if (!infoCard) return;
    resetInfoCardAutoScroll();

    window.requestAnimationFrame(() => {
      infoCard.scrollTop = 0;
      const maxScroll = infoCard.scrollHeight - infoCard.clientHeight;
      if (maxScroll <= 6) return;

      let direction = 1;
      let currentTop = 0;
      const step = 1;
      const delayMs = 1200;

      const startScroll = () => {
        infoCardAutoScrollTimer = window.setInterval(() => {
          currentTop += direction * step;
          if (currentTop >= maxScroll) {
            currentTop = maxScroll;
            infoCard.scrollTop = maxScroll;
            stopInfoCardAutoScroll();
            direction = -1;
            infoCardAutoScrollDelayTimer = window.setTimeout(startScroll, delayMs);
            return;
          }
          if (currentTop <= 0 && direction < 0) {
            currentTop = 0;
            infoCard.scrollTop = 0;
            stopInfoCardAutoScroll();
            direction = 1;
            infoCardAutoScrollDelayTimer = window.setTimeout(startScroll, delayMs);
            return;
          }
          infoCard.scrollTop = currentTop;
        }, 28);
      };

      infoCardAutoScrollDelayTimer = window.setTimeout(startScroll, delayMs);
    });
  }

  if (infoCard) {
    infoCard.addEventListener('mouseenter', restartInfoCardAutoScroll);
    infoCard.addEventListener('mouseleave', resetInfoCardAutoScroll);
  }

  function getCurrentProduct() {
    return PRODUCTS[currentProductKey] || PRODUCTS.clone16;
  }

  function renderImageCard(card, src, alt) {
    if (!card) return;
    card.className = 'info-card image-card';
    card.innerHTML = `<img src="${src}" alt="${alt}" />`;
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
      card2.innerHTML = `
        <div class="social-strip" aria-label="Crystal Prompter social media">
          <a class="social-icon-button" href="https://www.facebook.com/crystalprompter/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.6c0-.8.2-1.3 1.4-1.3h1.5V5.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v1.8H8.5V14h2.2v7h2.8z"/>
            </svg>
          </a>
          <a class="social-icon-button" href="https://www.instagram.com/crystalprompter_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="4" ry="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="16.8" cy="7.6" r="1" />
            </svg>
          </a>
          <a class="social-icon-button" href="https://www.youtube.com/@i_crystal_river" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 8.2c-.2-1-.9-1.8-1.9-2-1.6-.4-6.1-.4-6.1-.4s-4.5 0-6.1.4c-1 .2-1.7 1-1.9 2C3.6 9.8 3.6 12 3.6 12s0 2.2.4 3.8c.2 1 .9 1.8 1.9 2 1.6.4 6.1.4 6.1.4s4.5 0 6.1-.4c1-.2 1.7-1 1.9-2 .4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8z"/>
              <path d="M10.3 14.8l4.7-2.8-4.7-2.8v5.6" fill="#2b1830"/>
            </svg>
          </a>
          <a class="social-icon-button" href="https://www.tiktok.com/@crystal_prompter" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.6 4c.3 1.8 1.4 3.2 3.1 3.9v2.3c-1.1 0-2.2-.3-3.1-.9v5.2a4.6 4.6 0 1 1-4.6-4.6c.3 0 .6 0 .9.1v2.4a2.3 2.3 0 1 0 1.4 2.1V4h2.3z"/>
            </svg>
          </a>
        </div>
      `;
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

  function updatePlaceholderProductSelection() {
    if (!placeholderProductButtons.length) return;
    placeholderProductButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.product === currentProductKey);
    });
  }

  function setQuickActionsMode(mode = 'all') {
    if (!quickActionButtons.length) return;
    const isLimitedMode = mode === 'nomatch' || mode === 'limited';
    const allowedActions = isLimitedMode
      ? new Set(['about_us', 'buy_now'])
      : null;

    if (bottomArea) {
      bottomArea.classList.toggle('nomatch-actions-layout', isLimitedMode);
    }

    quickActionButtons.forEach((button) => {
      const action = button.dataset.action || '';
      const shouldShow = !allowedActions || allowedActions.has(action);
      button.style.display = shouldShow ? '' : 'none';
    });
  }

  function setCardsPanelHidden(hidden) {
    if (!cardsPanel) return;
    cardsPanel.classList.toggle('response-hidden', hidden);
  }

  function selectProduct(productKey, options = {}) {
    const product = PRODUCTS[productKey];
    if (!product) return;

    currentProductKey = productKey;
    if (options.setPlaceholderMode !== false) {
      setPlaceholderMode('intro');
    }
    setCardsPanelHidden(false);
    updatePlaceholderProductSelection();
    showDefaultBottomCards(product.images, product.name);
    if (productKey === 'clone16') {
      renderClone16IntroSlider();
    } else {
      clearCustomCenterPanel();
      setInitialVideoPanelHidden(true);
    }
    setInfoCardText(product.summary.title, product.summary.bodyHtml || product.summary.body, Boolean(product.summary.bodyHtml));

    if (options.showQuickActions && quickActions) {
      setQuickActionsMode('all');
      quickActions.classList.remove('hidden');
    }
  }

  function showCurrentProductImages() {
    const product = getCurrentProduct();
    setCardsPanelHidden(false);
    if (currentProductKey === 'clone16') {
      showMergedEmptyBottomCard();
      renderClone16ApplicationImagesPlaceholder();
    } else {
      clearCustomCenterPanel();
      showDefaultBottomCards(product.images, product.name);
      setInitialVideoPanelHidden(true);
      setPlaceholderMode('intro');
      stopPanelVideo();
    }
    setInfoCardText(`${product.name} Images`, `You are viewing configured ${product.name} product images in Card 2 and Card 3.`);
  }

  function showCurrentProductVideo() {
    const product = getCurrentProduct();
    setCardsPanelHidden(false);
    clearCustomCenterPanel();
    if (currentProductKey === 'clone16') {
      showMergedEmptyBottomCard();
    } else {
      showDefaultBottomCards(product.images, product.name);
    }
    setInfoCardText(product.video.title, product.video.body);
    if (!product.video.src) {
      setInitialVideoPanelHidden(true);
      setPlaceholderMode('intro');
      stopPanelVideo();
      return;
    }
    setInitialVideoPanelHidden(false);
    playPanelVideo(product.video.src, false);
  }

  function showCurrentProductText(section) {
    const product = getCurrentProduct();
    setCardsPanelHidden(false);
    if (section === 'specification') {
      clearCustomCenterPanel();
      if (currentProductKey === 'clone16') {
        showMergedEmptyBottomCard();
      } else {
        showDefaultBottomCards(product.images, product.name);
      }
      if (currentProductKey === 'clone16') {
        renderCustomPlaceholder(`
          <div class="placeholder-spec-card">
            <h3>Specifications</h3>
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
          </div>
        `);
      } else {
        setInitialVideoPanelHidden(true);
        setPlaceholderMode('intro');
        stopPanelVideo();
      }
      setInfoCardText(product.specification.title, product.specification.body);
      return;
    }
    if (section === 'installation') {
      clearCustomCenterPanel();
      if (currentProductKey === 'clone16') {
        showMergedEmptyBottomCard();
      } else {
        showDefaultBottomCards(product.images, product.name);
      }
      setInfoCardText(product.installation.title, product.installation.body);
      return;
    }
    if (section === 'buy_now') {
      clearCustomCenterPanel();
      showDefaultBottomCards(product.images, product.name);
      setInfoCardText(product.buyNow.title, product.buyNow.body);
    }
  }

  if (placeholderProductButtons.length) {
    placeholderProductButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectProduct(button.dataset.product || 'clone16', { showQuickActions: true });
      });
    });
    updatePlaceholderProductSelection();
  }

  function applyMatchedResponse(match) {
    if (!match) return;

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
      stopAvatarVideo();
      setQuickActionsMode('limited');
      showAboutUsSocialCard();
      setInfoCardText(INFO_TEXT.aboutUs.title, INFO_TEXT.aboutUs.bodyHtml, true);
      playPanelVideo(PANEL_ABOUT_US_VIDEO, false);
    }
    if (match.id === 'images') showCurrentProductImages();
    if (match.id === 'videos') showCurrentProductVideo();
    if (match.id === 'specification') showCurrentProductText('specification');
    if (match.id === 'installation') showCurrentProductText('installation');
    if (match.id === 'buy_now') {
      setQuickActionsMode('limited');
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

  function detectProductKeyFromText(rawText) {
    const normalized = normalizeQuestion(rawText);
    for (const product of PRODUCT_ALIAS_MAP) {
      if (product.aliases.some((alias) => normalized.includes(alias))) {
        return product.key;
      }
    }
    return '';
  }

  function matchScriptedQuestion(rawQuestion) {
    const normalized = normalizeQuestion(rawQuestion);
    const tokens = normalized.split(' ').filter(Boolean);
    if (!tokens.length) return null;

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
    const detectedProductKey = detectProductKeyFromText(msg);
    if (detectedProductKey && PRODUCTS[detectedProductKey]) {
      currentProductKey = detectedProductKey;
      updatePlaceholderProductSelection();
      showDefaultBottomCards(PRODUCTS[detectedProductKey].images, PRODUCTS[detectedProductKey].name);
    }
    setInitialVideoPanelHidden(false);
    setQuickActionsMode('all');
    if (quickActions) quickActions.classList.remove('hidden');

    const match = matchScriptedQuestion(msg);
    if (!match) {
      setPlaceholderMode('nomatch');
      setInitialVideoPanelHidden(true);
      setQuickActionsMode('nomatch');
      if (quickActions) quickActions.classList.remove('hidden');
      setCardsPanelHidden(true);
      stopPanelVideo();
      stopAvatarVideo();
      return;
    }
    applyMatchedResponse(match);
  }

  function quickAction(label) {
    document.getElementById('userInput').value = label;
    sendMessage(label);
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
