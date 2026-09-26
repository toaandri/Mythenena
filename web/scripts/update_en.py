import json

with open('D:/Mythenena/web/locales/en.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['confidentialite'] = {
    'title': 'Privacy Policy',
    'intro': 'Last updated: September 2026. Mythenena is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.',
    'importantTitle': 'Important Note',
    'importantContent': 'Mythenena is a listening and information tool, not a medical service. In case of emergency, contact emergency services (+261 20 22 XXX XX) or go to the nearest emergency room.',
    'sections': {
        'dataProtection': {
            'title': 'Data Protection',
            'content': 'We only collect strictly necessary data: display name, email/phone (for login), and your assessment responses (anonymized). No sensitive data is stored without your explicit consent.'
        },
        'anonymity': {
            'title': 'Guaranteed Anonymity',
            'content': 'On the forum, AI chat, and support groups, you are identified only by a pseudonym. Your real identity is never visible to other users. Directory professionals only see what you choose to share when requesting an appointment.'
        },
        'dataUsage': {
            'title': 'Data Usage',
            'content': 'Your data is used only to: authenticate you, personalize your experience, improve our services (anonymous statistics), and contact you if you request it (appointments). We never sell your data.'
        },
        'sharing': {
            'title': 'Third-Party Sharing',
            'content': 'No commercial sharing. Only cases: 1) You request an appointment (sent to chosen professional), 2) Legal obligation (imminent danger reporting), 3) Technical providers (hosting, AI) under strict confidentiality agreements.'
        },
        'rights': {
            'title': 'Your Rights',
            'content': 'Per GDPR and Malagasy law: right of access, rectification, erasure, portability, restriction, objection. To exercise rights: contact us via the Privacy page. Account deletion available in settings (coming soon).'
        },
        'limits': {
            'title': 'Limits of Liability',
            'content': 'Mythenena is not an emergency medical service. AI can make mistakes. Support groups are moderated but not monitored 24/7. In crisis, contact emergency services immediately.'
        },
        'contact': {
            'title': 'Contact Us',
            'content': 'For any questions about your data: confidentialite@mythenena.mg or via contact form. Data Protection Officer: DPO Mythenena.'
        }
    }
};

data['connexion'] = {
    'title': 'Log In',
    'subtitle': 'Sign in to access your personal space',
    'identifierLabel': 'Email or phone number',
    'passwordLabel': 'Password',
    'passwordPlaceholder': '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    'submit': 'Log In',
    'noAccount': 'Don\'t have an account yet?',
    'signupLink': 'Sign Up',
    'demoNote': 'Demo mode: any identifier/password works',
    'successMessage': 'Login successful! Redirecting...',
    'errors': {
        'required': 'Please fill in all fields',
        'invalidIdentifier': 'Enter a valid email or phone number',
        'invalidCredentials': 'Invalid credentials'
    }
};

data['inscription'] = {
    'title': 'Create Account',
    'subtitle': 'Join Mythenena to access your personal space',
    'nameLabel': 'Display Name',
    'namePlaceholder': 'Your first name or nickname',
    'identifierLabel': 'Email or phone number',
    'passwordLabel': 'Password',
    'passwordPlaceholder': 'At least 6 characters',
    'confirmPasswordLabel': 'Confirm Password',
    'confirmPasswordPlaceholder': 'Repeat the password',
    'submit': 'Create Account',
    'hasAccount': 'Already have an account?',
    'loginLink': 'Log In',
    'termsNote': 'By creating an account, you accept our ',
    'termsLink': 'Privacy Policy',
    'demoNote': 'Demo mode: registration is simulated',
    'successMessage': 'Account created successfully! Redirecting to login...',
    'errors': {
        'required': 'Please fill in all fields',
        'nameTooShort': 'Name must be at least 2 characters',
        'invalidIdentifier': 'Enter a valid email or phone number',
        'passwordTooShort': 'Password must be at least 6 characters',
        'passwordMismatch': 'Passwords do not match'
    }
};

data['aide'] = {
    'title': 'Help & Usage Guide',
    'searchPlaceholder': 'Search a question...',
    'quickLinksTitle': 'Quick Access',
    'faqTitle': 'Frequently Asked Questions',
    'noResults': 'No results for your search',
    'contactTitle': 'Need More Help?',
    'contactSubtitle': 'Contact our support team',
    'contactDesc': 'Our team is here to help. Response within 24 business hours.',
    'contactEmail': 'Contact us by email',
    'contactForum': 'Ask on the forum',
    'emergencyTitle': '\u26a0\ufe0f Emergency Situation',
    'emergencyDesc': 'If you are in immediate danger or someone else is, don\'t wait: call +261 20 22 XXX XX (Madagascar listening line) or go to the nearest emergency room. You are not alone.',
    'emergencyLink': 'View all emergency contacts',
    'categories': {
        'gettingStarted': 'Getting Started with Mythenena',
        'evaluation': 'Your Personal Assessment',
        'forum': 'Support Forum & Groups',
        'chat': 'Instant AI Help',
        'premium': 'Premium Offers & Follow-up',
        'account': 'My Account & Privacy'
    },
    'quickLinks': {
        'evaluation': 'Take Assessment',
        'forum': 'Join Forum',
        'chat': 'Talk to AI Assistant',
        'resources': 'Exercises & Resources',
        'annuaire': 'Find a Professional',
        'premium': 'View Premium Offers'
    },
    'faq': {
        'q1': 'How do I get started with Mythenena?',
        'a1': 'Simple: no signup required to start. Click "Start Assessment" on the homepage, answer 5 questions, and discover personalized resources. You can create an account later to save your history.',
        'q2': 'Is the app really free?',
        'a2': 'Yes, assessment, forum, AI chat, breathing exercises, and directory are 100% free. Premium offers (Essential Follow-up at 115,000 Ar/month and Intensive Follow-up at 207,000 Ar/month) add professional sessions.',
        'q3': 'Is my data secure?',
        'a3': 'Absolutely. We use TLS encryption, store only the minimum necessary, and never sell your data. See our Privacy Policy for all details.',
        'q4': 'Can I use Mythenena without creating an account?',
        'a4': 'Yes! All core features (assessment, anonymous forum, AI chat, exercises, directory) work without an account. The account only syncs your history across devices.',
        'q5': 'What is the Personal Assessment for?',
        'a5': 'It\'s a 5-question exploratory check (mood, sleep, stress, relationships, motivation) giving you a visual snapshot of your well-being and guiding you to appropriate resources. Not a medical diagnosis.',
        'q6': 'Can I retake the assessment?',
        'a6': 'As many times as you want. Each assessment is dated, track your progress in "My Summary" (Synthesis page).',
        'q7': 'What if my score is low?',
        'a7': 'A low score indicates distress. The app automatically suggests: breathing exercises, AI chat, forum, or booking a professional. In emergency, call +261 20 22 XXX XX.',
        'q8': 'How do I join a support group?',
        'a8': 'Go to "Support Forum", choose a group (Depression, Self-Esteem, Sobriety), click it. You enter the anonymous group chat directly. ~15 participants per group.',
        'q9': 'Are groups moderated?',
        'a9': 'Yes, by a moderation team and automated filters. But not 24/7 monitoring. Report concerning content. In crisis, contact emergency services.',
        'q10': 'Can I create my own group?',
        'a10': '"Create New Group" feature coming soon. For now, the 3 main groups cover the most common needs.',
        'q11': 'Does the AI assistant replace a psychologist?',
        'a11': 'No. It\'s a 24/7 listening and guidance tool. It detects crisis signs and directs you to emergency services or professionals. It does not diagnose.',
        'q12': 'Are my AI conversations private?',
        'a12': 'Yes, they are encrypted and anonymized. Not read by humans except for imminent danger reports (legal duty to protect).',
        'q13': 'Does the AI speak Malagasy?',
        'a13': 'Yes! The assistant understands and responds in French, Malagasy, and English. Change language in the menu (globe icon top right).',
        'q14': 'What does Essential Follow-up (115,000 Ar/month) include?',
        'a14': 'Everything free + 1 weekly 2-hour session with a verified listening professional (psychologist/psychiatrist), personalized confidential follow-up, cancelable anytime.',
        'q15': 'How do I book an appointment with a professional?',
        'a15': 'From the "Directory" tab or after choosing a Premium offer, click "Book Appointment", indicate availability and reason. The professional contacts you via the platform.',
        'q16': 'How do I delete my account?',
        'a16': 'Account deletion coming soon in settings. Meanwhile, contact us via Privacy page to request deletion (processed within 30 days).',
        'q17': 'I forgot my password, what now?',
        'a17': 'On the Login page, click "Forgot Password" (coming soon). You\'ll receive a reset link by email or SMS based on your identifier.',
        'q18': 'Can I change my email/phone?',
        'a18': 'Yes, from your account settings (gear icon top right > Login > edit).'
    }
};

with open('D:/Mythenena/web/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('en.json updated with all new pages')