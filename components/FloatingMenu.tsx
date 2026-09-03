"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";

// Master dictionary for top Navbar and Parent DOM elements
const masterDict: Record<string, Record<string, string>> = {
  en: {
    "HOME": "HOME",
    "CURSOS": "COURSES",
    "TOOLS": "TOOLS",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Sign In",
    "Acesso Antecipado": "Early Access",
    "Acesso antecipado": "Early Access",
    "Painel do Aluno": "Student Dashboard",
    "Painel Admin": "Admin Panel",
    "Sair da conta": "Sign Out",
    "Pesquisar...": "Search...",
    "Minha Conta": "My Account",
    "Voltar": "Back",
    "Especialistas": "Specialists",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Evolve your art with artificial intelligence. Our tool was trained exclusively on advanced tattoo techniques.",
    "Mais Vendido": "Best Seller",
    "Tutor IA Especialista": "Specialist AI Tutor",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "A private mentor available 24/7. Get technical questions answered in real time, receive precise needle and pigment suggestions for each project, and get help planning your sessions completely.",
    "Planejamento de Sessão": "Session Planning",
    "Análise de Pigmentos": "Pigment Analysis",
    "Mentoria Técnica 24h": "24/7 Technical Mentoring",
    "Gratuito": "Free",
    "Acessar Tutor": "Access Tutor",
    "Novo": "New",
    "Assistente WhatsApp": "WhatsApp Assistant",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Automate your quotes. The AI talks to clients on WhatsApp, understands the tattoo idea, and already suggests prices based on your price table.",
    "Orçamentos Automáticos": "Automatic Quotes",
    "Agendamento de Horários": "Appointment Scheduling",
    "Triagem de Clientes 24h": "24/7 Client Screening",
    "/mês": "/month",
    "Assinar Assistente": "Subscribe to Assistant",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. All rights reserved.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Built for professional creators and tattoo artists.",
    "O Primeiro Passo Para o Topo": "The First Step to the Top",
    "Posicionamento para": "Positioning for",
    "tatuadores": "tattoo artists",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "It's not enough to be the best tattoo artist if nobody knows your work. Learn the exact secrets to position yourself as an authority, attract clients who pay well, and turn your art into a highly profitable business.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "What positioning is and how to apply it to your artistic career",
    "Estruturação das suas redes sociais": "Structuring your social media",
    "Criação de conteúdos que atraem clientes": "Creating content that attracts clients",
    "Técnicas de vendas e conversão de clientes": "Sales techniques and client conversion",
    "Como utilizar o tráfego pago de forma objetiva": "How to use paid traffic effectively",
    "Acesso à comunidade exclusiva da Ink Authority": "Access to the exclusive Ink Authority community",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 BONUS: Free profile analysis (for the first 20)",
    "Investimento": "Investment",
    "Ou 12x de R$ 99,70": "Or 12x of R$99.70",
    "Processando...": "Processing...",
    "Garantir Vaga": "Secure Your Spot",
    "Acesso imediato após o pagamento": "Immediate access after payment",
    "Assista ao Vídeo": "Watch the Video",
    "Aumente o som": "Turn up the sound"
  },
  es: {
    "HOME": "INICIO",
    "CURSOS": "CURSOS",
    "TOOLS": "HERRAMIENTAS",
    "DASHBOARD": "PANEL",
    "Entrar": "Iniciar Sesión",
    "Acesso Antecipado": "Acceso Anticipado",
    "Acesso antecipado": "Acceso anticipado",
    "Painel do Aluno": "Panel del Alumno",
    "Painel Admin": "Panel de Admin",
    "Sair da conta": "Cerrar sesión",
    "Pesquisar...": "Buscar...",
    "Minha Conta": "Mi Cuenta",
    "Voltar": "Volver",
    "Especialistas": "Especialistas",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Evoluciona tu arte con inteligencia artificial. Nuestra herramienta fue entrenada exclusivamente con técnicas avanzadas de tatuaje.",
    "Mais Vendido": "Más Vendido",
    "Tutor IA Especialista": "Tutor IA Especialista",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "Un mentor particular disponible 24h. Resuelve dudas técnicas en tiempo real, recibe sugerencias precisas de agujas y pigmentos para cada proyecto, y ten ayuda en la planificación completa de tus sesiones.",
    "Planejamento de Sessão": "Planificación de Sesión",
    "Análise de Pigmentos": "Análisis de Pigmentos",
    "Mentoria Técnica 24h": "Mentoría Técnica 24h",
    "Gratuito": "Gratis",
    "Acessar Tutor": "Acceder al Tutor",
    "Novo": "Nuevo",
    "Assistente WhatsApp": "Asistente de WhatsApp",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Automatiza tus presupuestos. La IA conversa con los clientes por WhatsApp, entiende la idea del tatuaje y ya sugiere valores según tu tabla.",
    "Orçamentos Automáticos": "Presupuestos Automáticos",
    "Agendamento de Horários": "Agenda de Horarios",
    "Triagem de Clientes 24h": "Filtrado de Clientes 24h",
    "/mês": "/mes",
    "Assinar Assistente": "Suscribirse al Asistente",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. Todos los derechos reservados.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Desarrollado para creadores y tatuadores profesionales.",
    "O Primeiro Passo Para o Topo": "El Primer Paso Hacia la Cima",
    "Posicionamento para": "Posicionamiento para",
    "tatuadores": "tatuadores",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "No basta con ser el mejor tatuador si nadie conoce tu trabajo. Aprende los secretos exactos para posicionarte como autoridad, atraer clientes que pagan bien y transformar tu arte en un negocio muy rentable.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "Qué es el posicionamiento y cómo aplicarlo a tu carrera artística",
    "Estruturação das suas redes sociais": "Estructuración de tus redes sociales",
    "Criação de conteúdos que atraem clientes": "Creación de contenidos que atraen clientes",
    "Técnicas de vendas e conversão de clientes": "Técnicas de ventas y conversión de clientes",
    "Como utilizar o tráfego pago de forma objetiva": "Cómo utilizar el tráfico pago de forma objetiva",
    "Acesso à comunidade exclusiva da Ink Authority": "Acceso a la comunidad exclusiva de Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 BONO: Análisis de perfil gratis (para los primeros 20)",
    "Investimento": "Inversión",
    "Ou 12x de R$ 99,70": "O 12x de R$99,70",
    "Processando...": "Procesando...",
    "Garantir Vaga": "Asegurar mi Cupo",
    "Acesso imediato após o pagamento": "Acceso inmediato tras el pago",
    "Assista ao Vídeo": "Mira el Video",
    "Aumente o som": "Sube el volumen"
  },
  fr: {
    "HOME": "ACCUEIL",
    "CURSOS": "COURS",
    "TOOLS": "OUTILS",
    "DASHBOARD": "TABLEAU DE BORD",
    "Entrar": "Se Connecter",
    "Acesso Antecipado": "Accès Anticipé",
    "Acesso antecipado": "Accès anticipé",
    "Painel do Aluno": "Espace Étudiant",
    "Painel Admin": "Panneau Admin",
    "Sair da conta": "Se Déconnecter",
    "Pesquisar...": "Rechercher...",
    "Minha Conta": "Mon Compte",
    "Voltar": "Retour",
    "Especialistas": "Spécialistes",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Faites évoluer votre art avec l'intelligence artificielle. Notre outil a été entraîné exclusivement sur des techniques avancées de tatouage.",
    "Mais Vendido": "Meilleure Vente",
    "Tutor IA Especialista": "Tuteur IA Spécialiste",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "Un mentor privé disponible 24h/24. Posez vos questions techniques en temps réel, recevez des suggestions précises d'aiguilles et de pigments pour chaque projet, et obtenez de l'aide pour planifier entièrement vos séances.",
    "Planejamento de Sessão": "Planification de Séance",
    "Análise de Pigmentos": "Analyse des Pigments",
    "Mentoria Técnica 24h": "Mentorat Technique 24h/24",
    "Gratuito": "Gratuit",
    "Acessar Tutor": "Accéder au Tuteur",
    "Novo": "Nouveau",
    "Assistente WhatsApp": "Assistant WhatsApp",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Automatisez vos devis. L'IA discute avec les clients sur WhatsApp, comprend l'idée du tatouage et suggère déjà des prix selon votre grille tarifaire.",
    "Orçamentos Automáticos": "Devis Automatiques",
    "Agendamento de Horários": "Prise de Rendez-vous",
    "Triagem de Clientes 24h": "Tri des Clients 24h/24",
    "/mês": "/mois",
    "Assinar Assistente": "S'abonner à l'Assistant",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. Tous droits réservés.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Conçu pour les créateurs et tatoueurs professionnels.",
    "O Primeiro Passo Para o Topo": "Le Premier Pas Vers le Sommet",
    "Posicionamento para": "Positionnement pour",
    "tatuadores": "tatoueurs",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "Il ne suffit pas d'être le meilleur tatoueur si personne ne connaît votre travail. Apprenez les secrets exacts pour vous positionner en tant qu'autorité, attirer des clients qui paient bien et transformer votre art en une activité très rentable.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "Qu'est-ce que le positionnement et comment l'appliquer à votre carrière artistique",
    "Estruturação das suas redes sociais": "Structuration de vos réseaux sociaux",
    "Criação de conteúdos que atraem clientes": "Création de contenus qui attirent des clients",
    "Técnicas de vendas e conversão de clientes": "Techniques de vente et de conversion de clients",
    "Como utilizar o tráfego pago de forma objetiva": "Comment utiliser le trafic payant de manière efficace",
    "Acesso à comunidade exclusiva da Ink Authority": "Accès à la communauté exclusive d'Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 BONUS : Analyse de profil gratuite (pour les 20 premiers)",
    "Investimento": "Investissement",
    "Ou 12x de R$ 99,70": "Ou 12x de 99,70 R$",
    "Processando...": "Traitement en cours...",
    "Garantir Vaga": "Réserver ma Place",
    "Acesso imediato após o pagamento": "Accès immédiat après le paiement",
    "Assista ao Vídeo": "Regarder la Vidéo",
    "Aumente o som": "Augmentez le son"
  },
  de: {
    "HOME": "START",
    "CURSOS": "KURSE",
    "TOOLS": "WERKZEUGE",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Anmelden",
    "Acesso Antecipado": "Frühzeitiger Zugang",
    "Acesso antecipado": "Frühzeitiger Zugang",
    "Painel do Aluno": "Studenten-Dashboard",
    "Painel Admin": "Admin-Bereich",
    "Sair da conta": "Abmelden",
    "Pesquisar...": "Suchen...",
    "Minha Conta": "Mein Konto",
    "Voltar": "Zurück",
    "Especialistas": "Spezialisten",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Entwickle deine Kunst mit künstlicher Intelligenz weiter. Unser Tool wurde ausschließlich mit fortgeschrittenen Tätowiertechniken trainiert.",
    "Mais Vendido": "Bestseller",
    "Tutor IA Especialista": "KI-Fachtutor",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "Ein privater Mentor, 24 Stunden verfügbar. Kläre technische Fragen in Echtzeit, erhalte präzise Nadel- und Pigmentempfehlungen für jedes Projekt und Hilfe bei der vollständigen Planung deiner Sitzungen.",
    "Planejamento de Sessão": "Sitzungsplanung",
    "Análise de Pigmentos": "Pigmentanalyse",
    "Mentoria Técnica 24h": "Technisches Mentoring 24h",
    "Gratuito": "Kostenlos",
    "Acessar Tutor": "Tutor öffnen",
    "Novo": "Neu",
    "Assistente WhatsApp": "WhatsApp-Assistent",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Automatisiere deine Kostenvoranschläge. Die KI unterhält sich mit Kunden auf WhatsApp, versteht die Tattoo-Idee und schlägt bereits Preise basierend auf deiner Preistabelle vor.",
    "Orçamentos Automáticos": "Automatische Kostenvoranschläge",
    "Agendamento de Horários": "Terminplanung",
    "Triagem de Clientes 24h": "Kundenvorqualifizierung 24h",
    "/mês": "/Monat",
    "Assinar Assistente": "Assistent abonnieren",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. Alle Rechte vorbehalten.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Entwickelt für professionelle Creator und Tätowierer.",
    "O Primeiro Passo Para o Topo": "Der Erste Schritt an die Spitze",
    "Posicionamento para": "Positionierung für",
    "tatuadores": "Tätowierer",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "Es reicht nicht, der beste Tätowierer zu sein, wenn niemand deine Arbeit kennt. Lerne die genauen Geheimnisse, um dich als Autorität zu positionieren, gut zahlende Kunden zu gewinnen und deine Kunst in ein hochprofitables Geschäft zu verwandeln.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "Was Positionierung ist und wie du sie auf deine künstlerische Karriere anwendest",
    "Estruturação das suas redes sociais": "Strukturierung deiner sozialen Netzwerke",
    "Criação de conteúdos que atraem clientes": "Erstellung von Inhalten, die Kunden anziehen",
    "Técnicas de vendas e conversão de clientes": "Verkaufstechniken und Kundenkonversion",
    "Como utilizar o tráfego pago de forma objetiva": "Wie man bezahlten Traffic gezielt einsetzt",
    "Acesso à comunidade exclusiva da Ink Authority": "Zugang zur exklusiven Ink Authority-Community",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 BONUS: Kostenlose Profilanalyse (für die ersten 20)",
    "Investimento": "Investition",
    "Ou 12x de R$ 99,70": "Oder 12x R$99,70",
    "Processando...": "Wird verarbeitet...",
    "Garantir Vaga": "Platz sichern",
    "Acesso imediato após o pagamento": "Sofortiger Zugang nach der Zahlung",
    "Assista ao Vídeo": "Video ansehen",
    "Aumente o som": "Ton lauter stellen"
  },
  it: {
    "HOME": "HOME",
    "CURSOS": "CORSI",
    "TOOLS": "STRUMENTI",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Accedi",
    "Acesso Antecipado": "Accesso Anticipado",
    "Acesso antecipado": "Accesso anticipado",
    "Painel do Aluno": "Pannello Studente",
    "Painel Admin": "Pannello Admin",
    "Sair da conta": "Disconnetti",
    "Pesquisar...": "Cerca...",
    "Minha Conta": "Il Mio Account",
    "Voltar": "Indietro",
    "Especialistas": "Specialisti",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Fai evolvere la tua arte con l'intelligenza artificiale. Il nostro strumento è stato addestrato esclusivamente con tecniche avanzate di tatuaggio.",
    "Mais Vendido": "Più Venduto",
    "Tutor IA Especialista": "Tutor IA Specialista",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "Un mentore privato disponibile 24 ore su 24. Risolvi dubbi tecnici in tempo reale, ricevi suggerimenti precisi su aghi e pigmenti per ogni progetto e ottieni aiuto nella pianificazione completa delle tue sessioni.",
    "Planejamento de Sessão": "Pianificazione della Sessione",
    "Análise de Pigmentos": "Analisi dei Pigmenti",
    "Mentoria Técnica 24h": "Mentoring Tecnico 24h",
    "Gratuito": "Gratuito",
    "Acessar Tutor": "Accedi al Tutor",
    "Novo": "Nuovo",
    "Assistente WhatsApp": "Assistente WhatsApp",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Automatizza i tuoi preventivi. L'IA conversa con i clienti su WhatsApp, capisce l'idea del tatuaggio e suggerisce già i prezzi in base al tuo listino.",
    "Orçamentos Automáticos": "Preventivi Automatici",
    "Agendamento de Horários": "Pianificazione degli Appuntamenti",
    "Triagem de Clientes 24h": "Screening dei Clienti 24h",
    "/mês": "/mese",
    "Assinar Assistente": "Abbonati all'Assistente",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. Tutti i diritti riservati.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Sviluppato per creator e tatuatori professionisti.",
    "O Primeiro Passo Para o Topo": "Il Primo Passo Verso il Vertice",
    "Posicionamento para": "Posizionamento per",
    "tatuadores": "tatuatori",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "Non basta essere il miglior tatuatore se nessuno conosce il tuo lavoro. Impara i segreti esatti per posizionarti come autorità, attrarre clienti che pagano bene e trasformare la tua arte in un business altamente redditizio.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "Cos'è il posizionamento e come applicarlo alla tua carriera artistica",
    "Estruturação das suas redes sociais": "Strutturazione dei tuoi social media",
    "Criação de conteúdos que atraem clientes": "Creazione di contenuti che attirano clienti",
    "Técnicas de vendas e conversão de clientes": "Tecniche di vendita e conversione dei clienti",
    "Como utilizar o tráfego pago de forma objetiva": "Come utilizzare il traffico a pagamento in modo efficace",
    "Acesso à comunidade exclusiva da Ink Authority": "Accesso alla community esclusiva di Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 BONUS: Analisi del profilo gratuita (per i primi 20)",
    "Investimento": "Investimento",
    "Ou 12x de R$ 99,70": "O 12x da R$99,70",
    "Processando...": "Elaborazione...",
    "Garantir Vaga": "Prenota il Tuo Posto",
    "Acesso imediato após o pagamento": "Accesso immediato dopo il pagamento",
    "Assista ao Vídeo": "Guarda il Video",
    "Aumente o som": "Alza il volume"
  },
  ja: {
    "HOME": "ホーム",
    "CURSOS": "コース",
    "TOOLS": "ツール",
    "DASHBOARD": "ダッシュボード",
    "Entrar": "ログイン",
    "Acesso Antecipado": "早期アクセス",
    "Acesso antecipado": "早期アクセス",
    "Painel do Aluno": "受講生パネル",
    "Painel Admin": "管理者パネル",
    "Sair da conta": "ログアウト",
    "Pesquisar...": "検索...",
    "Minha Conta": "マイアカウント",
    "Voltar": "戻る",
    "Especialistas": "スペシャリスト",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "人工知能であなたのアートを進化させましょう。私たちのツールは高度なタトゥー技術のみで訓練されています。",
    "Mais Vendido": "人気No.1",
    "Tutor IA Especialista": "専門AIチューター",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "24時間利用可能な専属メンター。リアルタイムで技術的な疑問を解決し、プロジェクトごとに正確な針と顔料の提案を受け、セッションの計画を完全にサポートします。",
    "Planejamento de Sessão": "セッション計画",
    "Análise de Pigmentos": "顔料分析",
    "Mentoria Técnica 24h": "24時間技術メンタリング",
    "Gratuito": "無料",
    "Acessar Tutor": "チューターにアクセス",
    "Novo": "新機能",
    "Assistente WhatsApp": "WhatsAppアシスタント",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "見積もりを自動化。AIがWhatsAppで顧客と会話し、タトゥーのアイデアを理解して、あなたの料金表に基づいた価格を提案します。",
    "Orçamentos Automáticos": "自動見積もり",
    "Agendamento de Horários": "予約スケジュール管理",
    "Triagem de Clientes 24h": "24時間顧客スクリーニング",
    "/mês": "/月",
    "Assinar Assistente": "アシスタントに登録",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. 無断複製・転載を禁じます。",
    "Desenvolvido para criadores e tatuadores profissionais.": "プロのクリエイターとタトゥーアーティストのために開発。",
    "O Primeiro Passo Para o Topo": "頂点への第一歩",
    "Posicionamento para": "ポジショニング対象：",
    "tatuadores": "タトゥーアーティスト",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "誰もあなたの仕事を知らなければ、最高のタトゥーアーティストであるだけでは不十分です。権威として自分を位置づけ、高く支払う顧客を惹きつけ、あなたのアートを高収益なビジネスに変える正確な秘訣を学びましょう。",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "ポジショニングとは何か、それをアーティストとしてのキャリアにどう応用するか",
    "Estruturação das suas redes sociais": "SNSの構築方法",
    "Criação de conteúdos que atraem clientes": "顧客を惹きつけるコンテンツ制作",
    "Técnicas de vendas e conversão de clientes": "販売テクニックと顧客成約",
    "Como utilizar o tráfego pago de forma objetiva": "有料広告を効果的に活用する方法",
    "Acesso à comunidade exclusiva da Ink Authority": "Ink Authority限定コミュニティへのアクセス",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 ボーナス：無料プロフィール診断（先着20名様）",
    "Investimento": "投資額",
    "Ou 12x de R$ 99,70": "または分割12回、各R$99.70",
    "Processando...": "処理中...",
    "Garantir Vaga": "席を確保する",
    "Acesso imediato após o pagamento": "支払い後すぐにアクセス可能",
    "Assista ao Vídeo": "動画を見る",
    "Aumente o som": "音量を上げてください"
  },
  ru: {
    "HOME": "ГЛАВНАЯ",
    "CURSOS": "КУРСЫ",
    "TOOLS": "ИНСТРУМЕНТЫ",
    "DASHBOARD": "ДАШБОРД",
    "Entrar": "Войти",
    "Acesso Antecipado": "Ранний Доступ",
    "Acesso antecipado": "Ранний доступ",
    "Painel do Aluno": "Кабинет ученика",
    "Painel Admin": "Панель админа",
    "Sair da conta": "Выйти",
    "Pesquisar...": "Поиск...",
    "Minha Conta": "Мой аккаунт",
    "Voltar": "Назад",
    "Especialistas": "Специалисты",
    "Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.": "Развивайте своё искусство с помощью искусственного интеллекта. Наш инструмент обучен исключительно на продвинутых техниках татуировки.",
    "Mais Vendido": "Хит продаж",
    "Tutor IA Especialista": "ИИ-наставник",
    "Um mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto, e tenha ajuda no planejamento completo das suas sessões.": "Персональный наставник, доступный 24 часа в сутки. Получайте ответы на технические вопросы в реальном времени, точные рекомендации по иглам и пигментам для каждого проекта, а также помощь в полном планировании сеансов.",
    "Planejamento de Sessão": "Планирование сеанса",
    "Análise de Pigmentos": "Анализ пигментов",
    "Mentoria Técnica 24h": "Техническая поддержка 24/7",
    "Gratuito": "Бесплатно",
    "Acessar Tutor": "Открыть наставника",
    "Novo": "Новинка",
    "Assistente WhatsApp": "WhatsApp-ассистент",
    "Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.": "Автоматизируйте расчёт стоимости. ИИ общается с клиентами в WhatsApp, понимает идею татуировки и сразу предлагает цену на основе вашего прайса.",
    "Orçamentos Automáticos": "Автоматические расчёты",
    "Agendamento de Horários": "Запись на приём",
    "Triagem de Clientes 24h": "Отбор клиентов 24/7",
    "/mês": "/мес.",
    "Assinar Assistente": "Подключить ассистента",
    "© 2026 Ink Authority. Todos os direitos reservados.": "© 2026 Ink Authority. Все права защищены.",
    "Desenvolvido para criadores e tatuadores profissionais.": "Создано для профессиональных креаторов и тату-мастеров.",
    "O Primeiro Passo Para o Topo": "Первый шаг к вершине",
    "Posicionamento para": "Позиционирование для",
    "tatuadores": "тату-мастеров",
    "Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.": "Недостаточно быть лучшим тату-мастером, если никто не знает о вашей работе. Узнайте точные секреты, как позиционировать себя как авторитета, привлекать клиентов, готовых хорошо платить, и превратить своё искусство в высокодоходный бизнес.",
    "O que é posicionamento e como aplicá-lo à sua carreira artística": "Что такое позиционирование и как применить его в вашей творческой карьере",
    "Estruturação das suas redes sociais": "Структурирование ваших социальных сетей",
    "Criação de conteúdos que atraem clientes": "Создание контента, привлекающего клиентов",
    "Técnicas de vendas e conversão de clientes": "Техники продаж и конверсии клиентов",
    "Como utilizar o tráfego pago de forma objetiva": "Как эффективно использовать платный трафик",
    "Acesso à comunidade exclusiva da Ink Authority": "Доступ к эксклюзивному сообществу Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)": "🎁 БОНУС: Бесплатный анализ профиля (для первых 20)",
    "Investimento": "Инвестиция",
    "Ou 12x de R$ 99,70": "Или 12 платежей по R$99,70",
    "Processando...": "Обработка...",
    "Garantir Vaga": "Забронировать место",
    "Acesso imediato após o pagamento": "Мгновенный доступ после оплаты",
    "Assista ao Vídeo": "Смотреть видео",
    "Aumente o som": "Включите звук"
  }
};

const reverseMap: Record<string, string> = {};
for (const lang in masterDict) {
  for (const pt in masterDict[lang]) {
    const val = masterDict[lang][pt];
    if (val && val !== pt) {
      reverseMap[val.toLowerCase()] = pt;
    }
  }
}

export function FloatingMenu() {
  const [theme, setTheme] = useState("dark");
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  const languages = [
    { code: "pt", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "ja", name: "日本語" },
    { code: "ru", name: "Русский" }
  ];

  const translateParentDOM = (targetLang: string) => {
    if (typeof document === "undefined") return;
    const walk = (node: Node | null | undefined) => {
      if (!node) return;
      if (node.nodeType === 3) {
        const val = node.nodeValue;
        if (!val || !val.trim()) return;

        const anyNode = node as any;
        if (anyNode._parentOrig === undefined) {
          const norm = val.trim();
          const pt = reverseMap[norm.toLowerCase()];
          anyNode._parentOrig = pt ? val.replace(norm, pt) : val;
        }

        const orig = anyNode._parentOrig;
        let res = orig;
        if (targetLang && targetLang !== "pt" && masterDict[targetLang]) {
          const norm = orig.trim();
          if (masterDict[targetLang][norm]) {
            res = orig.replace(norm, masterDict[targetLang][norm]);
          }
        }

        if (res !== node.nodeValue) {
          node.nodeValue = res;
        }
      } else if (node.nodeType === 1) {
        const el = node as HTMLElement;
        if (el.tagName !== "SCRIPT" && el.tagName !== "STYLE" && !el.classList.contains("notranslate")) {
          // Snapshot into a plain array before recursing: this now walks
          // the whole page (not just <nav>), and React mutates the live
          // DOM as it renders — e.g. mid-navigation, when clicking a nav
          // link unmounts the old page and mounts the new one. Iterating
          // the live childNodes NodeList by index while React is adding or
          // removing children out from under it throws (walk() would get
          // called with an out-of-range/undefined entry); a static
          // snapshot can't shrink mid-loop.
          Array.from(node.childNodes).forEach(walk);
        }
      }
    };

    // Walk the whole page (not just <nav>) so public pages like /tools and
    // /courses get translated too. This never touches the landing page's
    // own content: an <iframe>'s child nodes are its element in the parent
    // document, not the document loaded inside it, so walk() can't cross
    // that boundary — that content has its own separate translation engine
    // (public/landing-i18n.js).
    try {
      if (document.body) walk(document.body);
    } catch (err) {
      // Best-effort UI polish — never let a translation pass take the app
      // down with it (e.g. if it races a route transition).
      console.error("translateParentDOM failed:", err);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const savedLang = localStorage.getItem("lang") || "pt";
    translateParentDOM(savedLang);
    syncLang(savedLang);

    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      const currentLang = localStorage.getItem("lang") || "pt";
      translateParentDOM(currentLang);
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: currentTheme }, '*');
          iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: currentLang }, '*');
        }
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    if (newTheme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
      document.body.style.backgroundColor = "#f6f7f9";
      document.body.style.color = "#111116";
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      document.body.style.backgroundColor = "#050505";
      document.body.style.color = "#ffffff";
    }

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: newTheme }, '*');
      }
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const syncLang = (langCode: string) => {
    translateParentDOM(langCode);
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: langCode }, '*');
      }
    });
  };

  const changeLanguage = (langCode: string) => {
    localStorage.setItem("lang", langCode);
    syncLang(langCode);
    setIsTranslateOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 notranslate items-start">
      {isTranslateOpen && (
        <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-1 mb-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-white min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="text-left px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={() => setIsTranslateOpen(!isTranslateOpen)}
          className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50 text-white"
          title="Mudar Idioma"
        >
          <Globe className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50 text-white"
          title="Alternar Modo Claro/Escuro"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
        </button>
      </div>
    </div>
  );
}
