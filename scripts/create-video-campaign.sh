#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/marketing-videos/campaign"
WORK_DIR="$OUT_DIR/_frames"
FONT_BOLD="Avenir-Heavy"
FONT_REG="Avenir-Book"
W=1080
H=1920

mkdir -p "$WORK_DIR" "$OUT_DIR"

make_text() {
  local out="$1"
  local width="$2"
  local point="$3"
  local font="$4"
  local fill="$5"
  local text="$6"
  magick -background none -fill "$fill" -font "$font" -gravity center -interline-spacing -6 -size "${width}x" -pointsize "$point" caption:"$text" "$out"
}

reset_work() {
  rm -f "$WORK_DIR"/*.png "$WORK_DIR"/*.mp4 "$WORK_DIR"/*.m4a "$WORK_DIR"/list.txt
}

make_phone() {
  local src="$1"
  local out="$2"
  magick "$src" \
    -resize 610x1320^ \
    -gravity center \
    -extent 610x1320 \
    -bordercolor "#243044" \
    -border 10 \
    "$out"
}

make_brand_bg() {
  local out="$1"
  magick -size "${W}x${H}" "gradient:#020617-#102448" \
    \( -size 1060x1060 radial-gradient:rgba\(59,130,246,.62\)-rgba\(59,130,246,0\) -blur 0x18 \) -geometry +10+790 -composite \
    \( -size 760x760 radial-gradient:rgba\(16,185,129,.24\)-rgba\(16,185,129,0\) -blur 0x20 \) -geometry +320+1030 -composite \
    \( -size 650x650 radial-gradient:rgba\(244,63,94,.22\)-rgba\(244,63,94,0\) -blur 0x18 \) -geometry +560+1080 -composite \
    "$out"
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
  local final_y=285
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

make_intro_slide() {
  local title="$1"
  local subtitle="$2"
  local chip="$3"
  local slide="$WORK_DIR/slide-01.png"
  make_brand_bg "$slide"
  make_text "$WORK_DIR/title-01.png" 920 84 "$FONT_BOLD" white "$title"
  make_text "$WORK_DIR/sub-01.png" 820 42 "$FONT_REG" "rgba(255,255,255,.78)" "$subtitle"
  magick "$slide" "$WORK_DIR/title-01.png" -gravity north -geometry +0+610 -composite "$slide"
  magick "$slide" "$WORK_DIR/sub-01.png" -gravity north -geometry +0+850 -composite "$slide"
  magick -background "#3b82f6" -fill white -font "$FONT_BOLD" -gravity center -size 760x86 -pointsize 38 caption:"$chip" "$WORK_DIR/chip-01.png"
  magick "$slide" "$WORK_DIR/chip-01.png" -gravity south -geometry +0+170 -composite "$slide"
}

make_content_slide() {
  local idx="$1"
  local title="$2"
  local subtitle="$3"
  local shot="$4"
  local chip="$5"
  local slide="$WORK_DIR/slide-${idx}.png"
  local title_img="$WORK_DIR/title-${idx}.png"
  local sub_img="$WORK_DIR/sub-${idx}.png"
  local phone_img="$WORK_DIR/phone-${idx}.png"

  make_brand_bg "$slide"
  magick "$ROOT/assets/logo.jpeg" -resize 82x82 -gravity center "$WORK_DIR/logo-${idx}.png"
  magick "$slide" "$WORK_DIR/logo-${idx}.png" -geometry +72+64 -composite "$slide"
  make_text "$title_img" 920 76 "$FONT_BOLD" white "$title"
  make_text "$sub_img" 830 38 "$FONT_REG" "rgba(255,255,255,.78)" "$subtitle"
  magick "$slide" "$title_img" -gravity north -geometry +0+82 -composite "$slide"
  magick "$slide" "$sub_img" -gravity north -geometry +0+260 -composite "$slide"
  make_phone "$shot" "$phone_img"
  magick "$slide" \
    \( -size 670x1385 xc:none -fill "rgba(0,0,0,.30)" -draw "roundrectangle 0,0 669,1384 48,48" -blur 0x24 \) -geometry +205+488 -composite \
    "$phone_img" -geometry +225+462 -composite \
    "$slide"
  magick -background "#ffffff" -fill "#0f172a" -font "$FONT_BOLD" -gravity center -size 760x76 -pointsize 32 caption:"$chip" "$WORK_DIR/chip-${idx}.png"
  magick "$slide" "$WORK_DIR/chip-${idx}.png" -gravity south -geometry +0+116 -composite "$slide"
}

make_graphic_slide() {
  local idx="$1"
  local title="$2"
  local subtitle="$3"
  local big="$4"
  local chip="$5"
  local accent="$6"
  local slide="$WORK_DIR/slide-${idx}.png"
  make_brand_bg "$slide"
  make_text "$WORK_DIR/title-${idx}.png" 920 78 "$FONT_BOLD" white "$title"
  make_text "$WORK_DIR/sub-${idx}.png" 830 40 "$FONT_REG" "rgba(255,255,255,.78)" "$subtitle"
  make_text "$WORK_DIR/big-${idx}.png" 860 98 "$FONT_BOLD" white "$big"
  magick "$slide" "$WORK_DIR/title-${idx}.png" -gravity north -geometry +0+160 -composite "$slide"
  magick "$slide" "$WORK_DIR/sub-${idx}.png" -gravity north -geometry +0+355 -composite "$slide"
  magick "$slide" \
    \( -size 820x520 xc:none -fill "rgba(15,23,42,.72)" -stroke "rgba(255,255,255,.14)" -strokewidth 3 -draw "roundrectangle 0,0 819,519 42,42" \) -geometry +130+640 -composite \
    "$WORK_DIR/big-${idx}.png" -gravity center -geometry +0+35 -composite \
    \( -size 760x16 "gradient:${accent}-rgba(59,130,246,0)" \) -geometry +160+1140 -composite \
    "$slide"
  magick -background "#ffffff" -fill "#0f172a" -font "$FONT_BOLD" -gravity center -size 760x76 -pointsize 32 caption:"$chip" "$WORK_DIR/chip-${idx}.png"
  magick "$slide" "$WORK_DIR/chip-${idx}.png" -gravity south -geometry +0+116 -composite "$slide"
}

make_outro_slide() {
  local title="$1"
  local subtitle="$2"
  local chip="$3"
  local slide="$WORK_DIR/slide-05.png"
  make_brand_bg "$slide"
  make_text "$WORK_DIR/title-05.png" 920 88 "$FONT_BOLD" white "$title"
  make_text "$WORK_DIR/sub-05.png" 860 42 "$FONT_REG" "rgba(255,255,255,.78)" "$subtitle"
  magick "$slide" "$WORK_DIR/title-05.png" -gravity north -geometry +0+650 -composite "$slide"
  magick "$slide" "$WORK_DIR/sub-05.png" -gravity north -geometry +0+900 -composite "$slide"
  magick -background "#ffffff" -fill "#0f172a" -font "$FONT_BOLD" -gravity center -size 760x86 -pointsize 38 caption:"$chip" "$WORK_DIR/chip-05.png"
  magick "$slide" "$WORK_DIR/chip-05.png" -gravity south -geometry +0+180 -composite "$slide"
}

render_static_part() {
  local idx="$1"
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$WORK_DIR/slide-${idx}.png" \
    -vf "scale=${W}:${H},zoompan=z='min(zoom+0.00055,1.045)':d=120:s=${W}x${H}:fps=30,format=yuv420p" \
    -t 4 "$WORK_DIR/part-${idx}.mp4"
}

make_music() {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "aevalsrc=0.10*sin(2*PI*(if(lt(mod(t\\,2)\\,0.5)\\,196\\,if(lt(mod(t\\,2)\\,1)\\,246.94\\,if(lt(mod(t\\,2)\\,1.5)\\,293.66\\,392))))*t):d=20:s=44100" \
    -f lavfi -i "aevalsrc=if(lt(mod(t\\,0.5)\\,0.12)\\,0.36*sin(2*PI*(80-220*mod(t\\,0.5))*t)*exp(-18*mod(t\\,0.5))\\,0):d=20:s=44100" \
    -f lavfi -i "anoisesrc=color=white:duration=20:sample_rate=44100" \
    -filter_complex "[0:a]volume=0.30,afade=t=in:st=0:d=0.8,afade=t=out:st=18.8:d=1.1[lead];[1:a]volume=0.36[kick];[2:a]highpass=f=6500,volume=0.014,tremolo=f=8:d=0.82[hats];[lead][kick][hats]amix=inputs=3,alimiter=limit=0.92[a]" \
    -map "[a]" "$WORK_DIR/ambient.m4a"
}

finish_video() {
  local slug="$1"
  local script_text="$2"
  local video="$OUT_DIR/${slug}.mp4"
  local poster="$OUT_DIR/${slug}-poster.png"
  local guion="$OUT_DIR/${slug}-guion.txt"

  cp "$WORK_DIR/slide-01.png" "$poster"
  render_logo_animation "intro" "$WORK_DIR/slide-01.png" "$WORK_DIR/part-01.mp4" "intro"
  render_static_part "02"
  render_static_part "03"
  render_static_part "04"
  render_logo_animation "outro" "$WORK_DIR/slide-05.png" "$WORK_DIR/part-05.mp4" "outro"
  for i in 01 02 03 04 05; do
    echo "file '$WORK_DIR/part-${i}.mp4'" >> "$WORK_DIR/list.txt"
  done
  make_music
  ffmpeg -hide_banner -loglevel error -y \
    -f concat -safe 0 -i "$WORK_DIR/list.txt" \
    -i "$WORK_DIR/ambient.m4a" \
    -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 -preset medium \
    -c:a aac -b:a 128k -shortest -movflags +faststart "$video"
  printf "%s\n" "$script_text" > "$guion"
  ffmpeg -hide_banner -loglevel error -y -ss 8 -i "$video" -frames:v 1 "$OUT_DIR/${slug}-preview.png"
  echo "$video"
}

build_general() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "Entrenar sin saber por dónde empezar." "EntrenoApp te enseña el siguiente paso y guarda tu progreso." "Gratis en iOS, Android y web"
  make_content_slide "02" "Primero ves el entreno." "Nada de perderte entre menús: lo importante aparece arriba." "$ROOT/app-store-screenshots/iphone-6.9/02-hoy-y-habitos.png" "1 · Mira qué toca hoy"
  make_content_slide "03" "Tocas empezar." "Ejercicios, series y registro en el mismo sitio." "$ROOT/app-store-screenshots/iphone-6.9/04-entreno-personalizado.png" "2 · Entrena y registra"
  make_content_slide "04" "Ves si mejoras." "Historial, racha y progreso sin libreta." "$ROOT/app-store-screenshots/iphone-6.9/06-progreso.png" "3 · Sigue avanzando"
  make_outro_slide "Entrena sin complicarte." "Rutinas, caminar, correr, gimnasio y mente en una app sencilla." "Busca EntrenoApp"
  finish_video "01-general-entrenoapp" "Video general: EntrenoApp para empezar a entrenar sin complicarse."
}

build_calm() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "Empieza con calma." "Para quien parte de cero y quiere moverse sin miedo." "Ideal para mayores y principiantes"
  make_graphic_slide "02" "Sin marcas ni prisas." "La app propone silla, pared, movilidad, equilibrio y paseos cortos." "10-20 min suaves" "1 · Hoy solo empezar" "#22c55e"
  make_content_slide "03" "Lo ves claro." "Pocas decisiones, botones grandes y una sesión preparada." "$ROOT/app-store-screenshots/iphone-6.9/01-plan-personalizado.png" "2 · Todo guiado"
  make_graphic_slide "04" "Tu progreso cuenta." "Cada sesión suma aunque sea pequeña. Lo importante es volver." "Constancia > perfección" "3 · Un paso más" "#3b82f6"
  make_outro_slide "Moverse tambien es entrenar." "EntrenoApp acompaña sin agobiar." "Busca EntrenoApp"
  finish_video "02-empezar-con-calma" "Video empezar con calma: personas mayores, principiantes y movimiento desde cero."
}

build_walk_run() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "Caminar y correr también cuentan." "Registra tiempo, recorrido y sensaciones desde el móvil." "Para salir hoy mismo"
  make_graphic_slide "02" "Pulsa iniciar." "El móvil puede controlar tu sesión mientras caminas o corres." "GPS + tiempo + ritmo" "1 · Empieza fuera" "#38bdf8"
  make_graphic_slide "03" "Compara con tu anterior." "Cuando repites, puedes tomar de referencia tu último entreno o tu mejor marca." "Hoy contra ayer" "2 · Supérate con cabeza" "#3b82f6"
  make_content_slide "04" "Todo queda guardado." "Historial, racha y progreso para no empezar de cero cada vez." "$ROOT/app-store-screenshots/iphone-6.9/07-historial.png" "3 · Mira tu evolución"
  make_outro_slide "Anda. Corre. Vuelve." "EntrenoApp te acompaña dentro y fuera del gimnasio." "Busca EntrenoApp"
  finish_video "03-caminar-correr-gps" "Video caminar/correr: registro GPS, tiempo, ritmo y referencia anterior."
}

build_gym_custom() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "Tu rutina, pero ordenada." "Mete tu plan y EntrenoApp lo convierte en seguimiento claro." "Para gimnasio y casa"
  make_content_slide "02" "Crea tu plan." "Añade ejercicios, series, reps, kilos o tiempo según toque." "$ROOT/play-store-assets/captura-02-rutina-propia.png" "1 · Tu rutina personalizada"
  make_content_slide "03" "Registra sin lío." "Cada ejercicio se abre cuando lo necesitas. Lo demás queda plegado." "$ROOT/app-store-screenshots/iphone-6.9/04-entreno-personalizado.png" "2 · Menos formulario"
  make_content_slide "04" "Progresión visible." "Mira lo que hiciste antes y decide tu siguiente paso." "$ROOT/app-store-screenshots/iphone-6.9/06-progreso.png" "3 · Pesos y evolución"
  make_outro_slide "Controla tu entrenamiento." "Tu plan, tus pesos, tu progreso." "Busca EntrenoApp"
  finish_video "04-gimnasio-rutina-propia" "Video gimnasio/rutina propia: crear rutina, registrar pesos y ver progresión."
}

build_mind_sleep() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "También puedes bajar el ritmo." "Respiración, mente y rutina nocturna para cerrar el día." "EntrenoApp Mente"
  make_content_slide "02" "Respira guiado." "Una flor te marca el ritmo para hacerlo facil." "$ROOT/app-store-screenshots/iphone-6.9/05-descanso-guiado.png" "1 · Un minuto para aterrizar"
  make_graphic_slide "03" "Rutina nocturna." "Lluvia suave, respiracion y cierre del dia sin decisiones." "7 min para desconectar" "2 · Preparar descanso" "#22c55e"
  make_graphic_slide "04" "Recordatorios amables." "Puedes recibir avisos de mente, reto diario o entrenamiento." "Tu app te acompaña" "3 · Sin presion" "#60a5fa"
  make_outro_slide "Cuidar la mente tambien suma." "EntrenoApp acompaña tu entrenamiento y tus habitos." "Busca EntrenoApp"
  finish_video "05-mente-descanso" "Video mente/descanso: respiración, rutina nocturna y recordatorios."
}

build_coach() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "Para entrenadores y nutricionistas." "Tus clientes entrenan en EntrenoApp. Tú ves cómo evolucionan." "EntrenoApp Coach"
  make_graphic_slide "02" "Programa desde tu lado." "Rutinas, objetivos y ajustes para cada cliente." "Tu plan llega a la app" "1 · Preparas el camino" "#38bdf8"
  make_graphic_slide "03" "El cliente registra." "Pesos, reps, tiempos, sensaciones y problemas quedan claros." "Datos útiles, no ruido" "2 · El cliente entrena" "#3b82f6"
  make_graphic_slide "04" "Ajustas con criterio." "Ves evolución y puedes modificar el plan cuando toca." "Seguimiento real" "3 · Mejoras el plan" "#22c55e"
  make_outro_slide "EntrenoApp Coach está en camino." "Una herramienta sencilla para acompañar mejor." "Lista de interesados"
  finish_video "06-coach-profesionales" "Video Coach: propuesta para entrenadores y nutricionistas."
}

build_plus() {
  reset_work
  prepare_logo_pieces
  make_intro_slide "EntrenoApp Plus está en camino." "Sin anuncios, ajustes con IA y nutrición más práctica." "Para ir un paso más allá"
  make_graphic_slide "02" "Entreno más inteligente." "La app aprende de lo que haces y te propone ajustes." "Menos pensar, mejor avanzar" "1 · IA para entrenar" "#3b82f6"
  make_graphic_slide "03" "Nutrición sencilla." "Menús semanales, ideas de comidas y objetivos claros." "Comer mejor sin caos" "2 · Plan semanal" "#22c55e"
  make_graphic_slide "04" "Peso y habitos." "Preparado para conectar basculas, sueño y salud cuando toque." "Todo en tu progreso" "3 · Ecosistema Plus" "#60a5fa"
  make_outro_slide "Plus será para quien quiera más." "La app gratis sigue siendo útil. Plus acelera el camino." "EntrenoApp Plus"
  finish_video "07-entrenoapp-plus" "Video Plus: sin anuncios, IA, nutricion y ecosistema futuro."
}

build_general
build_calm
build_walk_run
build_gym_custom
build_mind_sleep
build_coach
build_plus

echo "Campaña creada en: $OUT_DIR"
