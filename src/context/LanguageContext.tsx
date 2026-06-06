import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "English" | "Telugu" | "Hindi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const english = {
  home: "Home",
  modeOfClass: "Mode of Class",
  language: "Language",
  register: "Register",
  portalLogin: "Portal Login",
  loggedInAs: "Logged in as",
  goToLanding: "Go to Landing Page",
  goToDashboard: "Go to Dashboard",
  onlineOnly: "Online Only",
  offlineOnly: "Offline Only",
  onlineOffline: "Online & Offline",
  contactUs: "Contact Us",
  registerNewMember: "Register New Member",
  goToCrm: "Go to CRM Portals (Login)",
  pickLanguage: "Pick Language",
  back: "Back",
  continue: "Continue",
  authorizedAccess: "Authorized Personnel Access Only",
  academicGateway: "Academic Gateway",
  loginGatewaySubtitle: "Select your portal role below to manage coursework, schedules, and grades.",
  studentLogin: "Student Login",
  parentLogin: "Parent Login",
  tutorLogin: "Tutor Login",
  adminLogin: "Admin Login",
  forgotPassword: "Forgot Password",

  empowering: "Empowering over 10,000+ students",
  heroTitle: "Empower Your Future with ",
  personalizedPaths: "Personalized learning paths",
  liveRecorded: "Live & recorded classes",
  provenResults: "Proven results",
  unlockCuriosity: "Unlock curiosity - every lesson builds a brighter tomorrow.",
  heroDescription: "Premium quality online & offline tuition for Classes 1st to 10th. Tailored learning paths, state-of-the-art mock dashboards, veteran faculty and a proven record of academic excellence.",
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
  activeSyllabus: "Active lessons syllabus in",

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

  footerTitle: "Premium tuitions for the next generation.",
  quickLinks: "Quick Links",
  contactInfo: "Contact Info",
  address: "Madhapur, Hyderabad, Telangana 500081",
  rightsReserved: "All rights reserved.",
};

const dictionary: Record<Language, Record<string, string>> = {
  English: english,
  Telugu: {
    ...english,
    home: "హోమ్",
    modeOfClass: "తరగతి విధానం",
    language: "భాష",
    register: "నమోదు",
    portalLogin: "పోర్టల్ లాగిన్",
    loggedInAs: "లాగిన్ అయిన పాత్ర",
    goToLanding: "హోమ్ పేజీకి వెళ్లండి",
    goToDashboard: "డ్యాష్‌బోర్డ్‌కు వెళ్లండి",
    onlineOnly: "ఆన్‌లైన్ మాత్రమే",
    offlineOnly: "ఆఫ్‌లైన్ మాత్రమే",
    onlineOffline: "ఆన్‌లైన్ & ఆఫ్‌లైన్",
    contactUs: "మమ్మల్ని సంప్రదించండి",
    pickLanguage: "భాషను ఎంచుకోండి",
    back: "వెనుకకు",
    continue: "కొనసాగించండి",
    authorizedAccess: "అధికారిక వినియోగదారులకే ప్రవేశం",
    academicGateway: "అకాడెమిక్ గేట్‌వే",
    loginGatewaySubtitle: "కోర్సులు, షెడ్యూల్‌లు, మార్కులను నిర్వహించడానికి మీ పోర్టల్ పాత్రను ఎంచుకోండి.",
    studentLogin: "విద్యార్థి లాగిన్",
    parentLogin: "తల్లిదండ్రుల లాగిన్",
    tutorLogin: "ట్యూటర్ లాగిన్",
    adminLogin: "అడ్మిన్ లాగిన్",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా",
    empowering: "10,000+ మంది విద్యార్థులకు శక్తిని అందిస్తున్నాం",
    heroTitle: "మీ భవిష్యత్తును బలోపేతం చేసుకోండి ",
    personalizedPaths: "వ్యక్తిగత అభ్యాస మార్గాలు",
    liveRecorded: "లైవ్ & రికార్డ్ తరగతులు",
    provenResults: "నిరూపిత ఫలితాలు",
    unlockCuriosity: "ఆసక్తిని పెంచండి - ప్రతి పాఠం మంచి రేపటిని నిర్మిస్తుంది.",
    heroDescription: "1వ తరగతి నుంచి 10వ తరగతి వరకు ఆన్‌లైన్ & ఆఫ్‌లైన్ ప్రీమియం ట్యూషన్. వ్యక్తిగత అభ్యాస మార్గాలు, అనుభవజ్ఞులైన బోధకులు, మెరుగైన ఫలితాలు.",
    getStarted: "ఇప్పుడే ప్రారంభించండి",
    explorePortals: "పోర్టల్‌లను చూడండి",
    conceptSyllabus: "భావన-ఆధారిత సిలబస్",
    attendanceConsistency: "హాజరు స్థిరత్వం",
    avgAchievement: "సగటు సాధన",
    findPerfectClass: "మీకు సరైన తరగతిని కనుగొనండి",
    selectCenterAndClass: "కోర్సు ఎంపికలు మరియు ఉచిత సెషన్ కోసం ప్రదేశం, తరగతిని ఎంచుకోండి",
    selectCenter: "అభ్యాస కేంద్రం",
    selectClass: "అభ్యాస తరగతి",
    bookDemo: "డెమో బుక్ చేయండి",
    activeSyllabus: "సక్రియ పాఠ్యాంశాలు",
    whyChooseTitle: "Academy Flow ఎందుకు?",
    whyChooseSub: "విద్యార్థుల విద్యా విశ్వాసాన్ని పెంచే ఆధునిక ట్యూషన్ సదుపాయాలు అందిస్తున్నాం.",
    expertTutorsTitle: "నిపుణులైన ట్యూటర్లు",
    expertTutorsDesc: "క్లిష్ట విషయాలను సులభంగా బోధించే అనుభవజ్ఞులైన ఉపాధ్యాయుల నుంచి నేర్చుకోండి.",
    customCurriculumTitle: "అనుకూల పాఠ్యాంశం",
    customCurriculumDesc: "ప్రతి విద్యార్థికి వ్యక్తిగత హోంవర్క్, లక్ష్యాలు, సాధన మాడ్యూల్స్ అందుతాయి.",
    progressTrackingTitle: "ప్రగతి ట్రాకింగ్",
    progressTrackingDesc: "వారపు నివేదికలు, హాజరు మీటర్లు, స్కోర్‌కార్డులు తల్లిదండ్రులకు స్పష్టత ఇస్తాయి.",
    interactiveDashboardsTitle: "ఇంటరాక్టివ్ డ్యాష్‌బోర్డ్‌లు",
    interactiveDashboardsDesc: "విద్యార్థి, తల్లిదండ్రులు, ట్యూటర్, అడ్మిన్ డ్యాష్‌బోర్డ్‌లతో పూర్తి అభ్యాస అనుభవం.",
    reviewsTitle: "తల్లిదండ్రులు & విద్యార్థుల సమీక్షలు",
    reviewsSub: "Academy Flow గురించి మా సమాజం చెప్పేది.",
    footerTitle: "తదుపరి తరానికి ప్రీమియం ట్యూషన్.",
    quickLinks: "త్వరిత లింకులు",
    contactInfo: "సంప్రదింపు సమాచారం",
    address: "మాధాపూర్, హైదరాబాద్, తెలంగాణ 500081",
    rightsReserved: "అన్ని హక్కులు రిజర్వు చేయబడ్డాయి.",
  },
  Hindi: {
    ...english,
    home: "होम",
    modeOfClass: "कक्षा का तरीका",
    language: "भाषा",
    register: "पंजीकरण",
    portalLogin: "पोर्टल लॉगिन",
    loggedInAs: "लॉग इन भूमिका",
    goToLanding: "होम पेज पर जाएं",
    goToDashboard: "डैशबोर्ड पर जाएं",
    onlineOnly: "केवल ऑनलाइन",
    offlineOnly: "केवल ऑफलाइन",
    onlineOffline: "ऑनलाइन & ऑफलाइन",
    contactUs: "संपर्क करें",
    pickLanguage: "भाषा चुनें",
    back: "वापस",
    continue: "जारी रखें",
    authorizedAccess: "केवल अधिकृत उपयोगकर्ताओं के लिए",
    academicGateway: "अकादमिक गेटवे",
    loginGatewaySubtitle: "कोर्स, शेड्यूल और ग्रेड मैनेज करने के लिए अपनी पोर्टल भूमिका चुनें.",
    studentLogin: "छात्र लॉगिन",
    parentLogin: "अभिभावक लॉगिन",
    tutorLogin: "ट्यूटर लॉगिन",
    adminLogin: "एडमिन लॉगिन",
    forgotPassword: "पासवर्ड भूल गए",
    empowering: "10,000+ छात्रों को सशक्त बना रहे हैं",
    heroTitle: "अपना भविष्य सशक्त बनाएं ",
    personalizedPaths: "व्यक्तिगत सीखने के मार्ग",
    liveRecorded: "लाइव & रिकॉर्डेड कक्षाएं",
    provenResults: "सिद्ध परिणाम",
    unlockCuriosity: "जिज्ञासा जगाएं - हर पाठ बेहतर कल बनाता है.",
    heroDescription: "कक्षा 1 से 10 तक ऑनलाइन & ऑफलाइन प्रीमियम ट्यूशन. व्यक्तिगत सीखने के मार्ग, अनुभवी शिक्षक और बेहतर परिणाम.",
    getStarted: "अभी शुरू करें",
    explorePortals: "पोर्टल देखें",
    conceptSyllabus: "अवधारणा-आधारित सिलेबस",
    attendanceConsistency: "उपस्थिति स्थिरता",
    avgAchievement: "औसत उपलब्धि",
    findPerfectClass: "अपनी सही कक्षा खोजें",
    selectCenterAndClass: "कोर्स विकल्प और मुफ्त सत्र के लिए स्थान और कक्षा चुनें",
    selectCenter: "लर्निंग सेंटर",
    selectClass: "लर्निंग क्लास",
    bookDemo: "डेमो बुक करें",
    activeSyllabus: "सक्रिय सिलेबस",
    whyChooseTitle: "Academy Flow क्यों चुनें?",
    whyChooseSub: "हम छात्रों का शैक्षणिक आत्मविश्वास बढ़ाने वाली आधुनिक ट्यूशन सुविधाएं देते हैं.",
    expertTutorsTitle: "विशेषज्ञ ट्यूटर",
    expertTutorsDesc: "जटिल विषयों को आसान बनाने वाले अनुभवी शिक्षकों से सीखें.",
    customCurriculumTitle: "अनुकूल पाठ्यक्रम",
    customCurriculumDesc: "हर छात्र को व्यक्तिगत होमवर्क योजना, लक्ष्य और अभ्यास मॉड्यूल मिलते हैं.",
    progressTrackingTitle: "प्रगति ट्रैकिंग",
    progressTrackingDesc: "साप्ताहिक रिपोर्ट, उपस्थिति मीटर और स्कोरकार्ड अभिभावकों को अपडेट रखते हैं.",
    interactiveDashboardsTitle: "इंटरैक्टिव डैशबोर्ड",
    interactiveDashboardsDesc: "छात्र, अभिभावक, ट्यूटर और एडमिन डैशबोर्ड के साथ पूर्ण सीखने का अनुभव.",
    reviewsTitle: "अभिभावक & छात्र समीक्षाएं",
    reviewsSub: "Academy Flow के बारे में हमारा समुदाय क्या कहता है.",
    footerTitle: "अगली पीढ़ी के लिए प्रीमियम ट्यूशन.",
    quickLinks: "त्वरित लिंक",
    contactInfo: "संपर्क जानकारी",
    address: "माधापुर, हैदराबाद, तेलंगाना 500081",
    rightsReserved: "सर्वाधिकार सुरक्षित.",
  },
};

const phraseTranslations: Record<Exclude<Language, "English">, Record<string, string>> = {
  Telugu: {
    Dashboard: "డ్యాష్‌బోర్డ్",
    Students: "విద్యార్థులు",
    Tutors: "ట్యూటర్లు",
    Parents: "తల్లిదండ్రులు",
    Courses: "కోర్సులు",
    Batches: "బ్యాచ్‌లు",
    Timetable: "టైమ్‌టేబుల్",
    Attendance: "హాజరు",
    Results: "ఫలితాలు",
    Fees: "ఫీజులు",
    Reports: "నివేదికలు",
    Notifications: "నోటిఫికేషన్లు",
    Settings: "సెట్టింగ్స్",
    Profile: "ప్రొఫైల్",
    Messages: "సందేశాలు",
    Reviews: "సమీక్షలు",
    Assignments: "అసైన్‌మెంట్లు",
    Tests: "పరీక్షలు",
    Schedule: "షెడ్యూల్",
    "My Tutor": "నా ట్యూటర్",
    "My Students": "నా విద్యార్థులు",
    "Student Login": "విద్యార్థి లాగిన్",
    "Parent Login": "తల్లిదండ్రుల లాగిన్",
    "Tutor Login": "ట్యూటర్ లాగిన్",
    "Admin Login": "అడ్మిన్ లాగిన్",
    "Forgot Password?": "పాస్‌వర్డ్ మర్చిపోయారా?",
    "Email Verification": "ఇమెయిల్ ధృవీకరణ",
    "OTP Verification": "OTP ధృవీకరణ",
    "Set New Password": "కొత్త పాస్‌వర్డ్ సెట్ చేయండి",
    "Confirm Password": "పాస్‌వర్డ్ నిర్ధారించండి",
    "Send OTP": "OTP పంపండి",
    "Verify OTP": "OTP ధృవీకరించండి",
    "Return to Login": "లాగిన్‌కు తిరిగి వెళ్లండి",
    "Logout": "లాగౌట్",
    "Cancel": "రద్దు",
    "Accept": "అంగీకరించు",
    "Reject": "తిరస్కరించు",
    "Registration Request Inbox": "నమోదు అభ్యర్థనల ఇన్‌బాక్స్",
    "Registration Notifications": "నమోదు నోటిఫికేషన్లు",
    "Class / Grade *": "తరగతి / గ్రేడ్ *",
    "Select Course *": "కోర్సు ఎంచుకోండి *",
    "Preferred Demo Date *": "డెమో తేదీ *",
    "Book My Free Seat": "ఉచిత సీటును బుక్ చేయండి",
    "Support Chat": "సపోర్ట్ చాట్",
    "Quick topics": "త్వరిత విషయాలు",
    "Type your message": "మీ సందేశం టైప్ చేయండి",
  },
  Hindi: {
    Dashboard: "डैशबोर्ड",
    Students: "छात्र",
    Tutors: "ट्यूटर",
    Parents: "अभिभावक",
    Courses: "कोर्स",
    Batches: "बैच",
    Timetable: "टाइमटेबल",
    Attendance: "उपस्थिति",
    Results: "परिणाम",
    Fees: "फीस",
    Reports: "रिपोर्ट",
    Notifications: "सूचनाएं",
    Settings: "सेटिंग्स",
    Profile: "प्रोफाइल",
    Messages: "संदेश",
    Reviews: "समीक्षाएं",
    Assignments: "असाइनमेंट",
    Tests: "परीक्षाएं",
    Schedule: "शेड्यूल",
    "My Tutor": "मेरा ट्यूटर",
    "My Students": "मेरे छात्र",
    "Student Login": "छात्र लॉगिन",
    "Parent Login": "अभिभावक लॉगिन",
    "Tutor Login": "ट्यूटर लॉगिन",
    "Admin Login": "एडमिन लॉगिन",
    "Forgot Password?": "पासवर्ड भूल गए?",
    "Email Verification": "ईमेल सत्यापन",
    "OTP Verification": "OTP सत्यापन",
    "Set New Password": "नया पासवर्ड सेट करें",
    "Confirm Password": "पासवर्ड पुष्टि करें",
    "Send OTP": "OTP भेजें",
    "Verify OTP": "OTP सत्यापित करें",
    "Return to Login": "लॉगिन पर लौटें",
    "Logout": "लॉगआउट",
    "Cancel": "रद्द करें",
    "Accept": "स्वीकार करें",
    "Reject": "अस्वीकार करें",
    "Registration Request Inbox": "पंजीकरण अनुरोध इनबॉक्स",
    "Registration Notifications": "पंजीकरण सूचनाएं",
    "Class / Grade *": "कक्षा / ग्रेड *",
    "Select Course *": "कोर्स चुनें *",
    "Preferred Demo Date *": "पसंदीदा डेमो तारीख *",
    "Book My Free Seat": "मेरी मुफ्त सीट बुक करें",
    "Support Chat": "सपोर्ट चैट",
    "Quick topics": "त्वरित विषय",
    "Type your message": "अपना संदेश लिखें",
  },
};

const originalTextNodes = new WeakMap<Text, string>();

function applyPhraseTranslations(language: Language) {
  if (typeof document === "undefined" || !document.body) return;

  const translations = language === "English" ? null : phraseTranslations[language];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;
    const parentName = textNode.parentElement?.tagName;
    if (parentName !== "SCRIPT" && parentName !== "STYLE" && textNode.textContent?.trim()) {
      nodes.push(textNode);
    }
    node = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const original = originalTextNodes.get(textNode) || textNode.textContent || "";
    if (!originalTextNodes.has(textNode)) {
      originalTextNodes.set(textNode, original);
    }
    const trimmed = original.trim();
    const translated = translations?.[trimmed];
    textNode.textContent = translated ? original.replace(trimmed, translated) : original;
  });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "English";
    const saved = localStorage.getItem("academyflow_language");
    return saved === "Telugu" || saved === "Hindi" ? saved : "English";
  });

  useEffect(() => {
    localStorage.setItem("academyflow_language", language);
    document.documentElement.lang = language === "Telugu" ? "te" : language === "Hindi" ? "hi" : "en";
  }, [language]);

  useEffect(() => {
    applyPhraseTranslations(language);
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyPhraseTranslations(language));
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return dictionary[language]?.[key] || english[key as keyof typeof english] || key;
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
