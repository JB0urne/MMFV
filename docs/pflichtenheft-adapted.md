# MMFV – Pflichtenheft (adaptiert)

Stand: abgeleitet aus `pflichtenheft.txt` (Langfrist-Vision) und `pflichtenheft2.txt` (aktueller Backlog), abgeglichen mit der bestehenden Implementierung (Angular + NestJS + SQLite, TMDB-Proxy).

Dieses Dokument ersetzt die technischen Altangaben (IMDb-first, alte URL-Pfade ohne `/api`, leere Vergleichskapitel, veraltetes Datenbankschema). Die Originaldateien bleiben unverändert.

---

## 1. Zielstellung

Ziel ist eine Webseite zur Publikation einer Filmliste und zum Finden des nächsten Films für die Abendunterhaltung – mit Fokus auf kurzen Infos und Trailern statt langer Kritiken.

In späteren Versionen: reichhaltigere Film-Details und Trailer, eigene Listen, Bewertungen und Empfehlungen von anderen Nutzern.

---

## 2. Produktvision & Einführungstext

*(für die „?“-About-Seite, inhaltlich aus dem Original übernommen; nicht unter ⚙)*

Kein Blog mit langen Reviews, sondern Anregungen, wenn man spontan etwas schauen will. Auf der Startseite eine Filmliste mit den wichtigsten Infos (Darstellung anpassbar). Klick führt zu Details, darunter zu Trailern. Von Film zu Film bzw. Trailer zu Trailer innerhalb der aktuellen **Auswahl**, ohne Umweg über die komplette Liste.

Hilfsfunktionen: Sortieren, Filtern, Zufallsgenerator u. a. Später: eigene Bewertungen und Listen (auch von Freunden), Trailer-Browsing daraus.

---

## 3. Glossar

| Begriff | Bedeutung |
| --- | --- |
| **Liste** | Persistente Filmsammlung (zunächst eine implizite Katalog-Liste; später mehrere Nutzerlisten). |
| **Auswahl** | Aktuell gefilterte / sortierte Teilmenge einer Liste. Navigation „nächster Film“ bezieht sich auf die Auswahl. |
| **L1** | Auswahlebene – Übersicht der Filme (Text, Poster, Raster, …). |
| **L2** | Detailebene – ein Film pro Ansicht, Link zum nächsten Film der Auswahl. |
| **L3** | Trailer-Ebene – Videomaterial, Navigation zum Trailer des nächsten Films der Auswahl. |

---

## 4. Drei Hauptebenen (Kern-UX)

Die Anwendung baut auf drei Ebenen auf (Muss für Major 2):

1. **L1 – Auswahl**: alle Filme der (aktuellen) Liste mit groben Infos (Titel, Jahr, Bewertung, …), noch ohne volle Details.
2. **L2 – Detail**: ein Film; Verlinkung zum nächsten Film der aktuellen Auswahl; zurück zu L1 soll den Kontext merken (Scroll-/Film-Position).
3. **L3 – Trailer**: Abspielen; ebenfalls Weiter zur Trailer-Ansicht des nächsten Films der Auswahl.

Optional später: Ebenen konfigurierbar / überspringbar (z. B. nur Bilder, All-in-One).

---

## UX-Architektur & Navigation (Kurz)

**Haupt-Header = Zielstruktur ab V3**, heute größtenteils deaktiviert; Features werden schrittweise verdrahtet.

| Header | Rolle |
| --- | --- |
| **Logo** | Start / L1 |
| **?** | „Worum geht’s?“ / About (eigenständig, **nicht** unter Einstellungen) |
| **⚙** | Einstellungen (Sprache, Darstellung, Ebenen-Konfig, später Konto-Prefs) |
| **Listen** | Listen wechseln/verwalten (ab V3) |
| **Zufall** | Zufallsfilm (nach V3) |
| **Konto** | Login / Profil (ab V3) |

**Nicht im Haupt-Header:** Filter, Suche, Import — gehören zur **L1-Listenleiste** (bzw. Listen-Verwaltung). Katalogsuche ≠ TMDB-Hinzufügen.

Verdrahtung grob: ⚙/? wachsen in 1.x → L1-Tools in 2.x → Listen/Konto in 3.0 → Zufall danach.

---

## 5. Differenzierende Features (Vision)

Was die Seite besonders machen soll (nicht alles sofort):

- Trailer-zu-Trailer navigieren und dabei Entscheidungen / Bewertungen treffen
- viele Ansichten für Listen und Auswahlen
- Sortierung inkl. Sekundär-/Tertiärsortierung; Filter aller Art
- Listen anonym (Share-Link/Hash) oder mit Konto erstellen und kombinieren
- Import/Export vieler Formate
- optionale Veröffentlichung von Nutzerbewertungen
- transparentes, konfigurierbares Recommendation-System
- Darstellungsprofile (Session / Gerät / Account)
- eingeschränkte Offline-Nutzung (Text jederzeit; Medien nur mit klarem Einverständnis und Rechtslage)
- alternative Navigation (Tastatur; weitere Eingaben optional)

---

## 6. Muss-, Soll- und Wunschkriterien

### 6.1 Muss

| ID | Kriterium | Ziel-Release |
| --- | --- | --- |
| MK01 | Drei Hauptebenen L1 → L2 → L3 inkl. Navigation in der Auswahl | 2.x |
| MK02 | Sortierung der Liste (auf/ab, später auch Autoren-Reihenfolge) | 1.x → 2.x |

### 6.2 Soll

| ID | Kriterium | Ziel-Release |
| --- | --- | --- |
| SK01 | Verschiedene Ansichten (Text, Poster, Raster, …) | 2.0 |
| SK02 | Sekundär- / Tertiärsortierung | 2.x |
| SK03 | Filtern (kombinierbar; Jahr, Genre, Bewertung, …) | 2.x |
| SK04 | Suche in Katalog / Liste / Auswahl (nicht nur TMDB-Add) | 2.x |
| SK05 | Nutzerverwaltung | 3.0 |
| SK06 | Filme bewerten | 2.x → 3.0 |
| SK07 | Listen erstellen und verwalten (auch anonym per Link) | 3.0 |
| SK08 | Responsive Design | durchgängig |

### 6.3 Wunsch (Backlog, keine feste Reihenfolge)

- Listenkombination, Drag & Drop
- erweitertes Filtern (Exklusion, AND/OR)
- Offline / lokaler Cache
- Recommendations (content- und nutzerbasiert)
- Moviemixer mit Animationen („Songraten“ / Zufall als Erlebnis)
- Franchise-/Tag-Kennzeichnung, Similarities
- eigene Kategorien / Netzdiagramme
- persönliches Design / Darstellungsprofile
- Kontakt / Melden, Hilfe / Tutorial
- optionale Social-Logins (Google o. Ä.; kein IMDb-Zwang)
- Audio-Zitate / Eastereggs (nur mit geklärter Lizenz)

Nicht mehr als aktive Ziele: Kinect/HoloLens, 3D-Filmwolke als Muss, Admin-UI zum dynamischen Anlegen von DB-Spalten, Captcha als alleinige Spam-Abwehr.

---

## 7. Ist-Zustand der Implementierung

### Erledigt (Stand Repo + `pflichtenheft2.txt`)

- NestJS-Backend, Movies-Controller, CRUD
- Filme anlegen (manuell / aus TMDB), bearbeiten, löschen
- TMDB-API über Backend-Proxy (`TMDB_API_KEY` nur serverseitig, `example.env`)
- SQLite-Schema passend zu `@mmfv/interfaces` (`Movie`: Titel, Übersetzungen, `tmdbId`, Jahr, Timestamps)
- Bulk-Import: Titelzeilen → Preview (TMDB-Match) → Commit
- Frontend: paginierte Text-/Tabellenliste, Edit-/Import-Dialoge; Header V3-Form (Listen/Zufall/Konto deaktiviert); L1-Leiste mit Filter/Suche-Stubs + Import

### Noch offen / nur teilweise

| Thema | Status |
| --- | --- |
| Import „App-Script: Liste → Import“ | offen (UI-Flow/Automatisierung) |
| Import/Export diverser Formate | nur Text-Titel-Import |
| Unit-Tests, Pipeline, Playwright | offen |
| Bewertungen | offen |
| L1 mit Posterplatzhaltern / reine Textansicht (ohne Tabelle) | offen |
| Poster-Speicher (Datei / S3 o. Ä.) + Sync TMDB/lokal | offen |
| L2 Detailseiten + Merken beim Zurück zu L1 | offen |
| L3 Trailer | offen |
| Data-Folder Sync / Backup ohne Versionskontrolle | offen |
| Zufallsfilm als Feature | nach 3.0 geplant (`pflichtenheft2`) |
| Sortieren / Filtern / Katalogsuche in der UI | L1-Stubs; Logik fehlt |

### Unabhängig vom Versionsfahrplan

- Link zur ursprünglichsten-html-Seite / About / anonymisiertes Comic-Foto
- Docker, Deployment, Server, optional K8s (siehe DevOps-Plan im Repo)
- optional LDAP / Keycloak
- MongoDB statt SQLite (Schema-Enforcement) – derzeit SQLite bewusst
- Seed-Generator aus Schema; Interface↔DB-Migration beim App-Start
- Performance-Tests in CI
- Verschlüsselung von DB/Backup
- TMDB-Suchtreffer cachen inkl. Expire/Refresh, auch ohne Katalogaufnahme
- L1/L2 konfigurierbar, eigene Eigenschaften am Film

---

## 8. Technische Leitplanken (aktuell)

- Monorepo: Angular-Frontend, NestJS-Backend, Shared-Libs (`@mmfv/interfaces`, `@mmfv/utils`, …)
- API-Präfix: `/api`
- Katalog-API (Auszug): `GET/POST /api/movies`, `PUT/DELETE /api/movies/:id`, `POST …/from-tmdb`, `POST …/import/preview|commit`, `GET /api/tmdb/search/movie`
- Filmquelle / Verifikation: **TMDB** (nicht IMDb)
- Anzeige-Titel: DE-Übersetzung wenn vorhanden, sonst `originalTitle`
- Keine TMDB-Keys oder direkten TMDB-URLs im Frontend

Erweiterungen (Listen, Nutzer, Bewertungen, Poster, Trailer) brauchen neue Endpunkte und Schema-Erweiterungen – die alten Pfade `/lists`, `/user` aus dem Original bleiben nur als fachliche Idee, nicht als verbindliche URL-Liste.

---

## 9. Release-Plan & Roadmap

SemVer: **Major.Minor.Patch**. Major = Meilenstein der Nutzererfahrung. Version auf der Seite ab öffentlichem 1.0 sichtbar halten.

### Übersicht

| Version | Fokus | Kurzbeschreibung |
| --- | --- | --- |
| **1.0** | Katalog | Textliste, CRUD, TMDB-Add, Basis-Import |
| **1.x** | Katalog-Reife | Tests, Backup, bessere Ansichten, Bewertungen vorbereiten |
| **2.0** | Drei Ebenen | Poster-L1, L2 Detail, L3 Trailer, Auswahl-Navigation |
| **2.x** | Entdecken | Sort/Filter/Suche, Multi-Sort, Moviemixer-Basis |
| **3.0** | Sozial / Listen | Nutzer, mehrere Listen, Import/Export-Vielfalt, optional Offline |
| **danach** | Polish & Ops | Zufalls-Feature mit Animation, Auth-Optionen, Deployment |

---

### Release 1.0 – Katalog (weitgehend erreicht)

**Ziel:** „Meine Liste“ als nutzbarer Textkatalog.

- [x] Liste mit mindestens Titel (+ Jahr / TMDB-Id)
- [x] Film anlegen, bearbeiten, löschen
- [x] TMDB-Suche und Übernahme in den Katalog
- [x] Titel-Import (Preview + Commit)
- [ ] Version auf der Webseite anzeigen
- [ ] Öffentliche Nightly/Stable-Kanäle (optional, wenn Deployment steht)

**Exit-Kriterium:** Katalog pflegbar ohne Roh-JSON-Arbeit.

---

### Release 1.x – Stabilisierung & Vorarbeit L2

**Ziel:** Produktionsnahe Pflege und Vorbereitung der visuellen Liste.

Priorität aus `pflichtenheft2.txt`:

1. Unit-Tests (Backend + kritische Shared-Utils)
2. CI-Pipeline (Lint, Build, Tests)
3. Data-Folder Sync / Backup (ohne Git)
4. L1: Textansicht und/oder Poster-Platzhalter statt reiner Admin-Tabelle
5. Bewertungsfeld am Film (einfach, zunächst eine Bewertungseigenschaft)
6. Import-Flow „Liste → Import“ vervollständigen; Export mindestens JSON/CSV skizzieren
7. Playwright (Smoke: Liste laden, Import-Dialog)

**Exit-Kriterium:** Automatisierte Checks grün; Backup-Pfad dokumentiert; L1 nicht nur Admin-Tabelle.

---

### Release 2.0 – Drei Hauptebenen

**Ziel:** MK01 vollständig.

1. **Poster:** Speicherung/Sync (lokal und/oder Objekt-Storage); Anzeige in L1 (Grid/Karten)
2. **L2 Detailseite:** Beschreibung/Metadaten (TMDB-Cache wo sinnvoll); „nächster Film“ in der Auswahl; Zustand merken bei Rückkehr zu L1
3. **L3 Trailer:** Einbindung (z. B. TMDB/YouTube); Navigation zum nächsten Trailer der Auswahl
4. Responsive Basis für alle drei Ebenen

**Exit-Kriterium:** Nutzer kann Liste → Detail → Trailer durchlaufen und in der Auswahl vorwärts navigieren.

---

### Release 2.x – Entdecken auf L1

**Ziel:** Hilfsfunktionen aus der Projekteinführung.

- Sortierung (UI) und Mehrfachsortierung (SK02)
- Filter (SK03) und Katalogsuche (SK04)
- Ansichtswechsel Text / Poster / Raster (SK01)
- Bewertungen auf allen Ebenen nutzbar machen (SK06, soweit ohne Nutzerkonto)
- optional: einfache Similarities / Tags

**Exit-Kriterium:** Auswahl entsteht durch Filter/Suche/Sort; L2/L3 folgen dieser Auswahl.

---

### Release 3.0 – Listen & Nutzer

**Ziel:** Major-3 aus dem Original, angepasst an den Stack.

- Nutzerkonten (SK05); später optional Keycloak/LDAP/Social
- mehrere Listen; anonym per Hash-Link (SK07)
- Import/Export diverser Formate + API-Quellen (WK02)
- Listen kombinieren (Grundfunktionen)
- eingeschränkte Offline-Nutzung (Text; Medien nur wenn rechtlich und technisch klar)
- Recommendation-Grundlage (transparent, konfigurierbar) – kann als 3.x nachziehen

**Danach (explizit `pflichtenheft2`):** Zufallsfilm als Feature mit Animationen (Moviemixer / „Songraten“).

**Exit-Kriterium:** Mindestens zwei Listen-Typen (eigene Katalog-Liste + eine nutzer-/hash-basierte Liste) nutzbar; Import und Export über Text hinaus.

---

### Querschnitt / Ops (parallel möglich)

- Docker-Images, Deployment, ggf. minimal K8s
- About / persönliche Unterseiten
- Schema-/Seed-Generatoren, Migrationsstrategie
- Verschlüsselung von Backups
- TMDB-Cache mit Expire für Suchtreffer

Diese Punkte blockieren die UX-Meilensteine nicht, sind aber für öffentliche Releases sinnvoll.

---

## 10. Akzeptanz-Ideen (kurz)

Statt leerer Testszenarien-Kapitel – als Orientierung:

| Szenario | Erwartung |
| --- | --- |
| Katalog pflegen | Film über TMDB hinzufügen, editieren, löschen; Liste aktualisiert sich |
| Import | Mehrere Titelzeilen → Preview → Commit; bekannte TMDB-IDs und reine Titel möglich |
| L2/L3 (ab 2.0) | Aus gefilterter Auswahl Detail öffnen, nächsten Film und Trailer erreichen, zurück zu L1 mit Kontext |
| Listen (ab 3.0) | Anonyme Liste per Link speichern; angemeldet private Liste anlegen |

Detaillierte Fälle gehören in die Test-Suite (Unit + Playwright), nicht dauerhaft in dieses Dokument.

---

## 11. Was bewusst weggelassen wurde

Aus den Originalen entfernt oder stark gekürzt, weil überholt oder leer:

- detaillierter Wettbewerber-Vergleich ohne ausgefüllte Ergebnisse
- alte Server-URL-Liste ohne `/api` und mit Listen/User als Ist-API
- IMDb als Primär-API und Verifikationsquelle
- volles Film-Tabellen-Schema (Cast, FSK, Similarities-Tabelle, …) als Muss-Datenmodell
- Captcha als zwingende Anforderung für anonyme Listen
- Admin-GUI zum freien Anlegen von Tabellenspalten
- Kinect / HoloLens / 3D-Zoom-Pflicht
- unausgefüllte Kapitel (konkrete Funktionen, GUI-Einzeiler, Glossar-Leerseiten, Anhang-Zitate als Spezifikation)

Inhaltlich wertvolle Ideen daraus stecken in Abschnitt 5–6 und im Backlog unter „Wunsch“ bzw. „unabhängig“.

---

## 12. Quellen

- `pflichtenheft.txt` – Langfrist-UX und Kriterien
- `pflichtenheft2.txt` – Checkliste Ist/Soll und parallele Themen
- Repo-Ist: `AGENTS.md`, Backend Movies/TMDB, Frontend List/Import/Edit
