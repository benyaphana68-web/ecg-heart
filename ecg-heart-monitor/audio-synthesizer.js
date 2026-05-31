// audio-synthesizer.js - เครื่องสังเคราะห์เสียงเต้นของหัวใจและเสียงเตือนภัย (Web Audio API Synthesizer)

export class AudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.muted = true; // เริ่มต้นด้วยสถานะปิดเสียงเพื่อมารยาทที่ดี
    this.alarmIntervalId = null;
    this.alarmActive = false;
  }

  /**
   * เริ่มต้น Audio Context (ต้องเรียกใช้หลังจากยูสเซอร์กดคลิกหน้าเว็บตามนโยบายเบราว์เซอร์)
   */
  init() {
    if (this.audioCtx) return;
    
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    } catch (e) {
      console.error("Web Audio API is not supported in this browser:", e);
    }
  }

  /**
   * สลับสถานะเปิด/ปิดเสียง (Mute / Unmute)
   */
  toggleMute(isMuted) {
    this.muted = isMuted;
    if (!this.audioCtx) this.init();

    if (this.masterGain && this.audioCtx) {
      // ค่อยๆ เปลี่ยนความดังเพื่อไม่ให้เกิดเสียงป๊อป (Clicking sound)
      const targetVolume = this.muted ? 0 : 0.25;
      this.masterGain.gain.setTargetAtTime(targetVolume, this.audioCtx.currentTime, 0.05);
    }
    return this.muted;
  }

  /**
   * เล่นเสียง Beep หัวใจเต้นปกติ
   * @param {number} freq - ความถี่เสียง (Hz)
   * @param {number} duration - ระยะเวลาเสียงค้าง (วินาที)
   */
  playHeartBeep(freq = 950, duration = 0.07) {
    if (this.muted || !this.audioCtx) return;
    
    // รีเซ็ตความชื่นมื่นหาก AudioContext หยุดทำงานชั่วคราว
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    // ป้องกันการระเบิดของเสียงขอบ (Smooth envelope)
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  /**
   * เปิดหรือปิดเสียงเตือนฉุกเฉินระดับสีแดง (เช่น กรณีหัวใจห้องล่างเต้นพลิ้ว/VF)
   */
  startEmergencyAlarm() {
    if (this.alarmActive) return;
    this.init();
    
    this.alarmActive = true;
    let highTone = true;

    const playAlarmTone = () => {
      if (!this.alarmActive || this.muted || !this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      // สลับความถี่เสียงหวอเตือนภัย (880Hz และ 660Hz)
      const freq = highTone ? 880 : 660;
      highTone = !highTone;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.38);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    };

    // เล่นโน้ตตัวแรกทันที
    playAlarmTone();
    // เล่นโน้ตถัดไปทุกๆ 400 มิลลิวินาที
    this.alarmIntervalId = setInterval(playAlarmTone, 400);
  }

  /**
   * ปิดเสียงเตือนฉุกเฉิน
   */
  stopEmergencyAlarm() {
    this.alarmActive = false;
    if (this.alarmIntervalId) {
      clearInterval(this.alarmIntervalId);
      this.alarmIntervalId = null;
    }
  }
}
