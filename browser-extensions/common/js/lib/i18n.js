// This attempts to provide an interface for the code to be common, and yet
// still work across all of the parkrun sites
// Although most of the content is still in English, such as the parkrun names

// Volunteer roles are in the language of the person who signed up,
// so a Russian parkrunner who has done volunteering will have all their roles
// listed in Russian even if they are fetched from the .org.uk website

// Known Roles:
// "Equipment Storage and Delivery"
// "Communications Person"
// "Volunteer Co-ordinator"
// "Pre-event Setup"
// "First Timers Welcome"
// "Sign Language Support"
// "Marshal"
// "Tail Walker"
// "Run Director"
// "Lead Bike"
// "Pacer (5k only)"
// "VI Guide"
// "Photographer"
// "Timekeeper"
// "Backup Timer"
// "Funnel Manager"
// "Finish Tokens"
// "Finish Token Support"
// "Barcode Scanning"
// "Number Checker"
// "Post-event Close Down"
// "Results Processor"
// "Token Sorting"
// "Report Writer"
// "Other"
// Warm Up (Juniors)
//
// New for 2018
// Car Park Marshal
//
// New for 2022
// parkwalker
var domains = {
    // Default english language options, good for most of the domains
    "default": {
        "url_athleteeventresultshistory": "results/athleteeventresultshistory/",
        "table_all_results": "All Results",
        "link_view_stats_for_all_parkruns": "View stats for all parkruns by this athlete",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "View stats for all parkruns by this athlete",
        "link_all": "All",
        // These variables contain text we output, so need translating by someone
        "text_see_challenge_progress": "See challenge progress",
        "text_running_challenges": "Running Challenges",
        // Volunteer roles are in ENGLISH
        "text_volunteer_role_map": {
            "Equipment Storage and Delivery": "Equipment Storage and Delivery",
            "Communications Person": "Communications Person",
            "Volunteer Co-ordinator": "Volunteer Co-ordinator",
            "Pre-event Setup": "Pre-event Setup",
            "First Timers Welcome": "First Timers Welcome",
            "Sign Language Support": "Sign Language Support",
            "Marshal": "Marshal",
            "Tail Walker": "Tail Walker",
            "Run Director": "Run Director",
            "Lead Bike": "Lead Bike",
            "Pacer (5k only)": "Pacer (5k only)",
            "VI Guide": "VI Guide",
            "Photographer": "Photographer",
            "Timekeeper": "Timekeeper",
            "Backup Timer": "Backup Timer",
            "Funnel Manager": "Funnel Manager",
            "Finish Tokens": "Finish Tokens",
            "Finish Token Support": "Finish Token Support",
            "Barcode Scanning": "Barcode Scanning",
            "Number Checker": "Number Checker",
            "Post-event Close Down": "Post-event Close Down",
            "Results Processor": "Results Processor",
            "Token Sorting": "Token Sorting",
            "Report Writer": "Report Writer",
            "Other": "Other",
            "Warm Up Leader (junior events only)": "Warm Up Leader (junior events only)",
            "Warm Up Leader": "Warm Up Leader",
            "Car Park Marshal": "Car Park Marshal",
            "Event Day Course Check": "Event Day Course Check",
            "parkwalker": "parkwalker"
        }
    },
    "www.parkrun.pl": {
        // Polish pages
        // http://www.parkrun.pl/warszawa-ursynow/rezultaty/athletehistory/?athleteNumber=546975
        // http://www.parkrun.pl/rezultaty/athleteresultshistory/?athleteNumber=546975
        // http://www.parkrun.pl/rezultaty/athleteeventresultshistory/?athleteNumber=546975&eventNumber=0
        // https://www.parkrun.pl/rezultaty/athleteeventresultshistory/?athleteNumber=3859211&eventNumber=0
        //"table_all_results": "Wszystkie rezultaty",
        "table_all_results": "Ukończone edycje parkrun",
        "link_view_stats_for_all_parkruns": "Zobacz statystyki uczestnika ze wszystkich biegów parkrun",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Zobacz wyniki tego zawodnika ze wszystkich biegów",
        "text_volunteer_role_map": {
            "Przechowanie sprzętu": "Equipment Storage and Delivery",
            "Przechowując(a)y wyposażenie": "Equipment Storage and Delivery",
            "Komunikacja i promocja": "Communications Person",
            "Koordynator woluntariuszy": "Volunteer Co-ordinator",
            "Koordynator wolontariuszy": "Volunteer Co-ordinator",
            "Ustawienie elementów trasy": "Pre-event Setup",
            "Rozstawienie oznakowań": "Pre-event Setup",
            "Rozstawiając(a)y oznakowanie": "Pre-event Setup",
            "Instruktor nowych uczestników": "First Timers Welcome",
            "Odprawa debiutantów": "First Timers Welcome",
            "Tłumacz(ka) języka migowego": "Sign Language Support",
            "Ubezpieczanie trasy": "Marshal",
            "Ubezpieczając(a)y trasę": "Marshal",
            "Zamykanie stawki": "Tail Walker",
            "Zamykając(a)y stawkę": "Tail Walker",
            "Koordynator spotkania": "Run Director",
            "Koordynator(ka) spotkania": "Run Director",
            "Rower bezpieczeństwa": "Lead Bike",
            "Wyznaczanie tempa": "Pacer (5k only)",
            "Przewodnik dla słabowidzących": "VI Guide",
            "Fotograf": "Photographer",
            "Pomiar czasu": "Timekeeper",
            "Mierząc(a)y czas": "Timekeeper",
            "Zapasowy pomiar czasu": "Backup Timer",
            "Pomiar czasu (dodatkowy)": "Backup Timer",
            "Koordynator tunelu mety": "Funnel Manager",
            "Wręczanie tokenów na mecie": "Finish Tokens",
            "Wydając(a)y tokeny": "Finish Tokens",
            "Pomoc przy wręczaniu tokenów": "Finish Token Support",
            "Pomocnik wydające(j)go tokeny": "Finish Token Support",
            "Skanowanie uczestników": "Barcode Scanning",
            "Skanując(a)y uczestników": "Barcode Scanning",
            "Sprawdzając(a)y pozycje na mecie": "Number Checker",
            "Zbieranie elementów z trasy": "Post-event Close Down",
            "Zbierając(a)y oznakowanie": "Post-event Close Down",
            "Wprowadzanie wyników": "Results Processor",
            "Wprowadzając(a)y wyniki": "Results Processor",
            "Sortowanie tokenów": "Token Sorting",
            "Sortując(a)y tokeny": "Token Sorting",
            "Przygotowanie raportu z biegu": "Report Writer",
            "Przygotowując(a)y raport": "Report Writer",
            "Inne": "Other",
            // "Prowadzący rozgrzewkę": "Warm Up Leader (junior events only)", // Not applicable for parkrun in poland
            "Koordynator(ka) parkingu": "Car Park Marshal",
            "Sprawdzenie trasy przed spotkaniem": "Event Day Course Check",
            "Sprawdzając(a)y trasę": "Event Day Course Check",
            "parkwalker": "parkwalker"
        }
    },
    "www.parkrun.it": {
        // Italian pages
        // http://www.parkrun.it/etna/results/athletehistory/?athleteNumber=3868619
        // http://www.parkrun.it/results/athleteresultshistory/?athleteNumber=3868619
        // http://www.parkrun.it/results/athleteeventresultshistory?athleteNumber=3868619&eventNumber=0
        "table_all_results": "Tutti i risultati",
        "link_view_stats_for_all_parkruns": "Visualizza statistiche per tutti i parkruns di questo atleta",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Visualizza statistiche per tutti i parkruns di questo atleta",
        "text_volunteer_role_map": {
            "Addetto magazzino e forniture": "Equipment Storage and Delivery",
            "Addetto comunicazioni": "Communications Person",
            "Coordinatore volontari": "Volunteer Co-ordinator",
            "Preparazione evento": "Pre-event Setup",
            "Benvenuto ai nuovi partecipanti": "First Timers Welcome",
            "Interprete lingua dei segni": "Sign Language Support",
            "Marshal": "Marshal",
            "Camminatore di coda": "Tail Walker",
            "Direttore di Corsa": "Run Director",
            "Ciclista apripista": "Lead Bike",
            "Pacer": "Pacer (5k only)",
            "Guida non vedenti": "VI Guide",
            "Fotografo": "Photographer",
            "Cronometrista": "Timekeeper",
            // "Backup Timer": "Backup Timer",
            "Addetto imbuto arrivo": "Funnel Manager",
            "Addetto token": "Finish Tokens",
            "Aiuto distribuzione token": "Finish Token Support",
            "Addetto scanner": "Barcode Scanning",
            "Controllo posizioni": "Number Checker",
            "Chiusura evento": "Post-event Close Down",
            "Elaboratore risultati": "Results Processor",
            "Sistemazione token": "Token Sorting",
            "Addetto report finale": "Report Writer",
            "Altro": "Other",
            // "Warm Up Leader (junior events only)": "Warm Up Leader (junior events only)"
            "Addetto parcheggio": "Car Park Marshal",
            "Controllo percorso nel giorno dell'evento": "Event Day Course Check",
            "passeggiatore": "parkwalker"
        }

    },
    "www.parkrun.dk": {
        // Danish pages
        // http://www.parkrun.dk/amagerstrandpark/results/athletehistory/?athleteNumber=3287153
        // http://www.parkrun.dk/results/athleteresultshistory/?athleteNumber=3287153
        // https://www.parkrun.dk/parkrunner/3287153/all/
        "table_all_results": "Alle resultater",
        "link_view_stats_for_all_parkruns": "Se tal for alle parkruns løbet af denne løber",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Se tal for alle parkruns løbet af denne løber",
        "text_volunteer_role_map": {
            "Udstyr – opbevaring og levering": "Equipment Storage and Delivery",
            "Kommunikation": "Communications Person",
            "Hjælperkoordinering": "Volunteer Co-ordinator",
            "Skiltning": "Pre-event Setup",
            "Vejledning": "First Timers Welcome",
            "Tegnsprogs tolk": "Sign Language Support",
            "Officials": "Marshal",
            "Gående bagtrop": "Tail Walker",
            "Løbsleder": "Run Director",
            "Cykel": "Lead Bike",
            "Fartholder": "Pacer (5k only)",
            "Ledsagere for synshandicappede": "VI Guide",
            "Fotograf": "Photographer",
            "Tidtager": "Timekeeper",
            "Sekunders tidtagning": "Backup Timer",
            "Slusestyring": "Funnel Manager",
            "Talonuddeling": "Finish Tokens",
            "Talonassistent": "Finish Token Support",
            "Resultatregistrering": "Barcode Scanning",
            "Talonkontrol": "Number Checker",
            "Opstilling": "Post-event Close Down",
            "Administration": "Results Processor",
            "Talonopsamling": "Token Sorting",
            "Journalist": "Report Writer",
            "Andet": "Other",
            // "Warm Up Leader (junior events only)": "Warm Up Leader (junior events only)"
            "Parkeringsvagt": "Car Park Marshal",
            "Ruteinspektion på løbsdagen": "Event Day Course Check",
            "parkwalker": "parkwalker"
        }
    },
    "www.parkrun.se": {
        // Swedish pages
        // http://www.parkrun.se/orebro/results/athletehistory/?athleteNumber=3899897
        // http://www.parkrun.se/results/athleteresultshistory/?athleteNumber=3899897
        // https://www.parkrun.se/parkrunner/3899897/all/
        "table_all_results": "Alla resultat",
        "link_view_stats_for_all_parkruns": "Se statistik för alla parkruns av denna löpare",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Se statistik för alla parkruns av denna löpare",
        "text_volunteer_role_map": {
            "Material - förvaring och leverans": "Equipment Storage and Delivery",
            "Kommunikationsansvarig": "Communications Person",
            "Volontäransvarig": "Volunteer Co-ordinator",
            "Ansvarig för att sätta upp banan": "Pre-event Setup",
            "Informationsansvarig för förstagångslöpare": "First Timers Welcome",
            "Teckenspråk assistent": "Sign Language Support",
            "Funktionär": "Marshal",
            "Sistagångare": "Tail Walker",
            "Loppansvarig": "Run Director",
            "Förcyklist": "Lead Bike",
            "Farthållare": "Pacer (5k only)",
            "Ledsagare för synskadad": "VI Guide",
            "Fotograf": "Photographer",
            "Tidtagare": "Timekeeper",
            // "Backup Timer": "Backup Timer",
            "Målfållaansvarig": "Funnel Manager",
            "Pollettutdelare": "Finish Tokens",
            "Pollettutdelare assistent": "Finish Token Support",
            "Streckkod scanning": "Barcode Scanning",
            "Nummerkontrollant": "Number Checker",
            "Ansvarig för att ta ner banan": "Post-event Close Down",
            "Resultatsansvarig": "Results Processor",
            "Pollettsorterare": "Token Sorting",
            "Journalist": "Report Writer",
            "Övrigt": "Other",
            "Ledare för uppvärmning": "Warm Up Leader (junior events only)",
            "Parkeringsvakt": "Car Park Marshal",
            "Bankontroll på eventdagen": "Event Day Course Check",
            "parkwalker": "parkwalker"
        }
    },
    "www.parkrun.fi": {
        // Finnish pages
        // http://www.parkrun.fi/tampere/results/athletehistory/?athleteNumber=4064283
        // http://www.parkrun.fi/results/athleteresultshistory/?athleteNumber=4064283
        // https://www.parkrun.fi/parkrunner/4064283/all/
        // It is all in English
    },
    "www.parkrun.fr": {
        // French pages
        // http://www.parkrun.fr/boisdeboulogne/results/athletehistory/?athleteNumber=422364
        // http://www.parkrun.fr/results/athleteresultshistory/?athleteNumber=422364
        // https://www.parkrun.fr/parkrunner/2769739/all/
        "table_all_results": "Toutes les participations",
        "link_view_stats_for_all_parkruns": "Consulter les stats de cet athlète tous parkruns confondus",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Consulter les stats de cet athlète tous parkruns confondus",
        // Volunteer roles are in FRENCH (A582667)
        "text_volunteer_role_map": {
            "Rangement & Mise à disposition de l'équipement": "Equipment Storage and Delivery",
            "Responsable communication": "Communications Person",
            "Coordinateur des bénévoles": "Volunteer Co-ordinator",
            "Balisage du parcours": "Pre-event Setup",
            "Briefing des nouveaux participants": "First Timers Welcome",
            "Assistance langage des signes": "Sign Language Support",
            "Aiguilleur": "Marshal",
            "Fermeur marcheur": "Tail Walker",
            "Responsable du run": "Run Director",
            "Vélo de tête": "Lead Bike",
            "Lièvre": "Pacer (5k only)",
            "Guide déficient visuel": "VI Guide",
            "Photographe": "Photographer",
            "Responsable chrono": "Timekeeper",
            "Chronomètre de secours": "Backup Timer",
            "Gestion SAS": "Funnel Manager",
            "Distribution des jetons": "Finish Tokens",
            "Assistant distribution des jetons": "Finish Token Support",
            "Scannage des codes-barres": "Barcode Scanning",
            "Vérification des jetons": "Number Checker",
            "Débalisage du parcours": "Post-event Close Down",
            "Mise en ligne des participations": "Results Processor",
            "Classement des jetons": "Token Sorting",
            "Rédacteur du compte-rendu": "Report Writer",
            "Autre": "Other",
            "Leader d'échauffement": "Warm Up Leader (junior events only)",
            "Aiguilleur parking": "Car Park Marshal",
            "Verification du Parcours - Jour de l'évènement": "Event Day Course Check",
            "promeneur": "parkwalker"
        }
    },
    "www.parkrun.com.de": {
        // German pages
        // http://www.parkrun.com.de/georgengarten/results/athletehistory/?athleteNumber=4099000
        // http://www.parkrun.com.de/results/athleteresultshistory/?athleteNumber=4099000
        // https://www.parkrun.com.de/parkrunner/4099000/all/
        "table_all_results": "Alle Ergebnisse bei",
        "link_view_stats_for_all_parkruns": "Statistiken für alle Läufe dieses Athleten ansehen",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Statistiken für alle Läufe dieses Athleten ansehen",
        // Volunteer roles are in GERMAN (A4029732)
        "text_volunteer_role_map": {
            "Ausrüstung Lagerung und Lieferung": "Equipment Storage and Delivery",
            "Kommunikation": "Communications Person",
            "Helfer Koordinator": "Volunteer Co-ordinator",
            "Veranstaltung Aufbau": "Pre-event Setup",
            "Einweiser für Erstläufer": "First Timers Welcome",
            "Zeichensprache Unterstützung": "Sign Language Support",
            "Streckenposten": "Marshal",
            "Schlussbegleitung": "Tail Walker",
            "Veranstaltungsleiter": "Run Director",
            "Führungs-Fahrrad": "Lead Bike",
            "Tempoläufer": "Pacer (5k only)",
            "Begleiter für Sehbehinderte": "VI Guide",
            "Fotograf": "Photographer",
            "Zeitnehmer": "Timekeeper",
            // "Backup Timer": "Backup Timer",
            "Leiter Einlaufgasse": "Funnel Manager",
            "Platzierungskarten Ausgabe": "Finish Tokens",
            "Helfer Platzierungskarten Ausgabe": "Finish Token Support",
            "Barcode Einleser": "Barcode Scanning",
            "Nummern-Kontrolleur": "Number Checker",
            "Veranstaltung Abbau": "Post-event Close Down",
            "Ergebnis Auswerter": "Results Processor",
            "Platzierungskarten Verwaltung": "Token Sorting",
            "Berichterstattung": "Report Writer",
            "andere Aufgaben": "Other",
            "Aufwärmgymnastik": "Warm Up Leader (junior events only)",
            "Parkplatzeinweisung": "Car Park Marshal",
            "parkwanderer": "parkwalker"
        }
    },
    "www.parkrun.no": {
        // Norweigen pages
        // http://www.parkrun.no/toyen/results/athletehistory/?athleteNumber=4370177
        // http://www.parkrun.no/results/athleteresultshistory/?athleteNumber=4370177
        // https://www.parkrun.no/parkrunner/4370177/all/
        // It's all in English
        // Volunteer roles are in ENGLISH
    },
    "www.parkrun.ru": {
        // Russian pages
        // http://www.parkrun.ru/bitsa/results/athletehistory/?athleteNumber=1551222
        // http://www.parkrun.ru/results/athleteresultshistory/?athleteNumber=1551222
        // https://www.parkrun.ru/parkrunner/1551222/all/
        // Randomly partly in English
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Показать статистику этого спортсмена по всем забегам",
        "table_all_results": "Все результаты",
        // Volunteer roles are in RUSSIAN (A1551222)
        "text_volunteer_role_map": {
            "Хранение и доставка оборудования": "Equipment Storage and Delivery",
            "Связи с общественностью": "Communications Person",
            "Координация волонтёров": "Volunteer Co-ordinator",
            "Подготовка забега": "Pre-event Setup",
            "Инструктаж новых бегунов": "First Timers Welcome",
            "Сурдопереводчик": "Sign Language Support",
            "Маршал": "Marshal",
            "Замыкающий": "Tail Walker",
            "Руководитель забега": "Run Director",
            "Ведущий велосипед": "Lead Bike",
            "Пейсер": "Pacer (5k only)",
            "Поводырь": "VI Guide",
            "Фотограф": "Photographer",
            "Секундомер": "Timekeeper",
            "Запасной секундомер": "Backup Timer",
            "Организация финиша": "Funnel Manager",
            "Раздача карточек позиций": "Finish Tokens",
            "Помощь в раздаче карточек позиций": "Finish Token Support",
            "Сканирование штрих-кодов": "Barcode Scanning",
            "Проверка карточек позиций": "Number Checker",
            "Закрытие забега": "Post-event Close Down",
            "Обработка результатов": "Results Processor",
            "Сортировка карточек": "Token Sorting",
            "Составление отчёта": "Report Writer",
            "Разное": "Other",
            "Проведение разминки": "Warm Up Leader (junior events only)",
            "Координатор парковки": "Car Park Marshal",
            "парковщик": "parkwalker"
        }
    },
    "www.parkrun.my": {
        // Malaysian pages
        // http://www.parkrun.my/tamanpuduulu/results/athletehistory/?athleteNumber=4493261
        // The following two pages do not exist, and the links to them are dead.
        // I wonder if this is just new-website teething problems, or an
        // intentional action
        // http://www.parkrun.my/results/athleteresultshistory/?athleteNumber=4493261
        // https://www.parkrun.my/parkrunner/4493261/all/
        // It's all in English, so all links should work as-is
        // Volunteer roles are in ENGLISH
    },
    "www.parkrun.jp": {
        // Japan pages
        // http://www.parkrun.jp/futakotamagawa/results/athletehistory/?athleteNumber=4493261
        // http://www.parkrun.jp/results/athleteresultshistory/?athleteNumber=4493261
        // https://www.parkrun.jp/parkrunner/4493261/all/
        // It's all in Japanese, nothing will work without translations!
        "table_all_results": "すべての結果",
        "link_view_stats_for_all_parkruns": "この登録者のすべてのparkrunの記録を見る。",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "この登録者のすべてのparkrunの記録を見る。",
        // Volunteer roles are in JAPANESE largely provided by Bill Steffancin (A4782624) via email
        "text_volunteer_role_map": {
            "ランディレクター": "Run Director",
            "タイム計測係": "Timekeeper",
            "着順トークン整理係": "Token Sorting",
            "結果集計係": "Results Processor",
            "カメラマン": "Photographer",
            "連絡対応係": "Communications Person",
            "コース誘導係": "Marshal",
            "イベント準備係": "Pre-event Setup",
            "用具管理係": "Equipment Storage and Delivery",
            "その他": "Other",
            "バーコード・スキャン係": "Barcode Scanning",
            "イベント後片付け係": "Post-event Close Down",
            "着順トークン配布係": "Finish Tokens",
            "着順確認係": "Number Checker",
            "初参加者歓迎係": "First Timers Welcome",
            "フィニッシュ後サポート係": "Funnel Manager",
            "先導バイク": "Lead Bike",
            "着順トークン配布補助係": "Finish Token Support",
            "最後尾確認係": "Tail Walker",
            "ボランティア・コーディネーター": "Volunteer Co-ordinator",
            "レポート作成係": "Report Writer",
            "ペースメーカー": "Pacer (5k only)",
            "Do Not Translate": "Backup Timer",
            "VIガイド": "VI Guide",
            "ウォームアップ・リーダー（ジュニアイベントのみ）": "Warm Up Leader (junior events only)",
            "手話サポート": "Sign Language Support",
            "駐車場整理係": "Car Park Marshal",
            "コース状況確認係": "Event Day Course Check",
            "当日コース状況確認係": "Event Day Course Check",
            "パークウォーカー": "parkwalker"
        }
    },
    "www.parkrun.co.nl": {
        "table_all_results": "Alle resultaten",
        "link_view_stats_for_all_parkruns": "Bekijk de statistieken van alle parkruns voor deze parkrunner",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Bekijk de statistieken van alle parkruns voor deze parkrunner",
        // Volunteer roles are in DUTCH
        "text_volunteer_role_map": {
            "Evenementleider": "Run Director",
            "Tijdwaarnemer": "Timekeeper",
            "Tokensorteerder": "Token Sorting",
            "Resultaatverwerking": "Results Processor",
            "Fotograaf": "Photographer",
            "Communicatiepersoon": "Communications Person",
            "Routeregelaar": "Marshal",
            "Opbouw evenement": "Pre-event Setup",
            "Materiaalbeheerder": "Equipment Storage and Delivery",
            "Anders": "Other",
            "Barcodescanner": "Barcode Scanning",
            "Afbouw evenement": "Post-event Close Down",
            "Uitdeler tokens": "Finish Tokens",
            "Controle nummers": "Number Checker",
            "Briefing nieuwe lopers": "First Timers Welcome",
            "Fuikregelaar": "Funnel Manager",
            "Kopfietser": "Lead Bike",
            "Assistent tokens": "Finish Token Support",
            "Sluitloper": "Tail Walker",
            "Coördinator vrijwilligers": "Volunteer Co-ordinator",
            "Loopverslag": "Report Writer",
            "Pacer": "Pacer (5k only)",
            "Buddy slechtziende loper": "VI Guide",
            "Gebarentolk": "Sign Language Support",
            "Parkeerregelaar": "Car Park Marshal",
            "Routecontroleur": "Event Day Course Check",
            "parkwandelaar": "parkwalker"
        }
    },
    "www.parkrun.co.at": {
        // Using German translation
        "table_all_results": "Alle Ergebnisse bei",
        "link_view_stats_for_all_parkruns": "Statistiken für alle Läufe dieses Athleten ansehen",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Statistiken für alle Läufe dieses Athleten ansehen",
        // Volunteer roles are in GERMAN (A4029732)
        "text_volunteer_role_map": {
            "Ausrüstung Lagerung und Lieferung": "Equipment Storage and Delivery",
            "Kommunikation": "Communications Person",
            "Koordination Helfer*innen": "Volunteer Co-ordinator",
            "Ausrüstung Aufbau": "Pre-event Setup",
            "Einweisung für Erstläufer*innen": "First Timers Welcome",
            "Gebärdensprache Unterstützung": "Sign Language Support",
            "Streckenposten": "Marshal",
            "Schlussbegleitung": "Tail Walker",
            "Laufleitung": "Run Director",
            "Führungs-Fahrrad": "Lead Bike",
            "Tempoläufer*in": "Pacer (5k only)",
            "Begleitung für Sehbehinderte": "VI Guide",
            "Fotos": "Photographer",
            "Zeitnehmer": "Timekeeper",
            // "Backup Timer": "Backup Timer",
            "Leitung Einlaufgasse": "Funnel Manager",
            "Zielmarkenausgabe": "Finish Tokens",
            "Zielmarken Unterstützung": "Finish Token Support",
            "Barcode einlesen": "Barcode Scanning",
            "Nummern-Kontrolle": "Number Checker",
            "Ausrüstung Abbau": "Post-event Close Down",
            "Ergebnisauswertung": "Results Processor",
            "Zielmarkenverwaltung": "Token Sorting",
            "Berichterstattung": "Report Writer",
            "andere Aufgaben": "Other",
            // "Aufwärmgymnastik": "Warm Up Leader (junior events only)", // Not applicable for parkruns in Austria (it actually says Germany)
            "Parkplatzeinweisung": "Car Park Marshal",
            "Streckenprüfung am parkrun-Tag": "Event Day Course Check",
            "parkwanderer": "parkwalker"
        }
    },
}

function get_localised_value(param, domain=location.host) {
    // Strip any leading http[s] protocol off the front of the domain
    var domain = domain.replace(/^https?:\/\//,'')
    if (domain in domains) {
        if (param in domains[domain]) {
            console.log("I18N:"+param+":"+domains[domain][param])
            return domains[domain][param]
        }
    }
    return get_localised_default_value(param)
}

function get_localised_default_value(param) {
    console.log("I18N:"+param+":"+domains.default[param])
    return domains.default[param]
}

function get_normalised_volunteer_role(role) {
    var mapped_role = null
    $.each(domains, function(domain, mappings) {
        if ("text_volunteer_role_map" in mappings) {
            if (role in mappings.text_volunteer_role_map) {
                mapped_role = mappings.text_volunteer_role_map[role]
                // Break out of the loop
                return false
            }
        }
    })
    if (mapped_role === null) {
        console.log("I18N: UNKNOWN VOLUNTEER ROLE: "+role)
        mapped_role = role // allow for parkrun to add new roles
    } else {
        if (role != mapped_role) {
            // console.log("I18N: mapped "+role+" to "+mapped_role)
        }
    }
    return mapped_role
}
