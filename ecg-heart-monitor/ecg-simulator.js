// ecg-simulator.js - ตัวจำลองคลื่นไฟฟ้าหัวใจทางคณิตศาสตร์ (Mathematical ECG Simulator)

export class ECGSimulator {
  constructor() {
    // กำหนดค่าตั้งต้นของแต่ละ Lead ในสภาวะปกติ (Normal amplitudes)
    this.leadConfigs = {
      'I':   { p: 0.10, q: -0.05, r: 0.90, s: -0.15, t: 0.25, polarity: 1 },
      'II':  { p: 0.15, q: -0.05, r: 1.30, s: -0.20, t: 0.30, polarity: 1 },
      'III': { p: 0.08, q: -0.05, r: 0.50, s: -0.15, t: 0.15, polarity: 1 },
      'aVR': { p: -0.12, q: 0.05, r: -0.30, s: 1.00, t: -0.25, polarity: -1 }, // aVR จะกลับหัวปกติ
      'aVL': { p: 0.05, q: -0.05, r: 0.40, s: -0.10, t: 0.12, polarity: 1 },
      'aVF': { p: 0.12, q: -0.05, r: 0.95, s: -0.18, t: 0.22, polarity: 1 },
      'V1':  { p: 0.04, q: -0.02, r: 0.20, s: -1.20, t: 0.10, polarity: 1 }, // V1 มี r เล็ก S ลึก
      'V2':  { p: 0.06, q: -0.02, r: 0.45, s: -1.00, t: 0.18, polarity: 1 },
      'V3':  { p: 0.08, q: -0.03, r: 0.85, s: -0.70, t: 0.25, polarity: 1 }, // V3-V4 เป็น Transitional zone
      'V4':  { p: 0.10, q: -0.04, r: 1.20, s: -0.40, t: 0.28, polarity: 1 },
      'V5':  { p: 0.12, q: -0.05, r: 1.25, s: -0.20, t: 0.28, polarity: 1 }, // V5-V6 มี R สูง S ตื้น
      'V6':  { p: 0.10, q: -0.05, r: 1.10, s: -0.15, t: 0.24, polarity: 1 }
    };
  }

  /**
   * คำนวณความสูงคลื่นไฟฟ้าหัวใจ ณ เวลา t (วินาที) สำหรับ Lead และเคสโรคที่กำหนด
   * @param {string} lead - ชื่อ Lead (I, II, III, aVR, aVL, aVF, V1-V6)
   * @param {number} t - เวลาเป็นวินาที
   * @param {number} bpm - อัตราการเต้นของหัวใจ (ครั้งต่อนาที)
   * @param {string} pathology - ชนิดความผิดปกติ (normal, anterior, inferior, lateral, septal, vf)
   */
  getSignalValue(lead, t, bpm, pathology) {
    // 1. จัดการกรณีหัวใจเต้นพลิ้วระรัว (Ventricular Fibrillation - VF)
    if (pathology === 'vf') {
      return this._generateVF(t);
    }

    const config = this.leadConfigs[lead] || this.leadConfigs['II'];
    const cycleDuration = 60 / bpm; // ระยะเวลาต่อ 1 การเต้น (วินาที)
    const phase = (t % cycleDuration) / cycleDuration; // สัดส่วนเฟส 0 ถึง 1

    // กำหนดลักษณะสัญญาณรบกวนพื้นหลังเล็กน้อย (Baseline Noise)
    const noise = (Math.sin(t * 120) * 0.01) + (Math.sin(t * 310) * 0.005);
    
    // ตั้งระดับ ST segment และ T wave เริ่มต้นตามปกติ
    let stShift = 0;
    let tMultiplier = 1.0;

    // 2. จัดการการยกหรือทรุดของระดับ ST (ST Elevation / Depression) ตามพยาธิสภาพของโรค
    switch (pathology) {
      case 'anterior': // กล้ามเนื้อหัวใจผนังหน้าขาดเลือดเฉียบพลัน (V3, V4)
        if (lead === 'V3' || lead === 'V4') {
          stShift = 0.55; // ST Elevation สูงมาก
          tMultiplier = 1.6; // T wave จะสูงเด่นตาม (Hyperacute T)
        } else if (lead === 'V2' || lead === 'V5') {
          stShift = 0.20; // มีผลข้างเคียงเล็กน้อย
        }
        break;

      case 'inferior': // กล้ามเนื้อหัวใจผนังล่างขาดเลือดเฉียบพลัน (II, III, aVF)
        if (lead === 'II' || lead === 'III' || lead === 'aVF') {
          stShift = 0.50; // ST Elevation
          tMultiplier = 1.5;
        } else if (lead === 'I' || lead === 'aVL') {
          stShift = -0.25; // Reciprocal ST Depression (กลับขั้วลงใต้เบสไลน์)
        }
        break;

      case 'lateral': // กล้ามเนื้อหัวใจผนังข้างขาดเลือดเฉียบพลัน (I, aVL, V5, V6)
        if (lead === 'I' || lead === 'aVL' || lead === 'V5' || lead === 'V6') {
          stShift = 0.45; // ST Elevation
          tMultiplier = 1.4;
        } else if (lead === 'II' || lead === 'III' || lead === 'aVF') {
          stShift = -0.18; // Reciprocal ST Depression
        }
        break;

      case 'septal': // กล้ามเนื้อหัวใจส่วนกั้นห้องขาดเลือด (V1, V2)
        if (lead === 'V1' || lead === 'V2') {
          stShift = 0.35; // ST Elevation
          tMultiplier = -1.2; // T-Wave Inversion (หัวกลับ)
        }
        break;
    }

    // 3. คำนวณคลื่นแต่ละส่วน (P-QRS-T Waveform Modeling)
    let value = 0;

    // A. คลื่น P Wave (Atrial Depolarization): เฟส 0.05 ถึง 0.15
    const pStart = 0.04;
    const pEnd = 0.14;
    if (phase >= pStart && phase <= pEnd) {
      const pPhase = (phase - pStart) / (pEnd - pStart);
      value += config.p * Math.sin(pPhase * Math.PI);
    }

    // B. ช่วง PR Segment (เสถียรที่ศูนย์): เฟส 0.14 ถึง 0.21 (ไม่มีการบวกค่า)

    // C. คลื่น Q Wave: เฟส 0.21 ถึง 0.23
    const qStart = 0.21;
    const qEnd = 0.235;
    if (phase >= qStart && phase <= qEnd) {
      const qPhase = (phase - qStart) / (qEnd - qStart);
      value += config.q * Math.sin(qPhase * Math.PI);
    }

    // D. คลื่น R Wave (Ventricular Depolarization ยอดแหลม): เฟส 0.235 ถึง 0.27
    const rStart = 0.235;
    const rEnd = 0.27;
    const rPeak = 0.25;
    if (phase >= rStart && phase <= rEnd) {
      if (phase < rPeak) {
        const rPhase = (phase - rStart) / (rPeak - rStart);
        value += config.r * rPhase;
      } else {
        const rPhase = (rEnd - phase) / (rEnd - rPeak);
        value += config.r * rPhase;
      }
    }

    // E. คลื่น S Wave: เฟส 0.27 ถึง 0.295
    const sStart = 0.27;
    const sEnd = 0.295;
    if (phase >= sStart && phase <= sEnd) {
      const sPhase = (phase - sStart) / (sEnd - sStart);
      value += config.s * Math.sin(sPhase * Math.PI);
    }

    // F. คลื่น ST Segment และ T Wave (Ventricular Repolarization)
    // สำหรับสภาวะปกติ คลื่น T อยู่ระหว่างเฟส 0.36 ถึง 0.58
    // แต่ถ้ามี ST elevation จุดเริ่มต้นตั้งแต่วินาทีที่พ้น S wave (0.295) จะถูกยกระดับขึ้นทันที
    const stStart = 0.295;
    const tEnd = 0.56;
    const tPeak = 0.44;

    if (phase >= stStart && phase <= tEnd) {
      // คำนวณความสูงพื้นหลังของช่วง ST ที่ยกหรือยุบตัวลง
      // ใช้ฟังก์ชันการเกลี่ยค่าโค้งให้สมูท (Smooth transition) จากจุดจบ S-wave ไปหาระดับ ST
      let currentSt = 0;
      if (phase < 0.34) {
        const tScale = (phase - stStart) / (0.34 - stStart);
        currentSt = stShift * tScale;
      } else {
        // ให้เกลี่ยระดับ ST คืนลงสู่ baseline เล็กน้อยใกล้ ๆ สิ้นสุด T-wave
        const tScale = (tEnd - phase) / (tEnd - 0.34);
        currentSt = stShift * Math.pow(tScale, 0.7);
      }
      value += currentSt;

      // คำนวณ คลื่น T Wave เอง
      const tWaveStart = 0.35;
      if (phase >= tWaveStart && phase <= tEnd) {
        let tValue = 0;
        if (phase < tPeak) {
          const tPhase = (phase - tWaveStart) / (tPeak - tWaveStart);
          tValue = config.t * tMultiplier * Math.sin(tPhase * Math.PI / 2);
        } else {
          const tPhase = (tEnd - phase) / (tEnd - tPeak);
          tValue = config.t * tMultiplier * Math.sin(tPhase * Math.PI / 2);
        }
        value += tValue;
      }
    }

    // G. ช่วงหลังคลื่น T (TP Segment) เสถียรที่ baseline จนกระทั่งจบลูปเต้น

    return value + noise;
  }

  /**
   * จำลองคลื่นสัญญาณหัวใจเต้นพริ้ว (Ventricular Fibrillation - VF) แบบสับสนวุ่นวาย
   * เกิดจากการรวมกันของคลื่น Sine หลายๆ ความถี่เพื่อสร้างคลื่นบิดเบี้ยวไร้จังหวะ
   */
  _generateVF(t) {
    const f1 = 4.2;  // ความถี่คลื่นหลัก
    const f2 = 7.8;  // ความถี่สั่นไหว
    const f3 = 13.5; // ความถี่นอยส์สั่นถี่ยิบ
    
    const w1 = Math.sin(t * f1 * 2 * Math.PI) * 0.35;
    const w2 = Math.sin(t * f2 * 2 * Math.PI + 1.2) * 0.22;
    const w3 = Math.cos(t * f3 * 2 * Math.PI + 2.5) * 0.12;
    const randomNoise = (Math.random() - 0.5) * 0.08;

    return w1 + w2 + w3 + randomNoise;
  }
}
