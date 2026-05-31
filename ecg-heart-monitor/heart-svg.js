// heart-svg.js - ข้อมูลแผนภาพเวกเตอร์หัวใจแบบโต้ตอบ (Interactive SVG Heart Diagram)

export const heartSVG = `
<svg id="heart-vector" viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients for realistic glowing effects -->
    <radialGradient id="aorta-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF5A79" />
      <stop offset="100%" stop-color="#C2203F" />
    </radialGradient>
    <radialGradient id="pulmonary-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4C91FF" />
      <stop offset="100%" stop-color="#1B4EA3" />
    </radialGradient>
    <radialGradient id="base-heart-grad" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2D3548" />
      <stop offset="100%" stop-color="#151A26" />
    </radialGradient>
    
    <!-- Abnormal Glow Filter -->
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g id="heart-container" transform="translate(0, 0)">
    <!-- หลอดเลือดใหญ่ Aorta -->
    <path id="aorta" d="M 175,120 C 175,40 255,40 255,90 C 255,110 240,130 220,140" 
          fill="none" stroke="url(#aorta-grad)" stroke-width="28" stroke-linecap="round" />
    <path id="aorta-branch1" d="M 205,55 L 205,30" fill="none" stroke="url(#aorta-grad)" stroke-width="8" stroke-linecap="round" />
    <path id="aorta-branch2" d="M 222,57 L 225,30" fill="none" stroke="url(#aorta-grad)" stroke-width="8" stroke-linecap="round" />
    <path id="aorta-branch3" d="M 238,65 L 245,38" fill="none" stroke="url(#aorta-grad)" stroke-width="8" stroke-linecap="round" />

    <!-- หลอดเลือดดำใหญ่ Superior Vena Cava -->
    <path id="vena-cava" d="M 140,40 L 140,150" 
          fill="none" stroke="#4C6E8D" stroke-width="22" stroke-linecap="round" />
          
    <!-- หลอดเลือด Pulmonary Artery (ไขว้ด้านหน้า) -->
    <path id="pulmonary-artery" d="M 215,150 C 215,100 150,110 145,95" 
          fill="none" stroke="url(#pulmonary-grad)" stroke-width="24" stroke-linecap="round" />
    <path id="pulmonary-left" d="M 150,100 C 130,105 110,115 100,120" fill="none" stroke="url(#pulmonary-grad)" stroke-width="12" />
    <path id="pulmonary-right" d="M 205,125 C 230,120 260,115 270,110" fill="none" stroke="url(#pulmonary-grad)" stroke-width="12" />

    <!-- โครงสร้างหัวใจด้านหลัง (Background base) -->
    <path d="M 120,160 C 100,160 85,210 100,240 C 115,270 190,360 200,370 C 210,360 285,270 300,240 C 315,210 300,160 280,160 Z" 
          fill="url(#base-heart-grad)" stroke="#3F4A61" stroke-width="4" />

    <!-- หัวใจห้องบนขวา Right Atrium (มุมมองผู้สังเกตด้านซ้าย) -->
    <path id="right-atrium" class="heart-chamber" d="M 130,155 C 90,165 85,210 115,225 C 125,230 135,215 140,205 Z" 
          fill="#354056" stroke="#4A5978" stroke-width="2.5" />
          
    <!-- หัวใจห้องบนซ้าย Left Atrium (มุมมองผู้สังเกตด้านขวา) -->
    <path id="left-atrium" class="heart-chamber" d="M 270,155 C 310,165 315,210 285,225 C 275,230 265,215 260,205 Z" 
          fill="#3D4A63" stroke="#52658A" stroke-width="2.5" />

    <!-- ==================== กล้ามเนื้อหัวใจส่วนห้องล่าง แบ่งตามจุดวินิจฉัย (Cardiac Walls) ==================== -->

    <!-- 1. ผนังหัวใจส่วนกั้นห้อง (Septal Wall / Zone) -->
    <path id="septal-zone" class="cardiac-wall" d="M 195,200 C 180,240 178,280 190,320 L 205,320 C 215,280 215,240 205,200 Z" 
          fill="#44516D" stroke="#5C6E94" stroke-width="2" />
          
    <!-- 2. ผนังหัวใจด้านหน้า (Anterior Wall / Zone) -->
    <path id="anterior-zone" class="cardiac-wall" d="M 195,200 C 190,240 188,270 200,305 C 170,290 155,270 145,240 C 135,210 160,200 195,200 Z" 
          fill="#4A5979" stroke="#647AA6" stroke-width="2" />

    <!-- 3. ผนังหัวใจด้านข้าง (Lateral Wall / Zone) -->
    <path id="lateral-zone" class="cardiac-wall" d="M 205,200 C 235,200 265,210 260,250 C 255,285 235,310 208,335 C 218,290 220,240 205,200 Z" 
          fill="#516184" stroke="#6D83B2" stroke-width="2" />

    <!-- 4. ผนังหัวใจด้านล่าง (Inferior Wall / Zone) -->
    <path id="inferior-zone" class="cardiac-wall" d="M 145,240 C 155,270 170,290 200,305 C 208,335 200,350 200,366 C 180,350 120,285 105,250 C 100,230 125,225 145,240 Z" 
          fill="#3E4C69" stroke="#556991" stroke-width="2" />

    <!-- เส้นเลือดหัวใจเลี้ยงกล้ามเนื้อหัวใจ (Coronary Arteries - วาดทับด้านบน) -->
    <!-- ขวา RCA -->
    <path id="rca-artery" class="coronary-artery" d="M 175,185 Q 150,195 130,225 T 120,270 T 135,320" 
          fill="none" stroke="#FF4D4D" stroke-width="3" stroke-linecap="round" opacity="0.85" />
    
    <!-- ซ้ายหลัก LCA & กิ่งหน้า LAD & กิ่งข้าง LCx -->
    <path id="lca-artery" class="coronary-artery" d="M 225,185 Q 230,190 235,195" 
          fill="none" stroke="#FF4D4D" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
    <path id="lad-artery" class="coronary-artery" d="M 235,195 Q 215,230 205,265 T 198,335" 
          fill="none" stroke="#FF4D4D" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
    <path id="lcx-artery" class="coronary-artery" d="M 235,195 Q 260,205 268,230 T 260,280" 
          fill="none" stroke="#FF4D4D" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />

    <!-- ข้อความระบุกายวิภาคย่อ (คลิกดูคำอธิบายได้) -->
    <g class="heart-labels" style="font-family: 'Inter', system-ui, sans-serif; font-size: 10px; font-weight: bold; pointer-events: none;" fill="#A5B4FC">
      <text x="145" y="270" text-anchor="middle" opacity="0.6">Anterior</text>
      <text x="250" y="270" text-anchor="middle" opacity="0.6">Lateral</text>
      <text x="155" y="325" text-anchor="middle" opacity="0.6">Inferior</text>
      <text x="195" y="225" text-anchor="middle" opacity="0.6" transform="rotate(-70 195 225)">Septum</text>
    </g>
  </g>
</svg>
`;

// ฟังก์ชันระบายสีและกะพริบตามความผิดปกติ
export function highlightHeartRegion(region) {
  // เคลียร์คลาสผิดปกติทั้งหมดก่อน
  const walls = document.querySelectorAll('.cardiac-wall');
  walls.forEach(wall => {
    wall.classList.remove('abnormal-glow', 'ischemic-glow');
  });

  const arteries = document.querySelectorAll('.coronary-artery');
  arteries.forEach(art => {
    art.classList.remove('artery-blocked');
  });

  if (!region || region === 'normal') return;

  // ตั้งค่าขอบเขตความผิดปกติและเส้นเลือดที่เป็นเป้าหมาย
  let targetWallId = '';
  let targetArteryIds = [];

  switch (region) {
    case 'septal':
      targetWallId = 'septal-zone';
      targetArteryIds = ['lca-artery', 'lad-artery'];
      break;
    case 'anterior':
      targetWallId = 'anterior-zone';
      targetArteryIds = ['lca-artery', 'lad-artery'];
      break;
    case 'lateral':
      targetWallId = 'lateral-zone';
      targetArteryIds = ['lca-artery', 'lcx-artery'];
      break;
    case 'inferior':
      targetWallId = 'inferior-zone';
      targetArteryIds = ['rca-artery'];
      break;
    case 'vf':
      // ถ้าเป็น VF ให้หัวใจสั่นทั้งหมด
      walls.forEach(wall => wall.classList.add('abnormal-glow'));
      return;
  }

  const targetWall = document.getElementById(targetWallId);
  if (targetWall) {
    targetWall.classList.add('abnormal-glow');
  }

  targetArteryIds.forEach(id => {
    const art = document.getElementById(id);
    if (art) {
      art.classList.add('artery-blocked');
    }
  });
}
