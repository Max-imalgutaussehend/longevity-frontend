export type MetricBadge = 'quick-win' | 'high-impact' | 'kasse';

export interface MetricEducation {
  title: string;
  summary: string;
  whyItMatters: string;
  optimalRange: string;
  actionableTips: string[];
  badge: MetricBadge;
  sampleHabit: string;
}

export const METRIC_BADGE_LABELS: Record<MetricBadge, string> = {
  'quick-win': 'Quick Win',
  'high-impact': 'High Impact',
  kasse: 'Kassen-Booster',
};

export const METRIC_EDUCATION: Record<string, MetricEducation> = {
  vo2max: {
    title: 'VO₂max',
    summary: 'Die maximale Sauerstoffaufnahme deines Körpers unter Belastung — der stärkste einzelne Prädiktor für Langlebigkeit.',
    whyItMatters: 'VO₂max gilt in der Forschung als einer der aussagekräftigsten Marker für die Gesamtmortalität. Ein niedriger Wert korreliert stärker mit vorzeitigem Tod als Rauchen, Diabetes oder Bluthochdruck.',
    optimalRange: 'Kohortenmittel ca. 42 ml/kg/min. Werte über 45–50 ml/kg/min gelten als sehr gut, unter 30 als erhöhtes Risiko.',
    actionableTips: [
      'Zone-2-Training: 2–3× pro Woche 30–45 Minuten locker bei Nasenatmung (Gespräch noch möglich).',
      'Einmal pro Woche eine kurze hochintensive Einheit (z. B. 4× 4 Minuten nahe Maximalpuls).',
      'Konsequenz vor Intensität: regelmäßige Bewegung schlägt gelegentliche Extremeinheiten.',
    ],
    badge: 'high-impact',
    sampleHabit: 'Absolviere 2× wöchentlich 40 Minuten lockeres Radfahren oder zügiges Gehen bei Nasenatmung.',
  },
  resting_hr: {
    title: 'Ruhepuls',
    summary: 'Herzschläge pro Minute in völliger Ruhe — ein einfacher Spiegel deiner kardiovaskulären Fitness und Erholung.',
    whyItMatters: 'Ein niedriger Ruhepuls zeigt ein effizientes, trainiertes Herz-Kreislauf-System. Chronisch erhöhte Werte sind mit höherem Risiko für Herz-Kreislauf-Erkrankungen assoziiert.',
    optimalRange: 'Kohortenmittel ca. 65 bpm. Sportlich aktive Menschen erreichen oft 45–55 bpm.',
    actionableTips: [
      'Kein Alkohol oder schweres Essen in den letzten 3 Stunden vor dem Schlafen.',
      '2× wöchentlich Zone-2-Training zur Stärkung des Schlagvolumens.',
      'Gezielte Atemübungen (z. B. 4-7-8-Atmung) zur Vagusnerv-Stimulation, 5 Minuten täglich.',
    ],
    badge: 'quick-win',
    sampleHabit: 'Vermeide 3 Stunden vor dem Zubettgehen Alkohol und schwere Mahlzeiten.',
  },
  systolic_bp: {
    title: 'Systol. Blutdruck',
    summary: 'Der obere Blutdruckwert — ein zentraler Risikofaktor für Herzinfarkt und Schlaganfall.',
    whyItMatters: 'Bluthochdruck bleibt oft jahrelang unbemerkt, schädigt aber kontinuierlich Gefäße, Herz und Nieren. Schon moderate Senkungen reduzieren das kardiovaskuläre Risiko deutlich.',
    optimalRange: 'Optimal unter 120 mmHg. Ab 130 mmHg beginnt der Grenzbereich, ab 140 mmHg gilt es klinisch als erhöht.',
    actionableTips: [
      'Kochsalzzufuhr reduzieren — verarbeitete Lebensmittel sind die Hauptquelle.',
      'Regelmäßiges Ausdauertraining (Zone 2) senkt den Ruheblutdruck nachhaltig.',
      'Kalium- und magnesiumreiche Ernährung (Gemüse, Hülsenfrüchte) unterstützt die Gefäßregulation.',
    ],
    badge: 'kasse',
    sampleHabit: 'Reduziere zugesetztes Salz und iss an 5 Tagen pro Woche eine Portion Hülsenfrüchte oder grünes Gemüse.',
  },
  ldl: {
    title: 'LDL-Cholesterin',
    summary: 'Das "schlechte" Cholesterin — zentraler Treiber für Arterienverkalkung (Atherosklerose).',
    whyItMatters: 'Hohe LDL-Werte über Jahre hinweg sind die Hauptursache für Plaquebildung in den Arterien und damit für Herzinfarkt und Schlaganfall.',
    optimalRange: 'Optimal unter 100 mg/dl für die Allgemeinbevölkerung, bei bestehenden Risikofaktoren niedriger.',
    actionableTips: [
      'Gesättigte Fette (fettes Fleisch, Butter) durch ungesättigte Fette (Olivenöl, Nüsse, Fisch) ersetzen.',
      'Löslichen Ballaststoffe (Hafer, Leinsamen) erhöhen die LDL-Ausscheidung.',
      'Regelmäßige Bewegung erhöht gleichzeitig das schützende HDL-Cholesterin.',
    ],
    badge: 'kasse',
    sampleHabit: 'Ersetze einmal täglich eine tierische Fettquelle durch Olivenöl, Nüsse oder fetten Fisch.',
  },
  hdl: {
    title: 'HDL-Cholesterin',
    summary: 'Das "gute" Cholesterin — transportiert überschüssiges Cholesterin zur Leber ab und schützt die Gefäße.',
    whyItMatters: 'Hohe HDL-Werte sind mit einem geringeren kardiovaskulären Risiko assoziiert, da HDL Cholesterin aus den Arterienwänden abtransportiert.',
    optimalRange: 'Über 60 mg/dl gilt als schützend, unter 40 mg/dl (Männer) bzw. 50 mg/dl (Frauen) als Risikofaktor.',
    actionableTips: [
      'Ausdauertraining ist der wirksamste Hebel zur HDL-Steigerung.',
      'Ungesättigte Fette (Olivenöl, Avocado, Nüsse) statt Transfette bevorzugen.',
      'Rauchstopp erhöht HDL messbar innerhalb weniger Wochen.',
    ],
    badge: 'kasse',
    sampleHabit: 'Baue 3× pro Woche mindestens 30 Minuten Ausdauertraining fest in deine Woche ein.',
  },
  hba1c: {
    title: 'HbA1c',
    summary: 'Der Langzeit-Blutzuckerwert der letzten 8–12 Wochen — zentraler Marker für Stoffwechselgesundheit.',
    whyItMatters: 'Chronisch erhöhter Blutzucker schädigt Gefäße, Nerven und Organe lange bevor ein Diabetes diagnostiziert wird. HbA1c erfasst diesen Trend zuverlässiger als eine Einzelmessung.',
    optimalRange: 'Optimal unter 5,7 %. Ab 5,7 % Prädiabetes-Bereich, ab 6,5 % klinischer Diabetes.',
    actionableTips: [
      'Einfache Kohlenhydrate (Weißmehl, Zucker) durch ballaststoffreiche Vollkornprodukte ersetzen.',
      'Nach den Mahlzeiten 10–15 Minuten spazieren gehen, um Blutzuckerspitzen zu glätten.',
      'Krafttraining erhöht die Insulinsensitivität der Muskulatur nachhaltig.',
    ],
    badge: 'high-impact',
    sampleHabit: 'Gehe nach dem größten Essen des Tages 10–15 Minuten spazieren.',
  },
  waist: {
    title: 'Taillenumfang',
    summary: 'Ein direkter Indikator für viszerales (organumschließendes) Fett — stärker mit Risiko verbunden als das Körpergewicht allein.',
    whyItMatters: 'Viszerales Fett ist metabolisch aktiv und fördert Entzündungen, Insulinresistenz und kardiovaskuläres Risiko unabhängig vom BMI.',
    optimalRange: 'Risikoarm unter 94 cm (Männer) bzw. 80 cm (Frauen); deutlich erhöhtes Risiko ab 102 cm bzw. 88 cm.',
    actionableTips: [
      'Kalorienüberschuss vermeiden — viszerales Fett reagiert besonders sensibel auf ein Energiedefizit.',
      'Zone-2-Ausdauertraining ist bei der Reduktion von viszeralem Fett besonders wirksam.',
      'Zucker und Alkohol reduzieren — beide fördern gezielt die Bauchfetteinlagerung.',
    ],
    badge: 'high-impact',
    sampleHabit: 'Reduziere zuckerhaltige Getränke und Alkohol auf maximal 1× pro Woche.',
  },
  sleep_duration: {
    title: 'Schlafdauer',
    summary: 'Die Menge an Schlaf pro Nacht — Basis für Regeneration, Hormonhaushalt und kognitive Leistungsfähigkeit.',
    whyItMatters: 'Chronischer Schlafmangel (unter 6 Stunden) ist mit erhöhtem Risiko für Herz-Kreislauf-Erkrankungen, Gewichtszunahme und beeinträchtigter Immunfunktion verbunden.',
    optimalRange: 'Optimal 7–9 Stunden pro Nacht für die meisten Erwachsenen.',
    actionableTips: [
      'Feste Schlafenszeit einhalten — auch am Wochenende (±30 Minuten).',
      'Bildschirme mindestens 30–60 Minuten vor dem Schlafen meiden (blaues Licht).',
      'Schlafzimmer kühl (16–19 °C) und komplett verdunkelt halten.',
    ],
    badge: 'quick-win',
    sampleHabit: 'Stelle einen festen Wecker für 30 Minuten vor dem Zubettgehen als "Bildschirm-aus"-Erinnerung.',
  },
  sleep_consistency: {
    title: 'Schlafkonsistenz',
    summary: 'Wie regelmäßig deine Schlaf- und Aufwachzeiten sind — misst die Stabilität deines zirkadianen Rhythmus.',
    whyItMatters: 'Unregelmäßiger Schlaf ("sozialer Jetlag") stört die innere Uhr, selbst wenn die Gesamtschlafdauer ausreicht, und ist mit metabolischen und kardiovaskulären Risiken verbunden.',
    optimalRange: 'Aufwach- und Einschlafzeit sollten von Tag zu Tag um weniger als 30–60 Minuten schwanken.',
    actionableTips: [
      'Jeden Tag zur gleichen Zeit aufstehen — auch nach einer kurzen Nacht.',
      'Morgens Tageslicht innerhalb der ersten Stunde nach dem Aufstehen tanken, um die innere Uhr zu stabilisieren.',
      'Wochenend-"Nachschlafen" schrittweise reduzieren, statt komplett verzichten.',
    ],
    badge: 'quick-win',
    sampleHabit: '7 Tage in Folge zur gleichen Uhrzeit (±30 Minuten) aufstehen.',
  },
  hrv_rmssd: {
    title: 'HRV (RMSSD)',
    summary: 'Die Herzfrequenzvariabilität — ein Fenster in die Balance deines autonomen Nervensystems und deinen Erholungsstatus.',
    whyItMatters: 'Eine hohe HRV zeigt eine gute Anpassungsfähigkeit an Stress und effektive Erholung. Niedrige, fallende Werte sind ein Frühwarnzeichen für Übertraining, Krankheit oder chronischen Stress.',
    optimalRange: 'Stark individuell — der eigene Trend über Wochen ist wichtiger als ein absoluter Zielwert. Kohortenmittel ca. 50 ms.',
    actionableTips: [
      'Ausreichend und regelmäßiger Schlaf ist der stärkste Hebel für eine höhere HRV.',
      'Alkohol reduziert die HRV messbar in der Folgenacht — bewusst einplanen.',
      'Regelmäßige Achtsamkeits- oder Atemübungen verbessern die HRV nachweislich.',
    ],
    badge: 'quick-win',
    sampleHabit: 'Praktiziere 3× pro Woche 5 Minuten langsame Bauchatmung vor dem Schlafen.',
  },
  zone2_minutes: {
    title: 'Zone-2-Minuten',
    summary: 'Wöchentliche Trainingszeit im lockeren aeroben Bereich — die Basis für kardiovaskuläre Gesundheit und Fettstoffwechsel.',
    whyItMatters: 'Zone-2-Training verbessert die mitochondriale Dichte und die Fähigkeit des Körpers, Fett als Energiequelle zu nutzen, ohne das Verletzungs- oder Übertrainingsrisiko hochintensiver Einheiten.',
    optimalRange: 'Kohortenmittel ca. 90 Min./Woche. Zielbereich für spürbare Effekte: 120–180 Min./Woche.',
    actionableTips: [
      'Intensität so wählen, dass ein Gespräch noch flüssig möglich ist (Nasenatmung als Faustregel).',
      'Lieber häufiger und kürzer als selten und lang — 3× 40 Minuten schlägt 1× 2 Stunden.',
      'Alltagsbewegungen wie Radfahren zur Arbeit oder zügiges Gehen zählen mit.',
    ],
    badge: 'high-impact',
    sampleHabit: 'Absolviere 2× wöchentlich 40 Minuten lockeres Radfahren oder schnelles Gehen bei Nasenatmung.',
  },
  steps: {
    title: 'Schritte',
    summary: 'Die tägliche Schrittzahl — der niederschwelligste und am besten belegte Hebel für allgemeine Aktivität.',
    whyItMatters: 'Studien zeigen einen deutlichen Rückgang der Gesamtmortalität mit steigender täglicher Schrittzahl, mit abnehmendem Grenznutzen ab ca. 8.000–10.000 Schritten.',
    optimalRange: 'Kohortenmittel ca. 7.500 Schritte/Tag. Zielbereich für spürbare Effekte: 8.000–10.000 Schritte/Tag.',
    actionableTips: [
      'Kurze Wege bewusst zu Fuß statt mit dem Auto zurücklegen.',
      'Telefonate im Gehen führen ("Walking Meetings").',
      'Eine Haltestelle früher aussteigen oder eine Etage weiter parken.',
    ],
    badge: 'quick-win',
    sampleHabit: 'Steigere deine tägliche Schrittzahl in 7 Tagen schrittweise auf mindestens 7.500 Schritte.',
  },
  strength_sessions: {
    title: 'Krafteinheiten',
    summary: 'Wöchentliche Trainingseinheiten mit Widerstand — essenziell für Muskelmasse, Knochendichte und Stoffwechsel im Alter.',
    whyItMatters: 'Muskelmasse ist ein starker Prädiktor für funktionale Unabhängigkeit im Alter. Krafttraining wirkt zudem osteoporose- und sarkopenieprotektiv und verbessert die Insulinsensitivität.',
    optimalRange: 'Kohortenmittel ca. 1×/Woche. Zielbereich für spürbare Effekte: 2–3× pro Woche mit allen großen Muskelgruppen.',
    actionableTips: [
      'Grundübungen bevorzugen (Kniebeuge, Kreuzheben, Drücken, Ziehen) statt Isolationsübungen.',
      'Progressive Steigerung: Gewicht oder Wiederholungen alle 1–2 Wochen leicht erhöhen.',
      'Auch Körpergewichtsübungen zu Hause zählen — Konsequenz schlägt Equipment.',
    ],
    badge: 'high-impact',
    sampleHabit: 'Plane 2 feste Krafttraining-Termine pro Woche fest in deinen Kalender ein.',
  },
  smoking: {
    title: 'Rauchen',
    summary: 'Rauchstatus — einer der stärksten einzelnen Risikofaktoren für praktisch jede Volkskrankheit.',
    whyItMatters: 'Rauchen erhöht das Risiko für Herz-Kreislauf-Erkrankungen, Krebs und Atemwegserkrankungen drastisch. Ein Rauchstopp bringt bereits innerhalb weniger Wochen messbare Verbesserungen.',
    optimalRange: 'Zielwert: Nichtraucher.',
    actionableTips: [
      'Professionelle Unterstützung nutzen — Rauchentwöhnungsprogramme verdoppeln die Erfolgsquote.',
      'Auslöser identifizieren und durch alternative Routinen ersetzen.',
      'Krankenkassen übernehmen oft Kosten für Entwöhnungsprogramme — beim Anbieter nachfragen.',
    ],
    badge: 'kasse',
    sampleHabit: 'Informiere dich diese Woche über ein von deiner Krankenkasse bezuschusstes Entwöhnungsprogramm.',
  },
  alcohol_units: {
    title: 'Alkohol',
    summary: 'Wöchentlicher Alkoholkonsum in Standardeinheiten — beeinflusst Schlaf, Leber, HRV und Langzeitrisiko.',
    whyItMatters: 'Alkohol stört die Schlafarchitektur, senkt die HRV in der Folgenacht und ist ab bestimmten Mengen mit erhöhtem Risiko für Lebererkrankungen und bestimmte Krebsarten verbunden.',
    optimalRange: 'Je weniger, desto risikoärmer — als grobe Orientierung gelten unter 7 Einheiten/Woche als niedrig.',
    actionableTips: [
      'Alkoholfreie Tage bewusst in die Woche einplanen (z. B. unter der Woche).',
      'Alternativen wie alkoholfreies Bier oder Kombucha bei sozialen Anlässen bereithalten.',
      'Konsum vor dem Schlafen besonders reduzieren — der Effekt auf die Schlafqualität ist am größten.',
    ],
    badge: 'quick-win',
    sampleHabit: 'Lege 3 feste alkoholfreie Tage pro Woche fest.',
  },
  hscrp: {
    title: 'hsCRP',
    summary: 'Hochsensitives C-reaktives Protein — ein Marker für stille, systemische Entzündung im Körper.',
    whyItMatters: 'Chronisch niedriggradige Entzündung ("Inflammaging") ist an der Entstehung von Arteriosklerose, Diabetes und vielen altersbedingten Erkrankungen beteiligt.',
    optimalRange: 'Optimal unter 1,0 mg/l. Ab 3,0 mg/l gilt das kardiovaskuläre Risiko als erhöht.',
    actionableTips: [
      'Entzündungshemmende Ernährung: viel Gemüse, Omega-3-reicher Fisch, wenig verarbeitete Lebensmittel.',
      'Regelmäßige moderate Bewegung senkt CRP nachweislich, Übertraining kann es erhöhen.',
      'Ausreichend Schlaf und Stressmanagement reduzieren die systemische Entzündungslast.',
    ],
    badge: 'kasse',
    sampleHabit: 'Ergänze 2× pro Woche eine Portion fetten Fisch (Lachs, Makrele) auf deinem Speiseplan.',
  },
};

export function getMetricEducation(metric: string): MetricEducation | undefined {
  return METRIC_EDUCATION[metric];
}
