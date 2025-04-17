// main.js
// --- Variables y peinados de ejemplo ---
const hairstyleOptions = [
  { name: 'Corte Clásico', img: 'hairstyle1.jpg' },
  { name: 'Cabello Largo', img: 'hairstyle2.jpg' },
  { name: 'Corte Moderno', img: 'hairstyle3.jpg' },
  { name: 'Rulos Volumen', img: 'hairstyle4.jpg' },
  { name: 'Bob Elegante', img: 'hairstyle5.jpg' },
  { name: 'Rapado Lateral', img: 'hairstyle6.jpg' }
];

// --- Elementos DOM ---
const photoUpload = document.getElementById('photo-upload');
const uploadLabel = document.querySelector('.upload-label');
const previewSection = document.getElementById('preview-section');
const originalPhoto = document.getElementById('original-photo');
const hairstylesList = document.getElementById('hairstyles-list');

// --- Lógica de UI ---
photoUpload.onchange = async function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(ev) {
    originalPhoto.src = ev.target.result;
    previewSection.style.display = '';
    await renderHairstyles(ev.target.result);
    window.scrollTo({ top: previewSection.offsetTop - 40, behavior: 'smooth' });
  };
  reader.readAsDataURL(file);
};

async function renderHairstyles(baseImg) {
  hairstylesList.innerHTML = '<div style="text-align:center;color:#888;width:100%;">Generando peinados con IA...</div>';
  // Lista de prompts de ejemplo para peinados
  const hairstylePrompts = [
    'short hair, neat hairstyle',
    'long straight hair',
    'modern fade haircut',
    'curly hair, volume',
    'bob haircut',
    'buzz cut, side shaved'
  ];
  // Llama al Space de HuggingFace para cada peinado
  const results = await Promise.all(hairstylePrompts.map(async (prompt) => {
    try {
      // La mayoría de Spaces requieren multipart/form-data
      const formData = new FormData();
      formData.append('image', dataURLtoBlob(baseImg), 'photo.jpg');
      formData.append('prompt', prompt);
      // Ahora usamos el backend proxy local
      const response = await fetch('http://localhost:3001/generate-hairstyle', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Error en HuggingFace Space');
      const result = await response.json();
      // El Space puede devolver la URL de la imagen generada en diferentes campos
      const url = result.data && result.data[0] ? result.data[0] : null;
      return { url, name: prompt };
    } catch (err) {
      return { url: null, name: prompt, error: true };
    }
  }));
  // Renderiza los resultados
  hairstylesList.innerHTML = '';
  results.forEach(res => {
    const card = document.createElement('div');
    card.className = 'hairstyle-card';
    if (res.url) {
      card.innerHTML = `
        <img src="${res.url}" alt="${res.name}" />
        <div class="hairstyle-name">${res.name}</div>
      `;
    } else {
      card.innerHTML = `<div style='color:#d63031;'>No disponible<br/><small>(CORS o límite Space)</small></div><div class="hairstyle-name">${res.name}</div>`;
    }
    hairstylesList.appendChild(card);
  });
}

// Utilidad para convertir dataURL a Blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

// Mejora UX: permite que al hacer click en la etiqueta se abra el file input
uploadLabel.onclick = () => photoUpload.click();
