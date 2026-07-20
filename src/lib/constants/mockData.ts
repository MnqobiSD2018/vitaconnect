// lib/constants/mockData.ts

export interface RegistrationField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'ZiG';
  description: string;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'Sports' | 'Music' | 'Business' | 'Other';
  image: string;
  ticketTiers: TicketTier[];
  customFields: RegistrationField[];
}

export const MOCK_EVENTS: Event[] = [
   {
    id: 'evt_1',
    title: 'Harare City Marathon 2026',
    slug: 'harare-city-marathon-2026',
    description: 'The premier athletic event in Zimbabwe. Participate in the Full Marathon, Half Marathon, 10km Run, or 5km Fun Run. The course runs through the historic suburbs of Harare with full support stations.',
    date: 'September 13, 2026',
    time: '05:30 AM - 12:00 PM',
    location: 'Harare Sports Club, Harare',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1200&q=80',
    ticketTiers: [
      {
        id: 't_marathon_42',
        name: '42.2km Full Marathon',
        price: 25,
        currency: 'USD',
        description: 'Includes official race bib, technical running t-shirt, finisher medal, and goodie bag. Min age: 18.',
        available: 150
      },
      {
        id: 't_marathon_21',
        name: '21.1km Half Marathon',
        price: 20,
        currency: 'USD',
        description: 'Includes official race bib, technical running t-shirt, finisher medal, and goodie bag. Min age: 16.',
        available: 300
      },
      {
        id: 't_marathon_10',
        name: '10km Power Run',
        price: 15,
        currency: 'USD',
        description: 'Includes official race bib, running t-shirt, and finisher medal. Open to all ages.',
        available: 500
      },
      {
        id: 't_funrun_5',
        name: '5km Fun Run & Walk',
        price: 10,
        currency: 'USD',
        description: 'Includes official race t-shirt and finisher ribbon. Perfect for families!',
        available: 800
      }
    ],
    customFields: [
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: ['Male', 'Female', 'Prefer not to say']
      },
      {
        name: 'age',
        label: 'Age on Race Day',
        type: 'text',
        required: true
      },
      {
        name: 'tshirtSize',
        label: 'Running T-Shirt Size',
        type: 'select',
        required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        name: 'clubName',
        label: 'Athletics Club / School Name (Optional)',
        type: 'text',
        required: false
      },
      {
        name: 'emergencyContact',
        label: 'Emergency Contact Name & Phone',
        type: 'text',
        required: true
      },
      {
        name: 'indemnity',
        label: 'I agree to the race terms, medical waiver, and indemnity agreement.',
        type: 'checkbox',
        required: true
      }
    ]
  },
  {
    id: 'evt_2',
    title: 'Victoria Falls Carnival 2026',
    slug: 'victoria-falls-carnival-2026',
    description: "Welcome to Africa's ultimate music and adventure festival. Celebrate New Year's Eve in style at the majestic Victoria Falls. Three days of international DJs, regional superstars, fire dancers, and adrenaline activities.",
    date: 'December 29 - 31, 2026',
    time: '04:00 PM - 03:00 AM Daily',
    location: 'Victoria Falls Primary School & Elephant Hills Resort',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    ticketTiers: [
      {
        id: 't_vfc_gen',
        name: '3-Day General Pass',
        price: 90,
        currency: 'USD',
        description: 'Access to all main stages and festival grounds for all 3 days. Excludes adventure activity bookings.',
        available: 1200
      },
      {
        id: 't_vfc_vip',
        name: '3-Day VIP Deck Pass',
        price: 200,
        currency: 'USD',
        description: 'Fast-track entry, access to elevated VIP viewing deck, private bars, flushing toilets, and welcome drink.',
        available: 250
      },
      {
        id: 't_vfc_vvip',
        name: '3-Day VVIP Backstage Experience',
        price: 450,
        currency: 'USD',
        description: 'All VIP perks plus backstage artist lounge access, complimentary local beverages and catering, and premium transfers.',
        available: 50
      }
    ],
    customFields: [
      {
        name: 'passportNum',
        label: 'Passport or National ID Number',
        type: 'text',
        required: true
      },
      {
        name: 'nationality',
        label: 'Nationality',
        type: 'text',
        required: true
      },
      {
        name: 'accommodation',
        label: 'Where are you staying in Vic Falls? (For safety & logistics)',
        type: 'text',
        required: false
      }
    ]
  },
  {
    id: 'evt_3',
    title: 'Zimbabwe Tech Summit 2026',
    slug: 'zimbabwe-tech-summit-2026',
    description: 'The largest technology conference in Zimbabwe, bringing together developers, startup founders, digital marketers, and investors. Panels on AI integration, Web3, FinTech regulation, and Agritech systems.',
    date: 'October 15, 2026',
    time: '08:00 AM - 05:00 PM',
    location: 'Celebration Centre, Borrowdale, Harare',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    ticketTiers: [
      {
        id: 't_zts_student',
        name: 'Student Pass',
        price: 15,
        currency: 'USD',
        description: 'Discounted access for active college and university students. Requires valid student ID at check-in.',
        available: 100
      },
      {
        id: 't_zts_delegate',
        name: 'Standard Delegate',
        price: 60,
        currency: 'USD',
        description: 'Full access to all panels, exhibition hall, lunch and coffee breaks, and post-event networking cocktail.',
        available: 400
      },
      {
        id: 't_zts_executive',
        name: 'VIP Executive Pass',
        price: 180,
        currency: 'USD',
        description: 'Front-row seating, access to VIP Executive Lounge with speakers, private catering, and invitation to VIP dinner.',
        available: 75
      }
    ],
    customFields: [
      {
        name: 'company',
        label: 'Company / Organization Name',
        type: 'text',
        required: true
      },
      {
        name: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        required: true
      },
      {
        name: 'dietary',
        label: 'Dietary Requirements',
        type: 'select',
        required: false,
        options: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free']
      }
    ]
  }
];
