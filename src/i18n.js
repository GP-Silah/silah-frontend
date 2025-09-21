import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import aboutEn from "./locales/en/about.json";
import aboutAr from "./locales/ar/about.json";

const resources = {
    en: {
        translation: {
            heroTitle: "Find Trusted Suppliers & Grow Your Business",
            heroSubtitle:
                "The easiest way to source products and connect with reliable suppliers",
            getStarted: "Get Started",
            whyChooseUs: "Why Choose Us?",
            whyPoint1:
                "Wide range of products and services to meet your needs.",
            whyPoint2:
                "Connect with trusted suppliers and buyers effortlessly.",
            whyPoint3:
                "Join group purchases to unlock bulk discounts and save more.",
            whyPoint4:
                "Get AI-powered demand forecasts to plan purchases smarter.",
            whyPoint5:
                "Enjoy a seamless experience with a user-friendly platform.",
            exploreTitle: "All You Need in One Place",
            exploreSubtitle:
                "Explore Our Categories and Source with Confidence!",
            tabs: {
                products: "Products",
                services: "Services",
            },
            filter: {
                agriculture: "Agricultural & Pet Supplies",
                beauty: "Beauty & Personal Care",
                fashion: "Fashion & Accessories",
                food: "Food, Beverages & Health",
                home: "Home & Living",
                hardware: "Hardware & Tools",
                packaging: "Packaging & Raw Materials",
                shipping: "Shipping & Logistics",
                design: "Design Services",
                legal: "Legal & Compliance Services",
                technical: "Technical & Repair Services",
                manufacturing: "Manufacturing & Packaging",
                it: "Software & IT Solutions",
                energy: "Energy & Sustainability",
                business: "Business & Marketing Services",
            },
            header: {
                category: "Category",
                searchPlaceholder: "Search products or services or suppliers",
                login: "Login",
                signup: "Sign up",
                filters: {
                    agriculture: "Agricultural & Pet Supplies",
                    beauty: "Beauty & Personal Care",
                    fashion: "Fashion & Accessories",
                    food: "Food, Beverages & Health",
                    home: "Home & Living",
                    hardware: "Hardware & Tools",
                    packaging: "Packaging & Raw Materials",
                    shipping: "Shipping & Logistics",
                    design: "Design Services",
                    legal: "Legal & Compliance Services",
                    technical: "Technical & Repair Services",
                    manufacturing: "Manufacturing & Packaging",
                    it: "Software & IT Solutions",
                    energy: "Energy & Sustainability",
                    business: "Business & Marketing Services",
                },
            },
            footer: {
                about: "About Us",
                terms: "Terms of Service",
                privacy: "Privacy Policy",
                contact: "Contact Us",
                rights: "All Rights Reserved.",
            },
            Signup: {
                join: "Join us!",
                businessName: "Business Name",
                register: "Commercial Register",
                activity: "Business Activity",
                selectCategory: "Select a Category",
                name: "Name",
                nationalId: "National ID",
                city: "City",
                email: "Email",
                password: "Password",
                confirmPassword: "Confirm Password",
                next: "Next",
                back: "Back",
                done: "Done",
            },
            SignupSteps: {
                step1Title: "Join us!",
                step2Title: "Join us!",
                step3Title: "Join us!",
                businessName: "Business Name",
                commercialRegister: "Commercial Register",
                businessActivity: "Business Activity",
                name: "Name",
                nationalId: "National ID",
                city: "City",
                email: "Email",
                password: "Password",
                confirmPassword: "Confirm Password",
                agree: "I agree on the",
                terms: "terms and conditions",
                back: "Back",
                next: "Next",
                done: "Done",
                haveAccount: "Already have an account?",
                login: "Log in",
                errors: {
                    numbersOnly: "Please enter numbers only",
                    invalidEmail: "Please enter a valid email address",
                    passwordMismatch: "Passwords do not match",
                },
            },
            Login: {
                title: "Welcome to Silah!",
                email: "Email",
                password: "Password",
                submit: "Log In",
                errors: {
                    invalidCredentials: "Invalid email or password",
                },
            },
            // about: {
            //     label: "About Us",
            //     title: "Silah believes in the power of seamless business connections. Our platform is designed to help companies find the right partners, optimize supply chains, and grow efficiently.",
            //     quote: "Connecting Businesses, Empowering Growth.",
            //     story: {
            //         title: "Our Story",
            //         text: "In today’s fast-paced business world, companies struggle to find reliable partners and suppliers. Silah was born from the need for a smarter, more efficient B2B marketplace that makes it easy to connect, collaborate, and grow. Founded as part of our graduation project, Silah has evolved into a vision for the future—a digital ecosystem where businesses can thrive together.",
            //     },
            //     mission: {
            //         title: "Our Mission",
            //         text: "Our mission is to simplify and enhance B2B connections through an intelligent, user-friendly platform. We empower businesses by providing tools that help them find the right partners, streamline operations, and unlock new opportunities. We are committed to building a trusted digital ecosystem that fosters growth, efficiency, and collaboration.",
            //     },
            //     vision: {
            //         title: "Our Vision",
            //         text: "Our vision is to become the leading B2B networking platform, transforming how businesses connect, collaborate, and grow. We aim to build a seamless digital ecosystem where companies can find the right partners, optimize their supply chains, and create endless opportunities—driving innovation and economic growth.",
            //     },
            //     values: {
            //         title: "Our Core Values",
            //         connectivity:
            //             "💡 Connectivity & Collaboration – We believe in strong business connections that foster partnerships.",
            //         innovation:
            //             "🚀 Innovation & Growth – We continuously innovate to help businesses scale faster and smarter.",
            //         trust: "🔍 Trust & Reliability – Transparency and trust are at the heart of every connection on Silah.",
            //         efficiency:
            //             "⚡ Efficiency & Optimization – Our goal is to simplify processes, save time, and enhance productivity.",
            //         empowerment:
            //             "🌍 Empowerment – We give businesses the tools and insights to grow with confidence.",
            //     },
            //     cta: {
            //         title: "Be part of the future of business networking!",
            //         text: "Whether you’re a startup, supplier, or a growing enterprise, Silah helps you find the right partners, opportunities, and success. Join us today and start connecting!",
            //         button: "Get Started",
            //     },
            // },
            // terms: {
            //     title: "Terms of Service Agreement",
            //     intro: 'Welcome to Sila ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our platform, sila.site (the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.',
            //     eligibility: {
            //         title: "Eligibility and Account Registration",
            //         text: "To access certain features of the Platform, users must create an account. Guests may browse the Platform, search for products and services, and add items to their cart without registering. However, an account is required to complete purchases and use direct messaging. By registering for an account, you represent that:",
            //         point1: "You are a legally registered business entity.",
            //         point2: "You provide accurate and complete information, including your Commercial Registration Number.",
            //         point3: "You will maintain the confidentiality of your account credentials and accept responsibility for all activities under your account.",
            //         note: "Sila reserves the right to suspend or terminate accounts that provide false information or violate these Terms.",
            //     },
            //     services: {
            //         title: "Services Provided",
            //         text: "Sila is a B2B platform that enables businesses to list, browse, and purchase products and services. Suppliers may list their products, and buyers may place orders. Direct messaging is available for business communication. The Platform also provides invoicing for completed transactions. Sila may introduce additional features or modify existing ones at its discretion, including premium plans for suppliers with enhanced functionalities.",
            //     },
            //     payments: {
            //         title: "Payments and Fees",
            //         text: "Buyers may use the Platform free of charge. Suppliers have access to both free and premium subscription plans. Payments for transactions between buyers and suppliers are processed through Tap Payments, an independent third-party payment provider. Sila does not store or process any payment information directly.",
            //     },
            //     content: {
            //         title: "User-Generated Content",
            //         text: "Suppliers are responsible for ensuring that their product listings, including descriptions, images, and prices, are accurate and do not violate any applicable laws. Buyers may submit reviews and ratings, which must be truthful and respectful. Sila reserves the right to remove content that is misleading, fraudulent, or violates these Terms. Comments and discussions outside of the provided rating and review system are not permitted on the Platform.",
            //     },
            //     retention: {
            //         title: "Account and Data Retention",
            //         text: "Users cannot delete their accounts or remove submitted data from the Platform. Sila retains user data indefinitely unless required by law to modify or delete it.",
            //     },
            //     liability: {
            //         title: "Limitation of Liability",
            //         text: "Sila acts as an intermediary between buyers and suppliers and does not guarantee the quality, delivery, or accuracy of listed products or services. Users are solely responsible for verifying product details, payment terms, and order fulfillment. Sila is not liable for any disputes between buyers and suppliers. By using the Platform, users acknowledge that transactions occur directly between businesses.",
            //     },
            //     law: {
            //         title: "Governing Law",
            //         text: "These Terms are governed by and construed in accordance with the laws of Saudi Arabia. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Saudi Arabia.",
            //     },
            //     modifications: {
            //         title: "Modifications to These Terms",
            //         text: "Sila reserves the right to update or modify these Terms at any time. Any changes will be effective upon posting on the Platform. Continued use of the Platform after changes have been posted constitutes acceptance of the revised Terms.",
            //     },
            //     contact: {
            //         title: "Contact Information",
            //         text: "If you have any questions about these Terms, please contact us at info@sila.site.",
            //     },
            // },
            // privacy: {
            //     title: "Privacy Policy",
            //     intro: 'Silah ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use silah.com.sa (the "Platform"). By accessing or using the Platform, you consent to the collection and use of your information as described in this Privacy Policy.',

            //     info: {
            //         title: "1. Information We Collect",
            //         text: "When you register for an account or use our Platform, we may collect the following information:",
            //         email: "Email address",
            //         name: "Full name",
            //         nationalId: "Nationality ID",
            //         businessName: "Business name (commercial name)",
            //         crn: "Commercial Registration Number",
            //         address: "Business address",
            //         note: "We do not collect personal phone numbers or other personal contact details.",
            //     },

            //     usage: {
            //         title: "2. How We Use Your Information",
            //         text: "We collect and use your information to:",
            //         account: "Create and manage user accounts.",
            //         transactions:
            //             "Facilitate business transactions between buyers and suppliers.",
            //         auth: "Enable secure authentication and session management.",
            //         invoices: "Provide invoices and transaction records.",
            //         compliance:
            //             "Ensure compliance with applicable laws and prevent fraudulent activities.",
            //         improve:
            //             "Improve platform functionality and user experience.",
            //     },

            //     cookies: {
            //         title: "3. Cookies and Session Tracking",
            //         text: "Silah does not use tracking cookies for analytics or behavioral monitoring. However, we use authentication tokens to allow users to stay logged in when accessing the Platform from the same browser. These tokens help maintain user sessions without requiring repeated logins.",
            //     },

            //     thirdParty: {
            //         title: "4. Third-Party Data Sharing",
            //         payments:
            //             "Payment Processing: Transactions are processed through Tap Payments, and user payment data may be shared with this service for payment verification and processing.",
            //         law: "Legal Compliance: If required by Saudi Arabian law, we may disclose user information to regulatory authorities or law enforcement agencies.",
            //     },

            //     storage: {
            //         title: "5. Data Storage and Security",
            //         text: "We store all user data securely in our PostgreSQL database. We implement industry-standard security measures to protect against unauthorized access, data breaches, and other risks. However, users are responsible for safeguarding their own account credentials.",
            //     },

            //     retention: {
            //         title: "6. Account and Data Retention",
            //         text: "Users cannot delete their accounts or request data removal. All data submitted to the Platform is retained indefinitely unless legal requirements mandate its deletion.",
            //     },

            //     ai: {
            //         title: "7. AI and Data Usage",
            //         text: "Silah uses AI-based forecasting to help suppliers analyze trends and optimize their business strategies. Forecasting is based on:",
            //         listings: "Supplier product listings.",
            //         orders: "Purchase history and order trends.",
            //     },

            //     law: {
            //         title: "8. Governing Law",
            //         text: "This Privacy Policy is governed by the laws of Saudi Arabia. Any disputes related to this Policy shall be subject to the exclusive jurisdiction of the courts of Saudi Arabia.",
            //     },

            //     changes: {
            //         title: "9. Changes to This Privacy Policy",
            //         text: "Silah reserves the right to update this Privacy Policy at any time. Any changes will be posted on the Platform, and continued use of the Platform after such changes constitutes acceptance of the updated policy.",
            //     },
            // },
            about: aboutEn,
        },
    },
    ar: {
        translation: {
            heroTitle: "ابحث عن موردين موثوقين ونمِّ عملك",
            heroSubtitle:
                "أسهل طريقة للحصول على المنتجات والتواصل مع موردين موثوقين",
            getStarted: "ابدأ الآن",
            whyChooseUs: "لماذا نحن؟",
            whyPoint1: "مجموعة واسعة من المنتجات والخدمات لتلبية احتياجاتك.",
            whyPoint2: "تواصل مع موردين ومشترين موثوقين بسهولة.",
            whyPoint3: "اشترك في المشتريات الجماعية للحصول على خصومات كبيرة.",
            whyPoint4: "احصل على تنبؤات ذكية بالطلب باستخدام الذكاء الاصطناعي.",
            whyPoint5: "استمتع بتجربة سلسة عبر منصة سهلة الاستخدام.",
            exploreTitle: "كل ما تحتاجه في مكان واحد",
            exploreSubtitle: "استكشف تصنيفاتنا وتسوّق بثقة!",
            tabs: {
                products: "منتجات",
                services: "خدمات",
            },
            filter: {
                agriculture: "الزراعة ولوازم الحيوانات",
                beauty: "الجمال والعناية الشخصية",
                fashion: "الأزياء والإكسسوارات",
                food: "الأغذية والمشروبات والصحة",
                home: "المنزل والمعيشة",
                hardware: "الأدوات والمعدات",
                packaging: "التغليف والخامات",
                shipping: "الشحن والخدمات اللوجستية",
                design: "خدمات التصميم",
                legal: "الخدمات القانونية والامتثال",
                technical: "الدعم الفني",
                manufacturing: "التصنيع",
                it: "حلول تقنية المعلومات",
                energy: "الطاقة والاستدامة",
                business: "الخدمات التجارية والتسويقية",
            },
            header: {
                category: "التصنيفات",
                searchPlaceholder: "ابحث عن منتجات أو خدمات أو موردين",
                login: "تسجيل الدخول",
                signup: "إنشاء حساب",
                filters: {
                    agriculture: "الزراعة ولوازم الحيوانات",
                    beauty: "الجمال والعناية الشخصية",
                    fashion: "الأزياء والإكسسوارات",
                    food: "الأغذية والمشروبات والصحة",
                    home: "المنزل والمعيشة",
                    hardware: "الأدوات والمعدات",
                    packaging: "التغليف والخامات",
                    energy: "الطاقة والاستدامة",
                    business: "الخدمات التجارية والتسويقية",
                    it: "حلول تقنية المعلومات",
                    shipping: "الشحن والخدمات اللوجستية",
                    design: "خدمات التصميم",
                    manufacturing: "التصنيع والتغليف",
                    technical: "الخدمات الفنية والصيانة",
                    legal: "الخدمات القانونية والامتثال",
                },
            },
            footer: {
                about: "من نحن",
                terms: "شروط الاستخدام",
                privacy: "سياسة الخصوصية",
                contact: "تواصل معنا",
                rights: "جميع الحقوق محفوظة.",
            },
            signup: {
                step1Title: "انضم إلينا!",
                step2Title: "انضم إلينا!",
                step3Title: "انضم إلينا!",
                businessName: "اسم النشاط التجاري",
                commercialRegister: "السجل التجاري",
                businessActivity: "نوع النشاط التجاري",
                name: "الاسم",
                nationalId: "الهوية الوطنية",
                city: "المدينة",
                email: "البريد الالكتروني",
                password: "كلمة السر",
                confirmPassword: "تأكيد كلمة السر",
                agree: "أوافق على",
                terms: "الشروط و الأحكام",
                back: "السابق",
                next: "التالي",
                done: "إنهاء",
                haveAccount: "لديك حساب؟",
                login: "الدخول",
                errors: {
                    numbersOnly: "الرجاء إدخال أرقام فقط",
                    invalidEmail: "البريد الالكتروني غير صحيح",
                    passwordMismatch: "كلمة السر غير متطابقة",
                },
            },
            login: {
                title: "مرحبا في صلة",
                email: "البريد الإلكتروني",
                password: "كلمة المرور",
                submit: "دخول",
                errors: {
                    invalidCredentials:
                        "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                },
            },
            // about: {
            //     label: "من نحن",
            //     title: "صلة تؤمن بقوة التواصل التجاري السلس. منصتنا مصممة لمساعدة الشركات على العثور على الشركاء المناسبين، وتحسين سلاسل الإمداد، والنمو بكفاءة.",
            //     quote: "ربط الأعمال، تمكين النمو.",
            //     story: {
            //         title: "قصتنا",
            //         text: "في عالم الأعمال السريع اليوم، تواجه الشركات صعوبة في العثور على شركاء وموردين موثوقين. وُلدت صلة من الحاجة إلى سوق B2B أذكى وأكثر كفاءة يسهل عملية التواصل والتعاون والنمو. بدأت كجزء من مشروع تخرجنا، وتطورت إلى رؤية مستقبلية لبناء نظام رقمي متكامل يزدهر فيه الجميع.",
            //     },
            //     mission: {
            //         title: "مهمتنا",
            //         text: "مهمتنا هي تبسيط وتعزيز الروابط بين الشركات من خلال منصة ذكية وسهلة الاستخدام. نحن نمكّن الشركات عبر أدوات تساعدهم في العثور على الشركاء المناسبين، وتبسيط العمليات، وفتح فرص جديدة. نحن ملتزمون ببناء نظام رقمي موثوق يعزز النمو والكفاءة والتعاون.",
            //     },
            //     vision: {
            //         title: "رؤيتنا",
            //         text: "رؤيتنا أن نصبح المنصة الرائدة للتواصل بين الشركات (B2B)، نعيد صياغة كيفية التواصل والتعاون والنمو. نهدف إلى بناء نظام رقمي سلس يمكّن الشركات من العثور على الشركاء المناسبين، وتحسين سلاسل الإمداد، وخلق فرص غير محدودة تدفع الابتكار والنمو الاقتصادي.",
            //     },
            //     values: {
            //         title: "قيمنا الأساسية",
            //         connectivity:
            //             "💡 التواصل والتعاون – نؤمن بقوة العلاقات التجارية التي تخلق شراكات فعالة.",
            //         innovation:
            //             "🚀 الابتكار والنمو – نبتكر باستمرار لمساعدة الشركات على التوسع بشكل أسرع وأكثر ذكاءً.",
            //         trust: "🔍 الثقة والموثوقية – الشفافية والثقة في صميم كل علاقة في صلة.",
            //         efficiency:
            //             "⚡ الكفاءة والتحسين – هدفنا تبسيط العمليات، وتوفير الوقت، وزيادة الإنتاجية.",
            //         empowerment:
            //             "🌍 التمكين – نقدم للشركات الأدوات والرؤى لاتخاذ قرارات واثقة والنمو بثقة.",
            //     },
            //     cta: {
            //         title: "كن جزءًا من مستقبل التواصل التجاري!",
            //         text: "سواء كنت شركة ناشئة أو مورّد أو مؤسسة نامية، تساعدك صلة على العثور على الشركاء المناسبين، والفرص، والنجاح. انضم إلينا اليوم وابدأ رحلتك!",
            //         button: "ابدأ الآن",
            //     },
            // },

            // terms: {
            //     title: "اتفاقية شروط الاستخدام",
            //     intro: 'مرحبًا بكم في صلة ("نحن" أو "لنا"). تحكم شروط الاستخدام هذه ("الشروط") وصولك إلى منصتنا sila.site ("المنصة") واستخدامك لها. باستخدامك المنصة فإنك توافق على الالتزام بهذه الشروط. إذا لم توافق على هذه الشروط، يجب عليك التوقف عن استخدام المنصة.',
            //     eligibility: {
            //         title: "الأهلية وتسجيل الحساب",
            //         text: "للوصول إلى ميزات معينة في المنصة، يجب على المستخدمين إنشاء حساب. يمكن للزوار تصفح المنصة والبحث عن المنتجات والخدمات وإضافة العناصر إلى سلة التسوق دون تسجيل. ومع ذلك، يتطلب إتمام عمليات الشراء واستخدام المراسلة المباشرة حسابًا. من خلال التسجيل فإنك تقر بما يلي:",
            //         point1: "أنك كيان تجاري مسجل قانونيًا.",
            //         point2: "أنك تقدم معلومات دقيقة وكاملة بما في ذلك رقم السجل التجاري.",
            //         point3: "أنك ستحافظ على سرية بيانات الدخول وتتحمل المسؤولية عن جميع الأنشطة تحت حسابك.",
            //         note: "تحتفظ صلة بالحق في تعليق أو إنهاء الحسابات التي تقدم معلومات غير صحيحة أو تنتهك هذه الشروط.",
            //     },
            //     services: {
            //         title: "الخدمات المقدمة",
            //         text: "صلة هي منصة B2B تمكّن الشركات من عرض المنتجات والخدمات وتصفحها وشرائها. يمكن للموردين عرض منتجاتهم، ويمكن للمشترين تقديم الطلبات. المراسلة المباشرة متاحة للتواصل التجاري. كما توفر المنصة إصدار الفواتير للمعاملات المكتملة. قد تقدم صلة ميزات إضافية أو تعدل الميزات الحالية وفقًا لتقديرها، بما في ذلك الخطط المميزة للموردين مع وظائف محسنة.",
            //     },
            //     payments: {
            //         title: "المدفوعات والرسوم",
            //         text: "يمكن للمشترين استخدام المنصة مجانًا. يتمتع الموردون بخطط اشتراك مجانية ومميزة. تتم معالجة المدفوعات للمعاملات بين المشترين والموردين من خلال Tap Payments، وهي مزود دفع مستقل من طرف ثالث. لا تخزن صلة أو تعالج أي معلومات دفع مباشرة.",
            //     },
            //     content: {
            //         title: "المحتوى الذي ينشئه المستخدم",
            //         text: "يتحمل الموردون مسؤولية التأكد من أن قوائم منتجاتهم، بما في ذلك الأوصاف والصور والأسعار، دقيقة ولا تنتهك أي قوانين معمول بها. يمكن للمشترين تقديم المراجعات والتقييمات والتي يجب أن تكون صادقة ومحترمة. تحتفظ صلة بالحق في إزالة أي محتوى مضلل أو احتيالي أو ينتهك هذه الشروط. التعليقات والمناقشات خارج نظام التقييم والمراجعة المقدم غير مسموح بها على المنصة.",
            //     },
            //     retention: {
            //         title: "الحساب واحتفاظ البيانات",
            //         text: "لا يمكن للمستخدمين حذف حساباتهم أو إزالة البيانات المقدمة من المنصة. تحتفظ صلة ببيانات المستخدمين إلى أجل غير مسمى ما لم يُطلب قانونًا تعديلها أو حذفها.",
            //     },
            //     liability: {
            //         title: "تحديد المسؤولية",
            //         text: "تعمل صلة كوسيط بين المشترين والموردين ولا تضمن جودة أو تسليم أو دقة المنتجات أو الخدمات المدرجة. يتحمل المستخدمون وحدهم مسؤولية التحقق من تفاصيل المنتجات وشروط الدفع وتنفيذ الطلبات. لا تتحمل صلة المسؤولية عن أي نزاعات بين المشترين والموردين. باستخدامك المنصة، فإنك تقر بأن المعاملات تتم مباشرة بين الشركات.",
            //     },
            //     law: {
            //         title: "القانون الحاكم",
            //         text: "تحكم هذه الشروط وتُفسر وفقًا لقوانين المملكة العربية السعودية. أي نزاعات تنشأ عن هذه الشروط أو تتعلق بها تخضع للاختصاص القضائي الحصري لمحاكم المملكة العربية السعودية.",
            //     },
            //     modifications: {
            //         title: "تعديلات على هذه الشروط",
            //         text: "تحتفظ صلة بالحق في تحديث أو تعديل هذه الشروط في أي وقت. تصبح أي تغييرات سارية فور نشرها على المنصة. يشكل استمرارك في استخدام المنصة بعد نشر التغييرات قبولًا للشروط المعدلة.",
            //     },
            //     contact: {
            //         title: "معلومات الاتصال",
            //         text: "إذا كان لديك أي استفسارات بخصوص هذه الشروط، يرجى التواصل معنا عبر info@sila.site.",
            //     },
            // },

            // privacy: {
            //     title: "سياسة الخصوصية",
            //     intro: 'صلة ("نحن" أو "لنا") ملتزمة بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وتخزين وحماية معلوماتك الشخصية عند استخدامك لموقع silah.com.sa ("المنصة"). باستخدام المنصة، فإنك توافق على جمع واستخدام معلوماتك كما هو موضح في هذه السياسة.',

            //     info: {
            //         title: "1. المعلومات التي نجمعها",
            //         text: "عند تسجيل حساب أو استخدام المنصة، قد نجمع المعلومات التالية:",
            //         email: "البريد الإلكتروني",
            //         name: "الاسم الكامل",
            //         nationalId: "الهوية الوطنية",
            //         businessName: "اسم النشاط التجاري (الاسم التجاري)",
            //         crn: "رقم السجل التجاري",
            //         address: "عنوان النشاط التجاري",
            //         note: "لا نقوم بجمع أرقام الهواتف الشخصية أو تفاصيل الاتصال الأخرى.",
            //     },

            //     usage: {
            //         title: "2. كيفية استخدامنا لمعلوماتك",
            //         text: "نقوم بجمع واستخدام معلوماتك من أجل:",
            //         account: "إنشاء وإدارة حسابات المستخدمين.",
            //         transactions:
            //             "تسهيل المعاملات التجارية بين المشترين والموردين.",
            //         auth: "تمكين التحقق الآمن من الهوية وإدارة الجلسات.",
            //         invoices: "توفير الفواتير وسجلات المعاملات.",
            //         compliance:
            //             "ضمان الامتثال للقوانين المعمول بها ومنع الأنشطة الاحتيالية.",
            //         improve: "تحسين وظائف المنصة وتجربة المستخدم.",
            //     },

            //     cookies: {
            //         title: "3. ملفات تعريف الارتباط وتتبع الجلسات",
            //         text: "صلة لا تستخدم ملفات تعريف الارتباط للتتبع أو التحليل. ومع ذلك، نستخدم رموز المصادقة للسماح للمستخدمين بالبقاء مسجلين عند الوصول إلى المنصة من نفس المتصفح. تساعد هذه الرموز في الحفاظ على الجلسات دون الحاجة إلى تسجيل الدخول المتكرر.",
            //     },

            //     thirdParty: {
            //         title: "4. مشاركة البيانات مع أطراف ثالثة",
            //         payments:
            //             "معالجة الدفع: تتم المعاملات من خلال Tap Payments، وقد تتم مشاركة بيانات الدفع مع هذه الخدمة للتحقق من الدفع ومعالجته.",
            //         law: "الامتثال القانوني: إذا كان مطلوبًا بموجب قوانين المملكة العربية السعودية، قد نفصح عن معلومات المستخدم للجهات التنظيمية أو سلطات إنفاذ القانون.",
            //     },

            //     storage: {
            //         title: "5. تخزين البيانات وأمانها",
            //         text: "نقوم بتخزين جميع بيانات المستخدمين بشكل آمن في قاعدة بيانات PostgreSQL. ونطبق معايير أمان متعارف عليها لحمايتها من الوصول غير المصرح به أو اختراق البيانات. ومع ذلك، فإن المستخدمين مسؤولون عن الحفاظ على سرية بيانات اعتماد حساباتهم.",
            //     },

            //     retention: {
            //         title: "6. الاحتفاظ بالحساب والبيانات",
            //         text: "لا يمكن للمستخدمين حذف حساباتهم أو طلب إزالة بياناتهم. يتم الاحتفاظ بجميع البيانات المقدمة للمنصة إلى أجل غير مسمى ما لم يكن هناك متطلبات قانونية بحذفها.",
            //     },

            //     ai: {
            //         title: "7. الذكاء الاصطناعي واستخدام البيانات",
            //         text: "تستخدم صلة تقنيات التنبؤ بالذكاء الاصطناعي لمساعدة الموردين على تحليل الاتجاهات وتحسين استراتيجيات أعمالهم. ويعتمد التنبؤ على:",
            //         listings: "قوائم منتجات الموردين.",
            //         orders: "سجل المشتريات والطلبات.",
            //     },

            //     law: {
            //         title: "8. القانون الواجب التطبيق",
            //         text: "تخضع سياسة الخصوصية هذه لقوانين المملكة العربية السعودية. أي نزاعات تتعلق بهذه السياسة تكون خاضعة للاختصاص الحصري لمحاكم المملكة العربية السعودية.",
            //     },

            //     changes: {
            //         title: "9. التعديلات على سياسة الخصوصية",
            //         text: "تحتفظ صلة بالحق في تحديث سياسة الخصوصية هذه في أي وقت. أي تغييرات سيتم نشرها على المنصة، ويعتبر استمرار استخدام المنصة بعد هذه التغييرات بمثابة قبول للسياسة المحدثة.",
            //     },
            // },
            about: aboutAr,
        },
    },
};
i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
