import type { Translations } from './translations';

export const he: Translations = {
  // Hero
  'hero.title': 'אנאל ואריק',
  'hero.subtitle': 'אנחנו מתחתנים!',
  'hero.date': '18 – 20 באוקטובר 2026',
  'hero.location': 'תל אביב, ישראל',

  // Countdown
  'countdown.months': 'חודשים',
  'countdown.days': 'ימים',
  'countdown.month_singular': 'חודש',
  'countdown.day_singular': 'יום',
  'countdown.celebration': 'היום הגדול הגיע!',

  // Nav
  'nav.rsvp': 'אישור הגעה',
  'nav.lang_fr': 'FR',
  'nav.lang_he': 'עב',
  'nav.lang_switch_fr': 'Passer en français',
  'nav.lang_switch_he': 'לעברית',

  // Event: Mairie
  'event.mairie.name': 'טקס אזרחי',
  'event.mairie.date': '18 באוקטובר 2026',
  'event.mairie.time': 'השעה תעודכן בהמשך',
  'event.mairie.location': 'עיריית קורבווא',
  'event.mairie.address': '2 פלאס אנרי ברביס, קורבווא',
  'event.mairie.transport': 'תחנת קורבווא (Transilien L) / לה דפאנס (RER A, מטרו 1)',
  'event.mairie.dress_code': 'לבוש עירוני',
  'event.mairie.description': 'טקס אזרחי בעיריית קורבווא, ולאחריו כיבוד קל במעגל משפחתי.',

  // Event: Welcome Dinner
  'event.welcome_dinner.name': 'ארוחת ערב חגיגית',
  'event.welcome_dinner.date': '18 באוקטובר 2026',
  'event.welcome_dinner.time': 'השעה תעודכן בהמשך',
  'event.welcome_dinner.location': 'נווה צדק, תל אביב',
  'event.welcome_dinner.address': 'נווה צדק, תל אביב',
  'event.welcome_dinner.transport': 'מונית / הליכה מהמרכז',
  'event.welcome_dinner.dress_code': 'שיק אלגנטי',
  'event.welcome_dinner.description': 'ארוחת ערב חמה בשכונה הקסומה של נווה צדק.',

  // Event: Beach Party
  'event.beach_party.name': 'מסיבת חוף',
  'event.beach_party.date': '19 באוקטובר 2026',
  'event.beach_party.time': 'השעה תעודכן בהמשך',
  'event.beach_party.location': 'מרינה הרצליה',
  'event.beach_party.address': 'מרינה הרצליה, הרצליה',
  'event.beach_party.transport': 'מונית / הסעה',
  'event.beach_party.dress_code': 'לבוש חוף',
  'event.beach_party.description': 'יום שלם על חוף הים במרינה של הרצליה. אל תשכחו בגד ים וקרם הגנה!',

  // Event: Wedding Ceremony
  'event.wedding_ceremony.name': 'חתונה',
  'event.wedding_ceremony.date': '20 באוקטובר 2026',
  'event.wedding_ceremony.time': 'השעה תעודכן בהמשך',
  'event.wedding_ceremony.location': 'אחוזה, בית חנן',
  'event.wedding_ceremony.address': 'בית חנן, ישראל',
  'event.wedding_ceremony.transport': 'הסעה מתל אביב',
  'event.wedding_ceremony.dress_code': 'לבוש ערב',
  'event.wedding_ceremony.description': 'טקס החתונה ולאחריו חגיגה גדולה מתחת לכוכבים.',

  // Event detail labels
  'event.label_date': 'תאריך',
  'event.label_time': 'שעה',
  'event.label_location': 'מקום',
  'event.label_address': 'כתובת',
  'event.label_transport': 'הגעה',
  'event.label_dress_code': 'לבוש',
  'event.label_description': 'תיאור',

  // RSVP
  'rsvp.title': 'אישור הגעה',
  'rsvp.subtitle': 'נשמח לדעת אם תוכלו להגיע.',
  'rsvp.name_label': 'שם מלא',
  'rsvp.name_placeholder': 'שם פרטי ומשפחה',
  'rsvp.email_label': 'אימייל',
  'rsvp.email_placeholder': 'your@email.com',
  'rsvp.events_label': 'לאילו אירועים תגיעו?',
  'rsvp.guests_label': 'מלווים',
  'rsvp.guests_description': 'מספר אנשים נוספים (מלבדכם)',
  'rsvp.dietary_label': 'מגבלות תזונתיות',
  'rsvp.dietary_placeholder': 'צמחוני, אלרגיות…',
  'rsvp.message_label': 'הודעה (אופציונלי)',
  'rsvp.message_placeholder': 'כמה מילים לזוג…',
  'rsvp.submit': 'שליחה',
  'rsvp.submitting': 'שולח…',
  'rsvp.success_title': 'תודה!',
  'rsvp.success_message': 'התשובה שלכם נרשמה. מחכים לראות אתכם!',
  'rsvp.error_title': 'שגיאה',
  'rsvp.error_message': 'אירעה שגיאה. נסו שוב.',
  'rsvp.error_retry': 'נסו שוב',
  'rsvp.error_name_required': 'שם הוא שדה חובה.',
  'rsvp.error_email_invalid': 'כתובת אימייל לא תקינה.',
  'rsvp.error_events_required': 'יש לבחור לפחות אירוע אחד.',

  // Practical
  'practical.title': 'מידע מעשי',
  'practical.flights.title': 'טיסות לתל אביב',
  'practical.flights.content': 'נמל התעופה בן גוריון (TLV) נמצא כ-20 דקות מתל אביב. טיסות ישירות מפריז CDG עם אל על, אייר פראנס וטרנסאוויה. הזמינו מוקדם למחירים הטובים ביותר.',
  'practical.hotels.title': 'לינה',
  'practical.hotels.content': 'שכונות מומלצות: נווה צדק (קסם), יפו (אותנטיות), מרכז תל אביב (חיי לילה). AirBnB ומלונות לכל תקציב.',
  'practical.transport.title': 'תחבורה',
  'practical.transport.content': 'מוניות: אפליקציית Gett (כמו Uber). אוטובוסים ורכבות אמינים. הסעות יאורגנו לחתונה. רישיון נהיגה צרפתי תקף בישראל.',
  'practical.currency.title': 'מטבע',
  'practical.currency.content': 'שקל ישראלי (₪ / ILS). כרטיסי אשראי מתקבלים בכל מקום. כספומטים בכל תל אביב. שער חליפין משוער: 1 € ≈ 4 ₪.',
  'practical.emergency.title': 'חירום',
  'practical.emergency.content': 'משטרה: 100 · מד"א: 101 · כיבוי אש: 102. שגרירות צרפת בתל אביב: +972 3 520 8500. לא נדרשת ויזה לאזרחי צרפת.',
  'practical.weather.title': 'מזג אוויר וטיפים',
  'practical.weather.content': 'אוקטובר בישראל: כ-25°C, שמשי ונעים. קחו קרם הגנה, כובע ולבוש קל ליום. הערבים ליד הים עלולים להיות קרירים.',

  // Footer
  'footer.made_with_love': 'נעשה באהבה על ידי הזוג',
  'footer.copyright': '© 2026 אנאל ואריק',
  'footer.from_with_love': 'באהבה, מפריז לתל אביב',

  // Globe
  'globe.aria_label': 'גלובוס אינטראקטיבי המציג את המסלול פריז – תל אביב',
  'globe.static_aria_label': 'מפת המסלול פריז – תל אביב',
  'globe.section_title': 'המסע שלנו',
  'globe.scroll_hint': 'גללו כדי לחקור',

  // Accessibility
  'a11y.skip_to_content': 'דלג לתוכן',
  'a11y.lang_changed': 'השפה שונתה לעברית',
};
