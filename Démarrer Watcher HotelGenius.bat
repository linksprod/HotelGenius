@echo off
title HotelGenius - Watcher automatique Excel
color 0A
cls

echo.
echo  =====================================================
echo   HotelGenius - Surveillance automatique des reservations
echo  =====================================================
echo.
echo  Ce programme surveille le fichier reservations.xlsx.
echo  Des qu une modification est sauvegardee :
echo    - Les nouveaux guests sont importes en base de donnees
echo    - Les e-mails de check-in sont envoyes automatiquement
echo.
echo  Ne fermez pas cette fenetre pendant votre session de travail.
echo  Pour arreter : fermez simplement cette fenetre.
echo  =====================================================
echo.

cd /d "%~dp0"

node watch-reservations.mjs

if errorlevel 1 (
  echo.
  echo  [ERREUR] Le watcher s'est arrete avec une erreur.
  echo  Verifiez que Node.js est bien installe.
  pause
)
