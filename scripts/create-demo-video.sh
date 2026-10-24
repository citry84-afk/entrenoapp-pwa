#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/marketing-videos"
WORK_DIR="$OUT_DIR/_frames"
VIDEO="$OUT_DIR/entrenoapp-demo-24s.mp4"
POSTER="$OUT_DIR/entrenoapp-demo-poster.png"
SCRIPT="$OUT_DIR/entrenoapp-demo-guion.txt"

FONT_BOLD="Avenir-Heavy"
FONT_REG="Avenir-Book"
W=1080
H=1920

mkdir -p "$WORK_DIR" "$OUT_DIR"
rm -f "$WORK_DIR"/slide-*.png "$WORK_DIR"/part-*.mp4 "$WORK_DIR"/list.txt "$WORK_DIR"/ambient.m4a "$WORK_DIR"/logo-*.png "$WORK_DIR"/intro-*.png "$WORK_DIR"/outro-*.png

make_text() {
  local out="$1"
  local width="$2"
  local point="$3"
  local font="$4"
  local fill="$5"
  local text="$6"
  magick -background none -fill "$fill" -font "$font" -gravity center -interline-spacing -6 -size "${width}x" -pointsize "$point" caption:"$text" "$out"
}

make_phone() {
  local src="$1"
  local out="$2"
  magick "$src" \
    -resize 620x1342^ \
    -gravity center \
    -extent 620x1342 \
    -bordercolor "#243044" \
    -border 10 \
    "$out"
}

make_slide() {
  local idx="$1"
  local title="$2"
  local subtitle="$3"
  local shot="$4"
  local chip="$5"
  local title_y="$6"

  local slide="$WORK_DIR/slide-${idx}.png"
  local title_img="$WORK_DIR/title-${idx}.png"
  local sub_img="$WORK_DIR/sub-${idx}.png"
  local phone_img="$WORK_DIR/phone-${idx}.png"

  magick -size "${W}x${H}" "gradient:#050914-#102448" \
    \( -size 900x900 radial-gradient:rgba\(59,130,246,.50\)-rgba\(59,130,246,0\) -blur 0x14 \) -geometry +90+980 -composite \
    \( -size 720x720 radial-gradient:rgba\(239,71,111,.40\)-rgba\(239,71,111,0\) -blur 0x18 \) -geometry +520+1020 -composite \
    "$slide"

  magick "$ROOT/assets/logo.jpeg" -resize 92x92 -gravity center "$WORK_DIR/logo-${idx}.png"
  magick "$slide" "$WORK_DIR/logo-${idx}.png" -geometry +68+66 -composite "$slide"

  make_text "$title_img" 920 78 "$FONT_BOLD" white "$title"
  make_text "$sub_img" 820 38 "$FONT_REG" "rgba(255,255,255,.78)" "$subtitle"
  magick "$slide" "$title_img" -gravity north -geometry "+0+${title_y}" -composite "$slide"
  magick "$slide" "$sub_img" -gravity north -geometry "+0+$((title_y + 190))" -composite "$slide"

  make_phone "$shot" "$phone_img"
  magick "$slide" \
    \( -size 680x1400 xc:none -fill "rgba(0,0,0,.32)" -draw "roundrectangle 0,0 679,1399 48,48" -blur 0x26 \) -geometry +200+498 -composite \
    "$phone_img" -geometry +220+470 -composite \
    "$slide"

  magick -background "#ffffff" -fill "#0f172a" -font "$FONT_BOLD" -gravity center -size 740x76 -pointsize 34 caption:"$chip" "$WORK_DIR/chip-${idx}.png"
  magick "$WORK_DIR/chip-${idx}.png" -alpha set -background none "$WORK_DIR/chip-${idx}.png"
  magick "$slide" "$WORK_DIR/chip-${idx}.png" -gravity south -geometry +0+118 -composite "$slide"
}

make_intro() {
  local slide="$WORK_DIR/slide-01.png"
  magick -size "${W}x${H}" "gradient:#020617-#101b33" \
    \( -size 1040x1040 radial-gradient:rgba\(59,130,246,.60\)-rgba\(59,130,246,0\) -blur 0x18 \) -geometry +20+730 -composite \
    \( -size 760x760 radial-gradient:rgba\(134,239,172,.32\)-rgba\(134,239,172,0\) -blur 0x20 \) -geometry +300+1000 -composite \
    "$slide"
  make_text "$WORK_DIR/title-01.png" 920 86 "$FONT_BOLD" white "¿No sabes por dónde empezar?"
  make_text "$WORK_DIR/sub-01.png" 820 42 "$FONT_REG" "rgba(255,255,255,.78)" "EntrenoApp te lo deja fácil: abre, pulsa empezar y entrena."
  magick "$slide" "$WORK_DIR/title-01.png" -gravity north -geometry +0+610 -composite "$slide"
  magick "$slide" "$WORK_DIR/sub-01.png" -gravity north -geometry +0+850 -composite "$slide"
  magick -background "#3b82f6" -fill white -font "$FONT_BOLD" -gravity center -size 760x86 -pointsize 38 caption:"Gratis en iOS, Android y web" "$WORK_DIR/chip-01.png"
  magick "$slide" "$WORK_DIR/chip-01.png" -gravity south -geometry +0+170 -composite "$slide"
}

make_outro() {
  local slide="$WORK_DIR/slide-06.png"
  magick -size "${W}x${H}" "gradient:#050914-#111827" \
    \( -size 1040x1040 radial-gradient:rgba\(59,130,246,.60\)-rgba\(59,130,246,0\) -blur 0x18 \) -geometry +20+850 -composite \
    "$slide"
  make_text "$WORK_DIR/title-06.png" 920 90 "$FONT_BOLD" white "Entrena sin complicarte."
  make_text "$WORK_DIR/sub-06.png" 860 42 "$FONT_REG" "rgba(255,255,255,.78)" "Rutinas, caminar, correr, gimnasio y progreso en una app sencilla."
  magick "$slide" "$WORK_DIR/title-06.png" -gravity north -geometry +0+650 -composite "$slide"
  magick "$slide" "$WORK_DIR/sub-06.png" -gravity north -geometry +0+900 -composite "$slide"
  magick -background "#ffffff" -fill "#0f172a" -font "$FONT_BOLD" -gravity center -size 760x86 -pointsize 38 caption:"Busca EntrenoApp" "$WORK_DIR/chip-06.png"
  magick "$slide" "$WORK_DIR/chip-06.png" -gravity south -geometry +0+180 -composite "$slide"
}

prepare_logo_pieces() {
  magick "$ROOT/assets/logo.jpeg" -resize 260x260^ -gravity center -extent 260x260 "$WORK_DIR/logo-full.png"
  magick "$WORK_DIR/logo-full.png" -crop 130x130+0+0 +repage "$WORK_DIR/logo-tl.png"
  magick "$WORK_DIR/logo-full.png" -crop 130x130+130+0 +repage "$WORK_DIR/logo-tr.png"
  magick "$WORK_DIR/logo-full.png" -crop 130x130+0+130 +repage "$WORK_DIR/logo-bl.png"
  magick "$WORK_DIR/logo-full.png" -crop 130x130+130+130 +repage "$WORK_DIR/logo-br.png"
}

interp() {
  awk -v a="$1" -v b="$2" -v p="$3" 'BEGIN{printf "%d", a + (b-a)*p}'
}

ease() {
  awk -v n="$1" -v start="$2" -v len="$3" 'BEGIN{
    p=(n-start)/len;
    if(p<0)p=0;
    if(p>1)p=1;
    p=1-(1-p)*(1-p);
    printf "%.5f", p;
  }'
}

render_logo_animation() {
  local mode="$1"
  local base="$2"
  local out="$3"
  local prefix="$4"
  local final_x=410
  local final_y=280
  local start_frame=0
  local len=42
  local n p tlx tly trx try blx bly brx bry

  if [[ "$mode" == "outro" ]]; then
    final_y=300
    start_frame=50
    len=52
  fi

  rm -f "$WORK_DIR/${prefix}"-*.png
  for n in $(seq -w 0 119); do
    local nn=$((10#$n))
    p="$(ease "$nn" "$start_frame" "$len")"
    if [[ "$mode" == "intro" ]]; then
      tlx="$(interp -170 "$final_x" "$p")"
      tly="$(interp -170 "$final_y" "$p")"
      trx="$(interp 1120 "$((final_x + 130))" "$p")"
      try="$(interp -170 "$final_y" "$p")"
      blx="$(interp -170 "$final_x" "$p")"
      bly="$(interp 1980 "$((final_y + 130))" "$p")"
      brx="$(interp 1120 "$((final_x + 130))" "$p")"
      bry="$(interp 1980 "$((final_y + 130))" "$p")"
    else
      tlx="$(interp "$final_x" -170 "$p")"
      tly="$(interp "$final_y" -170 "$p")"
      trx="$(interp "$((final_x + 130))" 1120 "$p")"
      try="$(interp "$final_y" -170 "$p")"
      blx="$(interp "$final_x" -170 "$p")"
      bly="$(interp "$((final_y + 130))" 1980 "$p")"
      brx="$(interp "$((final_x + 130))" 1120 "$p")"
      bry="$(interp "$((final_y + 130))" 1980 "$p")"
    fi

    magick "$base" \
      "$WORK_DIR/logo-tl.png" -geometry +"$tlx"+"$tly" -composite \
      "$WORK_DIR/logo-tr.png" -geometry +"$trx"+"$try" -composite \
      "$WORK_DIR/logo-bl.png" -geometry +"$blx"+"$bly" -composite \
      "$WORK_DIR/logo-br.png" -geometry +"$brx"+"$bry" -composite \
      "$WORK_DIR/${prefix}-${n}.png"
  done

  ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$WORK_DIR/${prefix}-%03d.png" \
    -vf "scale=${W}:${H},format=yuv420p" -t 4 "$out"
}

render_static_part() {
  local idx="$1"
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$WORK_DIR/slide-${idx}.png" \
    -vf "scale=${W}:${H},zoompan=z='min(zoom+0.00055,1.045)':d=120:s=${W}x${H}:fps=30,format=yuv420p" \
    -t 4 "$WORK_DIR/part-${idx}.mp4"
}

make_music() {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "aevalsrc=0.11*sin(2*PI*(if(lt(mod(t\\,2)\\,0.5)\\,196\\,if(lt(mod(t\\,2)\\,1)\\,246.94\\,if(lt(mod(t\\,2)\\,1.5)\\,293.66\\,392))))*t):d=24:s=44100" \
    -f lavfi -i "aevalsrc=if(lt(mod(t\\,0.5)\\,0.12)\\,0.42*sin(2*PI*(80-220*mod(t\\,0.5))*t)*exp(-18*mod(t\\,0.5))\\,0):d=24:s=44100" \
    -f lavfi -i "anoisesrc=color=white:duration=24:sample_rate=44100" \
    -filter_complex "[0:a]volume=0.32,afade=t=in:st=0:d=0.8,afade=t=out:st=22.6:d=1.2[lead];[1:a]volume=0.42[kick];[2:a]highpass=f=6500,volume=0.018,tremolo=f=8:d=0.82[hats];[lead][kick][hats]amix=inputs=3,alimiter=limit=0.92[a]" \
    -map "[a]" "$WORK_DIR/ambient.m4a"
}

make_intro
prepare_logo_pieces
make_slide "02" "Tu entreno aparece arriba." "Sin leer manuales. La sesión de hoy es lo primero." "$ROOT/app-store-screenshots/iphone-6.9/02-hoy-y-habitos.png" "1 · Mira qué toca hoy" 82
make_slide "03" "Tocas empezar." "Ejercicios claros, registro sencillo y progreso guardado." "$ROOT/app-store-screenshots/iphone-6.9/04-entreno-personalizado.png" "2 · Entrena y registra" 82
make_slide "04" "También vale tu propia rutina." "Mete tu planificación y controla pesos, tiempos y evolución." "$ROOT/play-store-assets/captura-02-rutina-propia.png" "3 · Usa tu plan" 82
make_slide "05" "Ves tu progreso." "Racha, historial y evolución sin libreta ni caos." "$ROOT/app-store-screenshots/iphone-6.9/06-progreso.png" "4 · Guarda progreso" 82
make_outro

cp "$WORK_DIR/slide-01.png" "$POSTER"

render_logo_animation "intro" "$WORK_DIR/slide-01.png" "$WORK_DIR/part-01.mp4" "intro"
render_static_part "02"
render_static_part "03"
render_static_part "04"
render_static_part "05"
render_logo_animation "outro" "$WORK_DIR/slide-06.png" "$WORK_DIR/part-06.mp4" "outro"

for i in 01 02 03 04 05 06; do
  echo "file '$WORK_DIR/part-${i}.mp4'" >> "$WORK_DIR/list.txt"
done

make_music

ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$WORK_DIR/list.txt" \
  -i "$WORK_DIR/ambient.m4a" \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 -preset medium \
  -c:a aac -b:a 128k -shortest -movflags +faststart "$VIDEO"

cat > "$SCRIPT" <<'TXT'
EntrenoApp demo 24s

Formato: Short/Reel/TikTok vertical.
Audio: base motivadora generada localmente, sin música externa.
Animación de marca: el icono se monta al inicio y se desmonta al cierre.

0-4s
Texto: ¿No sabes por dónde empezar?
Voz: "Si quieres entrenar pero no sabes qué hacer, abre EntrenoApp."

4-8s
Texto: Tu entreno aparece arriba.
Voz: "La app te enseña primero la sesión de hoy, sin perderte entre opciones."

8-12s
Texto: Tocas empezar.
Voz: "Haces los ejercicios, registras lo importante y sigues."

12-16s
Texto: También vale tu propia rutina.
Voz: "Si ya tienes un plan, lo puedes llevar en el formato de EntrenoApp."

16-20s
Texto: Ves tu progreso.
Voz: "Racha, historial y evolución, todo guardado en tu móvil."

20-24s
Texto: Entrena sin complicarte.
Voz: "EntrenoApp. Gratis en iOS, Android y web."
TXT

echo "$VIDEO"
echo "$POSTER"
echo "$SCRIPT"
