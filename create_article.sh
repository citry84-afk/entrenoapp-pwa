#!/bin/bash

TITLE="$1"
EMOJI="$2"
FILENAME="$3"
DESCRIPTION="$4"

cat > "${FILENAME}" << ARTICLE
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#00D4FF">
    <meta name="description" content="${DESCRIPTION}">
    <meta name="author" content="LIPA Studios">
    <meta name="robots" content="index, follow">
    <meta name="google-site-verification" content="DSyHkxyNB3t94dJbNUw_GKpCGAp4tLsK6JBeGhvhQbQ" />
    <title>${TITLE} 2025 | EntrenoApp</title>
    <link rel="icon" type="image/png" href="assets/icons/icon-192x192.png">
    <link rel="stylesheet" href="css/content-pages.css">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-633RQLC6T0"></script>
    <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-633RQLC6T0');</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4837743291717475" crossorigin="anonymous"></script>
    <style>
        .product-card { background: white; border: 2px solid #e0e0e0; border-radius: 16px; padding: 30px; margin: 30px 0; transition: all 0.3s ease; }
        .product-card:hover { border-color: #667eea; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15); }
        .product-header { display: flex; gap: 20px; margin-bottom: 20px; }
        .product-image { width: 150px; height: 150px; background: #f8f9fa; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; flex-shrink: 0; }
        .product-info { flex: 1; }
        .product-title { font-size: 1.4rem; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }
        .product-rating { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .stars { color: #FFA500; font-size: 1.2rem; }
        .rating-text { color: #6a6a6a; font-size: 0.95rem; }
        .product-price { font-size: 1.5rem; font-weight: 700; color: #667eea; margin-bottom: 15px; }
        .product-description { color: #4a4a4a; line-height: 1.6; margin-bottom: 20px; }
        .product-features { list-style: none; padding: 0; margin-bottom: 20px; }
        .product-features li { padding: 8px 0; padding-left: 25px; position: relative; color: #4a4a4a; }
        .product-features li::before { content: '✓'; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        .amazon-button { display: inline-flex; align-items: center; gap: 10px; background: #FF9900; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; }
        .amazon-button:hover { background: #FF8800; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3); }
        .disclosure { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 40px 0; border-left: 4px solid #FF9900; }
        .disclosure strong { color: #FF9900; display: block; margin-bottom: 10px; }
        @media (max-width: 768px) { .product-header { flex-direction: column; } .product-image { width: 100%; height: 200px; } }
    </style>
</head>
<body>
    <nav class="main-navigation">
        <div class="nav-container">
            <a href="/" class="nav-logo">💪 EntrenoApp</a>
            <ul class="nav-links">
                <li><a href="/">Inicio</a></li>
                <li><a href="/app.html">App</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/contact.html">Contacto</a></li>
            </ul>
        </div>
    </nav>
    <div class="breadcrumbs"><div class="container"><a href="/">Inicio</a> > <a href="/blog.html">Blog</a> > ${TITLE}</div></div>
    <div class="hero-section"><div class="hero-content"><h1 class="hero-title">${EMOJI} ${TITLE} 2025</h1></div></div>
    <div class="article-container">
        <div class="article-header"><h1 class="article-title">${TITLE} 2025</h1><div class="article-meta"><span>📅 16 Ene, 2025</span><span>⏱️ 15 min</span><span>👤 EntrenoApp</span></div></div>
        <div class="article-content">
ARTICLE

echo "Artículo base creado: ${FILENAME}"
