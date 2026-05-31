// app.js - ตัวประมวลผลหลักของแอปพลิเคชัน (Main Application Logic)

import { heartSVG, highlightHeartRegion } from './heart-svg.js';
import { ECGSimulator } from './ecg-simulator.js';
import { AudioSynthesizer } from './audio-synthesizer.js';

// ข้อมูลอธิบายอาการแต่ละเคสภาษาไทย
const pathologyDetails = {
  normal: {
    location: "ไม่มี (หัวใจปกติ)",
    artery: "ไม่มี (เลือดไหลเวียนปกติ)",
    leads: ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"],
    leadsStatus: "normal",
    desc: "คลื่นไฟฟ้าหัวใจมีจังหวะเต้นที่สม่ำเสมอ มี P-wave นำหน้า QRS complex ทุกตัว ความสัมพันธ์ของจังหวะเต้นเป็นปกติ สะท้อนถึงการนำไฟฟ้าหัวใจที่วิ่งจาก SA Node ผ่าน AV Node ลงไปสู่หัวใจห้องล่างโดยไม่มีการขัดขวางหรือมีกล้ามเนื้อขาดเลือด"
  },
  anterior: {
    location: "ผนังด้านหน้าหัวใจห้องล่างซ้าย (Anterior Wall)",
    artery: "Left Anterior Descending (LAD) - หลอดเลือดแดงหลักด้านหน้า",
    leads: ["V3", "V4"],
    secondaryLeads: ["V2", "V5"],
    leadsStatus: "critical",
    desc: "ตรวจพบคลื่น ST-segment ยกสูงขึ้นเด่นชัด (ST Elevation) ใน Leads V3 และ V4 ซึ่งเกิดจากการอุดตันของหลอดเลือดแดง LAD ที่ทำหน้าที่นำเลือดไปเลี้ยงกล้ามเนื้อหัวใจด้านหน้า หากไม่รีบเปิดหลอดเลือดอาจนำไปสู่ภาวะหัวใจล้มเหลวเฉียบพลัน"
  },
  inferior: {
    location: "ผนังด้านล่างหัวใจห้องล่างซ้าย (Inferior Wall)",
    artery: "Right Coronary Artery (RCA) - หลอดเลือดแดงขวา",
    leads: ["II", "III", "aVF"],
    reciprocalLeads: ["I", "aVL"],
    leadsStatus: "critical",
    desc: "พบ ST-segment ยกตัวขึ้นในกลุ่ม Lead ผนังล่าง (II, III, aVF) พร้อมมีการทรุดตัวของ ST-segment กลับด้าน (Reciprocal Depression) ใน Lead I และ aVL บ่งชี้การขาดเลือดรุนแรงที่ผนังด้านล่างของหัวใจ มักมีสาเหตุหลักมาจากการอุดตันของหลอดเลือดแดงด้านขวา (RCA)"
  },
  lateral: {
    location: "ผนังด้านข้างหัวใจห้องล่างซ้าย (Lateral Wall)",
    artery: "Left Circumflex (LCx) - หลอดเลือดแดงอ้อมหลังซ้าย",
    leads: ["I", "aVL", "V5", "V6"],
    reciprocalLeads: ["II", "III", "aVF"],
    leadsStatus: "critical",
    desc: "พบ ST-segment ยกตัวในกลุ่ม Lead ผนังข้าง (I, aVL, V5, V6) บ่งชี้ถึงภาวะเนื้อเยื่อกล้ามเนื้อหัวใจส่วนผนังด้านข้างของห้องซ้ายล่างขาดเลือดเฉียบพลันเนื่องจากหลอดเลือดแดง LCx เกิดการอุดตันกระทันหัน"
  },
  septal: {
    location: "ผนังกั้นห้องหัวใจส่วนหน้า (Septal Wall)",
    artery: "Left Anterior Descending (LAD) - กิ่งย่อย Septal Branches",
    leads: ["V1", "V2"],
    leadsStatus: "warning",
    desc: "ตรวจพบลักษณะผนังกั้นห้องหัวใจขาดเลือด โดยมีคลื่น ST-segment ยกตัวขึ้นระดับปานกลาง หรือคลื่น T-wave หัวกลับ (T-wave Inversion) ใน Lead V1 และ V2 สะท้อนถึงปัญหาในหลอดเลือดแดง LAD ส่วนปลายหรือกิ่งย่อย"
  },
  vf: {
    location: "ระบบนำไฟฟ้าหัวใจห้องล่างล้มเหลวเฉียบพลัน (Cardiac Arrest)",
    artery: "ไม่สามารถระบุได้ (กล้ามเนื้อหัวใจทั้งหมดขาดออกซิเจนขั้นรุนแรง)",
    leads: ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"],
    leadsStatus: "vf",
    desc: "คลื่นไฟฟ้าแปรปรวนอย่างสมบูรณ์แบบไร้ทิศทางและจังหวะ (Chaotic Amplitude) ไม่มี P-wave, QRS, หรือ T-wave ที่ระบุได้ หัวใจเต้นพลิ้วระรัวอย่างสั่นไหวและไม่บีบตัวส่งเลือด ผู้ป่วยจะหมดสติ ชีพจรหยุดเต้นในทันที ต้องทำการปั๊มหัวใจ (CPR) และใช้เครื่องช็อคไฟฟ้า (AED) เพื่อรักษาชีวิตทันที!"
  }
};

class ECGApplication {
  constructor() {
    this.simulator = new ECGSimulator();
    this.synthesizer = new AudioSynthesizer();
    
    // ตั้งค่าตัวแปร Logic
    this.currentPathology = 'normal';
    this.currentBpm = 75;
    this.currentGain = 1.0;
    this.currentSpeed = 25; // mm/s
    this.viewMode = 'grid'; // grid หรือ single
    this.activeSingleLead = 'II';
    this.hoveredElectrode = null;
    
    // ตัวควบคุม Canvas และการวาด
    this.canvas = document.getElementById('ecg-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // ตัวแปรเก็บประวัติเส้นกราฟ
    // historyData[leadName] = Array(width) ของค่า Y
    this.historyData = {};
    this.currentX = 0; // ตำแหน่ง X ล่าสุดของแถบวาดคลื่น
    this.eraserWidth = 18; // ความกว้างแถบลบด้านหน้าหัวอ่าน
    
    // ตัวควบคุมเวลาสำหรับแอนิเมชัน
    this.time = 0;
    this.lastTime = 0;
    this.lastBeepTime = 0;
    
    // อ้างอิง DOM Elements
    this.dom = {
      bpmSlider: document.getElementById('bpm-slider'),
      bpmVal: document.getElementById('bpm-val'),
      audioToggle: document.getElementById('audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),
      audioText: document.getElementById('audio-text'),
      pathologyTitle: document.getElementById('pathology-title'),
      pathologyTag: document.getElementById('active-pathology-tag'),
      gainSlider: document.getElementById('gain-slider'),
      gainVal: document.getElementById('gain-val'),
      speedSlider: document.getElementById('speed-slider'),
      speedVal: document.getElementById('speed-val'),
      leadSelectWrap: document.getElementById('lead-select-wrap'),
      singleLeadSelect: document.getElementById('single-lead-select'),
      diagLocation: document.getElementById('diag-location'),
      diagArtery: document.getElementById('diag-artery'),
      diagLeads: document.getElementById('diag-leads'),
      diagDesc: document.getElementById('diag-desc-text'),
      heartPlaceholder: document.getElementById('heart-svg-placeholder'),
      heartGlow: document.getElementById('heart-glow-element')
    };
    
    this.init();
  }

  init() {
    // 1. ใส่รูปหัวใจ SVG ลงใน Placeholder
    this.dom.heartPlaceholder.innerHTML = heartSVG;
    
    // 2. ปรับขนาด Canvas ให้เข้ากับกล่องแสดงผล
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // 3. เริ่มต้นโครงสร้างข้อมูลเก็บประวัติ ECG
    this.initHistoryData();
    
    // 4. ผูกการทำงานปุ่มเหตุการณ์ต่าง ๆ (Event Listeners)
    this.setupEventListeners();
    
    // 5. อัปเดตข้อมูลแสดงผลตามสภาวะเริ่มต้น (ปกติ)
    this.updatePathologyUI();
    
    // 6. เริ่มต้นลูปแอนิเมชันวาดกราฟ
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.animationLoop(t));
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentNode.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // รีเซ็ตตำแหน่งกวาดแถบกราฟหากหน้าจอเปลี่ยนขนาด
    this.currentX = 0;
    this.initHistoryData();
  }

  initHistoryData() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const leads = ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"];
    
    leads.forEach(lead => {
      this.historyData[lead] = new Array(Math.ceil(width)).fill(0);
    });
  }

  setupEventListeners() {
    // ปรับอัตราเต้นชีพจร BPM
    this.dom.bpmSlider.addEventListener('input', (e) => {
      this.currentBpm = parseInt(e.target.value);
      this.dom.bpmVal.textContent = this.currentBpm;
      
      // ถ้ากำลังเป็น VF อยู่ จะล็อคชีพจรให้ดูวิกฤตตลอดเวลา (BPM จะไม่ส่งผลต่อจังหวะชีพจรของ VF)
    });

    // ปรับความสูงคลื่น Gain
    this.dom.gainSlider.addEventListener('input', (e) => {
      this.currentGain = parseFloat(e.target.value);
      this.dom.gainVal.textContent = Math.round(this.currentGain * 10);
    });

    // ปรับความเร็วการกวาด Speed
    this.dom.speedSlider.addEventListener('input', (e) => {
      this.currentSpeed = parseInt(e.target.value);
      this.dom.speedVal.textContent = this.currentSpeed;
    });

    // เลือกเคสผิดปกติ
    const pathButtons = document.querySelectorAll('.pathology-btn');
    pathButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pathButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const pathType = btn.getAttribute('data-pathology');
        this.setPathology(pathType);
      });
    });

    // สลับโหมดการแสดงผล Lead (12 Leads หรือเดี่ยว)
    const modeButtons = document.querySelectorAll('.view-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.viewMode = btn.getAttribute('data-mode');
        if (this.viewMode === 'single') {
          this.dom.leadSelectWrap.classList.remove('hidden');
        } else {
          this.dom.leadSelectWrap.classList.add('hidden');
        }
        
        // รีเซ็ตการวาดใหม่เพื่อจัดช่องใหม่
        this.currentX = 0;
        this.initHistoryData();
      });
    });

    // เลือกดู Lead เดี่ยวในแบบขยาย
    this.dom.singleLeadSelect.addEventListener('change', (e) => {
      this.activeSingleLead = e.target.value;
      this.currentX = 0;
      this.initHistoryData();
    });

    // จัดการเสียง Beep
    this.dom.audioToggle.addEventListener('click', () => {
      const isMuted = !this.synthesizer.muted;
      const muted = this.synthesizer.toggleMute(isMuted);
      
      if (muted) {
        this.dom.audioToggle.classList.remove('unmuted');
        this.dom.audioText.textContent = "ปิดเสียง";
        this.dom.audioIcon.innerHTML = `
          <line x1="1" y1="1" x2="23" y2="23" stroke="#FF3366" stroke-width="2"></line>
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        `;
      } else {
        this.dom.audioToggle.classList.add('unmuted');
        this.dom.audioText.textContent = "เปิดเสียง";
        this.dom.audioIcon.innerHTML = `
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        `;
        // เล่นเสียงทันที 1 ครั้งเพื่อยืนยันการเปิด
        this.synthesizer.playHeartBeep(950, 0.07);
      }
    });

    // จัดการแท็บ ซ้าย (แผนภาพหัวใจ vs ขั้วไฟฟ้า)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        // ถ้าเข้าแท็บขั้วไฟฟ้า ให้รีเซ็ตสถานะไฮไลท์ขั้วไฟฟ้าเก่า
        if (tabId === 'tab-electrodes') {
          this.clearElectrodeHighlights();
        }
      });
    });

    // ระบบสัมผัสและมีปฏิสัมพันธ์กับ SVG หัวใจ
    // เมื่อยูสเซอร์กดคลิกที่กล้ามเนื้อหัวใจส่วนต่าง ๆ ให้พาไปไฮไลท์ Leads ที่มีผลกระทบ
    setTimeout(() => {
      const regions = ['septal-zone', 'anterior-zone', 'lateral-zone', 'inferior-zone'];
      regions.forEach(regId => {
        const pathEl = document.getElementById(regId);
        if (pathEl) {
          pathEl.addEventListener('click', () => {
            // ดึงชื่อตำแหน่งหัวใจและผูกไปยังปุ่มเคสโรคที่ใกล้เคียงเพื่อสาธิต
            let targetPathology = 'normal';
            if (regId === 'septal-zone') targetPathology = 'septal';
            else if (regId === 'anterior-zone') targetPathology = 'anterior';
            else if (regId === 'lateral-zone') targetPathology = 'lateral';
            else if (regId === 'inferior-zone') targetPathology = 'inferior';

            // กดปุ่มจำลองโรคอัติโนมัติ
            const btn = document.querySelector(`.pathology-btn[data-pathology="${targetPathology}"]`);
            if (btn) btn.click();
          });
        }
      });
    }, 500);

    // ปฏิสัมพันธ์กับจุดติดขั้วไฟฟ้า (Electrodes hover/click)
    const electrodes = document.querySelectorAll('.electrode');
    electrodes.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const id = e.target.id;
        this.highlightElectrodeConnection(id);
      });
      el.addEventListener('mouseleave', () => {
        this.clearElectrodeHighlights();
      });
    });
  }

  // เปลี่ยนพยาธิสภาพหัวใจ (Pathology Setter)
  setPathology(type) {
    if (this.currentPathology === type) return;
    this.currentPathology = type;

    // 1. จัดการเสียงเตือนภัย (Emergency alarm) ของโรคหัวใจ VF
    if (type === 'vf') {
      this.synthesizer.startEmergencyAlarm();
    } else {
      this.synthesizer.stopEmergencyAlarm();
    }

    // 2. จัดการเปลี่ยนสีไฮไลท์รูปหัวใจ SVG
    let region = 'normal';
    if (type === 'anterior') region = 'anterior';
    else if (type === 'inferior') region = 'inferior';
    else if (type === 'lateral') region = 'lateral';
    else if (type === 'septal') region = 'septal';
    else if (type === 'vf') region = 'vf';
    
    highlightHeartRegion(region);

    // 3. ปรับค่า BPM อัตโนมัติให้เข้ากับกรณีศึกษา
    if (type === 'vf') {
      this.dom.bpmSlider.disabled = true;
      this.dom.bpmVal.textContent = "300+ (เต้นพลิ้ว)";
    } else {
      this.dom.bpmSlider.disabled = false;
      let targetBpm = 75;
      if (type === 'anterior') targetBpm = 95; // หัวใจเต้นเร็วจากความเจ็บปวด
      if (type === 'inferior') targetBpm = 55;  // RCA อุดตันส่งผลถึงระบบนำไฟฟ้า SA node ทำให้เต้นช้า
      if (type === 'septal') targetBpm = 80;
      
      this.currentBpm = targetBpm;
      this.dom.bpmSlider.value = targetBpm;
      this.dom.bpmVal.textContent = targetBpm;
    }

    // 4. อัปเดตข้อมูลแผงรายงานการวินิจฉัยด้านขวา
    this.updatePathologyUI();
  }

  // อัปเดต UI รายงานการวินิจฉัยโรคตามสภาวะ
  updatePathologyUI() {
    const details = pathologyDetails[this.currentPathology];
    
    // ตั้งข้อความรายงาน
    this.dom.pathologyTitle.textContent = this.currentPathology === 'normal' 
      ? 'จังหวะหัวใจปกติ (Normal Sinus)' 
      : `ตรวจพบ: ${details.location}`;
      
    this.dom.diagLocation.textContent = details.location;
    this.dom.diagArtery.textContent = details.artery;
    this.dom.diagDesc.textContent = details.desc;

    // ล้างสถานะสีหัวใจ
    this.dom.pathologyTag.className = "status-pill active-pathology";
    const dot = this.dom.pathologyTag.querySelector('.pulse-dot');
    dot.className = "pulse-dot";
    
    this.dom.diagLocation.className = "diag-value highlight-value";
    this.dom.diagArtery.className = "diag-value highlight-value";

    if (details.leadsStatus === 'normal') {
      dot.classList.add('green');
      this.dom.heartGlow.className = "heart-back-glow";
    } else if (details.leadsStatus === 'warning') {
      dot.classList.add('yellow');
      this.dom.diagLocation.classList.add('warning');
      this.dom.heartGlow.className = "heart-back-glow abnormal";
    } else {
      dot.classList.add('red');
      this.dom.diagLocation.classList.add('critical');
      this.dom.diagArtery.classList.add('critical');
      this.dom.heartGlow.className = "heart-back-glow abnormal";
    }

    // วาดชิป Lead ที่ผิดปกติ
    this.dom.diagLeads.innerHTML = '';
    
    if (this.currentPathology === 'normal') {
      const chip = document.createElement('span');
      chip.className = 'lead-chip ok-chip';
      chip.textContent = 'ทุก Lead ปกติ';
      this.dom.diagLeads.appendChild(chip);
    } else if (this.currentPathology === 'vf') {
      const chip = document.createElement('span');
      chip.className = 'lead-chip fail-chip';
      chip.textContent = 'วิกฤต - ทุก Lead เสียหายรุนแรง';
      this.dom.diagLeads.appendChild(chip);
    } else {
      // สำหรับ STEMI แสดง Leads หลักที่พบการยกตัวสูงของ ST
      details.leads.forEach(leadName => {
        const chip = document.createElement('span');
        chip.className = 'lead-chip fail-chip';
        chip.textContent = `${leadName} (ST Elevation)`;
        this.dom.diagLeads.appendChild(chip);
      });

      // ถ้ามี reciprocal leads
      if (details.reciprocalLeads) {
        details.reciprocalLeads.forEach(leadName => {
          const chip = document.createElement('span');
          chip.className = 'lead-chip';
          chip.style.borderColor = 'rgba(99, 102, 241, 0.4)';
          chip.style.color = '#A5B4FC';
          chip.textContent = `${leadName} (ST Depress)`;
          this.dom.diagLeads.appendChild(chip);
        });
      }
    }
  }

  // ไฮไลท์จุดขั้วไฟฟ้าสัมพันธ์กับ Leads และหัวใจส่วนที่รับกระแสไฟฟ้า
  highlightElectrodeConnection(electrodeId) {
    this.clearElectrodeHighlights();
    
    const electrode = document.getElementById(electrodeId);
    if (electrode) electrode.classList.add('highlighted');
    
    // จับคู่จุดขั้วไฟฟ้ากับกลุ่ม Leads ที่มีผลกระทบ
    let leadsToHighlight = [];
    let heartRegionToGlow = '';
    
    switch (electrodeId) {
      case 'el-V1': leadsToHighlight = ['V1']; heartRegionToGlow = 'septal-zone'; break;
      case 'el-V2': leadsToHighlight = ['V2']; heartRegionToGlow = 'septal-zone'; break;
      case 'el-V3': leadsToHighlight = ['V3']; heartRegionToGlow = 'anterior-zone'; break;
      case 'el-V4': leadsToHighlight = ['V4']; heartRegionToGlow = 'anterior-zone'; break;
      case 'el-V5': leadsToHighlight = ['V5']; heartRegionToGlow = 'lateral-zone'; break;
      case 'el-V6': leadsToHighlight = ['V6']; heartRegionToGlow = 'lateral-zone'; break;
      case 'el-RA': leadsToHighlight = ['I', 'II', 'aVR']; break;
      case 'el-LA': leadsToHighlight = ['I', 'III', 'aVL']; break;
      case 'el-LL': leadsToHighlight = ['II', 'III', 'aVF']; break;
    }

    // เก็บข้อมูล Lead ที่ถูกไฮไลท์ชั่วคราวเพื่อส่งผลลัพธ์ไปวาดกรอบไฟบน Canvas
    this.highlightedLeads = leadsToHighlight;

    // กระตุ้นสีที่หัวใจชั่วคราว (ถ้ามีการเชื่อมโยงผนังหัวใจชัดเจน)
    if (heartRegionToGlow) {
      const wall = document.getElementById(heartRegionToGlow);
      if (wall) wall.style.fill = '#FF5A79';
    }
  }

  clearElectrodeHighlights() {
    document.querySelectorAll('.electrode').forEach(el => {
      el.classList.remove('highlighted');
    });
    
    // คืนสีเดิมให้หัวใจ (ตามสภาวะโรคปัจจุบัน)
    let region = 'normal';
    if (this.currentPathology === 'anterior') region = 'anterior';
    else if (this.currentPathology === 'inferior') region = 'inferior';
    else if (this.currentPathology === 'lateral') region = 'lateral';
    else if (this.currentPathology === 'septal') region = 'septal';
    else if (this.currentPathology === 'vf') region = 'vf';
    highlightHeartRegion(region);
    
    this.highlightedLeads = [];
  }

  // ฟังก์ชันลูปวาดมอนิเตอร์คลื่นหัวใจ (60 FPS Animation Loop)
  animationLoop(timestamp) {
    const elapsed = (timestamp - this.lastTime) / 1000; // วินาที
    this.lastTime = timestamp;
    
    // ตัวแปรปรับแต่งสเกลเวลา (เพื่อให้คลื่นสมจริงขึ้น)
    this.time += elapsed;
    
    // คณนาหาพิกเซลที่ความเร็วต้องเคลื่อนไหวต่อเฟรม
    // 1 มิลลิเมตรทางวิทยาศาสตร์แพทย์ = ประมาณ 4 พิกเซล
    const mmPerSec = this.currentSpeed;
    const pixelsPerSec = mmPerSec * 4;
    const pixelsToDraw = Math.ceil(pixelsPerSec * elapsed);
    
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    
    // 1. ประมวลผลคลื่นล่วงหน้าและบันทึกลง Buffer ประวัติ
    const leads = this.viewMode === 'grid' 
      ? ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"]
      : [this.activeSingleLead];
      
    for (let p = 0; p < pixelsToDraw; p++) {
      // เลื่อนตำแหน่งหัวอ่าน (currentX) ไปทีละพิกเซล
      this.currentX = (this.currentX + 1) % Math.ceil(width);
      
      // แปลง X บน Canvas ไปเป็นเวลาวิทยาศาตร์จำลองเพื่อป้อนให้สูตรคณิตศาสตร์คลื่นไฟฟ้า
      // จุดประสงค์เพื่อให้คลื่นซิงค์ความเร็วรอบได้เสถียร
      const pixelTimeScale = (this.currentX / pixelsPerSec);
      
      // วนคำนวณสัญญาณให้ครบทุก Lead
      leads.forEach(lead => {
        const val = this.simulator.getSignalValue(lead, this.time + (p * 0.002), this.currentBpm, this.currentPathology);
        if (this.historyData[lead]) {
          this.historyData[lead][this.currentX] = val;
        }
      });

      // 2. จัดการซิงค์จังหวะชีพจร (เต้นชีพจรและส่งเสียง Beep)
      // หัวใจจะเต้นบีบตัวเมื่อเข้าสู่ช่วงยอด R-wave ของ Lead II (เฟสที่ 0.25 ของรอบจังหวะ)
      if (this.currentPathology !== 'vf') {
        const cycleDuration = 60 / this.currentBpm;
        const cycleTime = this.time % cycleDuration;
        const rWaveTime = 0.25 * cycleDuration;
        
        // ตรวจสอบว่ารอบเวลาได้วิ่งครบรอบผ่านจุด R-wave หรือยัง
        if (cycleTime >= rWaveTime && (this.time - this.lastBeepTime) > (cycleDuration * 0.8)) {
          this.lastBeepTime = this.time;
          
          // เล่นเสียงปี๊บปกติ
          const pitch = this.currentPathology === 'normal' ? 950 : 800; // โรคขาดเลือดเสียงจะทุ้มต่ำเตือนเล็กน้อย
          this.synthesizer.playHeartBeep(pitch, 0.08);
          
          // ทำภาพหัวใจบีบตัว (Heartbeat class)
          const heartContainer = document.getElementById('heart-container');
          if (heartContainer) {
            heartContainer.classList.add('beat');
            setTimeout(() => {
              heartContainer.classList.remove('beat');
            }, 90);
          }
        }
      }
    }
    
    // 3. เริ่มขั้นตอนวาดเนื้อหาบนหน้าจอ (Rendering)
    this.drawMonitorGrid(leads);
    
    // รันลูปเฟรมถัดไป
    requestAnimationFrame((t) => this.animationLoop(t));
  }

  // วาดพื้นหลังมอนิเตอร์แพทย์ (ตารางความถี่ 1 มม. สีแดง/ส้มจาง และวาดเส้นคลื่นหัวใจ)
  drawMonitorGrid(leads) {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    
    // เคลียร์ Canvas สดก่อน
    this.ctx.fillStyle = '#05080E';
    this.ctx.fillRect(0, 0, width, height);
    
    // A. วาดตารางกริด (ECG Grid Paper) แบบละเอียด
    this.ctx.strokeStyle = 'rgba(255, 77, 77, 0.05)'; // กริดย่อย 1 มม.
    this.ctx.lineWidth = 0.5;
    const gridSpacing = 4; // 1 มิลลิเมตร = 4 พิกเซล
    
    for (let x = 0; x < width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
    
    // กริดหลัก 5 มม. (เส้นเข้มขึ้นเล็กน้อย)
    this.ctx.strokeStyle = 'rgba(255, 77, 77, 0.16)';
    this.ctx.lineWidth = 1.0;
    const largeGridSpacing = gridSpacing * 5; // 5 มม. = 20 พิกเซล
    
    for (let x = 0; x < width; x += largeGridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += largeGridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // B. วาดเส้นคลื่นหัวใจของแต่ละ Lead
    const numLeads = leads.length;
    let numCols = 1;
    let numRows = 1;

    if (this.viewMode === 'grid') {
      numCols = 3; // จัดแบบ 4 แถว 3 คอลัมน์ (ตามมาตรฐานมอนิเตอร์วินิจฉัย)
      numRows = 4;
    }

    const cellWidth = width / numCols;
    const cellHeight = height / numRows;

    leads.forEach((lead, index) => {
      // คำนวณหาตำแหน่งตารางขอบเขต (Bounding Box) ของ Lead นี้
      const colIndex = index % numCols;
      const rowIndex = Math.floor(index / numCols);
      
      const xOffset = colIndex * cellWidth;
      const yOffset = rowIndex * cellHeight;
      const centerY = yOffset + (cellHeight / 2);
      
      // ดึงระดับสีตามสภาวะ
      let strokeColor = '#00FF88'; // ปกติเขียวนีออน
      
      if (this.currentPathology === 'vf') {
        strokeColor = '#FF3366'; // แดงวิกฤตหมดเมื่อเกิด VF
      } else {
        const details = pathologyDetails[this.currentPathology];
        const isTarget = details && details.leads.includes(lead);
        const isSecondary = details && details.secondaryLeads && details.secondaryLeads.includes(lead);
        const isReciprocal = details && details.reciprocalLeads && details.reciprocalLeads.includes(lead);
        
        if (isTarget) {
          strokeColor = '#FF3366'; // แดงเตือนภัยหลัก
        } else if (isSecondary) {
          strokeColor = '#FFAA00'; // ส้มเตือนภัยรอง
        } else if (isReciprocal) {
          strokeColor = '#4C91FF'; // น้ำเงินเตือนฝั่งตรงข้าม
        }
      }

      // วาดกรอบตัดแบ่งช่องแบบจาง ๆ
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(xOffset, yOffset, cellWidth, cellHeight);

      // เขียนป้ายชื่อ Lead ไว้มุมซ้ายบนของช่อง
      this.ctx.fillStyle = strokeColor;
      this.ctx.font = 'bold 11px Outfit, Sarabun, sans-serif';
      this.ctx.fillText(lead, xOffset + 12, yOffset + 18);

      // ไฮไลท์กรอบเป็นสีเหลืองถ้าเกิดกรณีขั้วไฟฟ้านั้นโดนชี้นำเมาส์
      if (this.highlightedLeads && this.highlightedLeads.includes(lead)) {
        this.ctx.strokeStyle = 'rgba(255, 204, 0, 0.4)';
        this.ctx.lineWidth = 2.0;
        this.ctx.strokeRect(xOffset + 2, yOffset + 2, cellWidth - 4, cellHeight - 4);
        
        // วาดฉากหลังกึ่งโปร่งแสงสีเหลืองอ่อน
        this.ctx.fillStyle = 'rgba(255, 204, 0, 0.02)';
        this.ctx.fillRect(xOffset + 2, yOffset + 2, cellWidth - 4, cellHeight - 4);
      }

      // วาดเส้นกราฟคลื่นไฟฟ้า
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1.8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // การไล่เฉดเรืองแสงเฉพาะสำหรับ Lead เดี่ยว
      if (this.viewMode === 'single') {
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = strokeColor;
        this.ctx.lineWidth = 2.2;
      } else {
        this.ctx.shadowBlur = 0; // ล้างเงาออกสำหรับหน้าจอรวม เพื่อความลื่นไหล
      }

      this.ctx.beginPath();
      
      const history = this.historyData[lead];
      let firstPoint = true;

      // วาดเส้นคลื่นสะสมจากซ้ายไปขวา
      for (let x = 0; x < cellWidth; x++) {
        // แผนผังพิกเซลบนหน้าจอจริง
        const canvasX = xOffset + x;
        
        // คำนวณข้ามพิกเซลที่เป็น "แถบลบ" หรือตัวกวาด (Eraser sweep gap)
        // ตำแหน่ง X ในประวัติจะถูกแมปให้ตรงกับพิกเซลปัจจุบัน
        const historyIdx = Math.round(x * (width / cellWidth));
        
        // ดึงตำแหน่งหัวอ่านปัจจุบันที่แมปลงช่องย่อย
        const localCurrentX = Math.round(this.currentX * (cellWidth / width));
        
        // ตรวจสอบว่าจุดนี้อยู่ในช่องแถบลบหรือไม่
        const isInEraser = (x >= localCurrentX && x < localCurrentX + Math.round(this.eraserWidth * (cellWidth / width))) ||
                           (localCurrentX + Math.round(this.eraserWidth * (cellWidth / width)) > cellWidth && 
                            x < (localCurrentX + Math.round(this.eraserWidth * (cellWidth / width))) % cellWidth);

        if (isInEraser) {
          continue; // ไม่วาดเส้นในช่วงแถบลบ
        }

        // ดึงค่า Y สัญญาณ และคูณอัตราขยาย Gain
        const signalVal = history[historyIdx] || 0;
        
        // ปรับทิศทาง (aVR มีรูปร่างคว่ำโดยสูตรธรรมชาติ แต่อัตราขยายจะปรับให้เสถียรตามแกน)
        const yValue = centerY - (signalVal * 30 * this.currentGain);

        if (firstPoint) {
          this.ctx.moveTo(canvasX, yValue);
          firstPoint = false;
        } else {
          this.ctx.lineTo(canvasX, yValue);
        }
      }
      this.ctx.stroke();
      
      // รีเซ็ตการสะท้อนแสงสำหรับวาดองค์ประกอบอื่น
      this.ctx.shadowBlur = 0;

      // วาดจุดหัวอ่านสว่าง (Glowing Sweep Head)
      const localCurrentX = Math.round(this.currentX * (cellWidth / width));
      const sweepHeadIdx = this.currentX;
      const headSignal = history[sweepHeadIdx] || 0;
      const headY = centerY - (headSignal * 30 * this.currentGain);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(xOffset + localCurrentX, headY, 3.5, 0, 2 * Math.PI);
      this.ctx.fill();

      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(xOffset + localCurrentX, headY, 6, 0, 2 * Math.PI);
      this.ctx.stroke();
    });
    
    // C. อัปเดตตำแหน่งเส้นกวาดหน้าจอบนตัวช่วยทางเทคนิค
    const scannerLine = document.getElementById('sweep-scanner-line');
    if (scannerLine) {
      scannerLine.style.display = 'block';
      scannerLine.style.left = `${this.currentX}px`;
      scannerLine.style.width = `2px`;
      scannerLine.style.background = this.currentPathology === 'vf' ? 'var(--color-critical)' : 'var(--color-normal)';
      scannerLine.style.boxShadow = `0 0 10px ${this.currentPathology === 'vf' ? 'var(--color-critical)' : 'var(--color-normal)'}`;
    }
  }
}

// โหลดระบบแอปพลิเคชันทันทีที่เว็บโหลดเสร็จสมบูรณ์
window.addEventListener('DOMContentLoaded', () => {
  const app = new ECGApplication();

  // ปลดล็อกเสียงเมื่อยูสเซอร์กดปฏิสัมพันธ์ครั้งแรกบนเว็บไซต์ (เบราว์เซอร์โพลีซี)
  document.body.addEventListener('click', () => {
    app.synthesizer.init();
  }, { once: true });
});
