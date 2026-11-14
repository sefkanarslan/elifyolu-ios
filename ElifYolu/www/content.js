/* Elif Yolu — içerik verisi.
   Ayet metinleri Hafs rivayetine göre harekelidir. Mealler kısa ve sadedir. */
'use strict';

const LETTERS = [
  { ar: 'ا', name: 'Elif', say: 'أَلِفْ', hint: 'Harekeye göre e / a sesi verir', dots: 0, joins: false },
  { ar: 'ب', name: 'Be', say: 'بَا', hint: 'B sesi', dots: 1, joins: true },
  { ar: 'ت', name: 'Te', say: 'تَا', hint: 'T sesi', dots: 2, joins: true },
  { ar: 'ث', name: 'Se', say: 'ثَا', hint: 'Peltek s — dil ucu dişlerin arasında', dots: 3, joins: true },
  { ar: 'ج', name: 'Cim', say: 'جِيمْ', hint: 'C sesi', dots: 1, joins: true },
  { ar: 'ح', name: 'Ha', say: 'حَا', hint: 'Boğazdan, hırıltısız h', dots: 0, joins: true },
  { ar: 'خ', name: 'Hı', say: 'خَا', hint: 'Gırtlaktan, hırıltılı h', dots: 1, joins: true },
  { ar: 'د', name: 'Dal', say: 'دَالْ', hint: 'D sesi', dots: 0, joins: false },
  { ar: 'ذ', name: 'Zel', say: 'ذَالْ', hint: 'Peltek z — dil ucu dişlerin arasında', dots: 1, joins: false },
  { ar: 'ر', name: 'Ra', say: 'رَا', hint: 'R sesi', dots: 0, joins: false },
  { ar: 'ز', name: 'Ze', say: 'زَايْ', hint: 'Z sesi', dots: 1, joins: false },
  { ar: 'س', name: 'Sin', say: 'سِينْ', hint: 'İnce s sesi', dots: 0, joins: true },
  { ar: 'ش', name: 'Şın', say: 'شِينْ', hint: 'Ş sesi', dots: 3, joins: true },
  { ar: 'ص', name: 'Sad', say: 'صَادْ', hint: 'Kalın s sesi', dots: 0, joins: true },
  { ar: 'ض', name: 'Dad', say: 'ضَادْ', hint: 'Kalın d sesi', dots: 1, joins: true },
  { ar: 'ط', name: 'Tı', say: 'طَا', hint: 'Kalın t sesi', dots: 0, joins: true },
  { ar: 'ظ', name: 'Zı', say: 'ظَا', hint: 'Kalın, peltek z sesi', dots: 1, joins: true },
  { ar: 'ع', name: 'Ayn', say: 'عَيْنْ', hint: 'Boğazın ortasından çıkan ses', dots: 0, joins: true },
  { ar: 'غ', name: 'Ğayn', say: 'غَيْنْ', hint: 'Gırtlaktan, gargara sesine benzer ğ', dots: 1, joins: true },
  { ar: 'ف', name: 'Fe', say: 'فَا', hint: 'F sesi', dots: 1, joins: true },
  { ar: 'ق', name: 'Kaf', say: 'قَافْ', hint: 'Kalın k — dilin en gerisinden', dots: 2, joins: true },
  { ar: 'ك', name: 'Kef', say: 'كَافْ', hint: 'İnce k sesi', dots: 0, joins: true },
  { ar: 'ل', name: 'Lam', say: 'لَامْ', hint: 'L sesi', dots: 0, joins: true },
  { ar: 'م', name: 'Mim', say: 'مِيمْ', hint: 'M sesi', dots: 0, joins: true },
  { ar: 'ن', name: 'Nun', say: 'نُونْ', hint: 'N sesi', dots: 1, joins: true },
  { ar: 'و', name: 'Vav', say: 'وَاوْ', hint: 'V sesi; uzatma harfi olarak û', dots: 0, joins: false },
  { ar: 'ه', name: 'He', say: 'هَا', hint: 'Hafif, nefesli h', dots: 0, joins: true },
  { ar: 'ي', name: 'Ye', say: 'يَا', hint: 'Y sesi; uzatma harfi olarak î', dots: 2, joins: true },
];
const LETTER = Object.fromEntries(LETTERS.map(l => [l.ar, l]));

const TAT = 'ـ'; // tatvil (birleştirme çizgisi)
function letterForms(ar) {
  const l = LETTER[ar];
  if (!l.joins) return { tek: ar, bas: ar, orta: TAT + ar, son: TAT + ar };
  return { tek: ar, bas: ar + TAT, orta: TAT + ar + TAT, son: TAT + ar };
}

const SIMILAR_GROUPS = [
  ['ب', 'ت', 'ث', 'ن', 'ي'], ['ج', 'ح', 'خ'], ['د', 'ذ'], ['ر', 'ز'],
  ['س', 'ش'], ['ص', 'ض'], ['ط', 'ظ'], ['ع', 'غ'], ['ف', 'ق'],
];

/* Hece öğeleri: ar = yazılış, read = okunuş, mark = işaret adı */
const SYL = (ar, read, mark, say) => ({ ar, read, mark, say: say || ar });
const HARAKAT = {
  ustun: [SYL('بَ', 'be', 'Üstün'), SYL('تَ', 'te', 'Üstün'), SYL('سَ', 'se', 'Üstün'), SYL('لَ', 'le', 'Üstün'),
          SYL('مَ', 'me', 'Üstün'), SYL('نَ', 'ne', 'Üstün'), SYL('قَ', 'ka', 'Üstün'), SYL('صَ', 'sa', 'Üstün'), SYL('طَ', 'ta', 'Üstün')],
  esre:  [SYL('بِ', 'bi', 'Esre'), SYL('تِ', 'ti', 'Esre'), SYL('سِ', 'si', 'Esre'), SYL('لِ', 'li', 'Esre'),
          SYL('مِ', 'mi', 'Esre'), SYL('نِ', 'ni', 'Esre'), SYL('قِ', 'kı', 'Esre'), SYL('صِ', 'sı', 'Esre'), SYL('طِ', 'tı', 'Esre')],
  otre:  [SYL('بُ', 'bü', 'Ötre'), SYL('تُ', 'tü', 'Ötre'), SYL('سُ', 'sü', 'Ötre'), SYL('لُ', 'lü', 'Ötre'),
          SYL('مُ', 'mü', 'Ötre'), SYL('نُ', 'nü', 'Ötre'), SYL('قُ', 'ku', 'Ötre'), SYL('صُ', 'su', 'Ötre'), SYL('طُ', 'tu', 'Ötre')],
  cezm:  [SYL('مِنْ', 'min', 'Cezm'), SYL('لَمْ', 'lem', 'Cezm'), SYL('قُلْ', 'kul', 'Cezm'), SYL('هُمْ', 'hüm', 'Cezm'),
          SYL('عَنْ', 'an', 'Cezm'), SYL('قَدْ', 'kad', 'Cezm'), SYL('بَلْ', 'bel', 'Cezm'), SYL('كُنْ', 'kün', 'Cezm')],
  sedde: [SYL('إِنَّ', 'inne', 'Şedde'), SYL('ثُمَّ', 'sümme', 'Şedde'), SYL('رَبِّ', 'rabbi', 'Şedde'),
          SYL('كُلُّ', 'küllü', 'Şedde'), SYL('عَمَّ', 'amme', 'Şedde')],
  tenvin: [SYL('بً', 'ben', 'İki üstün'), SYL('بٍ', 'bin', 'İki esre'), SYL('بٌ', 'bün', 'İki ötre'),
           SYL('تً', 'ten', 'İki üstün'), SYL('تٍ', 'tin', 'İki esre'), SYL('تٌ', 'tün', 'İki ötre'),
           SYL('قً', 'kan', 'İki üstün'), SYL('قٍ', 'kın', 'İki esre'), SYL('قٌ', 'kun', 'İki ötre')],
  med:   [SYL('بَا', 'bâ', 'Med'), SYL('بِي', 'bî', 'Med'), SYL('بُو', 'bû', 'Med'),
          SYL('نَا', 'nâ', 'Med'), SYL('نِي', 'nî', 'Med'), SYL('نُو', 'nû', 'Med'),
          SYL('قَا', 'kâ', 'Med'), SYL('قِي', 'kî', 'Med'), SYL('قُو', 'kû', 'Med')],
};
const MARK_INFO = {
  'Üstün': { sign: 'بَ', text: 'Harfin üstündeki eğik çizgi. İnce harflerde "e", kalın harflerde "a" okunur.' },
  'Esre': { sign: 'بِ', text: 'Harfin altındaki eğik çizgi. İnce harflerde "i", kalın harflerde "ı" okunur.' },
  'Ötre': { sign: 'بُ', text: 'Harfin üstündeki küçük vav. İnce harflerde "ü", kalın harflerde "u" okunur.' },
  'Cezm': { sign: 'مِنْ', text: 'Harfin üstündeki küçük yuvarlak. Harf harekesiz okunur ve önceki harfe bağlanır: مِنْ → min.' },
  'Şedde': { sign: 'إِنَّ', text: 'Harfin üstündeki küçük "w" işareti. Harf iki kez okunur: إِنَّ → in-ne.' },
  'İki üstün': { sign: 'بً', text: 'Tenvin: harekeye bir "n" eklenir. İki üstün → "en / an".' },
  'İki esre': { sign: 'بٍ', text: 'Tenvin: iki esre → "in / ın".' },
  'İki ötre': { sign: 'بٌ', text: 'Tenvin: iki ötre → "ün / un".' },
  'Med': { sign: 'بَا', text: 'Uzatma: Elif, Vav ve Ye harekeli harften sonra gelince sesi uzatır: بَا bâ, بِي bî, بُو bû.' },
};

const W = (ar, read, mean) => ({ ar, read, mean, say: ar });
const WORDS1 = [
  W('رَبّ', 'rab', 'Rab, sahip'), W('كِتَاب', 'kitâb', 'kitap'), W('يَوْم', 'yevm', 'gün'), W('دِين', 'dîn', 'din'),
  W('نَاس', 'nâs', 'insanlar'), W('نُور', 'nûr', 'nur, ışık'), W('قَلْب', 'kalb', 'kalp'), W('عِلْم', 'ilm', 'ilim, bilgi'),
  W('مَاء', 'mâ', 'su'), W('شَمْس', 'şems', 'güneş'), W('قَمَر', 'kamer', 'ay'), W('أَرْض', 'arz', 'yer, yeryüzü'),
];
const WORDS2 = [
  W('سَمَاء', 'semâ', 'gök'), W('رَحْمَة', 'rahmet', 'merhamet'), W('سَلَام', 'selâm', 'esenlik, selam'), W('صَلَاة', 'salât', 'namaz'),
  W('حَقّ', 'hak', 'gerçek, hak'), W('جَنَّة', 'cennet', 'cennet, bahçe'), W('خَيْر', 'hayr', 'iyilik, hayır'), W('رَسُول', 'resûl', 'elçi'),
  W('إِلَٰه', 'ilâh', 'ilah, mabud'), W('أَحَد', 'ehad', 'bir, tek'), W('مَلِك', 'melik', 'hükümdar'), W('قُلْ', 'kul', 'de ki'),
];

const BESMELE = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const A = (ar, read, mean) => ({ ar, read, mean });
const SURAHS = {
  fatiha: {
    name: 'Fâtiha', no: 1, besmeleIsAyah: true, ayahs: [
      A('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillâhirrahmânirrahîm', 'Rahmân ve Rahîm olan Allah\'ın adıyla.'),
      A('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'Elhamdü lillâhi rabbil âlemîn', 'Hamd, âlemlerin Rabbi Allah\'a mahsustur.'),
      A('الرَّحْمَٰنِ الرَّحِيمِ', 'Errahmânir rahîm', 'O, Rahmân\'dır, Rahîm\'dir.'),
      A('مَالِكِ يَوْمِ الدِّينِ', 'Mâliki yevmid dîn', 'Din (hesap) gününün sahibidir.'),
      A('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'İyyâke na\'büdü ve iyyâke neste\'în', 'Yalnız sana ibadet eder, yalnız senden yardım dileriz.'),
      A('اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'İhdinas sırâtal müstakîm', 'Bizi dosdoğru yola ilet.'),
      A('صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        'Sırâtallezîne en\'amte aleyhim ğayril mağdûbi aleyhim veled dâllîn',
        'Nimet verdiklerinin yoluna; gazaba uğrayanların ve sapanların yoluna değil.'),
    ],
  },
  ihlas: {
    name: 'İhlâs', no: 112, ayahs: [
      A('قُلْ هُوَ اللَّهُ أَحَدٌ', 'Kul hüvallâhü ehad', 'De ki: O Allah birdir.'),
      A('اللَّهُ الصَّمَدُ', 'Allâhüs samed', 'Allah Samed\'dir; her şey O\'na muhtaçtır, O hiçbir şeye muhtaç değildir.'),
      A('لَمْ يَلِدْ وَلَمْ يُولَدْ', 'Lem yelid ve lem yûled', 'Doğurmamış ve doğurulmamıştır.'),
      A('وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', 'Ve lem yekün lehû küfüven ehad', 'Hiçbir şey O\'na denk değildir.'),
    ],
  },
  kevser: {
    name: 'Kevser', no: 108, ayahs: [
      A('إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', 'İnnâ a\'taynâkel kevser', 'Şüphesiz biz sana Kevser\'i verdik.'),
      A('فَصَلِّ لِرَبِّكَ وَانْحَرْ', 'Fesalli li rabbike venhar', 'O hâlde Rabbin için namaz kıl ve kurban kes.'),
      A('إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', 'İnne şânieke hüvel ebter', 'Asıl soyu kesik olan, sana kin besleyendir.'),
    ],
  },
  felak: {
    name: 'Felak', no: 113, ayahs: [
      A('قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Kul eûzü bi rabbil felak', 'De ki: Sabahın Rabbine sığınırım.'),
      A('مِنْ شَرِّ مَا خَلَقَ', 'Min şerri mâ halak', 'Yarattığı şeylerin kötülüğünden,'),
      A('وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', 'Ve min şerri ğâsikın izâ vekab', 'Karanlığı çöktüğünde gecenin kötülüğünden,'),
      A('وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', 'Ve min şerrin neffâsâti fil ukad', 'Düğümlere üfleyenlerin kötülüğünden,'),
      A('وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', 'Ve min şerri hâsidin izâ hased', 'Ve haset ettiğinde hasetçinin kötülüğünden.'),
    ],
  },
  nas: {
    name: 'Nâs', no: 114, ayahs: [
      A('قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Kul eûzü bi rabbin nâs', 'De ki: İnsanların Rabbine sığınırım,'),
      A('مَلِكِ النَّاسِ', 'Melikin nâs', 'İnsanların Hükümdarına,'),
      A('إِلَٰهِ النَّاسِ', 'İlâhin nâs', 'İnsanların İlahına,'),
      A('مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', 'Min şerril vesvâsil hannâs', 'O sinsi vesvesecinin kötülüğünden;'),
      A('الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', 'Ellezî yüvesvisü fî sudûrin nâs', 'O ki insanların gönüllerine vesvese verir,'),
      A('مِنَ الْجِنَّةِ وَالنَّاسِ', 'Minel cinneti ven nâs', 'Gerek cinlerden gerek insanlardan.'),
    ],
  },
};

const L = (id, title, kind, extra) => Object.assign({ id, title, kind }, extra);
const ar = s => s.split(' ');
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const UNITS = [
  { id: 'u1', title: 'Elif-Ba 1', desc: 'İlk harfler: Elif\'ten Hı\'ya', color: 'green', lessons: [
    L('u1l1', 'Elif, Be, Te, Se', 'letters', { fresh: ar('ا ب ت ث'), pool: ar('ا ب ت ث') }),
    L('u1l2', 'Cim, Ha, Hı', 'letters', { fresh: ar('ج ح خ'), pool: ar('ا ب ت ث ج ح خ') }),
    L('u1l3', 'Tekrar', 'letters', { fresh: [], pool: ar('ا ب ت ث ج ح خ') }),
  ] },
  { id: 'u2', title: 'Elif-Ba 2', desc: 'Dal\'dan Sad\'a', color: 'blue', lessons: [
    L('u2l1', 'Dal, Zel, Ra, Ze', 'letters', { fresh: ar('د ذ ر ز'), pool: ar('د ذ ر ز ا ب') }),
    L('u2l2', 'Sin, Şın, Sad', 'letters', { fresh: ar('س ش ص'), pool: ar('د ذ ر ز س ش ص') }),
    L('u2l3', 'Tekrar', 'letters', { fresh: [], pool: ar('ا ب ت ث ج ح خ د ذ ر ز س ش ص') }),
  ] },
  { id: 'u3', title: 'Elif-Ba 3', desc: 'Dad\'dan Kaf\'a', color: 'purple', lessons: [
    L('u3l1', 'Dad, Tı, Zı', 'letters', { fresh: ar('ض ط ظ'), pool: ar('ض ط ظ ص س') }),
    L('u3l2', 'Ayn, Ğayn, Fe, Kaf', 'letters', { fresh: ar('ع غ ف ق'), pool: ar('ض ط ظ ع غ ف ق') }),
    L('u3l3', 'Tekrar', 'letters', { fresh: [], pool: ar('ص ض ط ظ ع غ ف ق س ش') }),
  ] },
  { id: 'u4', title: 'Elif-Ba 4', desc: 'Kef\'ten Ye\'ye — alfabe tamam!', color: 'orange', lessons: [
    L('u4l1', 'Kef, Lam, Mim', 'letters', { fresh: ar('ك ل م'), pool: ar('ك ل م ق ف') }),
    L('u4l2', 'Nun, Vav, He, Ye', 'letters', { fresh: ar('ن و ه ي'), pool: ar('ك ل م ن و ه ي') }),
    L('u4l3', 'Büyük tekrar', 'letters', { fresh: [], pool: LETTERS.map(l => l.ar) }),
  ] },
  { id: 'u5', title: 'Benzer Harfler', desc: 'Noktalar ve bitişik yazılış', color: 'red', lessons: [
    L('u5l1', 'Noktalara dikkat', 'similar', { groups: [0, 1, 2, 3] }),
    L('u5l2', 'Noktalara dikkat 2', 'similar', { groups: [4, 5, 6, 7, 8] }),
    L('u5l3', 'Bitişik yazılış 1', 'forms', { pool: ar('ب ت ج س ع ف ل م ن ه') }),
    L('u5l4', 'Bitişik yazılış 2', 'forms', { pool: ar('ا د ر و ك ق ص ط ي ش غ ح') }),
  ] },
  { id: 'u6', title: 'Harekeler', desc: 'Üstün, esre, ötre', color: 'blue', lessons: [
    L('u6l1', 'Üstün', 'syll', { marks: ['Üstün'], items: HARAKAT.ustun }),
    L('u6l2', 'Esre', 'syll', { marks: ['Esre'], items: HARAKAT.esre }),
    L('u6l3', 'Ötre', 'syll', { marks: ['Ötre'], items: HARAKAT.otre }),
    L('u6l4', 'Karışık hece', 'syll', { marks: [], items: [...HARAKAT.ustun, ...HARAKAT.esre, ...HARAKAT.otre] }),
  ] },
  { id: 'u7', title: 'Okuma İşaretleri', desc: 'Cezm, şedde, tenvin, med', color: 'green', lessons: [
    L('u7l1', 'Cezm', 'syll', { marks: ['Cezm'], items: HARAKAT.cezm }),
    L('u7l2', 'Şedde', 'syll', { marks: ['Şedde'], items: HARAKAT.sedde }),
    L('u7l3', 'Tenvin', 'syll', { marks: ['İki üstün', 'İki esre', 'İki ötre'], items: HARAKAT.tenvin }),
    L('u7l4', 'Med (uzatma)', 'syll', { marks: ['Med'], items: HARAKAT.med }),
    L('u7l5', 'Tekrar', 'syll', { marks: [], items: [...HARAKAT.cezm, ...HARAKAT.sedde, ...HARAKAT.tenvin, ...HARAKAT.med] }),
  ] },
  { id: 'u8', title: 'Kelimeler 1', desc: 'Kur\'an\'da geçen temel kelimeler', color: 'purple', lessons: [
    L('u8l1', 'Kelimeler 1', 'words', { fresh: WORDS1.slice(0, 4), pool: WORDS1.slice(0, 4) }),
    L('u8l2', 'Kelimeler 2', 'words', { fresh: WORDS1.slice(4, 8), pool: WORDS1.slice(0, 8) }),
    L('u8l3', 'Kelimeler 3', 'words', { fresh: WORDS1.slice(8, 12), pool: WORDS1 }),
  ] },
  { id: 'u9', title: 'Kelimeler 2', desc: 'Sık geçen kavramlar', color: 'orange', lessons: [
    L('u9l1', 'Kavramlar 1', 'words', { fresh: WORDS2.slice(0, 4), pool: WORDS2.slice(0, 4) }),
    L('u9l2', 'Kavramlar 2', 'words', { fresh: WORDS2.slice(4, 8), pool: WORDS2.slice(0, 8) }),
    L('u9l3', 'Kavramlar 3', 'words', { fresh: WORDS2.slice(8, 12), pool: WORDS2 }),
    L('u9l4', 'Kelime tekrarı', 'words', { fresh: [], pool: [...WORDS1, ...WORDS2] }),
  ] },
  { id: 'u10', title: 'Fâtiha Suresi', desc: 'Kur\'an\'ın ilk suresi', color: 'green', lessons: [
    L('u10l1', 'Ayet 1–3', 'surah', { surah: 'fatiha', fresh: range(0, 2), pool: range(0, 2) }),
    L('u10l2', 'Ayet 4–5', 'surah', { surah: 'fatiha', fresh: range(3, 4), pool: range(0, 4) }),
    L('u10l3', 'Ayet 6–7', 'surah', { surah: 'fatiha', fresh: range(5, 6), pool: range(0, 6) }),
    L('u10l4', 'Fâtiha tekrarı', 'surah', { surah: 'fatiha', fresh: [], pool: range(0, 6) }),
  ] },
  { id: 'u11', title: 'İhlâs Suresi', desc: 'Allah\'ın birliği', color: 'blue', lessons: [
    L('u11l1', 'Ayet 1–2', 'surah', { surah: 'ihlas', fresh: range(0, 1), pool: range(0, 1) }),
    L('u11l2', 'Ayet 3–4', 'surah', { surah: 'ihlas', fresh: range(2, 3), pool: range(0, 3) }),
    L('u11l3', 'İhlâs tekrarı', 'surah', { surah: 'ihlas', fresh: [], pool: range(0, 3) }),
  ] },
  { id: 'u12', title: 'Kevser Suresi', desc: 'En kısa sure', color: 'purple', lessons: [
    L('u12l1', 'Ayet 1–3', 'surah', { surah: 'kevser', fresh: range(0, 2), pool: range(0, 2) }),
    L('u12l2', 'Kevser tekrarı', 'surah', { surah: 'kevser', fresh: [], pool: range(0, 2) }),
  ] },
  { id: 'u13', title: 'Felak Suresi', desc: 'Sabahın Rabbine sığınma', color: 'orange', lessons: [
    L('u13l1', 'Ayet 1–3', 'surah', { surah: 'felak', fresh: range(0, 2), pool: range(0, 2) }),
    L('u13l2', 'Ayet 4–5', 'surah', { surah: 'felak', fresh: range(3, 4), pool: range(0, 4) }),
    L('u13l3', 'Felak tekrarı', 'surah', { surah: 'felak', fresh: [], pool: range(0, 4) }),
  ] },
  { id: 'u14', title: 'Nâs Suresi', desc: 'Kur\'an\'ın son suresi', color: 'red', lessons: [
    L('u14l1', 'Ayet 1–3', 'surah', { surah: 'nas', fresh: range(0, 2), pool: range(0, 2) }),
    L('u14l2', 'Ayet 4–6', 'surah', { surah: 'nas', fresh: range(3, 5), pool: range(0, 5) }),
    L('u14l3', 'Nâs tekrarı', 'surah', { surah: 'nas', fresh: [], pool: range(0, 5) }),
  ] },
];
// ---- Ezber (memorisation) units: inserted after each surah's learning unit
const EZ = (surah, name, color) => ({ id: 'ez-' + surah, title: 'Ezber: ' + name, desc: 'Boşlukları doldur, ezberden oku', color, ezber: true, lessons: [
  L('ez-' + surah + '-1', 'Boşluk doldur', 'ezber', { surah, level: 1 }),
  L('ez-' + surah + '-2', 'Eksik kelimeler', 'ezber', { surah, level: 2 }),
  L('ez-' + surah + '-3', 'Ezberden oku', 'ezber', { surah, level: 3 }),
] });
[['u10', 'fatiha', 'Fâtiha', 'orange'], ['u11', 'ihlas', 'İhlâs', 'green'], ['u12', 'kevser', 'Kevser', 'blue'],
 ['u13', 'felak', 'Felak', 'purple'], ['u14', 'nas', 'Nâs', 'green']].forEach(([after, surah, name, color]) => {
  UNITS.splice(UNITS.findIndex(u => u.id === after) + 1, 0, EZ(surah, name, color));
});
const ALL_LESSONS = UNITS.flatMap(u => u.lessons.map(l => Object.assign(l, { unit: u })));
