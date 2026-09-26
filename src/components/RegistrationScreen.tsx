import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2, Languages, UserRound, BriefcaseBusiness, MapPin, Phone, GraduationCap, QrCode, ShieldCheck, PiggyBank, Building2, LockKeyhole } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader } from './ui';
import { LANGUAGES, type LangCode } from '@/i18n';
import { getShramaId } from './ShramaIDScreen';
import type { Role, Gender, RegistrationProfile } from '@/types';

const registrationCopy: Record<LangCode, Record<string, string>> = {
  en: { title: 'Registration', subtitle: 'Create your demo worker or employer profile', chooseRole: 'Account type', labourer: 'Labourer', contractor: 'Contractor', employer: 'Employer', language: 'Preferred language', fullName: 'Full name', phone: 'Mobile number', skill: 'Primary skill', experience: 'Experience', qualification: 'Qualification', languages: 'Languages spoken', location: 'Current location', wage: 'Expected monthly income', company: 'Company / business name', workers: 'Workers you manage', emergency: 'Emergency contact', example: 'Use example', continue: 'Create profile', back: 'Back', demo: 'Prototype only — no real registration, payments, insurance or payroll are processed.', skillExample: 'Example: Mason', nameExample: 'Example: Ravi Kumar', qualificationExample: 'Example: ITI / Diploma / Class 10', locationExample: 'Example: Mysuru, Karnataka', companyExample: 'Example: Kumar Constructions', emergencyExample: 'Example: Suresh Kumar — 9123456780', wageExample: 'Example: ₹18,000 / month', workersExample: 'Example: 12' },
  hi: { title: 'पंजीकरण', subtitle: 'अपना डेमो मजदूर या नियोक्ता प्रोफ़ाइल बनाएं', chooseRole: 'खाता प्रकार', labourer: 'मजदूर', contractor: 'ठेकेदार', employer: 'नियोक्ता', language: 'पसंदीदा भाषा', fullName: 'पूरा नाम', phone: 'मोबाइल नंबर', skill: 'मुख्य कौशल', experience: 'अनुभव', qualification: 'योग्यता', languages: 'बोली जाने वाली भाषाएं', location: 'वर्तमान स्थान', wage: 'अपेक्षित मासिक आय', company: 'कंपनी / व्यवसाय का नाम', workers: 'आपके अधीन मजदूर', emergency: 'आपातकालीन संपर्क', example: 'उदाहरण भरें', continue: 'प्रोफ़ाइल बनाएं', back: 'वापस', demo: 'केवल प्रोटोटाइप — कोई वास्तविक पंजीकरण, भुगतान, बीमा या पेरोल नहीं होता।', skillExample: 'उदाहरण: राजमिस्त्री', nameExample: 'उदाहरण: रवि कुमार', qualificationExample: 'उदाहरण: ITI / डिप्लोमा / कक्षा 10', locationExample: 'उदाहरण: मैसूर, कर्नाटक', companyExample: 'उदाहरण: कुमार कंस्ट्रक्शन्स', emergencyExample: 'उदाहरण: सुरेश कुमार — 9123456780', wageExample: 'उदाहरण: ₹18,000 / माह', workersExample: 'उदाहरण: 12' },
  kn: { title: 'ನೋಂದಣಿ', subtitle: 'ನಿಮ್ಮ ಡೆಮೊ ಕಾರ್ಮಿಕ ಅಥವಾ wield ಅಡಿಯಲ್ಲಿ ನೌಕರರ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ', chooseRole: 'ಖಾತೆ ಪ್ರಕಾರ', labourer: 'ಕಾರ್ಮಿಕ', contractor: 'ಗುತ್ತಿಗೆದಾರ', employer: 'ಉದ್ಯೋಗದಾರ', language: 'ಆದ್ಯತೆಯ ಭಾಷೆ', fullName: 'ಪೂರ್ಣ ಹೆಸರು', phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', skill: 'ಮುಖ್ಯ ಕೌಶಲ್ಯ', experience: 'ಅನುಭವ', qualification: 'ಅರ್ಹತೆ', languages: 'ಮಾತನಾಡುವ ಭಾಷೆಗಳು', location: 'ಪ್ರಸ್ತುತ ಸ್ಥಳ', wage: 'ನಿರೀಕ್ಷಿತ ಮಾಸಿಕ ಆದಾಯ', company: 'ಕಂಪನಿ / ವ್ಯವಹಾರದ ಹೆಸರು', workers: 'ನಿಮ್ಮ ಅಡಿಯಲ್ಲಿ ಕಾರ್ಮಿಕರು', emergency: 'ತುರ್ತು ಸಂಪರ್ಕ', example: 'ಉದಾಹರಣೆ ತುಂಬಿ', continue: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ', back: 'ಹಿಂದೆ', demo: 'ಮೂಲಮಾದರಿ ಮಾತ್ರ — ನಿಜವಾದ ನೋಂದಣಿ, ಪಾವತಿ, ವಿಮೆ ಅಥವಾ ಪೇರೋಲ್ ನಡೆಯುವುದಿಲ್ಲ.', skillExample: 'ಉದಾಹರಣೆ: ಮೇಸ್ತ್ರಿ', nameExample: 'ಉದಾಹರಣೆ: ರವಿ ಕುಮಾರ್', qualificationExample: 'ಉದಾಹರಣೆ: ITI / ಡಿಪ್ಲೊಮಾ / 10ನೇ ತರಗತಿ', locationExample: 'ಉದಾಹರಣೆ: ಮೈಸೂರು, ಕರ್ನಾಟಕ', companyExample: 'ಉದಾಹರಣೆ: ಕುಮಾರ್ ಕನ್‌ಸ್ಟ್ರಕ್ಷನ್ಸ್', emergencyExample: 'ಉದಾಹರಣೆ: ಸುರೇಶ್ ಕುಮಾರ್ — 9123456780', wageExample: 'ಉದಾಹರಣೆ: ₹18,000 / ತಿಂಗಳು', workersExample: 'ಉದಾಹರಣೆ: 12' },
  ta: { title: 'பதிவு', subtitle: 'உங்கள் டெமோ தொழிலாளர் அல்லது முதலாளி சுயவிவரத்தை உருவாக்கவும்', chooseRole: 'கணக்கு வகை', labourer: 'தொழிலாளர்', contractor: 'ஒப்பந்ததாரர்', employer: 'முதலாளி', language: 'விருப்ப மொழி', fullName: 'முழு பெயர்', phone: 'மொபைல் எண்', skill: 'முக்கிய திறன்', experience: 'அனுபவம்', qualification: 'தகுதி', languages: 'பேசும் மொழிகள்', location: 'தற்போதைய இடம்', wage: 'எதிர்பார்க்கும் மாத வருமானம்', company: 'நிறுவனம் / வணிக பெயர்', workers: 'உங்களின் தொழிலாளர்கள்', emergency: 'அவசர தொடர்பு', example: 'உதாரணம் நிரப்பு', continue: 'சுயவிவரத்தை உருவாக்கு', back: 'பின்', demo: 'முன்மாதிரி மட்டும் — உண்மையான பதிவு, பணம், காப்பீடு அல்லது ஊதியச் செயலாக்கம் நடைபெறாது.', skillExample: 'உதாரணம்: மேஸ்திரி', nameExample: 'உதாரணம்: ரவி குமார்', qualificationExample: 'உதாரணம்: ITI / டிப்ளோமா / 10ஆம் வகுப்பு', locationExample: 'உதாரணம்: மைசூரு, கர்நாடகா', companyExample: 'உதாரணம்: குமார் கன்ஸ்ட்ரக்ஷன்ஸ்', emergencyExample: 'உதாரணம்: சுரேஷ் குமார் — 9123456780', wageExample: 'உதாரணம்: ₹18,000 / மாதம்', workersExample: 'உதாரணம்: 12' },
  te: { title: 'నమోదు', subtitle: 'మీ డెమో కార్మికుడు లేదా యజమాని ప్రొఫైల్ సృష్టించండి', chooseRole: 'ఖాతా రకం', labourer: 'కార్మికుడు', contractor: 'కాంట్రాక్టర్', employer: 'యజమాని', language: 'ఇష్టమైన భాష', fullName: 'పూర్తి పేరు', phone: 'మొబైల్ నంబర్', skill: 'ప్రధాన నైపుణ్యం', experience: 'అనుభవం', qualification: 'అర్హత', languages: 'మాట్లాడే భాషలు', location: 'ప్రస్తుత స్థానం', wage: 'అంచనా నెలవారీ ఆదాయం', company: 'కంపెనీ / వ్యాపారం పేరు', workers: 'మీ కింద కార్మికులు', emergency: 'అత్యవసర సంప్రదింపు', example: 'ఉదాహరణ నింపండి', continue: 'ప్రొఫైల్ సృష్టించండి', back: 'వెనుకకు', demo: 'ప్రోటోటైప్ మాత్రమే — నిజమైన నమోదు, చెల్లింపులు, బీమా లేదా పేరోల్ జరగదు.', skillExample: 'ఉదాహరణ: మేస్త్రీ', nameExample: 'ఉదాహరణ: రవి కుమార్', qualificationExample: 'ఉదాహరణ: ITI / డిప్లొమా / 10వ తరగతి', locationExample: 'ఉదాహరణ: మైసూరు, కర్ణాటక', companyExample: 'ఉదాహరణ: కుమార్ కన్‌స్ట్రక్షన్స్', emergencyExample: 'ఉదాహరణ: సురేష్ కుమార్ — 9123456780', wageExample: 'ఉదాహరణ: ₹18,000 / నెల', workersExample: 'ఉదాహరణ: 12' },
  mr: { title: 'नोंदणी', subtitle: 'तुमचे डेमो कामगार किंवा मालक प्रोफाइल तयार करा', chooseRole: 'खाते प्रकार', labourer: 'कामगार', contractor: 'कंत्राटदार', employer: 'मालक', language: 'पसंतीची भाषा', fullName: 'पूर्ण नाव', phone: 'मोबाईल नंबर', skill: 'मुख्य कौशल्य', experience: 'अनुभव', qualification: 'शैक्षणिक पात्रता', languages: 'बोलल्या जाणाऱ्या भाषा', location: 'सध्याचे ठिकाण', wage: 'अपेक्षित मासिक उत्पन्न', company: 'कंपनी / व्यवसायाचे नाव', workers: 'तुमच्याकडील कामगार', emergency: 'आपत्कालीन संपर्क', example: 'उदाहरण भरा', continue: 'प्रोफाइल तयार करा', back: 'मागे', demo: 'फक्त प्रोटोटाइप — प्रत्यक्ष नोंदणी, पेमेंट, विमा किंवा पेरोल चालवले जात नाही.', skillExample: 'उदाहरण: गवंडी', nameExample: 'उदाहरण: रवी कुमार', qualificationExample: 'उदाहरण: ITI / डिप्लोमा / 10वी', locationExample: 'उदाहरण: म्हैसूर, कर्नाटक', companyExample: 'उदाहरण: कुमार कन्स्ट्रक्शन्स', emergencyExample: 'उदाहरण: सुरेश कुमार — 9123456780', wageExample: 'उदाहरण: ₹18,000 / महिना', workersExample: 'उदाहरण: 12' },
  bn: { title: 'নিবন্ধন', subtitle: 'আপনার ডেমো শ্রমিক বা মালিক প্রোফাইল তৈরি করুন', chooseRole: 'অ্যাকাউন্টের ধরন', labourer: 'শ্রমিক', contractor: 'ঠিকাদার', employer: 'মালিক', language: 'পছন্দের ভাষা', fullName: 'পুরো নাম', phone: 'মোবাইল নম্বর', skill: 'প্রধান দক্ষতা', experience: 'অভিজ্ঞতা', qualification: 'যোগ্যতা', languages: 'কথ্য ভাষা', location: 'বর্তমান অবস্থান', wage: 'প্রত্যাশিত মাসিক আয়', company: 'কোম্পানি / ব্যবসার নাম', workers: 'আপনার অধীনে শ্রমিক', emergency: 'জরুরি যোগাযোগ', example: 'উদাহরণ পূরণ করুন', continue: 'প্রোফাইল তৈরি করুন', back: 'পিছনে', demo: 'শুধু প্রোটোটাইপ — বাস্তব নিবন্ধন, পেমেন্ট, বিমা বা পেরোল করা হয় না।', skillExample: 'উদাহরণ: রাজমিস্ত্রি', nameExample: 'উদাহরণ: রবি কুমার', qualificationExample: 'উদাহরণ: ITI / ডিপ্লোমা / দশম শ্রেণি', locationExample: 'উদাহরণ: মাইসোর, কর্ণাটক', companyExample: 'উদাহরণ: কুমার কনস্ট্রাকশনস', emergencyExample: 'উদাহরণ: সুরেশ কুমার — 9123456780', wageExample: 'উদাহরণ: ₹18,000 / মাস', workersExample: 'উদাহরণ: 12' },
};

const skillGroups = {
  'Construction': ['Mason', 'Construction Labour', 'Plumber', 'Electrician', 'Welder', 'Painter', 'Carpenter', 'Bar Bender', 'Tile Worker', 'Scaffolder', 'Roofer'],
  'Industrial': ['Industrial Labour', 'Factory Worker', 'Machine Operator', 'Fitter', 'Lathe Operator', 'Rigger', 'Industrial Electrician', 'Maintenance Technician', 'Production Worker'],
  'Hospitality & Services': ['Chef', 'Hotel Management', 'Baker', 'Housekeeping', 'Barista', 'Beautician'],
  'Transport & Delivery': ['Driver - Ola/Uber', 'Delivery Driver', 'Auto Driver', 'Truck Driver'],
  'Other': ['Helper', 'Loader', 'Security Guard', 'Caregiver'],
};
const skills = Object.values(skillGroups).flat();

export function RegistrationScreen() {
  const { role, setRole, setScreen, lang, setLang, setRegistrationProfile, showToast, showWellbeingAlertNow } = useApp();
  const [formRole, setFormRole] = useState<Role>(role ?? 'labourer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('Prefer not to say');
  const [skill, setSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [additionalSkills, setAdditionalSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [company, setCompany] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [workers, setWorkers] = useState('');
  const [hiringNeed, setHiringNeed] = useState('');
  const [budget, setBudget] = useState('');
  const [emergency, setEmergency] = useState('');
  const [skilledPaymentOpen, setSkilledPaymentOpen] = useState(false);
  const [savingsSetupOpen, setSavingsSetupOpen] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [savingsRate, setSavingsRate] = useState(1);
  const [savingsBank, setSavingsBank] = useState('AU Small Finance Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const c = registrationCopy[lang];
  const skilledWorkerLabel: Record<string, string> = { en: 'Skilled Worker', hi: 'कुशल कामगार', kn: 'ಕುಶಲ ಕಾರ್ಮಿಕ', ta: 'திறமையான தொழிலாளர்', te: 'నైపుణ్య కార్మికుడు', mr: 'कुशल कामगार', bn: 'দক্ষ কর্মী' };
  const skilledWorkerDesc: Record<string, string> = { en: 'Chef, driver, hotel & other skilled jobs', hi: 'शेफ, ड्राइवर, होटल और अन्य कुशल काम', kn: 'ಶೆಫ್, ಚಾಲಕ, ಹೋಟೆಲ್ ಮತ್ತು ಇತರ ಕುಶಲ ಕೆಲಸಗಳು', ta: 'சமையலர், ஓட்டுநர், ஹோட்டல் மற்றும் பிற திறன் பணிகள்', te: 'చెఫ్, డ్రైవర్, హోటల్ మరియు ఇతర నైపుణ్య పనులు', mr: 'शेफ, ड्रायव्हर, हॉटेल आणि इतर कुशल कामे', bn: 'শেফ, ড্রাইভার, হোটেল ও অন্যান্য দক্ষ কাজ' };
  const selectedLanguage = useMemo(() => LANGUAGES.find((l) => l.code === lang), [lang]);

  const useExample = () => {
    setName(formRole === 'labourer' ? 'Ravi Kumar' : formRole === 'skilledWorker' ? 'Ananya Sharma' : formRole === 'employer' ? 'Meera Iyer' : 'Rajesh Kumar');
    setPhone('9876543210');
    setGender(formRole === 'skilledWorker' ? 'Female' : 'Male');
    setSkill(formRole === 'labourer' ? 'Mason' : formRole === 'skilledWorker' ? 'Chef' : formRole === 'employer' ? 'General Construction' : 'Construction Supervisor');
    setCustomSkill('');
    setAdditionalSkills(formRole === 'labourer' ? 'Tile Worker, Bar Bender' : formRole === 'skilledWorker' ? 'Indian Cuisine, Food Safety' : formRole === 'employer' ? 'Project planning, site management' : 'Site Management, Safety Supervision');
    setExperience(formRole === 'employer' ? '6 years' : '4 years');
    setQualification(formRole === 'labourer' ? 'ITI - Civil' : formRole === 'skilledWorker' ? 'Hotel Management Certificate' : formRole === 'employer' ? 'B.E. / Civil Project Management' : 'Diploma in Civil Engineering');
    setSpokenLanguages('Kannada, Hindi, English');
    setLocation('Mysuru, Karnataka');
    setMonthlyIncome(formRole === 'labourer' ? '18000' : formRole === 'skilledWorker' ? '24000' : formRole === 'employer' ? '95000' : '45000');
    setCompany(formRole === 'employer' ? 'Iyer Realty & Build' : 'Kumar Constructions');
    setBusinessType(formRole === 'employer' ? 'Residential construction' : 'Construction company');
    setWorkers(formRole === 'employer' ? '8' : '12');
    setHiringNeed(formRole === 'employer' ? 'Need 3 masons and 2 helpers for 2-week finishing work' : '');
    setBudget(formRole === 'employer' ? '120000' : '65000');
    setEmergency('Suresh Kumar - 9123456780');
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const nameValue = name.trim();
    const phoneValue = phone.trim();
    const selectedSkill = skill === 'Other' ? customSkill.trim() : skill.trim();

    if (!nameValue) next.name = 'Name is required.';
    else if (nameValue.length < 2) next.name = 'Name must be at least 2 characters.';
    else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(nameValue)) next.name = 'Name should contain letters and spaces only.';

    if (!/^\d{10}$/.test(phoneValue)) next.phone = 'Mobile number must be exactly 10 digits.';
    if (!selectedSkill) next.skill = skill === 'Other' ? 'Please enter your skill.' : 'Please select a skill.';
    if (!location.trim()) next.location = 'Location is required.';
    if (monthlyIncome.trim() && (!/^\d+(\.\d+)?$/.test(monthlyIncome.trim()) || Number(monthlyIncome) < 0)) next.monthlyIncome = 'Enter a valid monthly income.';
    if (formRole === 'employer' && !company.trim()) next.company = 'Business name is required.';
    if (formRole === 'employer' && !businessType.trim()) next.businessType = 'Business type is required.';
    if (formRole === 'employer' && !hiringNeed.trim()) next.hiringNeed = 'Hiring need is required.';
    if (formRole === 'employer' && budget.trim() && (!/^\d+(\.\d+)?$/.test(budget.trim()) || Number(budget) < 0)) next.budget = 'Enter a valid budget.';
    if ((formRole === 'contractor' || formRole === 'employer') && workers.trim() && (!/^\d+$/.test(workers.trim()) || Number(workers) < 0)) next.workers = 'Enter a valid whole number of workers.';
    if (emergency.trim() && !/[A-Za-z\p{L}\p{M}].*\d{10}/u.test(emergency.trim())) next.emergency = 'Include a contact name and a 10-digit mobile number.';
    setErrors(next);
    return { valid: Object.keys(next).length === 0, selectedSkill };
  };

  const submit = async () => {
    if (isSubmitting) return;
    const result = validate();
    if (!result.valid) {
      showToast('Please correct the highlighted registration fields.');
      return;
    }
    const skills = [result.selectedSkill, ...additionalSkills.split(',').map((s) => s.trim()).filter(Boolean)].filter(Boolean);
    const salary = Number(monthlyIncome);
    const profile: RegistrationProfile = {
      name: name.trim(), phone: phone.trim(), gender, category: formRole === 'skilledWorker' ? 'skilledWorker' : 'labourer', primarySkill: result.selectedSkill, skills: Array.from(new Set(skills)),
      experience: experience.trim(), qualification: qualification.trim(),
      languages: spokenLanguages.split(',').map((item) => item.trim()).filter(Boolean), location: location.trim(),
      monthlyIncome: salary || 0, company: company.trim() || undefined, workersManaged: Number(workers) || undefined,
      emergencyContact: emergency.trim(),
    };
    setIsSubmitting(true);
    try {
      await setRegistrationProfile(profile, { showWellbeing: false, accountRole: formRole });
      const account = { shramaId: getShramaId(profile.name, profile.phone), phone: profile.phone, role: formRole, profile, lang };
      const accounts = JSON.parse(localStorage.getItem('shrama-accounts') || '[]');
      const nextAccounts = [...accounts.filter((a: any) => a.shramaId !== account.shramaId || a.role !== account.role), account];
      localStorage.setItem('shrama-accounts', JSON.stringify(nextAccounts));
      localStorage.setItem('shrama-demo-account', JSON.stringify(account));
      showToast('Demo profile created — your ShramaID is ready.');
      if (formRole === 'skilledWorker') {
        setSkilledPaymentOpen(true);
        return;
      }
      setScreen(formRole === 'labourer' ? 'shramId' : 'home');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-3xl mx-auto">
      <ScreenHeader title={c.title} subtitle={c.subtitle} />

      <Card className="p-4 mb-4 border border-brand-100 bg-brand-50/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center flex-shrink-0"><Globe2 size={20} /></div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{c.language}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedLanguage?.nativeLabel} — labels and examples can be read in your selected regional language.</p>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border ${lang === l.code ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {l.nativeLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{c.chooseRole}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          <button onClick={() => setFormRole('labourer')} className={`p-4 rounded-2xl border text-left ${formRole === 'labourer' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}>
            <UserRound size={20} className={formRole === 'labourer' ? 'text-brand-600' : 'text-gray-400'} />
            <p className="font-bold text-gray-900 mt-2">{c.labourer}</p>
          </button>
          <button onClick={() => setFormRole('contractor')} className={`p-4 rounded-2xl border text-left ${formRole === 'contractor' ? 'border-accent-500 bg-accent-50' : 'border-gray-200 bg-white'}`}>
            <BriefcaseBusiness size={20} className={formRole === 'contractor' ? 'text-accent-600' : 'text-gray-400'} />
            <p className="font-bold text-gray-900 mt-2">{c.contractor}</p>
          </button>
          <button onClick={() => setFormRole('employer')} className={`p-4 rounded-2xl border text-left ${formRole === 'employer' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
            <BriefcaseBusiness size={20} className={formRole === 'employer' ? 'text-amber-600' : 'text-gray-400'} />
            <p className="font-bold text-gray-900 mt-2">{c.employer}</p>
          </button>
          <button onClick={() => setFormRole('skilledWorker')} className={`p-4 rounded-2xl border text-left ${formRole === 'skilledWorker' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
            <BriefcaseBusiness size={20} className={formRole === 'skilledWorker' ? 'text-purple-600' : 'text-gray-400'} />
            <p className="font-bold text-gray-900 mt-2">{skilledWorkerLabel[lang]}</p>
            <p className="text-xs text-gray-500 mt-1">{skilledWorkerDesc[lang]}</p>
          </button>
        </div>
      </Card>

      <div className="flex justify-end mb-3">
        <button onClick={useExample} className="text-xs font-bold text-brand-600 flex items-center gap-1"><CheckCircle2 size={14} /> {c.example}</button>
      </div>

      <Card className="p-5 space-y-4">
        <div className="mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Personal details</p>
        </div>

        <Field label={c.fullName} icon={<UserRound size={16} />} value={name} onChange={(value) => { setName(value); setErrors((prev) => ({ ...prev, name: '' })); }} placeholder={c.nameExample} error={errors.name} />
        <Field label={c.phone} icon={<Phone size={16} />} value={phone} onChange={(value) => { setPhone(value.replace(/\D/g, '').slice(0, 10)); setErrors((prev) => ({ ...prev, phone: '' })); }} placeholder="Example: 9876543210" inputMode="tel" maxLength={10} error={errors.phone} />

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5"><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={16} />{c.skill}</span></label>
          <select value={skill} onChange={(e) => { setSkill(e.target.value); setErrors((prev) => ({ ...prev, skill: '' })); }} className={`w-full px-3.5 py-3 rounded-xl border ${errors.skill ? 'border-error-400 bg-error-50' : 'border-gray-200 bg-gray-50'} text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400`}>
            <option value="">Select your skill</option>
            {Object.entries(skillGroups).map(([group, groupSkills]) => <optgroup key={group} label={group}>{groupSkills.map((item) => <option key={item} value={item}>{item}</option>)}</optgroup>)}
            <option value="Other">Other — enter my skill</option>
          </select>
          {skill === 'Other' && <div className="mt-2"><Field label="Your skill" value={customSkill} onChange={(value) => { setCustomSkill(value); setErrors((prev) => ({ ...prev, skill: '' })); }} placeholder="Example: Solar Panel Technician" error={errors.skill} /></div>}
          {skill !== 'Other' && errors.skill && <p className="text-xs text-error-600 font-semibold mt-1.5">{errors.skill}</p>}
        </div>

        <Field label="Other / additional skills" value={additionalSkills} onChange={setAdditionalSkills} placeholder="Example: Tile Worker, Bar Bender, Shuttering" />
        <p className="text-[11px] text-gray-400 -mt-2">Add multiple skills separated by commas. Insurance recommendations use all skills entered.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={c.experience} value={experience} onChange={setExperience} placeholder="Example: 4 years" />
          <Field label={c.qualification} icon={<GraduationCap size={16} />} value={qualification} onChange={setQualification} placeholder={c.qualificationExample} />
        </div>

        <Field label={c.languages} icon={<Languages size={16} />} value={spokenLanguages} onChange={setSpokenLanguages} placeholder="Example: Kannada, Hindi" />
        <Field label={c.location} icon={<MapPin size={16} />} value={location} onChange={(value) => { setLocation(value); setErrors((prev) => ({ ...prev, location: '' })); }} placeholder={c.locationExample} error={errors.location} />

        {(formRole === 'contractor' || formRole === 'employer') && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Business profile</p>
            <Field label={c.company} value={company} onChange={setCompany} placeholder={c.companyExample} error={errors.company} />
            {formRole === 'employer' && (
              <>
                <Field label="Business type" value={businessType} onChange={(value) => { setBusinessType(value); setErrors((prev) => ({ ...prev, businessType: '' })); }} placeholder="Example: Residential construction" error={errors.businessType} />
                <Field label="Hiring need" value={hiringNeed} onChange={(value) => { setHiringNeed(value); setErrors((prev) => ({ ...prev, hiringNeed: '' })); }} placeholder="Example: Need 3 masons and 2 helpers" error={errors.hiringNeed} />
                <Field label="Estimated budget" value={budget} onChange={(value) => { setBudget(value.replace(/[^0-9.]/g, '')); setErrors((prev) => ({ ...prev, budget: '' })); }} placeholder="Example: 120000" inputMode="numeric" error={errors.budget} />
              </>
            )}
            <Field label={c.workers} value={workers} onChange={(value) => { setWorkers(value.replace(/\D/g, '')); setErrors((prev) => ({ ...prev, workers: '' })); }} placeholder={c.workersExample} inputMode="numeric" error={errors.workers} />
          </div>
        )}

        {(formRole === 'labourer' || formRole === 'skilledWorker') && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Work profile</p>
            <Field label={c.wage} value={monthlyIncome} onChange={(value) => { setMonthlyIncome(value.replace(/[^0-9.]/g, '')); setErrors((prev) => ({ ...prev, monthlyIncome: '' })); }} placeholder={c.wageExample} inputMode="numeric" error={errors.monthlyIncome} />
          </div>
        )}

        {formRole === 'employer' && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hiring and budget</p>
            <Field label={c.wage} value={monthlyIncome} onChange={(value) => { setMonthlyIncome(value.replace(/[^0-9.]/g, '')); setErrors((prev) => ({ ...prev, monthlyIncome: '' })); }} placeholder={c.wageExample} inputMode="numeric" error={errors.monthlyIncome} />
            <Field label="Expected project budget" value={budget} onChange={(value) => { setBudget(value.replace(/[^0-9.]/g, '')); setErrors((prev) => ({ ...prev, budget: '' })); }} placeholder="Example: 120000" inputMode="numeric" error={errors.budget} />
          </div>
        )}

        {formRole === 'skilledWorker' && (
          <Card className="p-4 border-purple-100 bg-purple-50/70">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-white text-purple-700 flex items-center justify-center shrink-0"><QrCode size={22} /></div>
              <div className="flex-1">
                <p className="font-extrabold text-gray-900">Skilled Worker Portal Access</p>
                <p className="text-sm text-gray-700 mt-1">There is a <strong>₹49 charge per quarter</strong> for accessing the ShramaSetu skilled-worker portal.</p>
                <p className="text-xs text-gray-500 mt-1">Scan the prototype QR below to simulate payment.</p>
                <img src="/upi-sample-qr.png" alt="Prototype QR for ₹49 portal access" className="w-28 h-28 mt-3 rounded-xl border border-gray-200 bg-white p-2" />
                <p className="text-[10px] text-gray-400 mt-2"><LockKeyhole size={11} className="inline mr-1" />Prototype only — no real payment is collected.</p>
              </div>
            </div>
          </Card>
        )}

        <Field label={c.emergency} icon={<Phone size={16} />} value={emergency} onChange={(value) => { setEmergency(value); setErrors((prev) => ({ ...prev, emergency: '' })); }} placeholder={c.emergencyExample} error={errors.emergency} />
      </Card>


      <div className="flex gap-3 mt-5">
        <Button variant="ghost" className="flex-1" onClick={() => { setRole(null); setScreen('home'); }}><ArrowLeft size={16} className="mr-2" />{c.back}</Button>
        <Button className="flex-[2]" onClick={submit} disabled={isSubmitting}>{isSubmitting ? 'Creating profile...' : c.continue}<ArrowRight size={16} className="ml-2" /></Button>
      </div>

      {skilledPaymentOpen && (
        <div className="fixed inset-0 z-[70] bg-black/45 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center"><QrCode size={22} /></div><div><p className="font-extrabold text-gray-900">Pay ₹49 for portal access</p><p className="text-xs text-gray-500">Quarterly skilled-worker access fee</p></div></div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-center"><img src="/upi-sample-qr.png" alt="Prototype QR" className="w-44 h-44 mx-auto rounded-2xl bg-white p-2 border border-gray-200" /><p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p><p className="text-[11px] text-gray-400 mt-1">Demo QR — no money is transferred.</p></div>
            <button onClick={() => { setSkilledPaymentOpen(false); setSavingsSetupOpen(true); }} className="w-full mt-4 py-3 rounded-xl bg-brand-600 text-white font-extrabold">I have paid ₹49 (Prototype)</button>
          </Card>
        </div>
      )}

      {savingsSetupOpen && (
        <div className="fixed inset-0 z-[70] bg-black/45 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center"><PiggyBank size={22} /></div><div><p className="font-extrabold text-gray-900">Your Smart Save Benefits</p><p className="text-xs text-gray-500 mt-1">Set up automatic micro-savings from your earnings.</p></div></div>
            <div className="mt-4 grid grid-cols-3 gap-2"><MiniBenefit icon="💰" text="Build an emergency buffer" /><MiniBenefit icon="🎯" text="Save for goals" /><MiniBenefit icon="🔒" text="Keep savings separate" /></div>
            <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4"><div className="flex justify-between items-center"><div><p className="font-bold text-gray-900 text-sm">Automatic savings rate</p><p className="text-xs text-gray-500 mt-1">Minimum 1% · increase it according to your income</p></div><span className="text-xl font-extrabold text-brand-700">{savingsRate}%</span></div><input type="range" min="1" max="10" value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))} className="w-full mt-4" /><div className="flex justify-between text-[10px] text-gray-400"><span>1% minimum</span><span>10%</span></div></div>
            <div className="mt-4"><p className="text-xs font-bold text-gray-600 mb-2">Savings destination</p><div className="grid grid-cols-1 gap-2">{['AU Small Finance Bank','Airtel Payments Bank','Ujjivan Small Finance Bank'].map((bank) => <button key={bank} onClick={() => setSavingsBank(bank)} className={`p-3 rounded-xl border text-left text-sm font-bold ${savingsBank === bank ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-700'}`}><Building2 size={15} className="inline mr-2" />{bank}{savingsBank === bank && <CheckCircle2 size={15} className="float-right" />}</button>)}</div></div>
            <div className="mt-4"><label className="text-xs font-bold text-gray-600">UPI / payment ID for automatic savings setup</label><input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@upi" className="w-full mt-2 px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
            <p className="text-[11px] text-gray-400 mt-3"><LockKeyhole size={12} className="inline mr-1" />Prototype only: this demonstrates the consent/setup screen. It does not create a real UPI AutoPay mandate or transfer money.</p>
            <button onClick={() => { setSavingsSetupOpen(false); showWellbeingAlertNow(); setScreen('shramId'); }} className="w-full mt-4 py-3 rounded-xl bg-brand-600 text-white font-extrabold">Save & Continue to ShramaID</button>
          </Card>
        </div>
      )}
    </div>
  );
}

function MiniBenefit({ icon, text }: { icon: string; text: string }) {
  return <div className="rounded-xl bg-gray-50 p-3 text-center"><div className="text-xl">{icon}</div><p className="text-[10px] font-bold text-gray-600 mt-1">{text}</p></div>;
}


function Field({ label, value, onChange, placeholder, icon, inputMode, list, error, maxLength }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: ReactNode; inputMode?: 'text' | 'tel' | 'numeric'; list?: string; error?: string; maxLength?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-1.5">{icon}{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} list={list} maxLength={maxLength} className={`w-full px-3.5 py-3 rounded-xl border ${error ? 'border-error-400 bg-error-50' : 'border-gray-200 bg-gray-50'} text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400`} />
      {error && <span className="block text-xs font-semibold text-error-600 mt-1.5">{error}</span>}
    </label>
  );
}
