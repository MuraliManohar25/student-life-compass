import { TaskItem, ScheduleBlock, ShoppingItem, StudentSpot, AIMessage } from '../types';

export const APP_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1U4FsmEbIYX3dYzAcjLlKg6vPin_ccTcLFd1FWHyYn5NpdkMYCM2riED5wyd8Gpark1RAax9ce22rcKfwAkbz2wrid2vplpvXobzFtEZkmTFxe37Qgw1XOfeyz0U0chmYnD-VRT0CDjeZGNYl7B9FZIPF6G8HeUF5aqa7-ft072FZSNTYidP_wpT_T-uuPmqDbxVcwwySNdgedItuXigqMQi8k1McGy3xwXCnlbwebg7GxhRY34F-eBbSI';

export const ALEX_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbpe0GwjmBohzY01plm7Ro8azsTnJCekdufkIOP8ZhZeZ6FBzkhssWPsIkSa1GHiMohj2sl-cuUy7phNKTLjyquOc1T4j8Sr3_dhLuJiEQyZwrHBRl17x5KHya_m0jdaBkzPLJiAYZfZ027u05UEBfrFNHKd2BXMvTGWqZ824JNtVFqpWE9hZQFeKPnQ7gAXzNI1z688msEkwuNOkhCsGgwN3mRnS7teDeIygFbz6B0M47TRE8rDhF';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'DBMS Normalization Assignment',
    dueTime: 'Tomorrow',
    duration: '2 hrs',
    priority: 'High',
    completed: false,
    course: 'CS-304: Database Systems',
    description: 'Nearest deadline + 15% overall course weight. Unlocks SQL Labs.'
  },
  {
    id: 't-2',
    title: 'Mathematics Revision',
    dueTime: 'In 4 days',
    duration: '1.5 hrs',
    priority: 'Medium',
    completed: false,
    course: 'Calculus III',
    description: 'Vector Integrals Revision • High occurrence in Section B'
  },
  {
    id: 't-3',
    title: 'Python Algorithm Practice',
    dueTime: 'Completed',
    duration: '1 hr',
    priority: 'Routine',
    completed: true,
    course: 'Data Structures',
    description: 'Trees & Graphs review with 4 mock platform challenges'
  }
];

export const INITIAL_SCHEDULE: ScheduleBlock[] = [
  {
    id: 's-1',
    timeRange: '09:00 AM - 11:00 AM',
    title: 'DBMS Normalization Lab',
    location: 'Lab Hall 3B • Prof. Harrington',
    status: 'Completed'
  },
  {
    id: 's-2',
    timeRange: '02:00 PM - 03:30 PM (Current)',
    title: 'Calculus III Problem Set',
    location: 'Due at 11:59 PM • Vector Fields & Flux',
    status: 'Urgent',
    urgent: true
  },
  {
    id: 's-3',
    timeRange: '05:00 PM - 07:00 PM',
    title: 'AI Sequenced Focus Block',
    location: 'Odegaard Library • Algorithms Revision',
    status: 'AI Sequenced',
    weightBadge: '95% PYQ Weight'
  }
];

export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Formal Presentation Shirt',
    price: 599,
    description: 'Campus interview season prep',
    budgetImpact: '24% budget impact',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMjnNDrktfkb8Iih11TFIPL92OGPqo6aaK558vRkD3GzSOSxGGxU_kZWKAvq_LxYGpkzdJ-7Q7eMWIbufB1POLhWxldOgwQRRz0TMDsg4u9u6-T1Ho8yKyibCqf8lR6cm5yzO3psYYFb6RUWJVTWSs0r7CoLUbQYMFI2T3eJ7m_vezxLepcRzXnbC2V0_0_YyH4FN5oN2tNDL1RKFrNzLcndA34Hj7jc8BrVml9WwinD0XOtYO2T-a',
    selected: true,
    category: 'apparel'
  },
  {
    id: 'shop-2',
    name: 'Academic Notebooks Pack',
    price: 249,
    description: '15% student discount at University Bookhouse',
    budgetImpact: '10% budget impact',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb439fYny9Ne_khLK8kgWTtmj9RAHZVITzpy8IFAfB9px8w9vfuKiqrJSCwQ-FRh372j4FLG1U2hck4ILe-C3ZeHEQEHYiECVABwmCYhhQR407MNarROgwb_3gHJPSNmdqcpOSF81SkZA8YoOmDCvj1ToxG5oCU4Mhx-L0Lnh91eFmdqyNi2xc5Icxk_62rttlPfmbFrTTRue06zxuVPUu2uisl9OiWVOhJq7D9E3BbRpJiHwjMomn',
    selected: true,
    category: 'stationery'
  },
  {
    id: 'shop-3',
    name: 'Casio Scientific Calculator',
    price: 750,
    description: 'Refurbished • Verified campus senior seller',
    budgetImpact: '30% budget impact',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3qWrapQjQDVkICsjwd73lVvSwnQekVl8U47JfDoOhlxqARY2_xDuB92MeTuqi4-6qk6AhxvaB748Ymr8Cq70i-RDJaGgzA6yEplGWvqDsboh5cwGGc37wDwVYgqCguPl7-NeC6xOLgnXmdDOTN1tt10R4DRiIa-Z1hCsoVhBHyg43WF9iCaTwucpCHjemfxW0qWqes1QNC88t3-j7WyJ0LOrJ9sR-tmCXOBqMqsKGC8REr1bqCs8i',
    selected: true,
    category: 'electronics'
  }
];

export const INITIAL_STUDENT_SPOTS: StudentSpot[] = [
  {
    id: 'spot-1',
    name: 'University Library Quiet Zone',
    category: 'study',
    categoryLabel: 'Study',
    rating: 4.8,
    distance: '150m away',
    tags: ['Free Wi-Fi', 'Power Plugs', 'Open till 11 PM'],
    crowdInfo: 'Moderate crowd (42 seats left)',
    actionType: 'navigate',
    actionLabel: 'Navigate',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDvmC_X8BNJfW7cLJZm2tDI4tR-AeMgtZjG3zb4erIczg_z90c9-03PiZzo9UZnThFS2xmj4fXpWqqkvsn6o4RRc5uG294llx8DR1IqnuA-4z_1dqmIenL0z8bLvyXb8OF0qBz1KvWQMVhp_7_bhMrRs3Ok5U2DQdhzNhZAEKRptnZnV6JaKVGuomVyp6tZ48aizWViLNP3LJv50Tl4ISJInhO3adX39LhahlTPwdZUzkFN0AYggXa'
  },
  {
    id: 'spot-2',
    name: 'Green Leaf Cafe & Canteen',
    category: 'food',
    categoryLabel: 'Food',
    rating: 4.4,
    distance: '300m away',
    tags: ['Special Thali ₹120', 'Quick Bite'],
    crowdInfo: 'View 124 Student Reviews',
    extraBadge: '₹₹ Student Budget',
    actionType: 'navigate',
    actionLabel: 'Navigate',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSGtt9ledF3wdbxkvaxf0praf3pU9SCSSsP-slsbUzQDRFjUWFCo8HUScHKXrpKdxoLWahZbGh1UwB1LNlXieWstuW_2TcESmPn5MFg8qUY1-uyOppX-T3YWC0Tf4pgYUjUbe7sfGknmcj_c7S6Rj0h_FoEb8iHZEqmTFpiSyc-pH9NF7WDJFkSX9JOtaADHkut-QK086KPSipWXZwhnJGgitJH5ga-LyzDjNpaBpWtUagVbN-7W-r'
  },
  {
    id: 'spot-3',
    name: 'Regal Cineplex',
    category: 'movies',
    categoryLabel: 'Movies',
    rating: 4.5,
    distance: '1.1 km away',
    tags: ['Now: Interstellar Re-release'],
    extraBadge: '₹180 ID pass',
    crowdInfo: 'Today: 4:15 PM, 7:30 PM',
    actionType: 'book_bms',
    actionLabel: 'Book via BMS',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgwzPYR3lmplCRaU7P0j5awLb22St8BVmdlJRKZnTYVS3rxLIzSSyaGEY1I5lXor6dWbL2BECGhT2DTPf1_8Sel-x14OfKS6KnJMVeZ5BnUahuf7JJIjc3zx91n9cEtwSJL6dX-oeiGJf0QpBzSE4Xr-HprD4MFKrn17cZOn9lcT398y43dRid2jhYwjby_oVErYezLgOatkq2MG85CaMMyXydS9X2UX4xa7zWxcAxLeBq2Qr_LrQo'
  },
  {
    id: 'spot-4',
    name: 'Campus Health & Pharmacy',
    category: 'essentials',
    categoryLabel: 'Essentials',
    rating: 4.7,
    distance: '450m away',
    tags: ['15% Student Discount', 'OTC Meds'],
    extraBadge: '24/7 Open',
    crowdInfo: 'Walk-in doctor available',
    actionType: 'call',
    actionLabel: 'Call',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDePQPfLETvSWiubKYvENrq0BNsujTBBn8ZWqfFCg-vPNeh4Bv-dwyVNXgkkIcTlSJdhghLP-gcg-vC8jSBqYx8cxTHKfejM9BfcFF7CghEukH6rvXYCPkrDMcnTwShrJ9x5npR0OG1Bu10xJi4eoHxoF1tL5RQIMHKPMuZUOAfxj5zvMbnKkaRakbFBjldg9AlSQLx052Q_9IASrFQeOyDoaK9LUyAO2G2a668HEHnD_TyElRQXjT7'
  },
  {
    id: 'spot-5',
    name: 'City Metro & Transport Hub',
    category: 'transport',
    categoryLabel: 'Transit',
    rating: 4.6,
    distance: '600m away',
    tags: ['Rapido Stand', 'Feeder Bus', 'Trains every 4m'],
    crowdInfo: 'Avg bike wait: ~3 mins',
    actionType: 'rapido',
    actionLabel: 'Open Rapido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfJodjyQv654-b9eXclSFZtfdDuYSNbMVMB7CRN3sALQkw1qeH65YobRCSSrqC6jYu2pGkiNwZGer3cMMvT55Y1mY5f1v5Uf0EF9aS8Tf9ub5IkI9BxKY6cqHK4HTCO1oJNqlCshkVT-ZXzXkQpbZl877V0MzjjmEfZ0X7CZWPC6cR8Huj_m0XiLhuMidjVfOlnBgzGJ3kxoTOAi_cafBvID8IBsBqntp0JcyKyWh0Tr92KIACtA2J'
  },
  {
    id: 'spot-6',
    name: 'North Zone LPG & Utilities',
    category: 'essentials',
    categoryLabel: 'Utilities',
    rating: 4.2,
    distance: '1.5 km away',
    tags: ['Doorstep delivery 24h'],
    alert: 'Refill due in 6 days',
    crowdInfo: 'Hostel Delivery',
    actionType: 'refill',
    actionLabel: 'Book Refill',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAahdEy6R0bXFfxmQFVYgF4pK7lVHLCjYHxPSgkjscfw7hhiYfIvGhAwmK39VM1xWswgA4F6Vv9WGF0yC8qhBlJC_DLAPpIq0P_QfcCsw6AjGXx51tHYFHd50BpoZng8GyYZfH5MYzu3n3NMq6ajM3XVi9D-YkN5TCH3OkWZy42xQoYmAZu5blcXZ4Plltl1RLRQOKzOYq76p3XDBuPhbbU5XFzKZPnUbgu_CgJ8xnL2khNm2tnIYEu'
  }
];

export const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'm-1',
    sender: 'user',
    text: 'I have an exam in 2 weeks and ₹1,500 left for discretionary spending. What should my priority be this weekend, and can I afford dinner with friends tonight?',
    timestamp: 'Today, 5:42 PM'
  },
  {
    id: 'm-2',
    sender: 'ai',
    text: 'Hey Alex! You can definitely do dinner with the crew tonight without derailing your Mid-Term prep, provided you stick to high-yield study blocks tomorrow morning. Here is your targeted gameplan:',
    timestamp: 'Today, 5:42 PM',
    richContent: {
      academicPriority: {
        title: 'DBMS: Relational Algebra & Normalization',
        duration: '3 Hours',
        slot: 'Saturday 10:00 AM – 1:00 PM at Odegaard 2nd Floor (Quiet Zone).',
        pyqWeight: '95% PYQ Weight',
        checkmarks: ['4 Core Theorems', '6 Past Year Solved Sets']
      },
      financialCheck: {
        discretionaryBudget: 1500,
        safePace: '₹277 / day',
        warning: 'If you spend an average ₹400 at a standard cafe, your safe pace drops sharply to ₹232/day.',
        recommendation: {
          title: 'Smart Student Recommendation',
          body: 'Green Leaf Cafe has verified student combo platters at ₹120. Eating there tonight saves ₹280, preserving a ₹157 daily surplus.',
          savings: '₹280 saved',
          distance: '0.4 km away • Student Discount verified'
        }
      },
      weekendPace: [
        {
          time: 'Tonight (7:30 PM - 9:30 PM)',
          category: 'Social',
          title: 'Dinner with friends @ Green Leaf (Budget: ₹150 max)',
          type: 'social'
        },
        {
          time: 'Sat Morning (10:00 AM - 1:00 PM)',
          category: 'Academics',
          title: 'Deep Work: DBMS Relational Algebra PYQ',
          type: 'academics'
        },
        {
          time: 'Sun Afternoon (2:00 PM - 4:30 PM)',
          category: 'Revision',
          title: 'Mock paper simulation & cheat-sheet sync',
          type: 'revision'
        }
      ]
    }
  }
];
