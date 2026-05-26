'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'rw';

interface Translations {
    [key: string]: {
        en: string;
        fr: string;
        rw: string;
    };
}

export const translations: Translations = {
    heroTitle1: {
        en: "No More Waiting in Line",
        fr: "Fini l'Attente en Ligne",
        rw: "Nta Gutegereza mu Murongo Kandi"
    },
    heroTitle2: {
        en: "Wait",
        fr: "Attendez",
        rw: "Tegereza"
    },
    heroTitle3: {
        en: "wherever.",
        fr: "où vous voulez.",
        rw: "aho waba uri hose."
    },
    heroDescription: {
        en: "Get a ticket. Sit down. We tell you when the doctor is ready for you. No more standing in line.",
        fr: "Prenez un ticket. Asseyez-vous. Nous vous disons quand le médecin est prêt pour vous. Plus la peine de faire la queue.",
        rw: "Fata tike. Icare. Turakubwira igihe muganga yiteguye kukwakira. Nta guhagarara ku murongo kandi."
    },
    getTicketBtn: {
        en: "Get Your Ticket",
        fr: "Prendre un ticket",
        rw: "Fata Tike"
    },
    trackPositionBtn: {
        en: "Track Position",
        fr: "Suivre ma position",
        rw: "Kurikirana Tike"
    },
    heroStat1Value: {
        en: "10+",
        fr: "10+",
        rw: "10+"
    },
    heroStat1Label: {
        en: "Our Services",
        fr: "Nos Services",
        rw: "Serivisi Zacu"
    },
    heroStat2Value: {
        en: "<15m",
        fr: "<15m",
        rw: "<15m"
    },
    heroStat2Label: {
        en: "Wait time",
        fr: "Temps d'attente",
        rw: "Igihe cyo gutegereza"
    },
    happyPatients: { en: "Happy Patients", fr: "Patients Satisfaits", rw: "Abarwayi Bafashijwe" },
    doctors: { en: "Doctors", fr: "Médecins", rw: "Abaganga" },

    home: { en: "Home", fr: "Accueil", rw: "Ahabanza" },
    services: { en: "Services", fr: "Services", rw: "Serivisi" },
    exploreServices: { en: "Explore Services", fr: "Explorer les Services", rw: "Reba Serivisi" },
    downloadApp: { en: "Download App", fr: "Télécharger l'App", rw: "Shyira Porogaramu Muri Telefone" },
    about: { en: "About", fr: "À propos", rw: "Abo turibo" },
    contact: { en: "Contact", fr: "Contact", rw: "Twandikire" },
    supportLabel: { en: "24/7 Support", fr: "Support 24/7", rw: "Abo kugufasha amasaha 24/7" },

    selectServiceTitle: {
        en: "Select Service",
        fr: "Sélectionnez un service",
        rw: "Hitamo Serivisi"
    },
    selectServiceSubtitle: {
        en: "Choose the department you need to visit today.",
        fr: "Choisissez le département que vous devez visiter aujourd'hui.",
        rw: "Hitamo ishami wifuza kugana uyu munsi."
    },
    consultationTitle: { en: "Consultation", fr: "Consultation", rw: "Kwisuzumisha" },
    consultationDesc: { en: "General consultations & checkups", fr: "Consultations générales & bilans", rw: "Kwisuzuma no kwivuriza rusange" },
    opdTitle: { en: "Consultation", fr: "Consultation", rw: "Kwisuzumisha" },
    opdDesc: { en: "General consultations & checkups", fr: "Consultations générales & bilans", rw: "Kwisuzuma no kwivuriza rusange" },
    laboratoryTitle: { en: "Laboratory", fr: "Laboratoire", rw: "Laboratwari" },
    laboratoryDesc: { en: "Blood tests & diagnostics", fr: "Analyses de sang", rw: "Gusuzuma amaraso n'ibindi" },
    pharmacyTitle: { en: "Pharmacy", fr: "Pharmacie", rw: "Faramasi" },
    pharmacyDesc: { en: "Medication pickup & consulting", fr: "Cueillette des médicaments", rw: "Gufata imiti" },
    radiologyTitle: { en: "Radiology", fr: "Radiologie", rw: "Radiyoloji" },
    radiologyDesc: { en: "X-Rays & Imaging", fr: "Radiographies & Imagerie", rw: "Gucishwa mu cyuma" },
    takeTicketTitle: { en: "Take Ticket", fr: "Prendre un Ticket", rw: "Fata Tike" },
    takingTicketBtn: { en: "Taking...", fr: "En cours...", rw: "Birimo..." },

    deptSelected: { en: "Department Selected", fr: "Département Sélectionné", rw: "Wahisemo Ishami" },
    selectDept: { en: "Select Department", fr: "Sélectionner un Département", rw: "Hitamo Ishami" },
    activeStatus: { en: "Active", fr: "Actif", rw: "Ikora" },
    activeTicketNotice: { en: "You have an active ticket", fr: "Vous avez un ticket actif", rw: "Ufite tike ikora" },
    positionText: { en: "Position", fr: "Position", rw: "Umwanya" },
    statusText: { en: "Status", fr: "Statut", rw: "Imiterere" },
    viewMyTicket: { en: "View My Ticket", fr: "Voir Mon Ticket", rw: "Reba Tike Yanjye" },
    patientFullName: { en: "Patient Full Name", fr: "Nom Complet du Patient", rw: "Amazina Yombi y'Umurwayi" },
    patientNamePlaceholder: { en: "e.g. John Doe", fr: "ex. Jean Dupont", rw: "Urugero. John Doe" },
    activeTicketDesc1: { en: "You already have an active ticket", fr: "Vous avez déjà un ticket actif", rw: "Ufite indi tike ikora" },
    activeTicketDesc2: { en: "in this department. You cannot open a new one while your current ticket is still active.", fr: "dans ce département. Vous ne pouvez pas en ouvrir un nouveau tant que votre ticket actuel est actif.", rw: "kuri iri shami. Ntushobora gufata indi mu gihe iyambere igikora." },

    contactTitle1: { en: "Let's talk about", fr: "Parlons de", rw: "Reka tuvuge ku" },
    contactTitle2: { en: "Your Care.", fr: "Votre Santé.", rw: "Buzima Bwawe." },
    contactDesc: {
        en: "Have questions about our queue system? Our medical team is available 24/7 to provide seamless support for your facility.",
        fr: "Des questions sur notre système d'attente ? Notre équipe est disponible 24/7 pour un support complet.",
        rw: "Urakenera ubufasha kuri serivisi zacu? Ikipe yacu yiteguye kugufasha amasaha 24 mu minsi 7 y'icyumweru."
    },
    emailSupport: { en: "Email Support", fr: "Support par Email", rw: "Ubufasha bwa Email" },
    phoneCall: { en: "Phone Call", fr: "Appel Téléphonique", rw: "Guhamagara" },
    emailDesc: { en: "Quickest for general inquiries", fr: "Plus rapide pour infos", rw: "Bihuse ku bibazo rusange" },
    phoneDesc: { en: "Emergency & technical support", fr: "Urgences & support tech", rw: "Ubutabazi no gufasha" },
    chatWelcome: {
        en: "Hello! Welcome to MediQueue Support. How can we help you today?",
        fr: "Bonjour ! Bienvenue au support MediQueue. Comment pouvons-nous vous aider ?",
        rw: "Muraho! Ikaze kuri MediQueue. Twagufasha iki uyu munsi?"
    },
    chatAuto1: {
        en: "Thank you for reaching out. Our medical support team will respond shortly.",
        fr: "Merci de nous avoir contactés. Notre équipe répondra rapidement.",
        rw: "Murakoze kutwandikira. Ikipe yacu irakubara mu kanya gato."
    },
    chatAuto2: {
        en: "We've received your message. A care specialist will be with you soon.",
        fr: "Message bien reçu. Un spécialiste vous répondra bientôt.",
        rw: "Twabonye ubutumwa bwanyu. Muganga aragufasha mu kanya."
    },
    chatAuto3: {
        en: "Your message has been noted. We'll get back to you within a few minutes.",
        fr: "Votre message est noté. Retour dans quelques minutes.",
        rw: "Ubutumwa bwakiriwe. Turagusubiza mu minota micye."
    },
    typeMessage: { en: "Message...", fr: "Message...", rw: "Andika hano..." },
    liveHelp: { en: "Live Help", fr: "Aide en direct", rw: "Ubufasha" },

    footerDesc: {
        en: "Modernizing healthcare management through intelligent queue systems.",
        fr: "Moderniser la gestion des soins de santé avec des files d'attente intelligentes.",
        rw: "Guteza imbere imicungire y'ibitaro binyuze mu gukora imirongo hifashishijwe ikoranabuhanga."
    },
    departmentsTitle: { en: "Departments", fr: "Départements", rw: "Amashami" },
    patientCareTitle: { en: "Patient Care", fr: "Soins aux patients", rw: "Kwita ku barwayi" },
    getInTouchTitle: { en: "Get in touch", fr: "Nous contacter", rw: "Twandikire" },
    virtualQueue: { en: "Virtual Queue", fr: "File d'attente virtuelle", rw: "Umurongo w'Ikoranabuhanga" },
    howItWorks: { en: "How it works", fr: "Comment ça marche", rw: "Uko bikora" },
    offlineAccess: { en: "Offline Access", fr: "Accès hors ligne", rw: "Gukoresha Nta Murongo" },
    termsOfCare: { en: "Terms of Care", fr: "Conditions de soins", rw: "Amabwiriza y'Ubuvuzi" },
    kigaliRwanda: { en: "Kigali, Rwanda", fr: "Kigali, Rwanda", rw: "Kigali, Rwanda" },
    copyrightText: {
        en: "© 2026 MediQueue. Designed for the Future of Healthcare.",
        fr: "© 2026 MediQueue. Conçu pour l'avenir des soins de santé.",
        rw: "© 2026 MediQueue. Byakorewe ahazaza h'ubuvuzi."
    },
    systemOnline: { en: "System Online", fr: "Système en Ligne", rw: "Sisitemu Irakora" },
    systemOffline: { en: "System Offline", fr: "Système Hors Ligne", rw: "Sisitemu Ntikora" },
    quickLinks: { en: "Quick Links", fr: "Liens Rapides", rw: "Aho wakanda" },
    legal: { en: "Legal", fr: "Légal", rw: "Amategeko" },
    privacyPolicy: { en: "Privacy Policy", fr: "Politique de confidentialité", rw: "Amabwiriza y'ibanga" },
    termsOfService: { en: "Terms of Service", fr: "Conditions d'utilisation", rw: "Amabwiriza yo gukoresha" },
    rightsReserved: { en: "All rights reserved.", fr: "Tous droits réservés.", rw: "Uburenganzira bwose burabitswe." },

    smartHealth: { en: "No More Waiting In Line", fr: "Santé Intelligente", rw: "Ubuzima Bwiza" },
    nowServing: { en: "Now Serving", fr: "En Service", rw: "Arakirwa ubu" },
    waiting: { en: "Waiting", fr: "En attente", rw: "Ategereje" },
    completed: { en: "Completed", fr: "Terminé", rw: "Byarangiye" },
    ticketNumber: { en: "Ticket Number", fr: "Numéro de Ticket", rw: "Inomero ya Tike" },
    yourTurn: { en: "● Your turn — please proceed", fr: "● À vous - veuillez avancer", rw: "● Niwowe - Komeza" },
    department: { en: "Department", fr: "Département", rw: "Ishami" },
    patient: { en: "Patient", fr: "Patient", rw: "Umurwayi" },
    issued: { en: "Issued", fr: "Émis", rw: "Yatanzwe" },
    dateLabel: { en: "Date", fr: "Date", rw: "Itariki" },
    estWait: { en: "Est. Wait", fr: "Attente Est.", rw: "Igihe usigaje" },
    queuePosition: { en: "Queue Position", fr: "Position dans la file", rw: "Aho uri ku murongo" },
    youAreUp: { en: "You're up!", fr: "C'est votre tour !", rw: "Niwowe utahiwe!" },
    getNewTicket: { en: "Get a New Ticket", fr: "Nouveau Ticket", rw: "Fata indi tike" },

    aboutTitle: { en: "Redefining Patient Care.", fr: "Redéfinir les soins.", rw: "Kwita ku barwayi birenze." },
    aboutDesc: {
        en: "Our system combines advanced queue deterministic algorithms with an intuitive interface to ensure you never lose your spot, even when offline.",
        fr: "Notre système combine des algorithmes de file d'attente avancés et une interface intuitive.",
        rw: "Sisitemu yacu ihuza ikoranabuhanga ryo kwipimisha umurongo ni isura nziza kugirango utazatindisuma."
    },
    preparingExp: { en: "Preparing your experience...", fr: "Préparation de votre expérience...", rw: "Turi gutegura ahantu heza..." },

    validatingTicket: { en: "Validating Ticket Details...", fr: "Validation des détails...", rw: "Kwandikisha..." },
    ticketNotFound: { en: "Ticket not found", fr: "Ticket introuvable", rw: "Tike Ntiyabonetse" },
    ticketExpired: { en: "This ticket doesn't exist or may have expired.", fr: "Ce ticket n'existe pas ou a expiré.", rw: "Iyi tike ntibaho cyangwa yataye agaciro." },
    getAnotherTicket: { en: "Get another ticket", fr: "Obtenir un autre", rw: "Fata indi tike" },
    backToServices: { en: "Back to services", fr: "Retour aux services", rw: "Subira inyuma" },
    autoSyncing: { en: "Auto-syncing", fr: "Synchronisation", rw: "Kunoza imibare" },
    liveWaitingList: { en: "Live Waiting List", fr: "File d'attente en direct", rw: "Abarwayi ku mirongo" },
    realTimeStatus: { en: "Real-time status of all patients in this department", fr: "Statut en temps réel de tous les patients", rw: "Uko umurongo wifashe aka kanya" },
    queueEmpty: { en: "Queue is Empty", fr: "La file est vide", rw: "Nta muntu mu murongo" },
    noPatientsInQueue: { en: "There are currently no other patients in the queue for this service.", fr: "Il n'y a actuellement aucun autre patient.", rw: "Kugeza ubu nta wundi murwayi uri gushaka iyi serivisi." },

    loadingStatus: { en: "System is warming up...", fr: "Le système démarre...", rw: "Sisitemu iri gutangira..." },
    establishingConn: { en: "Establishing secure connection", fr: "Établissement d'une connexion sécurisée", rw: "Turi gushyiraho inzira yumutekano" },
    loadingModules: { en: "Loading core modules", fr: "Chargement des modules principaux", rw: "Gufungura ibikoresho by'ingenzi" },
    preparingInterface: { en: "Preparing interface", fr: "Préparation de l'interface", rw: "Gutegura isura ya porogaramu" },
    readyStatus: { en: "Almost ready...", fr: "Presque prêt...", rw: "Bigiye gukunda..." },
    offlineStatus: { en: "Offline Mode", fr: "Mode hors ligne", rw: "Nta Murongo Urahari" },
    activeTicketBannerTitle: { en: "Active Ticket Found", fr: "Ticket actif trouvé", rw: "Tike yabonetse" },
    activeTicketBannerAction: { en: "Resume Waiting", fr: "Continuer l'attente", rw: "Komeza utegereje" },

    sameNameHint: { en: "Using the same name as your existing tickets", fr: "Utilise le même nom que vos tickets existants", rw: "Ukoresha amazina amwe n'ayandi matike yawe" },
    deferredTicketCreated: { en: "Ticket booked! It will activate once your current service is complete.", fr: "Ticket réservé! Il s'activera une fois votre service actuel terminé.", rw: "Tike yafashwe! Izakora numara serivisi yawe ya mbere irangira." },
    ticketGenerated: { en: "Ticket generated successfully!", fr: "Ticket généré avec succès!", rw: "Tike yatanzwe neza!" },
    generateFailed: { en: "Failed to generate ticket. Please try again.", fr: "Échec de la génération. Réessayez.", rw: "Tike ntiyatanzwe. Ongera ugerageze." },
    systemError: { en: "A system error occurred.", fr: "Une erreur système s'est produite.", rw: "Habaye ikibazo cya sisitemu." },

    backToHome: { en: "Back to Home", fr: "Retour à l'accueil", rw: "Subira Ahabanza" },
    positionUpdated: { en: "Position updated", fr: "Position mise à jour", rw: "Umwanya wahinduwe" },
    serviceComplete: { en: "Your service is complete. Thank you!", fr: "Votre service est terminé. Merci!", rw: "Serivisi yawe irarangiye. Murakoze!" },
    queueRefreshing: { en: "Refreshing live queue…", fr: "Actualisation de la file…", rw: "Kuvugurura umurongo…" },
    moreService: { en: "more service", fr: "service de plus", rw: "serivisi imwe yongeye" },
    moreServices: { en: "more services", fr: "services de plus", rw: "serivisi eziyongeye" },

    myServicesTitle: { en: "My booked services", fr: "Mes services réservés", rw: "Serivisi nasabye" },
    oneServiceBooked: { en: "1 service booked", fr: "1 service réservé", rw: "Serivisi 1 yasabwe" },
    servicesBooked: { en: "services booked", fr: "services réservés", rw: "serivisi zasabwe" },
    inQueue: { en: "in queue", fr: "dans la file", rw: "ku murongo" },
    deferredLabel: { en: "Waiting its turn", fr: "En attente de son tour", rw: "Itegereje umwanya wayo" },
    deferredHint: { en: "Will activate after your current service", fr: "S'activera après votre service actuel", rw: "Irazamuka numara kuvurwa iyi" },
    chooseServiceNow: { en: "You are being called in multiple services at the same time.", fr: "Vous êtes appelé dans plusieurs services en même temps.", rw: "Urimo guhamagarwa mu mashami menshi icyarimwe." },
    chooseServiceNowHint: { en: "Choose where you will go now. The other ticket will stay valid and move to the end of that queue.", fr: "Choisissez où vous irez maintenant. L'autre ticket restera valide et passera à la fin de cette file.", rw: "Hitamo aho ugiye kujya. Indi tike urayigumana ariko irajya inyuma y'abandi." },
    saving: { en: "Saving...", fr: "Enregistrement...", rw: "Kubitara..." },
    chooseLabel: { en: "Choose", fr: "Choisir", rw: "Hitamo" },
    sequentialNote: { en: "Each service activates automatically after the previous one is complete", fr: "Chaque service s'active automatiquement après la fin du précédent", rw: "Buri serivisi yizana wamara gukora iyibanza" },
    serviceChoiceSaved: { en: "Service selected. Other active call has been moved to the end of its queue.", fr: "Service sélectionné. L'autre appel a été déplacé à la fin.", rw: "Serivisi yatoranijwe. Iyindi yimuwe ijyanwa inyuma y'abandi." },
    serviceChoiceFailed: { en: "Could not save your service choice. Please try again.", fr: "Impossible d'enregistrer. Veuillez réessayer.", rw: "Ntibyashobotse. Ongera ugerageze." },
    bookedLabel: { en: "ACTIVE", fr: "ACTIF", rw: "YAFASHWE" },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedLang = localStorage.getItem('app-language') as Language;
        if (storedLang && ['en', 'fr', 'rw'].includes(storedLang)) {
            setLanguage(storedLang);
        }
    }, []);

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (key: string, fallback?: string): string => {
        if (!translations[key]) {
            if (!fallback) {
                console.warn(`Translation key not found: ${key}`);
            }
            return fallback || key;
        }
        return translations[key][language] || translations[key]['en'];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
