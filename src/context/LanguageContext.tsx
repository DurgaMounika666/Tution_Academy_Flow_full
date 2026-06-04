import React, { createContext, useContext, useState } from "react";

type Language = "English" | "Telugu" | "Hindi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  English: {
    // Navbar
    home: "Home",
    modeOfClass: "Mode of Class",
    language: "Language",
    register: "Register",
    portalLogin: "Portal Login",
    loggedInAs: "Logged in as",
    goToLanding: "Go to Landing Page",
    onlineOnly: "Online Only",
    offlineOnly: "Offline Only",
    onlineOffline: "Online & Offline",
    contactUs: "Contact Us",
    registerNewMember: "Register New Member",
    goToCrm: "Go to CRM Portals (Login)",
    pickLanguage: "Pick Language",

    // Hero Section
    empowering: "Empowering over 10,000+ students",
    heroTitle: "Empower Your Future with ",
    personalizedPaths: "Personalized learning paths",
    liveRecorded: "Live & recorded classes",
    provenResults: "Proven results",
    unlockCuriosity: "Unlock curiosity — every lesson builds a brighter tomorrow.",
    heroDescription: "Premium quality online & offline tuition for Classes 1st to 10th. Tailored learning paths, state-of-the-art mock dashboards, veteran faculty and a proven record of high academic excellence.",
    getStarted: "Get Started Now",
    explorePortals: "Explore Portals",
    conceptSyllabus: "Concept-Oriented Syllabus",
    attendanceConsistency: "Attendance Consistency",
    avgAchievement: "Average Achievement",
    findPerfectClass: "Find Your Perfect Class",
    selectCenterAndClass: "Select location and class to unlock course options and book a free session",
    selectCenter: "Select Learning Center",
    selectClass: "Select Learning Class",
    bookDemo: "Book a Demo",
    activeSyllabus: "Active Lessons syllabus in",

    // Why Choose Us
    whyChooseTitle: "Why Choose Academy Flow?",
    whyChooseSub: "We offer state of the art tuition features designed to guide students towards complete academic confidence.",
    expertTutorsTitle: "Expert Tutors",
    expertTutorsDesc: "Learn from veteran instructors who simplify complex topics with engaging visual teaching methodologies.",
    customCurriculumTitle: "Custom Curriculum",
    customCurriculumDesc: "Every student receives a personalized homework plan, milestone goals, and tailored practice modules.",
    progressTrackingTitle: "Progress Tracking",
    progressTrackingDesc: "Weekly reports, visual attendance meters, and automated scorecards keep parents fully informed.",
    interactiveDashboardsTitle: "Interactive Mock Dashboards",
    interactiveDashboardsDesc: "Full-fidelity simulated student, parent, tutor, and admin dashboards for immersive learning.",

    // Reviews
    reviewsTitle: "Parent & Student Reviews",
    reviewsSub: "What our community says about Academy Flow and our result-oriented learning environment.",
    review1Text: "Academy Flow transformed my daughter's mathematics scores. The tutor portal updates are incredibly detailed!",
    review1Author: "Sarah Jenkins",
    review1Role: "Parent of 9th Grader",
    review2Text: "The interactive mock dashboard let me easily keep track of my physics lessons. Highly recommended tuition!",
    review2Author: "David Miller",
    review2Role: "10th Grade Student",
    review3Text: "The convenience of hybrid classes along with instant performance metrics made fee tracking and learning very transparent.",
    review3Author: "Anjali Rao",
    review3Role: "Parent of 7th Grader",

    // Footer
    footerTitle: "Premium Tuitions for the next generation.",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    address: "Madhapur, Hyderabad, Telangana 500081",
    rightsReserved: "All rights reserved."
  },
  Telugu: {
    // Navbar
    home: "హోమ్",
    modeOfClass: "తరగతి మోడ్",
    language: "భాష",
    register: "రిజిస్టర్",
    portalLogin: "పోర్టల్ లాగిన్",
    loggedInAs: "లాగిన్ అయ్యారు:",
    goToLanding: "ల్యాండింగ్ పేజీకి వెళ్ళండి",
    onlineOnly: "ఆన్‌లైన్ మాత్రమే",
    offlineOnly: "ఆఫ్‌లైన్ మాత్రమే",
    onlineOffline: "ఆన్‌లైన్ & ఆఫ్‌లైన్",
    contactUs: "మమ్మల్ని సంప్రదించండి",
    registerNewMember: "కొత్త సభ్యుడిని నమోదు చేయండి",
    goToCrm: "CRM పోర్టల్స్ (లాగిన్) వెళ్ళండి",
    pickLanguage: "భాషను ఎంచుకోండి",

    // Hero Section
    empowering: "10,000+ కంటే ఎక్కువ మంది విద్యార్థులకు సాధికారత కల్పిస్తోంది",
    heroTitle: "దీనితో మీ భవిష్యత్తును బలోపేతం చేసుకోండి ",
    personalizedPaths: "వ్యక్తిగతీకరించిన అభ్యాస మార్గాలు",
    liveRecorded: "లైవ్ & రికార్డ్ చేయబడిన క్లాసులు",
    provenResults: "నిరూపితమైన ఫలితాలు",
    unlockCuriosity: "కుతూహలాన్ని అన్‌లాక్ చేయండి — ప్రతి పాఠం రేపటి మంచి భవిష్యత్తును నిర్మిస్తుంది.",
    heroDescription: "1 నుండి 10వ తరగతుల వరకు ప్రీమియం నాణ్యత గల ఆన్‌లైన్ & ఆఫ్‌లైన్ ట్యూషన్లు. అనుకూలీకరించిన అభ్యాస మార్గాలు, అత్యాధునిక మాక్ డ్యాష్‌బోర్డ్‌లు, అనుభవజ్ఞులైన ఫ్యాకల్టీ మరియు అధిక విద్యా ప్రతిభకు నిరూపితమైన రికార్డ్.",
    getStarted: "ఇప్పుడే ప్రారంభించండి",
    explorePortals: "పోర్టల్‌లను అన్వేషించండి",
    conceptSyllabus: "భావన-ఆధారిత సిలబస్",
    attendanceConsistency: "హాజరు నిలకడ",
    avgAchievement: "సగటు సాధన",
    findPerfectClass: "మీ ఖచ్చితమైన క్లాస్‌ను కనుగొనండి",
    selectCenterAndClass: "కోర్సు ఎంపికలను అన్‌లాక్ చేయడానికి మరియు ఉచిత సెషన్‌ను బుక్ చేయడానికి స్థానం మరియు క్లాస్‌ను ఎంచుకోండి",
    selectCenter: "అభ్యాస కేంద్రాన్ని ఎంచుకోండి",
    selectClass: "అభ్యాస తరగతిని ఎంచుకోండి",
    bookDemo: "డెమో బుక్ చేయండి",
    activeSyllabus: "ఇక్కడ సక్రియ సిలబస్ పాఠాలు",

    // Why Choose Us
    whyChooseTitle: "అకాడమీ ఫ్లోను ఎందుకు ఎంచుకోవాలి?",
    whyChooseSub: "విద్యార్థులను పూర్తి విద్యాపరమైన విశ్వాసం వైపు నడిపించడానికి రూపొందించిన అత్యాధునిక ట్యూషన్ ఫీచర్లను మేము అందిస్తున్నాము.",
    expertTutorsTitle: "నిపుణులైన ట్యూటర్లు",
    expertTutorsDesc: "ఆకర్షణీయమైన దృశ్య బోధనా పద్ధతులతో సంక్లిష్టమైన విషయాలను సరళీకృతం చేసే అనుభవజ్ఞులైన బోధకుల నుండి నేర్చుకోండి.",
    customCurriculumTitle: "అనుకూలీకరించిన పాఠ్యాంశాలు",
    customCurriculumDesc: "ప్రతి విద్యార్థి వ్యక్తిగతీకరించిన హోంవర్క్ ప్లాన్, మైలురాయి లక్ష్యాలు మరియు తగిన ప్రాక్టీస్ మాడ్యూళ్లను అందుకుంటారు.",
    progressTrackingTitle: "ప్రగతి పరిశీలన",
    progressTrackingDesc: "వారపు నివేదికలు, దృశ్య హాజరు మీటర్లు మరియు స్వయంచాలక స్కోర్‌కార్డ్‌లు తల్లిదండ్రులకు పూర్తిగా తెలియజేస్తాయి.",
    interactiveDashboardsTitle: "ఇంటరాక్టివ్ మాక్ డ్యాష్‌బోర్డ్‌లు",
    interactiveDashboardsDesc: " లీనమయ్యే అభ్యాసం కోసం విద్యార్థి, తల్లిదండ్రులు, ట్యూటర్ మరియు అడ్మిన్ డ్యాష్‌బోర్డ్‌లు.",

    // Reviews
    reviewsTitle: "తల్లిదండ్రులు & విద్యార్థుల సమీక్షలు",
    reviewsSub: "అకాడమీ ఫ్లో మరియు మా ఫలితాల ఆధారిత అభ్యాస వాతావరణం గురించి మా సంఘం ఏమంటుందో చూడండి.",
    review1Text: "అకాడమీ ఫ్లో నా కుమార్తె గణితం స్కోర్‌లను మార్చింది. ట్యూటర్ పోర్టల్ అప్‌డేట్‌లు చాలా వివరంగా ఉన్నాయి!",
    review1Author: "సారా జెంకిన్స్",
    review1Role: "9వ తరగతి విద్యార్థి తల్లిదండ్రులు",
    review2Text: "ఇంటరాక్టివ్ మాక్ డ్యాష్‌బోర్డ్ నా ఫిజిక్స్ పాఠాలను సులభంగా ట్రాక్ చేయడానికి నన్ను అనుమతించింది. అత్యంత సిఫార్సు చేయబడిన ట్యూషన్!",
    review2Author: "డేవిడ్ మిల్లర్",
    review2Role: "10వ తరగతి విద్యార్థి",
    review3Text: "తక్షణ పనితీరు కొలమానాలతో కూడిన హైబ్రిడ్ తరగతుల సౌలభ్యం ఫీజు ట్రాకింగ్ మరియు అభ్యాసాన్ని చాలా పారదర్శకంగా చేసింది.",
    review3Author: "అంజలి రావు",
    review3Role: "7వ తరగతి విద్యార్థి తల్లిదండ్రులు",

    // Footer
    footerTitle: "తదుపరి తరం కోసం ప్రీమియం ట్యూషన్లు.",
    quickLinks: "త్వరిత లింకులు",
    contactInfo: "సంప్రదింపు సమాచారం",
    address: "మాధాపూర్, హైదరాబాద్, తెలంగాణ 500081",
    rightsReserved: "అన్ని హక్కులు ప్రత్యేకించబడినవి."
  },
  Hindi: {
    // Navbar
    home: "होम",
    modeOfClass: "कक्षा का तरीका",
    language: "भाषा",
    register: "पंजीकरण",
    portalLogin: "पोर्टल लॉगिन",
    loggedInAs: "लॉग इन किया है:",
    goToLanding: "होम पेज पर जाएं",
    onlineOnly: "केवल ऑनलाइन",
    offlineOnly: "केवल ऑफ़लाइन",
    onlineOffline: "ऑनलाइन और ऑफ़लाइन",
    contactUs: "संपर्क करें",
    registerNewMember: "नया सदस्य पंजीकृत करें",
    goToCrm: "CRM पोर्टल पर जाएं (लॉगिन)",
    pickLanguage: "भाषा चुनें",

    // Hero Section
    empowering: "10,000+ से अधिक छात्रों को सशक्त बनाना",
    heroTitle: "अकादमी फ्लो के साथ अपने भविष्य को सशक्त बनाएं ",
    personalizedPaths: "व्यक्तिगत शिक्षण पथ",
    liveRecorded: "लाइव और रिकॉर्डेड कक्षाएं",
    provenResults: "सफल परिणाम",
    unlockCuriosity: "जिज्ञासा जगाएं — हर पाठ एक उज्जवल कल का निर्माण करता है।",
    heroDescription: "कक्षा 1 से 10वीं तक के लिए प्रीमियम गुणवत्ता वाली ऑनलाइन और ऑफलाइन ट्यूशन। अनुकूलित शिक्षण पथ, अत्याधुनिक मॉक डैशबोर्ड, अनुभवी शिक्षक और उच्च शैक्षणिक उत्कृष्टता का सिद्ध रिकॉर्ड।",
    getStarted: "अभी शुरू करें",
    explorePortals: "पोर्टल एक्सप्लोर करें",
    conceptSyllabus: "अवधारणा-उन्मुख पाठ्यक्रम",
    attendanceConsistency: "उपस्थिति निरंतरता",
    avgAchievement: "औसत उपलब्धि",
    findPerfectClass: "अपनी आदर्श कक्षा खोजें",
    selectCenterAndClass: "पाठ्यक्रम विकल्पों को अनलॉक करने और मुफ्त सत्र बुक करने के लिए स्थान और कक्षा का चयन करें",
    selectCenter: "शिक्षण केंद्र चुनें",
    selectClass: "शिक्षण कक्षा चुनें",
    bookDemo: "डेमो बुक करें",
    activeSyllabus: "सक्रिय पाठ्यक्रम विषय",

    // Why Choose Us
    whyChooseTitle: "अकादमी फ्लो को क्यों चुनें?",
    whyChooseSub: "हम छात्रों को पूर्ण शैक्षणिक आत्मविश्वास की ओर ले जाने के लिए डिज़ाइन की गई अत्याधुनिक ट्यूशन सुविधाएं प्रदान करते हैं।",
    expertTutorsTitle: "विशेषज्ञ शिक्षक",
    expertTutorsDesc: "अनुभवी शिक्षकों से सीखें जो आकर्षक दृश्य शिक्षण पद्धतियों के साथ जटिल विषयों को सरल बनाते हैं।",
    customCurriculumTitle: "कस्टम पाठ्यक्रम",
    customCurriculumDesc: "प्रत्येक छात्र को एक व्यक्तिगत गृहकार्य योजना, मील के पत्थर के लक्ष्य और अनुकूलित अभ्यास मॉड्यूल मिलते हैं।",
    progressTrackingTitle: "प्रगति ट्रैकिंग",
    progressTrackingDesc: "साप्ताहिक रिपोर्ट, दृश्य उपस्थिति मीटर और स्वचालित स्कोरकार्ड माता-पिता को पूरी तरह से सूचित रखते हैं।",
    interactiveDashboardsTitle: "इंटरैक्टिव मॉक डैशबोर्ड",
    interactiveDashboardsDesc: "गहन सीखने के लिए छात्र, अभिभावक, शिक्षक और व्यवस्थापक डैशबोर्ड का पूर्ण सिमुलेशन।",

    // Reviews
    reviewsTitle: "अभिभावक और छात्र समीक्षाएं",
    reviewsSub: "अकादमी फ्लो और हमारे परिणाम-उन्मुख शिक्षण वातावरण के बारे में हमारा समुदाय क्या कहता है।",
    review1Text: "अकादमी फ्लो ने मेरी बेटी के गणित के अंकों को बदल दिया। ट्यूटर पोर्टल अपडेट अविश्वसनीय रूप से विस्तृत हैं!",
    review1Author: "सारा जेन्किंस",
    review1Role: "9वीं कक्षा के छात्र के अभिभावक",
    review2Text: "इंटरैक्टिव मॉक डैशबोर्ड ने मुझे अपने भौतिकी के पाठों को आसानी से ट्रैक करने दिया। अत्यधिक अनुशंसित ट्यूशन!",
    review2Author: "डेविड मिलर",
    review2Role: "10वीं कक्षा का छात्र",
    review3Text: "तत्काल प्रदर्शन मेट्रिक्स के साथ हाइब्रिड कक्षाओं की सुविधा ने शुल्क ट्रैकिंग और सीखने को बहुत पारदर्शी बना दिया।",
    review3Author: "अंजलि राव",
    review3Role: "7वीं कक्षा के छात्र के अभिभावक",

    // Footer
    footerTitle: "अगली पीढ़ी के लिए प्रीमियम ट्यूशन।",
    quickLinks: "त्वरित लिंक",
    contactInfo: "संपर्क जानकारी",
    address: "माधापुर, हैदराबाद, तेलंगाना 500081",
    rightsReserved: "सर्वाधिकार सुरक्षित।"
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("English");

  const t = (key: string): string => {
    return dictionary[language]?.[key] || dictionary["English"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
