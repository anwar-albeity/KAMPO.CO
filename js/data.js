/* ==========================================================
   EDIT THIS FILE to make the portfolio yours.
   Put your photos in /images and point to them below.
   ========================================================== */
window.SITE = {
  // ---- the agency ----
  studio: 'Kampo Co.',                   // agency name: titles, footer, About story
  logo: 'images/logo.webp',              // wordmark in the masthead and top bar (transparent WebP)
  disciplines: ['Design', 'Motion', 'Technology'], // under the masthead
  name: 'Anwar',                         // you, the founder (short name: hero byline, cartoon newspaper)
  fullName: 'Anwar Abdalla',             // About story and CV
  founded: 2025,                         // "Est." year under the masthead
  title: 'Creative Designer & Developer', // your own job title
  tagline: ['Creative', 'Agency!'],     // the two lines under the studio name in the hero
  promise: ['We print', 'businesses', 'into being.'], // the front-page headline; the middle line is set biggest
  location: 'Mombasa, Kenya',
  email: 'info@kampo.ke',
  whatsapp: '254718235532',             // WhatsApp number in international format, digits only (Contact page phone)
  whatsappText: 'Hi Anwar, I found Kampo Co. on your website and I’d like a quote for a project.',
  // every plain email link opens the visitor's email app with this subject and opening message already written
  emailSubject: 'Project enquiry from the Kampo Co. website',
  emailText: 'Hi Anwar,\n\nI found Kampo Co. on your website and I’d like a quote for a project.\n\nMy name:\nMy business:\nWhat I need help with:\nWhen I’d like to start:\nBest number to reach me:\n\nThank you,',
  issue: 'Vol. 01 — Monochrome Edition',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'Dribbble', url: 'https://dribbble.com/' },
    { label: 'Behance', url: 'https://behance.net/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
  ],

  // Animated photo (fallback when aboutPortrait is not set). Two options:
  //  1) frames: a list of photos shot in a burst; they play like a flipbook.
  //  2) video: a short .mp4 (muted, looping). If set, it wins over frames.
  // The older portrait and hand-drawn (hedcut) frames are kept in design-sources/unused.
  portrait: {
    frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `images/me-${n}.webp`),
    fps: 10,
    video: '', // e.g. 'images/me.mp4'
  },
  // Your real photo: the About story and the "Meet the founder" teaser on the front page.
  aboutPortrait: {
    frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `images/me-${n}.webp`),
    fps: 10,
  },

  // front page intro under the headline
  // the questions people ask before getting in touch; every answer stands on its own in one or two short lines
  faq: [
    ['How much will it cost?', 'It depends on the job. Tell us what you need for a free written quote. Nothing starts until you agree.'],
    ['How long will it take?', 'Your written quote sets the dates before you say yes.'],
    ['Can I get just one thing?', 'Yes. Pick one service or several, from any area.'],
    ['I am not sure what I need.', 'Book the free twenty-minute meeting. We will say what to do first, and what can wait.'],
    ['Do you only work in Mombasa?', 'No. We work across Kenya, Africa and abroad, on WhatsApp, email and video.'],
    ['What do I need to start?', 'Just your idea. Tell us what you sell and who buys it. We help with the rest.'],
  ],
  personLine: 'Designer, developer and auditor from Mombasa. He builds your business, and checks the numbers twice.',
  standfirst:
    'We set up, brand and build businesses. All in one place.',

  // a giant statement right under the hero (<em> and <b> allowed)
  statement: 'Kampo Co. builds <em>brands,</em> the <em>online presence</em> people find them by, and the <em>systems</em> that run the business behind it.',

  // ---- the three offers (front page "What We Do") ----
  // `work` is the slug of the project that shows this offer in action.
  services: [
    { key: 'brand', need: 'Brand', title: 'Brand', tag: 'Brand', text: 'A look people remember, and the rules to keep it consistent everywhere.', items: ['Logo & identity', 'Art direction', 'Posters & campaigns', 'Brand guidelines'], work: 'make-it-loud' },
    { key: 'footprint', need: 'Online', title: 'Online', tag: 'Online', text: 'Everything a customer needs to find you, trust you and buy from you online, delivered as one package.', items: ['Website', 'Social media kit', 'Google Business profile', 'Business email'], work: 'rb-perfumes' },
    { key: 'erp', need: 'Systems', title: 'Systems', tag: 'Systems', text: 'Your sales, stock, invoicing and reports moved off paper and Excel onto one system built around how you actually work.', items: ['Process mapping', 'Custom dashboards', 'Invoicing & payments', 'Staff training & support'], work: 'contingent-haulage' },
  ],
  // the ERP band on the front page: the struck-out "before" and the "after"
  erpBand: { before: ['Paper.', 'Excel.', 'WhatsApp.'], after: 'One screen.' },
  // the word that cycles under the studio cartoon on the front page
  toonWords: ['Brands', 'Websites', 'Systems'],
  // the free first step, offered on the front page
  freeCheck: {
    title: ['A free', '<em>20-minute</em>', 'business check.'],
    text: 'We look at your business and tell you the one thing to fix first. No cost, no obligation.',
    whatsappText: 'Hi Anwar, I would like to book the free 20-minute business check for my business.',
  },

  // "For every business in Kenya": each sector opens to show what the studio would build for it
  industries: [
    { name: 'Logistics & transport', brand: 'A fleet identity drivers and clients recognise', web: 'Quote request and shipment tracking pages', system: 'Shipments, dispatch, fleet, fuel and invoicing in one place' },
    { name: 'Shops & retail', brand: 'Packaging, signage and a look that sells on the shelf', web: 'Online catalogue with WhatsApp and M-Pesa ordering', system: 'Stock, sales, suppliers and daily cash-up across branches' },
    { name: 'Restaurants & cafés', brand: 'Menus, signage and social posts that make people hungry', web: 'Menu site, table bookings and delivery orders', system: 'Orders, kitchen tickets, stock and daily sales reports' },
    { name: 'Hotels & tourism', brand: 'An identity that feels like the coast', web: 'A booking-ready website guests trust', system: 'Rooms, bookings, housekeeping and guest billing' },
    { name: 'Real estate', brand: 'Property brochures and site hoardings', web: 'Listings with photos, maps and enquiry forms', system: 'Tenants, rent collection, arrears and maintenance' },
    { name: 'Schools & colleges', brand: 'Crests, uniforms and prospectus design', web: 'Admissions site with online applications', system: 'Students, fees, M-Pesa payments and report cards' },
    { name: 'Clinics & pharmacies', brand: 'A calm, trustworthy identity', web: 'Services, doctors and appointment booking', system: 'Patients, appointments, stock and billing' },
    { name: 'Salons & beauty', brand: 'A brand clients want to post about', web: 'Price list, gallery and online booking', system: 'Appointments, stylists, products and commissions' },
    { name: 'Agribusiness', brand: 'Product labels and packaging for market', web: 'Buyer-facing site and product catalogue', system: 'Farmers, collections, payments and produce stock' },
    { name: 'Manufacturing', brand: 'Product branding and trade-show material', web: 'Catalogue and distributor enquiries', system: 'Production, raw materials, orders and dispatch' },
    { name: 'Construction', brand: 'Company profile and site signage', web: 'Projects portfolio and tender enquiries', system: 'Projects, materials, sub-contractors and invoicing' },
    { name: 'Garages & auto', brand: 'Workshop signage and job cards', web: 'Services, prices and service booking', system: 'Job cards, parts stock, mechanics and billing' },
    { name: 'Fashion & clothing', brand: 'Labels, lookbooks and campaigns', web: 'Online shop with sizes and WhatsApp checkout', system: 'Stock by size and colour, orders and tailoring' },
    { name: 'SACCOs & finance', brand: 'A brand members trust with their money', web: 'Products, loan calculator and member sign-up', system: 'Members, savings, loans and statements' },
    { name: 'NGOs & churches', brand: 'Campaign identity and reports people read', web: 'Story-led site with donations', system: 'Members, donors, projects and reporting' },
    { name: 'Professional services', brand: 'A sharp identity for lawyers, accountants and consultants', web: 'Services, team and consultation booking', system: 'Clients, matters, time tracking and invoicing' },
  ],

  // the step-by-step questionnaire (front page and Contact).
  // web3formsKey: your free Web3Forms access key (web3forms.com, sign up with your email).
  // With it, every questionnaire lands straight in your inbox, with the client's email as reply-to.
  // Without it, Submit opens the visitor's email app with the answers written out.
  web3formsKey: '',
  // a reply time you can keep, e.g. 'within 24 hours, Monday to Saturday'. Shown next to the brief when set.
  replyPromise: '',
  // a booking link for the free 20-minute call (Calendly, Cal.com, Google appointment page). Shown on Contact when set.
  callLink: '',
  brief: {
    // the service menu at the top of "Tell us what you need". `name` is the value that reaches the inbox.
    services: [
      { name: 'Website', title: 'Websites', line: 'A site that brings you customers.', text: 'Business sites, online shops, booking sites and web apps, designed and coded from scratch, with M-Pesa built in and set up to show on Google.', items: ['Design & code', 'M-Pesa & card payments', 'Found on Google', 'Hosting & care'] },
      { name: 'Branding', title: 'Branding', line: 'A look people remember.', text: 'Logo, colours, type and the rules that keep them consistent, from your shopfront to your Instagram grid.', items: ['Logo & mark', 'Colours & type', 'Brand guidelines', 'Print & packaging'] },
      { name: 'Digital footprint', title: 'Digital footprint', line: 'Easy to find on Google and socials.', text: 'Your Google Business profile, social pages and WhatsApp catalogue set up and matched to your brand, so customers find you and trust you.', items: ['Google Business profile', 'Social media kit', 'WhatsApp Business', 'Business email'] },
      { name: 'Marketing', title: 'Marketing', line: 'Posts and ads that bring customers.', text: 'Social media run for you, photo and video content, paid ads and email or SMS campaigns, with a plain report every month on what worked.', items: ['Social media', 'Photo & video', 'Paid ads', 'Monthly reports'] },
      { name: 'ERP system', title: 'ERP systems', line: 'Your whole business on one screen.', text: 'A system built around how your business already works, replacing paper books, Excel and WhatsApp groups. Works on phones, in the office and across branches.', items: ['Sales & stock', 'Invoicing & eTIMS', 'Staff & payroll', 'Dashboards'] },
      { name: 'CRM', title: 'CRM', line: 'Never lose a customer again.', text: 'Leads, deals, quotes and reminders tracked for the whole team, so no sale gets lost in a WhatsApp chat.', items: ['Leads & deals', 'Follow-up reminders', 'WhatsApp & SMS', 'Sales reports'] },
      { name: 'Business setup', title: 'Business setup', line: 'Registered, KRA ready, paid on M-Pesa.', text: 'Company registration, KRA PIN and eTIMS, M-Pesa and bank set up, a business plan or pitch deck, and a local partner for international clients entering Kenya. Legal filings are signed off with a licensed advocate or tax agent.', items: ['Registration', 'KRA & eTIMS', 'Business plan', 'Market entry'] },
      { name: 'Care', title: 'Care & IT', line: 'We keep it all running.', text: 'Monthly maintenance for your website and systems, office IT and networking, backups and basic security, and a full digital audit when you want one.', items: ['Maintenance', 'Office IT', 'Backups & security', 'Digital audit'] },
    ],
    sizes: ['Just me', '2–10 people', '11–50 people', 'More than 50'],
    // websites
    siteType: ['Business or company site', 'Online shop', 'Bookings & appointments', 'Portfolio or personal site', 'Landing page for a campaign', 'Web app or client portal', 'Not sure yet'],
    siteNow: ['No, this is our first', 'Yes, it needs a redesign', 'Yes, it needs new features'],
    siteDo: ['Sell products online', 'Take M-Pesa & card payments', 'Take bookings', 'Enquiry & quote forms', 'WhatsApp chat button', 'Customer accounts & login', 'Blog or news', 'English & Swahili', 'Show up on Google', 'Connect to our ERP or CRM'],
    sitePages: ['One page', '2–5 pages', '6–15 pages', 'More than 15', 'Not sure'],
    siteContent: ['Words and photos are ready', 'We need help with the words', 'We need words and photos', 'Not sure'],
    siteDomain: ['We own a domain', 'We need a domain', 'Not sure what that is'],
    // branding
    logo: ['Yes, keep it', 'Yes, but it needs a refresh', 'No, we need one'],
    brandNeed: ['Logo & mark', 'Colours & typefaces', 'Brand guidelines', 'Business cards & stationery', 'Packaging & labels', 'Signage & shopfront', 'Social media templates', 'Uniforms & merch', 'A name or tagline'],
    // digital footprint
    online: ['Nothing yet', 'Social media pages', 'A website', 'Google Business profile'],
    footWhere: ['Google Business profile', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'WhatsApp Business catalogue', 'Google Ads', 'Email newsletter'],
    footRun: ['Set it up and hand it over', 'Set it up and run it monthly', 'Not sure yet'],
    // ERP
    erpToday: ['Paper & books', 'Excel', 'WhatsApp groups', 'QuickBooks or other software', 'Nothing yet'],
    erpModules: ['Sales & orders', 'Stock & inventory', 'Purchasing & suppliers', 'Invoicing & payments', 'KRA eTIMS invoices', 'M-Pesa payments', 'Staff & payroll', 'Fleet & deliveries', 'Branches & locations', 'Reports & dashboards'],
    // business setup
    setupStage: ['Just an idea', 'Registered, not trading yet', 'Trading, not registered', 'Registered and trading', 'A company abroad, entering Kenya'],
    setupNeed: ['Registration', 'KRA PIN & eTIMS', 'M-Pesa & bank', 'Business plan', 'Pitch deck', 'Bookkeeping', 'Market entry advice'],
    // marketing
    growWhere: ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Google Ads', 'Email & SMS', 'Not sure, advise us'],
    growRun: ['Run it for us every month', 'A launch campaign only', 'Train our team to do it'],
    careNeed: ['Website or system updates', 'Office computers and Wi-Fi', 'Backups and security', 'A full check-up of everything digital'],
    erpUsers: ['1–5', '6–20', '21–50', 'More than 50'],
    erpWhere: ['Office computers', 'Phones in the field', 'Tablets at the counter', 'Places with poor network'],
    // CRM
    crmToday: ['Phone contacts', 'WhatsApp chats', 'Excel or Google Sheets', 'A notebook', 'Another CRM', 'All over the place'],
    crmDo: ['Track leads & deals', 'Follow-up reminders', 'WhatsApp & SMS messages', 'Quotes & invoices', 'Sales team targets', 'Customer history & notes', 'Who buys what reports', 'Bulk promotions'],
    crmTeam: ['Just me', '2–5 people', '6–20 people', 'More than 20'],
    crmVolume: ['Under 50 a month', '50–500 a month', '500–5,000 a month', 'More than 5,000'],
    timelines: ['As soon as possible', 'In 1–3 months', 'Just exploring'],
    heard: ['Instagram', 'LinkedIn', 'Google', 'A friend or client', 'Other'],
  },
  process: [
    { title: 'Think.' },
    { title: 'Create.' },
    { title: 'Deliver.' },
  ],
  stats: [
    { value: 4, label: 'Projects shipped' },
    { value: 4, label: 'Certifications' },
    { value: 9, label: 'Happy clients' },
    { value: 3, label: 'Years in print' },
  ],
  testimonials: [
    { quote: 'Anwar took our messy idea and made it look like a real brand. He listened, kept us in the loop and delivered when he said he would. We will be working with him again.', author: 'Chidi Okafor', country: 'Nigeria' },
    { quote: 'Anwar alituelewa haraka sana. Tulimweleza tunachotaka, naye akatuletea tovuti nzuri na rahisi kutumia. Mawasiliano yalikuwa mazuri muda wote. Tunamshukuru sana.', author: 'Idris Mwinyi', country: 'Tanzania' },
    { quote: 'No stress at all. He sent updates without us having to chase him, and the final site came out better than what we had in mind.', author: 'Juma Bakari', country: 'Tanzania' },
  ],

  // ---- About: your biography, written like a newspaper feature ----
  // Replace every line here with your own story.
  story: {
    kicker: 'Profile',
    headline: ['Between numbers', 'and things that move'],
    deck: '',
    byline: 'By the Editorial Desk',
    paragraphs: [
      'Anwar grew up in Mombasa between two ways of seeing the world: the order of <em>numbers</em> and the freedom to <em>make things.</em>',
      'Accounting taught him to look closer. Computer science taught him to think in <em>systems.</em> Design taught him that useful things can be <em>beautiful.</em>',
      'By day he works in audit. After that he runs <em>Kampo Co.,</em> building brands, websites and systems for people with something to put into the world.',
    ],
    pullquote: 'The work changes but the instinct stays the same.',
    signoff: 'Mombasa, Kenya. Still in the making',
  },

  // ---- Services: six areas, laid out like a capabilities page. `need` ties an area to the brief's follow-up
  // questions; `partner` marks work signed off with a licensed advocate or tax agent. No prices: every job is quoted.
  offer: {
    pillars: [
      { key: 'setup', name: 'Setup', need: 'Start', label: 'Business Setup', title: 'Company Registration & Tax', line: 'Get legal and ready to trade.',
        text: 'We register your company or business name and set you up with KRA, so you can open accounts, invoice and trade from day one.',
        kind: 'One-off project', cta: 'Start your business the right way', services: [
        ['Company registration', 1], ['Business name registration', 1], ['KRA PIN registration', 1], ['eTIMS set up', 1] ] },
      { key: 'brand', name: 'Brand', need: 'Brand', label: 'Branding', title: 'Brand Strategy & Identity', line: 'Look the part, everywhere.',
        text: 'We work out what your business stands for and who it is for, then turn that into a look: a logo, colours, type and the rules that keep it consistent.',
        kind: 'One-off project', cta: 'Build a brand people remember', services: [
        ['Brand strategy'], ['Positioning & messaging'], ['Logo & identity design'], ['Visual systems'], ['Brand guidelines'] ] },
      { key: 'web', name: 'Web', need: 'Online', label: 'Digital Experiences', title: 'Web Design & Development', line: 'Get found and trusted online.',
        text: 'Websites planned around what your customers need to do, built to load fast on any phone, and easy for your team to update.',
        kind: 'One-off project', cta: 'Build a website that works', services: [
        ['Website strategy'], ['UX/UI design'], ['Website development'], ['CMS implementation'], ['Responsive optimisation'] ] },
      { key: 'software', name: 'Software', need: 'Systems', label: 'Software & Automation', title: 'Software & Automation', line: 'Run everything from one screen.',
        text: 'Systems built around how your business really works: the records, invoices, stock and follow-ups that eat your day, moved into one place.',
        kind: 'One-off project', cta: 'Build systems that grow with you', services: [
        ['Custom applications'], ['CRM systems'], ['Client portals'], ['Workflow automation'], ['SaaS platforms'], ['Mobile applications'], ['Integrations'], ['Reporting dashboards'] ] },
      { key: 'growth', name: 'Growth', need: 'Grow', label: 'Growth', title: 'Growth & Visibility', line: 'Bring in more customers.',
        text: 'Monthly work that puts you in front of the right people: search, content, social and ads, with a report that shows what each shilling did.',
        kind: 'Monthly', cta: 'Grow every month', services: [
        ['Search engine optimisation'], ['Content strategy'], ['Social media marketing'], ['Paid advertising'], ['Analytics & reporting'] ] },
      { key: 'creative', name: 'Creative', need: 'Brand', label: 'Creative', title: 'Creative Production', line: 'Every piece, on brand.',
        text: 'The everyday pieces your brand lives on, made to match: from the post you share today to the deck you pitch with next week.',
        kind: 'One-off or monthly', cta: 'Make every piece count', services: [
        ['Social graphics'], ['Pitch decks'], ['Campaign assets'], ['Presentation systems'], ['Marketing collateral'] ] },
    ],
    packages: [],
  },

  // ---- About: the CV as it reads on the page. Each point carries the lens it belongs to
  // (design, code, numbers) so a reader can pick which side of the work to read.
  cv: {
    lede: 'Designer and developer by craft, auditor by profession. Anwar builds brands and the systems behind them, and checks the numbers twice.',
    lenses: [['all', 'Everything'], ['design', 'The designer'], ['code', 'The developer'], ['numbers', 'The auditor']],
    jobs: [
      { years: '2025 to now', place: 'Kampo Co.', role: 'Founder, creative director and developer', points: [
        ['design', 'Run the studio end to end: the brief, the art direction, the design and the launch.'],
        ['code', 'Shipped brand websites, an online shop, a logistics ERP and a sales CRM for clients across Africa.'],
        ['design code', 'Own the scope, the timeline and the client relationship from the first call to handover.'],
      ] },
      { years: 'Aug 2026 to now', place: 'Innovus', role: 'Associate auditor', points: [
        ['numbers', 'Plan and carry out audit engagements across a portfolio of clients.'],
        ['numbers', 'Test internal controls and vouch transactions back to their source documents.'],
        ['numbers', 'Prepare working papers and findings to firm standards for senior review.'],
      ] },
      { years: 'Oct 2025 to May 2026', place: 'Contingent Haulage Africa Ltd', role: 'Accounts assistant', work: 'contingent-haulage', points: [
        ['numbers', 'Kept the day-to-day accounts of a regional haulage business: invoices, receipts and payment vouchers.'],
        ['numbers', 'Reconciled the bank and the ledgers, and prepared the monthly management reports.'],
        ['code', 'Designed and built the company’s own ERP for shipments, dispatch, fleet and invoicing.'],
      ] },
    ],
    study: [
      { years: '2023 to 2024', place: 'Riara University', role: 'Diploma in Computer Science', lens: 'code' },
      { years: '2022 to now', place: 'KASNEB', role: 'CPA, Intermediate level (Section IV) completed', lens: 'numbers' },
    ],
    skills: [
      { group: 'Design', lens: 'design', items: ['Art direction and brand identity', 'UI, UX and interaction design', 'Motion design', 'Editorial typography and print'] },
      { group: 'Code', lens: 'code', items: ['Front-end: HTML, CSS, JavaScript', 'ERP and CRM system design', 'Oracle Cloud Infrastructure', 'Cisco networking and C++'] },
      { group: 'Numbers', lens: 'numbers', items: ['Audit and assurance', 'Internal controls testing', 'Financial statements and reporting', 'Reconciliations and the general ledger'] },
      { group: 'Working together', lens: 'design code numbers', items: ['Clients and stakeholders', 'Scoping and delivery', 'Analytical problem solving', 'Discretion with sensitive data'] },
    ],
    certs: [
      { name: 'Oracle Cloud Infrastructure', note: 'Certificate', lens: 'code' },
      { name: 'Cisco Networking', note: 'Certificate', lens: 'code' },
      { name: 'C++ Programming', note: 'Certificate', lens: 'code' },
    ],
  },

  // ---- About: CV (from your CV) ----
  experience: [
    { years: '2025 — Now', place: 'Kampo Co.', role: 'Founder · Creative Director & Developer', text: 'Lead the studio end to end, from brief and art direction to design, build and launch. Delivered brand websites, e-commerce, a logistics ERP and a sales CRM for clients across East Africa, owning scope, timelines and client relationships.' },
    { years: 'Aug 2026 — Now', place: 'Innovus', role: 'Associate Auditor', text: 'Plan and execute audit engagements across client portfolios. Assess and test internal controls, vouch transactions to source, and prepare working papers and findings to firm standards for review by senior management.' },
    { years: 'Oct 2025 — May 2026', place: 'Contingent Haulage Africa Ltd', role: 'Accounts Assistant', text: 'Managed day-to-day accounting for a regional haulage operation: invoicing, receipts and payment vouchers, bank and ledger reconciliations, and monthly management reporting. Designed and built the company’s internal ERP for shipments, dispatch, fleet and invoicing.' },
  ],
  education: [
    { years: 'May 2023 — Aug 2024', place: 'Riara University', role: 'Diploma in Computer Science' },
    { years: 'Jan 2022 — To date', place: 'KASNEB', role: 'CPA Intermediate (Section IV) completed' },
  ],
  skills: [
    { group: 'Design & Product', items: ['Art direction & brand identity', 'UI / UX & interaction design', 'Motion design', 'Editorial typography & print'] },
    { group: 'Engineering', items: ['Front-end development (HTML, CSS, JavaScript)', 'ERP & CRM system design', 'Cloud infrastructure (Oracle OCI)', 'Networking (Cisco) · C++'] },
    { group: 'Finance & Audit', items: ['Audit & assurance', 'Internal controls testing', 'Financial statements & reporting', 'Reconciliations & general ledger'] },
    { group: 'Ways of working', items: ['Client & stakeholder management', 'Project scoping & delivery', 'Analytical problem solving', 'Discretion with sensitive data'] },
  ],
  certifications: [
    { name: 'CPA Intermediate (Section IV)', note: 'KASNEB' },
    { name: 'Diploma in Computer Science', note: 'Riara University' },
    { name: 'Oracle Cloud Infrastructure', note: 'Certification' },
    { name: 'Cisco Networking', note: 'Certification' },
    { name: 'C++ Programming', note: 'Certification' },
  ],
  languages: [], // add any you speak, e.g. ['English', 'Swahili']

  // The agency's projects. Each one becomes a card in Featured Work and gets its own page.
  // Optional `hero` is a wide image for the top of the project page (falls back to `cover`).
  projects: [
    {
      slug: 'rb-perfumes', need: 'Online', offers: ['Online'], title: 'RB Perfumes', year: 2026, category: 'Brand Website & E-commerce',
      cover: 'images/rb-perfumes-cover.webp', hero: 'images/rb-perfumes-hero.webp', images: ['images/rb-perfumes-1.webp', 'images/rb-perfumes-2.webp'],
      client: 'RB Perfumes, Mombasa', role: 'Design, Development',
      line: 'Fragrance, without the noise.',
      scope: ['Brand website', 'Product catalogue', 'WhatsApp ordering'],
      status: 'Live',
      link: 'https://rayanbayusuf.pages.dev/',
    },
    {
      slug: 'contingent-haulage', need: 'Systems', offers: ['Systems'], title: 'Contingent Haulage', year: '2025–26', category: 'Tailored ERP · Logistics',
      cover: 'images/erp-cover.webp', hero: 'images/erp-hero.webp', images: ['images/erp-1.webp', 'images/erp-2.webp'],
      client: 'Contingent Haulage Africa Limited', role: 'Product design, Development',
      status: 'Internal system',
      line: 'Every truck, every invoice, one screen.',
      scope: ['Shipments', 'Dispatch', 'Fleet & drivers', 'Invoicing', 'Reporting'],
      // Case study. Draft wording: check every line against what really happened.
      caseStudy: {
        before: 'Shipments lived in Excel sheets and WhatsApp groups. Invoices were typed up by hand at the end of each trip, and finding out where a truck was meant a phone call.',
        beforePoints: ['Excel and WhatsApp', 'Invoices typed by hand', 'No live view of the fleet'],
        build: 'A tailor-made ERP built around how the team already works, from the moment a shipment is booked to the moment it is paid.',
        modules: [
          { name: 'Shipments', text: 'Every container booked, tracked and closed in one list.' },
          { name: 'Dispatch board', text: 'Drag a load from Booked to Delivered and everyone sees it.' },
          { name: 'Fleet & drivers', text: 'Trucks, drivers, documents and service dates in one place.' },
          { name: 'Invoicing', text: 'Invoices raised from the shipment itself, not retyped.' },
          { name: 'Reporting', text: 'Daily and monthly numbers without building a spreadsheet.' },
        ],
        after: 'One screen for every truck and every invoice. The office sees what the road sees, and month-end reports come straight out of the system.',
        afterPoints: ['One source of truth', 'Invoices straight from the job', 'Reports on demand'],
        // Real results go here, e.g. { value: '2 days → 20 min', label: 'Time to raise an invoice' }.
        // The results row stays hidden until this list has something in it.
        results: [],
      },
      link: '',
    },
    {
      slug: 'ledger-crm', need: 'Systems', offers: ['Systems'], title: 'Ledger CRM', year: 2025, category: 'CRM System',
      cover: 'images/crm-cover.webp', hero: 'images/crm-hero.webp', images: ['images/crm-1.webp', 'images/crm-2.webp'],
      client: 'Private client (under NDA)', role: 'Product design, Development',
      status: 'Delivered',
      line: 'No lead goes cold.',
      scope: ['Pipeline', 'Contacts', 'Follow-ups', 'Lead capture'],
      // Case study. Draft wording: check every line against what really happened.
      caseStudy: {
        before: 'Leads arrived by phone, WhatsApp and email and were written down wherever was closest. Follow-ups depended on memory, so warm leads went cold.',
        beforePoints: ['Leads in three inboxes', 'Follow-ups from memory', 'No view of the pipeline'],
        build: 'A focused CRM that catches every lead in one place and nudges the team when it is time to follow up.',
        modules: [
          { name: 'Lead capture', text: 'Website and WhatsApp enquiries land in the CRM automatically.' },
          { name: 'Pipeline', text: 'Every deal on a board, from first hello to signed.' },
          { name: 'Contacts', text: 'One record per client with every call, note and file.' },
          { name: 'Follow-ups', text: 'Reminders so nobody is left waiting for a reply.' },
        ],
        after: 'Every lead in one pipeline, every follow-up on time. The team knows exactly who to call today.',
        afterPoints: ['One pipeline', 'Reminders, not memory', 'Clear next step for every lead'],
        results: [],
      },
      link: '',
    },
    {
      slug: 'make-it-loud', need: 'Brand', offers: ['Brand'], title: 'Make it Loud', year: 2025, category: 'Branding Poster',
      cover: 'images/poster-cover.webp', hero: 'images/poster-hero.webp', images: ['images/poster-1.webp', 'images/poster-2.webp'],
      client: 'Kampo Co. (self-initiated)', role: 'Art direction, Graphic design',
      status: 'Studio identity series',
      line: 'One colour. No photos. Impossible to walk past.',
      scope: ['Art direction', 'Typography', 'Print'],
      // the studio's manifesto, set huge on the Make it Loud page. <em> = italic, <b> = black weight
      manifesto: [
        'Most brands <em>whisper.</em>',
        'We would rather be <b>heard.</b>',
        'Design, motion and code,',
        'built to be <em>felt,</em> not just seen.',
        'One colour. Big type. <em>No noise.</em>',
        'That is the agenda.',
      ],
      motto: 'Make it Loud.',
      link: '',
    },
  ],
};

// A social link shows only once it points at a real profile (https://instagram.com/yourname), never at a bare homepage.
window.SITE.socials = window.SITE.socials.filter((s) => /^https?:\/\/[^/]+\/[^/?#]+/.test(s.url));

// One set of services across the whole site: the brief's menu is the same six groups the Services page shows.
window.SITE.brief.services = window.SITE.offer.pillars.map((p) => ({ name: p.name, title: p.name, line: p.line })).concat({ name: 'Custom build', title: 'Custom build', line: 'Anything else, built for you.' });

// ---- The brief, service by service ----
// Every service on the menu has its own short screen in the brief. Tick "Analytics & reporting" and you are asked
// about analytics and reporting, nothing else. Each question is [key, question, kind, options, hint]:
//   kind 'one' = pick one, 'many' = pick all that apply (adds "Other"), 'text' = a line in their own words.
// `lead` sits under the screen title and says why we ask. Every question is optional.
// Areas also have one shared question, asked once, when anything in that area is ticked.
window.SITE.areaQuestions = {
  setup: { title: 'Where is your business <em>today?</em>', qs: [
    ['stage', 'Where is your business today?', 'one', ['Just an idea', 'Trading, not registered yet', 'Registered, need the rest sorted', 'Based abroad, setting up in Kenya']],
  ] },
  web: { title: 'Your website <em>today.</em>', qs: [
    ['now', 'Do you have a website now?', 'one', ['No, this is our first', 'Yes, but it needs redoing', 'Yes, it needs new features']],
    ['link', 'If yes, its address', 'text', [], 'e.g. yourbusiness.co.ke'],
  ] },
  software: { title: 'How you run things <em>today.</em>', qs: [
    ['today', 'What do you use today?', 'many', ['Paper and books', 'Excel or Google Sheets', 'WhatsApp groups', 'Other software']],
    ['users', 'How many people will use the new system?', 'one', ['1 to 5', '6 to 20', '21 to 100', 'More than 100']],
  ] },
  growth: { title: 'Where your customers <em>are.</em>', qs: [
    ['where', 'Where do your customers spend time?', 'many', ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Google search', 'WhatsApp', 'Not sure']],
    ['run', 'How should we work together?', 'one', ['You run it for us, every month', 'Set it up and train our team', 'One campaign, then we review']],
  ] },
};
window.SITE.serviceQuestions = {
  // Business setup
  'Company registration': { lead: 'So we file the right company type with the right people, first time.', qs: [
    ['type', 'What kind of company?', 'one', ['Private limited company (Ltd)', 'Non-profit, limited by guarantee', 'Branch of a foreign company', 'Not sure, advise us']],
    ['people', 'How many directors or shareholders?', 'one', ['Just me', '2 or 3', '4 or more']],
    ['pins', 'Do they all have a KRA PIN?', 'one', ['Yes, all of them', 'Some do', 'None yet', 'Some are not Kenyan']],
    ['names', 'Names you would like to register', 'text', [], 'First choice, then a backup in case it is taken'],
  ] },
  'Business name registration': { lead: 'A registered business name is the quickest way to trade legally on your own or with partners.', qs: [
    ['owner', 'Who will own it?', 'one', ['Just me', 'Me and partners']],
    ['names', 'Names you would like to register', 'text', [], 'First choice, then a backup'],
    ['later', 'Might you move to a limited company later?', 'one', ['Yes, soon', 'Maybe one day', 'No']],
  ] },
  'KRA PIN registration': { lead: 'So we register the PIN with the taxes you will actually file.', qs: [
    ['for', 'Who is the PIN for?', 'one', ['Me, personally', 'The business or company', 'Both']],
    ['itax', 'Do you have an iTax login already?', 'one', ['Yes, but I need help with it', 'No', 'Not sure']],
    ['taxes', 'Which might apply to you?', 'many', ['Income tax', 'VAT (sales above KES 5 million a year)', 'PAYE (staff on payroll)', 'Turnover tax (small business)', 'Not sure, advise us']],
  ] },
  'eTIMS set up': { lead: 'eTIMS comes in a few forms. These tell us which one fits how you sell.', qs: [
    ['now', 'How do you invoice today?', 'one', ['By hand, in a book', 'Word or Excel', 'Accounting software', 'A till or POS', 'Not invoicing yet']],
    ['fit', 'Where would you like to issue eTIMS invoices?', 'one', ['On my phone', 'On a computer, online', 'Straight from our system or POS', 'Not sure, advise us']],
    ['volume', 'Roughly how many invoices a month?', 'one', ['Under 50', '50 to 500', 'More than 500']],
  ] },
  // Branding
  'Brand strategy': { lead: 'Strategy starts with why now, and who it is for.', qs: [
    ['why', 'What is behind this now?', 'one', ['A new business', 'We are repositioning', 'Moving into a new market', 'Our brand feels all over the place']],
    ['who', 'Who is your main customer?', 'text', [], 'e.g. young professionals in Nairobi, hotels on the coast'],
    ['admire', 'Two or three brands you admire, in any industry', 'text', []],
  ] },
  'Positioning & messaging': { lead: 'So we write what makes you the obvious choice, in words you would actually use.', qs: [
    ['need', 'What do you need written?', 'many', ['A tagline', 'Mission and values', 'A one-minute pitch', 'Website copy', 'A tone of voice guide']],
    ['diff', 'What do you do better than anyone else?', 'text', []],
    ['rivals', 'Your main competitors', 'text', [], 'Names or links'],
  ] },
  'Logo & identity design': { lead: 'A few answers here save rounds of guessing later.', qs: [
    ['have', 'Do you have a logo now?', 'one', ['No, start fresh', 'Yes, refresh it', 'Yes, keep it and build around it']],
    ['name', 'Is the business name final?', 'one', ['Yes', 'Not yet', 'We need help naming it']],
    ['feel', 'Which feel is closest?', 'many', ['Classic and trusted', 'Modern and minimal', 'Bold and loud', 'Handmade and warm', 'Premium and luxury', 'Not sure yet']],
  ] },
  'Visual systems': { lead: 'A visual system is the look beyond the logo. It has to work everywhere you show up.', qs: [
    ['where', 'Where must the look work?', 'many', ['Social media', 'Packaging', 'Signage and shopfront', 'Vehicles', 'Uniforms', 'Print', 'Website and app']],
    ['have', 'Do you have colours or fonts already?', 'one', ['Yes, keep them', 'Some, open to change', 'Nothing yet']],
  ] },
  'Brand guidelines': { lead: 'Guidelines are for the people who use your brand when you are not in the room.', qs: [
    ['who', 'Who will use them?', 'many', ['Our team', 'Printers and sign makers', 'Agencies and freelancers', 'Branches or franchise partners']],
    ['brand', 'Is the brand itself designed?', 'one', ['Yes, keep it as it is', 'Yes, by someone else', 'Not yet, design it first']],
    ['format', 'In what form?', 'one', ['A PDF', 'A printed book', 'A web page', 'Not sure']],
  ] },
  // Digital experiences
  'Website strategy': { lead: 'Before any design: what the site is for, and how we will know it works.', qs: [
    ['job', 'What is the site’s main job?', 'one', ['Bring in enquiries', 'Sell products', 'Take bookings', 'Build trust and credibility', 'Share information']],
    ['who', 'Who visits it most?', 'text', [], 'e.g. tourists booking a stay, buyers comparing suppliers'],
    ['win', 'How will you know it is working?', 'many', ['More enquiries', 'Online sales', 'More bookings', 'Higher on Google', 'Fewer repeat questions by phone']],
  ] },
  'UX/UI design': { lead: 'So we size the design work to what you really need drawn.', qs: [
    ['what', 'What are we designing?', 'many', ['Website pages', 'Web app screens', 'Phone app screens', 'A dashboard']],
    ['size', 'Roughly how many pages or screens?', 'one', ['Up to 5', '6 to 15', '16 or more', 'Not sure']],
    ['content', 'Are words and photos ready?', 'one', ['Yes, ready', 'Some of it', 'We need help with content']],
  ] },
  'Website development': { lead: 'What the site must do decides how it is built.', qs: [
    ['do', 'What must it do?', 'many', ['Sell online', 'Take M-Pesa', 'Take card payments', 'Take bookings', 'Contact or quote forms', 'Blog or news', 'Member logins', 'More than one language']],
    ['domain', 'Do you have a domain name?', 'one', ['Yes', 'No, help us get one', 'Not sure']],
    ['mail', 'Email on your own domain (you@yourbusiness.co.ke)?', 'one', ['Yes, set it up', 'We already have it', 'Not needed']],
  ] },
  'CMS implementation': { lead: 'So the site is easy to update for whoever does it.', qs: [
    ['who', 'Who will update the site?', 'one', ['Me', 'Our team', 'You, for us', 'Not sure']],
    ['what', 'What will change most often?', 'many', ['Products and prices', 'Blog or news', 'Events', 'Team and jobs', 'Photos and galleries']],
    ['pref', 'Any platform in mind?', 'one', ['WordPress', 'Shopify', 'Webflow', 'No preference']],
  ] },
  'Responsive optimisation': { lead: 'We fix what is there, so tell us what is going wrong.', qs: [
    ['link', 'Address of the site to fix', 'text', [], 'e.g. yourbusiness.co.ke'],
    ['wrong', 'What is wrong today?', 'many', ['Slow to load', 'Breaks on phones', 'Hard to find things', 'Not showing on Google', 'Looks dated']],
  ] },
  // Software & automation
  'Custom applications': { lead: 'A sentence about the job it does is worth more than a list of features.', qs: [
    ['job', 'In one sentence, what should it do?', 'text', [], 'e.g. let our drivers log deliveries and customers sign on the phone'],
    ['runs', 'Where will it run?', 'many', ['In a web browser', 'Android phones', 'iPhones', 'Office computers']],
    ['offline', 'Must it work without internet?', 'one', ['Yes, often offline', 'Sometimes', 'No']],
  ] },
  'CRM systems': { lead: 'A CRM should follow how you actually win and keep customers.', qs: [
    ['track', 'What should it keep track of?', 'many', ['Contacts', 'Leads and deals', 'Follow-ups and reminders', 'Orders and history', 'Complaints and support', 'Loyalty and repeat buys']],
    ['from', 'Where do your leads come from?', 'many', ['WhatsApp', 'Phone calls', 'The website', 'Walk-ins', 'Social media', 'Referrals']],
    ['team', 'How many people sell or serve customers?', 'one', ['Just me', '2 to 5', '6 to 20', 'More than 20']],
  ] },
  'Client portals': { lead: 'A portal is your clients’ own corner of your business. What should they find there?', qs: [
    ['do', 'What will clients do in it?', 'many', ['See their orders or jobs', 'Download invoices and statements', 'Pay online', 'Upload documents', 'Book appointments', 'Message us']],
    ['count', 'How many clients would sign in?', 'one', ['Under 50', '50 to 500', 'More than 500']],
    ['login', 'How should they sign in?', 'one', ['Email and password', 'Phone number and an SMS code', 'Not sure']],
  ] },
  'Workflow automation': { lead: 'Start with the task you would most like never to do by hand again.', qs: [
    ['task', 'Which task eats the most time?', 'text', [], 'e.g. copying M-Pesa payments into Excel every evening'],
    ['often', 'How often does it happen?', 'one', ['Many times a day', 'Every day', 'Every week', 'Every month']],
    ['tools', 'Which tools are involved?', 'many', ['WhatsApp', 'Email', 'Excel or Google Sheets', 'M-Pesa', 'Accounting software']],
  ] },
  'SaaS platforms': { lead: 'Software you sell to others is a business on its own, so a few business questions.', qs: [
    ['buyers', 'Who will pay for it?', 'one', ['Businesses', 'Individuals', 'Both']],
    ['money', 'How will it make money?', 'one', ['Monthly subscription', 'Pay per use', 'A commission on sales', 'Not decided yet']],
    ['stage', 'Where are you with it?', 'one', ['An idea', 'Tested the idea with real users', 'A prototype exists', 'Live, and it needs rebuilding']],
  ] },
  'Mobile applications': { lead: 'Which phones, who holds them, and what the app must do on them.', qs: [
    ['phones', 'Which phones?', 'one', ['Android', 'iPhone', 'Both']],
    ['who', 'Who uses it?', 'one', ['Our customers', 'Our staff in the field', 'Both']],
    ['must', 'What must it do?', 'many', ['Logins and accounts', 'M-Pesa payments', 'Notifications', 'Maps and location', 'Use the camera', 'Work offline', 'Chat']],
  ] },
  'Integrations': { lead: 'Tell us what should talk to what, and we work out how.', qs: [
    ['what', 'What should be connected?', 'many', ['M-Pesa', 'KRA eTIMS', 'QuickBooks, Xero or Sage', 'Our bank', 'Google Workspace', 'WhatsApp Business', 'Our website']],
    ['way', 'Which way should the data move?', 'one', ['One way', 'Both ways', 'Not sure']],
  ] },
  'Reporting dashboards': { lead: 'A dashboard is only useful if it answers the questions you ask every week.', qs: [
    ['decide', 'What should the dashboard help you decide?', 'text', [], 'e.g. which branch to restock, which product to push'],
    ['numbers', 'Which numbers matter most?', 'many', ['Sales and revenue', 'Stock levels', 'Cash flow', 'Expenses', 'Staff performance', 'Customer numbers', 'Tax due']],
    ['source', 'Where do those numbers live today?', 'many', ['Excel or Google Sheets', 'Accounting software', 'A till or POS', 'M-Pesa statements', 'Our own system', 'On paper']],
    ['fresh', 'How fresh must they be?', 'one', ['Live, as it happens', 'Updated daily', 'Weekly', 'Monthly']],
  ] },
  // Growth
  'Search engine optimisation': { lead: 'So we chase the searches that bring you customers, not just traffic.', qs: [
    ['reach', 'Where do you want to be found?', 'one', ['My town or city', 'Across Kenya', 'Across East Africa', 'Worldwide']],
    ['terms', 'Three searches you would love to win', 'text', [], 'e.g. “plumber in Nyali”, “office furniture Mombasa”'],
    ['gbp', 'Do you have a Google Business Profile?', 'one', ['Yes', 'Not yet', 'Not sure']],
  ] },
  'Content strategy': { lead: 'A plan for what to say, where, and how often you can keep it up.', qs: [
    ['types', 'What kind of content?', 'many', ['Articles', 'Short videos', 'Photos', 'Newsletters', 'Client stories']],
    ['who', 'Who creates it?', 'one', ['You, for us', 'Us, with your plan and guidance', 'A mix of both']],
    ['pace', 'How often can you publish?', 'one', ['Weekly', 'Twice a month', 'Monthly']],
  ] },
  'Social media marketing': { lead: 'So we focus on the accounts and results that matter to you.', qs: [
    ['have', 'Which accounts do you have?', 'many', ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'X', 'None yet']],
    ['goal', 'What matters most?', 'one', ['More enquiries and DMs', 'More sales', 'More people knowing us', 'More followers']],
    ['pace', 'How many posts a week?', 'one', ['1 or 2', '3 or 4', '5 or more', 'Not sure, advise us']],
  ] },
  'Paid advertising': { lead: 'Where to advertise and where each ad should lead.', qs: [
    ['where', 'Where should the ads run?', 'many', ['Google', 'Facebook and Instagram', 'TikTok', 'LinkedIn', 'Not sure, advise us']],
    ['lead', 'Where should someone land after tapping an ad?', 'one', ['A WhatsApp chat', 'The website, to buy or enquire', 'A phone call', 'A sign-up form']],
    ['spend', 'Rough monthly ad spend, paid to the platforms', 'one', ['Under KES 20,000', 'KES 20,000 to 100,000', 'Over KES 100,000', 'Not sure yet'], 'This goes to Google or Meta, separate from our work'],
  ] },
  'Analytics & reporting': { lead: 'Numbers are only worth tracking if they change a decision. Start there.', qs: [
    ['decide', 'What decision should the numbers help you make?', 'text', [], 'e.g. which ads to keep, which page loses buyers'],
    ['measure', 'What do you want to measure?', 'many', ['Website visitors', 'Where sales come from', 'How the ads perform', 'Social media growth', 'What customers do on the site']],
    ['setup', 'What is set up today?', 'many', ['Google Analytics', 'Meta Pixel', 'Google Search Console', 'Nothing yet', 'Not sure']],
    ['report', 'How often do you want a report?', 'one', ['Weekly', 'Monthly', 'Quarterly']],
  ] },
  // Creative
  'Social graphics': { lead: 'So every post looks like it came from the same brand.', qs: [
    ['where', 'For which platforms?', 'many', ['Instagram posts', 'Stories and reels covers', 'TikTok', 'Facebook', 'LinkedIn', 'WhatsApp status']],
    ['count', 'How many a month?', 'one', ['Up to 10', '10 to 30', 'More than 30']],
    ['brand', 'What brand do you have to work from?', 'one', ['A full brand', 'A logo only', 'Nothing yet']],
  ] },
  'Pitch decks': { lead: 'Who is in the room decides what the deck must prove.', qs: [
    ['for', 'Who is it for?', 'one', ['Investors', 'Clients or a tender', 'Partners', 'Our own team']],
    ['content', 'Is the content ready?', 'one', ['Yes, written', 'Notes only', 'We need help writing it']],
    ['size', 'Roughly how many slides?', 'one', ['Up to 10', '10 to 20', 'More than 20']],
  ] },
  'Campaign assets': { lead: 'One campaign, many pieces, all on brand.', qs: [
    ['what', 'What is the campaign?', 'text', [], 'e.g. a store opening, a holiday promotion, a product launch'],
    ['formats', 'Which pieces do you need?', 'many', ['Posters', 'Social posts', 'Video ads', 'Billboards', 'Flyers', 'Radio script']],
    ['date', 'When does it go live?', 'text', [], 'A date, or roughly'],
  ] },
  'Presentation systems': { lead: 'Templates your team can fill in, so every deck looks the part.', qs: [
    ['tool', 'Which software do you use?', 'one', ['PowerPoint', 'Google Slides', 'Keynote', 'Canva']],
    ['kinds', 'Which templates?', 'many', ['Sales pitch', 'Company profile', 'Reports', 'Training', 'Proposals and tenders']],
    ['who', 'Who will use them?', 'one', ['Just me', 'A small team', 'The whole company']],
  ] },
  'Marketing collateral': { lead: 'The printed and shared pieces you hand to customers.', qs: [
    ['what', 'Which pieces?', 'many', ['Business cards', 'Flyers and brochures', 'Company profile', 'Menus or price lists', 'Letterheads and invoices', 'Banners and roll-ups']],
    ['form', 'Print, digital or both?', 'one', ['Print', 'Digital', 'Both']],
    ['printer', 'Should we handle the printing?', 'one', ['Yes, manage the printer', 'No, just the files']],
  ] },
};
