#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ASSET_DIR="$ROOT_DIR/play-store-assets"
OUT_DIR="$ROOT_DIR/marketing-videos"
CAPTURE_DIR="$OUT_DIR/source-captures"
FONT_BOLD="/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
FONT_REGULAR="/System/Library/Fonts/Avenir Next.ttc"

mkdir -p "$OUT_DIR"

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Falta el archivo necesario: $1" >&2
    exit 1
  fi
}

require_file "$FONT_BOLD"
require_file "$FONT_REGULAR"

for screenshot in \
  captura-02-registra-series.png \
  captura-03-sabes-que-toca.png \
  captura-04-adapta-tu-dia.png \
  captura-05-progreso-real.png \
  captura-06-sin-cuenta.png; do
  require_file "$ASSET_DIR/$screenshot"
done

for capture in 01-home.png 02-workout.png 03-series.png 04-log.png; do
  require_file "$CAPTURE_DIR/$capture"
done

make_feature() {
  local source="$1"
  local output="$2"
  local title_line_1="$3"
  local title_line_2="$4"
  local subtitle="$5"

  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -t 1.15 -i "color=c=#070b14:s=1080x1920:r=30" \
    -loop 1 -t 6.80 -i "$source" \
    -f lavfi -t 1.35 -i "color=c=#070b14:s=1080x1920:r=30" \
    -filter_complex "
      [0:v]
        drawbox=x=66:y=430:w=16:h=470:color=#2f8cff:t=fill,
        drawbox=x=66:y=420:w=750:h=2:color=#2f8cff@0.35:t=fill,
        drawtext=fontfile='$FONT_BOLD':text='ENTRENOAPP':fontcolor=#59a9ff:fontsize=42:x=94:y=470,
        drawtext=fontfile='$FONT_BOLD':text='$title_line_1':fontcolor=white:fontsize=82:x=94:y=575,
        drawtext=fontfile='$FONT_BOLD':text='$title_line_2':fontcolor=white:fontsize=82:x=94:y=680,
        drawtext=fontfile='$FONT_REGULAR':text='$subtitle':fontcolor=#b8c5d9:fontsize=38:x=94:y=815,
        fade=t=out:st=0.90:d=0.25,format=yuv420p[intro];
      [1:v]
        scale=1080:2340,
        crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/6.80)',
        eq=saturation=1.04:contrast=1.025,
        drawbox=x=18:y=18:w=1044:h=1884:color=#2f8cff@0.18:t=4,
        fade=t=in:st=0:d=0.25,
        fade=t=out:st=6.45:d=0.35,
        fps=30,format=yuv420p[feature];
      [2:v]
        drawbox=x=66:y=510:w=16:h=390:color=#2f8cff:t=fill,
        drawtext=fontfile='$FONT_BOLD':text='ENTRENOAPP':fontcolor=#59a9ff:fontsize=42:x=94:y=545,
        drawtext=fontfile='$FONT_BOLD':text='EMPIEZA HOY':fontcolor=white:fontsize=86:x=94:y=655,
        drawtext=fontfile='$FONT_REGULAR':text='iOS  ·  Android  ·  Web':fontcolor=#b8c5d9:fontsize=39:x=94:y=785,
        drawtext=fontfile='$FONT_BOLD':text='entrenoapp.com':fontcolor=#59a9ff:fontsize=43:x=94:y=855,
        fade=t=in:st=0:d=0.25,format=yuv420p[outro];
      [intro][feature][outro]concat=n=3:v=1:a=0[outv]
    " \
    -map "[outv]" -an -c:v libx264 -preset medium -crf 18 \
    -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart \
    "$OUT_DIR/$output"

  ffmpeg -y -hide_banner -loglevel error -ss 1.45 -i "$OUT_DIR/$output" \
    -frames:v 1 -q:v 2 "$OUT_DIR/${output%.mp4}-portada.jpg"
}

make_feature \
  "$ASSET_DIR/captura-03-sabes-que-toca.png" \
  "01-entreno-del-dia.mp4" \
  "UN ENTRENO." \
  "NADA MAS." \
  "Abre, mira que toca y empieza."

make_feature \
  "$ASSET_DIR/captura-02-registra-series.png" \
  "02-registro-de-series.mp4" \
  "REGISTRA." \
  "SIGUE." \
  "Peso, repeticiones y descanso."

make_feature \
  "$ASSET_DIR/captura-04-adapta-tu-dia.png" \
  "03-adapta-tu-entreno.mp4" \
  "TU DIA CAMBIA." \
  "TU PLAN TAMBIEN." \
  "Corto, suave o normal. Tu decides."

make_feature \
  "$ASSET_DIR/captura-05-progreso-real.png" \
  "04-progreso-real.mp4" \
  "PROGRESO." \
  "SIN RUIDO." \
  "Constancia, volumen y mejores marcas."

make_feature \
  "$ASSET_DIR/captura-06-sin-cuenta.png" \
  "05-privacidad-y-datos.mp4" \
  "SIN CUENTA." \
  "TUS DATOS." \
  "Tu rutina se queda contigo."

ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -t 1.20 -i "color=c=#070b14:s=1080x1920:r=30" \
  -loop 1 -t 2.70 -i "$CAPTURE_DIR/01-home.png" \
  -loop 1 -t 2.70 -i "$CAPTURE_DIR/02-workout.png" \
  -loop 1 -t 2.70 -i "$CAPTURE_DIR/03-series.png" \
  -loop 1 -t 2.70 -i "$CAPTURE_DIR/04-log.png" \
  -f lavfi -t 1.50 -i "color=c=#070b14:s=1080x1920:r=30" \
  -filter_complex "
    [0:v]
      drawbox=x=66:y=420:w=16:h=500:color=#2f8cff:t=fill,
      drawtext=fontfile='$FONT_BOLD':text='ENTRENOAPP':fontcolor=#59a9ff:fontsize=42:x=94:y=470,
      drawtext=fontfile='$FONT_BOLD':text='ASI DE':fontcolor=white:fontsize=92:x=94:y=590,
      drawtext=fontfile='$FONT_BOLD':text='SIMPLE.':fontcolor=white:fontsize=92:x=94:y=710,
      drawtext=fontfile='$FONT_REGULAR':text='Mira tu sesion. Empieza. Registra.':fontcolor=#b8c5d9:fontsize=37:x=94:y=845,
      fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v0];
    [1:v]scale=810:1753,pad=1080:1920:135:83:color=#070b14,drawbox=x=132:y=80:w=816:h=1760:color=#2f8cff@0.30:t=4,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v1];
    [2:v]scale=810:1753,pad=1080:1920:135:83:color=#070b14,drawbox=x=132:y=80:w=816:h=1760:color=#2f8cff@0.30:t=4,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v2];
    [3:v]scale=810:1753,pad=1080:1920:135:83:color=#070b14,drawbox=x=132:y=80:w=816:h=1760:color=#2f8cff@0.30:t=4,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v3];
    [4:v]scale=810:1753,pad=1080:1920:135:83:color=#070b14,drawbox=x=132:y=80:w=816:h=1760:color=#2f8cff@0.30:t=4,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v4];
    [5:v]
      drawbox=x=66:y=490:w=16:h=480:color=#2f8cff:t=fill,
      drawtext=fontfile='$FONT_BOLD':text='UN ENTRENO.':fontcolor=white:fontsize=84:x=94:y=585,
      drawtext=fontfile='$FONT_BOLD':text='NADA MAS.':fontcolor=white:fontsize=84:x=94:y=695,
      drawtext=fontfile='$FONT_BOLD':text='entrenoapp.com':fontcolor=#59a9ff:fontsize=43:x=94:y=840,
      fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v5];
    [v0][v1]xfade=transition=fade:duration=0.35:offset=0.85[x1];
    [x1][v2]xfade=transition=fade:duration=0.35:offset=3.20[x2];
    [x2][v3]xfade=transition=fade:duration=0.35:offset=5.55[x3];
    [x3][v4]xfade=transition=fade:duration=0.35:offset=7.90[x4];
    [x4][v5]xfade=transition=fade:duration=0.35:offset=10.25[demo_raw];
    [demo_raw]scale=in_range=full:out_range=limited,format=yuv420p[outv]
  " \
  -map "[outv]" -an -c:v libx264 -preset medium -crf 18 \
  -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart \
  "$OUT_DIR/06-demo-funcionamiento-real.mp4"

ffmpeg -y -hide_banner -loglevel error -ss 1.60 -i "$OUT_DIR/06-demo-funcionamiento-real.mp4" \
  -frames:v 1 -q:v 2 "$OUT_DIR/06-demo-funcionamiento-real-portada.jpg"

ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -t 1.20 -i "color=c=#070b14:s=1080x1920:r=30" \
  -loop 1 -t 3.20 -i "$ASSET_DIR/captura-03-sabes-que-toca.png" \
  -loop 1 -t 3.20 -i "$ASSET_DIR/captura-02-registra-series.png" \
  -loop 1 -t 3.20 -i "$ASSET_DIR/captura-04-adapta-tu-dia.png" \
  -loop 1 -t 3.20 -i "$ASSET_DIR/captura-05-progreso-real.png" \
  -loop 1 -t 3.20 -i "$ASSET_DIR/captura-06-sin-cuenta.png" \
  -f lavfi -t 1.50 -i "color=c=#070b14:s=1080x1920:r=30" \
  -filter_complex "
    [0:v]
      drawbox=x=66:y=390:w=16:h=560:color=#2f8cff:t=fill,
      drawtext=fontfile='$FONT_BOLD':text='ENTRENOAPP':fontcolor=#59a9ff:fontsize=42:x=94:y=440,
      drawtext=fontfile='$FONT_BOLD':text='ENTRENA.':fontcolor=white:fontsize=92:x=94:y=560,
      drawtext=fontfile='$FONT_BOLD':text='SIN LIARTE.':fontcolor=white:fontsize=92:x=94:y=680,
      drawtext=fontfile='$FONT_REGULAR':text='Todo lo que necesitas. Nada que distraiga.':fontcolor=#b8c5d9:fontsize=35:x=94:y=825,
      settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v0];
    [1:v]scale=1080:2340,crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/3.20)',eq=saturation=1.04:contrast=1.025,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v1];
    [2:v]scale=1080:2340,crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/3.20)',eq=saturation=1.04:contrast=1.025,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v2];
    [3:v]scale=1080:2340,crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/3.20)',eq=saturation=1.04:contrast=1.025,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v3];
    [4:v]scale=1080:2340,crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/3.20)',eq=saturation=1.04:contrast=1.025,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v4];
    [5:v]scale=1080:2340,crop=1080:1920:0:'min(in_h-out_h,(in_h-out_h)*t/3.20)',eq=saturation=1.04:contrast=1.025,fps=30,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v5];
    [6:v]
      drawbox=x=66:y=470:w=16:h=500:color=#2f8cff:t=fill,
      drawtext=fontfile='$FONT_BOLD':text='ENTRENOAPP':fontcolor=#59a9ff:fontsize=42:x=94:y=520,
      drawtext=fontfile='$FONT_BOLD':text='EMPIEZA HOY':fontcolor=white:fontsize=86:x=94:y=650,
      drawtext=fontfile='$FONT_REGULAR':text='Disponible en iOS, Android y web':fontcolor=#b8c5d9:fontsize=37:x=94:y=785,
      drawtext=fontfile='$FONT_BOLD':text='entrenoapp.com':fontcolor=#59a9ff:fontsize=43:x=94:y=860,
      settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v6];
    [v0][v1]xfade=transition=fade:duration=0.35:offset=0.85[x1];
    [x1][v2]xfade=transition=fade:duration=0.35:offset=3.70[x2];
    [x2][v3]xfade=transition=fade:duration=0.35:offset=6.55[x3];
    [x3][v4]xfade=transition=fade:duration=0.35:offset=9.40[x4];
    [x4][v5]xfade=transition=fade:duration=0.35:offset=12.25[x5];
    [x5][v6]xfade=transition=fade:duration=0.35:offset=15.10[outv]
  " \
  -map "[outv]" -an -c:v libx264 -preset medium -crf 18 \
  -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart \
  "$OUT_DIR/00-resumen-entrenoapp.mp4"

ffmpeg -y -hide_banner -loglevel error -ss 1.55 -i "$OUT_DIR/00-resumen-entrenoapp.mp4" \
  -frames:v 1 -q:v 2 "$OUT_DIR/00-resumen-entrenoapp-portada.jpg"

echo "Videos creados en $OUT_DIR"
