"""Shared content catalogs seeded into the database.

These mirror the original frontend mock catalogs so the backend becomes the
single source of truth. Per-user state (saves, selections, reservations)
lives in the ``saved_items`` table instead.
"""

SPOTS_CATALOG = [
    {
        "name": "University Library Quiet Zone",
        "category": "study",
        "category_label": "Study",
        "rating": 4.8,
        "distance": "150m away",
        "tags": ["Free Wi-Fi", "Power Plugs", "Open till 11 PM"],
        "crowd_info": "Moderate crowd (42 seats left)",
        "extra_badge": "",
        "action_type": "navigate",
        "action_label": "Navigate",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBDvmC_X8BNJfW7cLJZm2tDI4tR-AeMgtZjG3zb4erIczg_z90c9-03PiZzo9UZnThFS2xmj4fXpWqqkvsn6o4RRc5uG294llx8DR1IqnuA-4z_1dqmIenL0z8bLvyXb8OF0qBz1KvWQMVhp_7_bhMrRs3Ok5U2DQdhzNhZAEKRptnZnV6JaKVGuomVyp6tZ48aizWViLNP3LJv50Tl4ISJInhO3adX39LhahlTPwdZUzkFN0AYggXa",
        "alert": "",
    },
    {
        "name": "Green Leaf Cafe & Canteen",
        "category": "food",
        "category_label": "Food",
        "rating": 4.4,
        "distance": "300m away",
        "tags": ["Special Thali Rs.120", "Quick Bite"],
        "crowd_info": "View 124 Student Reviews",
        "extra_badge": "Student Budget",
        "action_type": "navigate",
        "action_label": "Navigate",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBSGtt9ledF3wdbxkvaxf0praf3pU9SCSSsP-slsbUzQDRFjUWFCo8HUScHKXrpKdxoLWahZbGh1UwB1LNlXieWstuW_2TcESmPn5MFg8qUY1-uyOppX-T3YWC0Tf4pgYUjUbe7sfGknmcj_c7S6Rj0h_FoEb8iHZEqmTFpiSyc-pH9NF7WDJFkSX9JOtaADHkut-QK086KPSipWXZwhnJGgitJH5ga-LyzDjNpaBpWtUagVbN-7W-r",
        "alert": "",
    },
    {
        "name": "Regal Cineplex",
        "category": "movies",
        "category_label": "Movies",
        "rating": 4.5,
        "distance": "1.1 km away",
        "tags": ["Now: Interstellar Re-release"],
        "crowd_info": "Today: 4:15 PM, 7:30 PM",
        "extra_badge": "Rs.180 ID pass",
        "action_type": "book_bms",
        "action_label": "Book via BMS",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBgwzPYR3lmplCRaU7P0j5awLb22St8BVmdlJRKZnTYVS3rxLIzSSyaGEY1I5lXor6dWbL2BECGhT2DTPf1_8Sel-x14OfKS6KnJMVeZ5BnUahuf7JJIjc3zx91n9cEtwSJL6dX-oeiGJf0QpBzSE4Xr-HprD4MFKrn17cZOn9lcT398y43dRid2jhYwjby_oVErYezLgOatkq2MG85CaMMyXydS9X2UX4xa7zWxcAxLeBq2Qr_LrQo",
        "alert": "",
    },
    {
        "name": "Campus Health & Pharmacy",
        "category": "essentials",
        "category_label": "Essentials",
        "rating": 4.7,
        "distance": "450m away",
        "tags": ["15% Student Discount", "OTC Meds"],
        "crowd_info": "Walk-in doctor available",
        "extra_badge": "24/7 Open",
        "action_type": "call",
        "action_label": "Call",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDePQPfLETvSWiubKYvENrq0BNsujTBBn8ZWqfFCg-vPNeh4Bv-dwyVNXgkkIcTlSJdhghLP-gcg-vC8jSBqYx8cxTHKfejM9BfcFF7CghEukH6rvXYCPkrDMcnTwShrJ9x5npR0OG1Bu10xJi4eoHxoF1tL5RQIMHKPMuZUOAfxj5zvMbnKkaRakbFBjldg9AlSQLx052Q_9IASrFQeOyDoaK9LUyAO2G2a668HEHnD_TyElRQXjT7",
        "alert": "",
    },
    {
        "name": "City Metro & Transport Hub",
        "category": "transport",
        "category_label": "Transit",
        "rating": 4.6,
        "distance": "600m away",
        "tags": ["Rapido Stand", "Feeder Bus", "Trains every 4m"],
        "crowd_info": "Avg bike wait: ~3 mins",
        "extra_badge": "",
        "action_type": "rapido",
        "action_label": "Open Rapido",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCfJodjyQv654-b9eXclSFZtfdDuYSNbMVMB7CRN3sALQkw1qeH65YobRCSSrqC6jYu2pGkiNwZGer3cMMvT55Y1mY5f1v5Uf0EF9aS8Tf9ub5IkI9BxKY6cqHK4HTCO1oJNqlCshkVT-ZXzXkQpbZl877V0MzjjmEfZ0X7CZWPC6cR8Huj_m0XiLhuMidjVfOlnBgzGJ3kxoTOAi_cafBvID8IBsBqntp0JcyKyWh0Tr92KIACtA2J",
        "alert": "",
    },
    {
        "name": "North Zone LPG & Utilities",
        "category": "essentials",
        "category_label": "Utilities",
        "rating": 4.2,
        "distance": "1.5 km away",
        "tags": ["Doorstep delivery 24h"],
        "crowd_info": "Hostel Delivery",
        "extra_badge": "",
        "action_type": "refill",
        "action_label": "Book Refill",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAahdEy6R0bXFfxmQFVYgF4pK7lVHLCjYHxPSgkjscfw7hhiYfIvGhAwmK39VM1xWswgA4F6Vv9WGF0yC8qhBlJC_DLAPpIq0P_QfcCsw6AjGXx51tHYFHd50BpoZng8GyYZfH5MYzu3n3NMq6ajM3XVi9D-YkN5TCH3OkWZy42xQoYmAZu5blcXZ4Plltl1RLRQOKzOYq76p3XDBuPhbbU5XFzKZPnUbgu_CgJ8xnL2khNm2tnIYEu",
        "alert": "Refill due in 6 days",
    },
]

SHOPPING_CATALOG = [
    {
        "name": "Formal Presentation Shirt",
        "price": 599,
        "description": "Campus interview season prep",
        "budget_impact": "24% budget impact",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAMjnNDrktfkb8Iih11TFIPL92OGPqo6aaK558vRkD3GzSOSxGGxU_kZWKAvq_LxYGpkzdJ-7Q7eMWIbufB1POLhWxldOgwQRRz0TMDsg4u9u6-T1Ho8yKyibCqf8lR6cm5yzO3psYYFb6RUWJVTWSs0r7CoLUbQYMFI2T3eJ7m_vezxLepcRzXnbC2V0_0_YyH4FN5oN2tNDL1RKFrNzLcndA34Hj7jc8BrVml9WwinD0XOtYO2T-a",
        "category": "apparel",
    },
    {
        "name": "Academic Notebooks Pack",
        "price": 249,
        "description": "15% student discount at University Bookhouse",
        "budget_impact": "10% budget impact",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDb439fYny9Ne_khLK8kgWTtmj9RAHZVITzpy8IFAfB9px8w9vfuKiqrJSCwQ-FRh372j4FLG1U2hck4ILe-C3ZeHEQEHYiECVABwmCYhhQR407MNarROgwb_3gHJPSNmdqcpOSF81SkZA8YoOmDCvj1ToxG5oCU4Mhx-L0Lnh91eFmdqyNi2xc5Icxk_62rttlPfmbFrTTRue06zxuVPUu2uisl9OiWVOhJq7D9E3BbRpJiHwjMomn",
        "category": "stationery",
    },
    {
        "name": "Casio Scientific Calculator",
        "price": 750,
        "description": "Refurbished, verified campus senior seller",
        "budget_impact": "30% budget impact",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuB3qWrapQjQDVkICsjwd73lVvSwnQekVl8U47JfDoOhlxqARY2_xDuB92MeTuqi4-6qk6AhxvaB748Ymr8Cq70i-RDJaGgzA6yEplGWvqDsboh5cwGGc37wDwVYgqCguPl7-NeC6xOLgnXmdDOTN1tt10R4DRiIa-Z1hCsoVhBHyg43WF9iCaTwucpCHjemfxW0qWqes1QNC88t3-j7WyJ0LOrJ9sR-tmCXOBqMqsKGC8REr1bqCs8i",
        "category": "electronics",
    },
]


def seed_catalog(db):
    """Insert catalog rows once; safe to call on every boot."""
    from app.models.models import Spot, ShoppingItem

    if db.query(Spot).count() == 0:
        for row in SPOTS_CATALOG:
            db.add(Spot(**row))
        db.commit()
    if db.query(ShoppingItem).count() == 0:
        for row in SHOPPING_CATALOG:
            db.add(ShoppingItem(**row))
        db.commit()
