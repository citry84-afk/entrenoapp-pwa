#!/bin/bash

# Fix suplementos-recomendados.html
sed -i '' 's|href="https://www\.amazon\.es/s?k=[^"]*tag=suplementospa-21"|href="https://www.amazon.es/s?k=PRODUCT_NAME\&tag=suplementospa-21"|g' suplementos-recomendados.html

# Replace with actual product names
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Optimum+Nutrition+Gold+Standard+100+Whey+Proteina/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Optimum+Nutrition+Creatina+Monohidrato/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Solgar+VM+2000+Multivitaminico/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Nordic+Naturals+Ultimate+Omega/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Optimum+Nutrition+Gold+Standard+Pre+Workout/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Scivation+Xtend+BCAA/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/NOW+Foods+Vitamina+D3+K2/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Doctors+Best+Magnesio/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Optimum+Nutrition+Gold+Standard+Casein/}' suplementos-recomendados.html
sed -i '' '0,/PRODUCT_NAME/{s/PRODUCT_NAME/Optimum+Nutrition+Glutamine+Powder/}' suplementos-recomendados.html

# Fix suplementos-para-perder-grasa.html
sed -i '' 's|href="https://www\.amazon\.es/s?k=[^"]*tag=suplementospa-21"|href="https://www.amazon.es/s?k=PRODUCT2\&tag=suplementospa-21"|g' suplementos-para-perder-grasa.html

sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+Cafeina+200mg/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/Optimum+Nutrition+Gold+Standard+Whey/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+CLA+800mg/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+L+Carnitina+500mg/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+Glucomannan+500mg/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+MCT+Oil/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+Green+Tea+Extract/}' suplementos-para-perder-grasa.html
sed -i '' '0,/PRODUCT2/{s/PRODUCT2/NOW+Foods+B+50+Complex/}' suplementos-para-perder-grasa.html

echo "✅ Enlaces corregidos correctamente!"
