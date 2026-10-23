// optimize-svgs.js
const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo'); // Usamos el paquete oficial SVGO

// CONFIGURACIÓN: Cambia estas rutas a tus carpetas correspondientes
const INPUT_DIR = path.join(__dirname, 'src/icons'); 
const OUTPUT_DIR = path.join(__dirname, 'imgoptimizados/icons'); // Sobrescribir o cambiar de carpeta
const TARGET_SIZE = 64; // El tamaño (en px) al que deseas redimensionar los iconos. En este caso requerimos 64 pixeles

// Asegurar que el directorio de salida existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para ajustar dimensiones en el código SVG estirando/escalando el viewBox
function resizeSvg(svgContent, size) {
  // Remover los atributos de ancho y alto fijos para no romper el escalado
  let cleanSvg = svgContent.replace(/<svg[^>]*>/, (match) => {
    // Si no tiene viewBox, intentamos deducir uno o añadirlo
    if (!match.includes('viewBox')) {
      return match.replace('<svg', `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"`);
    }
    // Reemplazar o forzar width y height al tamaño objetivo
    let updated = match;
    if (updated.includes('width=')) updated = updated.replace(/width="[^"]*"/, `width="${size}"`);
    else updated = updated.replace('<svg', `<svg width="${size}"`);
    
    if (updated.includes('height=')) updated = updated.replace(/height="[^"]*"/, `height="${size}"`);
    else updated = updated.replace('<svg', `<svg height="${size}"`);
    
    return updated;
  });
  return cleanSvg;
}

// Procesar todos los archivos de la carpeta
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    if (path.extname(file).toLowerCase() === '.svg') {
      const filePath = path.join(INPUT_DIR, file);
      const svgRaw = fs.readFileSync(filePath, 'utf8');

      // 1. Optimizar código eliminando basura de editores de diseño
      const result = optimize(svgRaw, {
        path: filePath,
        multipass: true, // Optimización exhaustiva
        plugins: [
          'preset-default', 
          'removeComments',
          'removeMetadata',
          'convertStyleToAttrs'
        ],
      });

      // 2. Aplicar el redimensionamiento
      const resizedSvg = resizeSvg(result.data, TARGET_SIZE);

      // 3. Guardar el archivo final
      const outputPath = path.join(OUTPUT_DIR, file);
      fs.writeFileSync(outputPath, resizedSvg, 'utf8');
      console.log(`✅ Optimizado y redimensionado: ${file}`);
    }
  });
});
