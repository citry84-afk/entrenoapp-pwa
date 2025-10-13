#!/bin/bash

# Arreglar enlaces en suplementos-recomendados.html
sed -i '' 's|https://www.amazon.es/s?k=B0013OXGXY?tag=suplementospa-21|https://www.amazon.es/s?k=Optimum+Nutrition+Creatina+Monohidrato&tag=suplementospa-21|g' "suplementos-recomendados.html"
sed -i '' 's|https://www.amazon.es/s?k=B00K7G4F4E?tag=suplementospa-21|https://www.amazon.es/s?k=Solgar+VM+2000+Multivitaminico&tag=suplementospa-21|g' "suplementos-recomendados.html"
sed -i '' 's|https://www.amazon.es/s?k=B00J3Z9YMI?tag=suplementospa-21|https://www.amazon.es/s?k=Nordic+Naturals+Omega+3&tag=suplementospa-21|g' "suplementos-recomendados.html"
sed -i '' 's|https://www.amazon.es/s?k=B00Z9XZ9ZQ?tag=suplementospa-21|https://www.amazon.es/s?k=Optimum+Nutrition+Pre+Workout&tag=suplementospa-21|g' "suplementos-recomendados.html"

# Arreglar enlaces en suplementos-para-perder-grasa.html
sed -i '' 's|https://www.amazon.es/s?k=B000QSNYGI?tag=suplementospa-21|https://www.amazon.es/s?k=NOW+Foods+Cafeina+200mg&tag=suplementospa-21|g' "suplementos-para-perder-grasa.html"
sed -i '' 's|https://www.amazon.es/s?k=B0013OXGXY?tag=suplementospa-21|https://www.amazon.es/s?k=Optimum+Nutrition+Whey+Proteina&tag=suplementospa-21|g' "suplementos-para-perder-grasa.html"
sed -i '' 's|https://www.amazon.es/s?k=B00J3Z9YMI?tag=suplementospa-21|https://www.amazon.es/s?k=NOW+Foods+CLA+800mg&tag=suplementospa-21|g' "suplementos-para-perder-grasa.html"
sed -i '' 's|https://www.amazon.es/s?k=B00K7G4F4E?tag=suplementospa-21|https://www.amazon.es/s?k=NOW+Foods+L+Carnitina+500mg&tag=suplementospa-21|g' "suplementos-para-perder-grasa.html"

echo "Enlaces arreglados!"
