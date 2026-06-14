import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const termsDE = `ALLGEMEINE NUTZUNGSBEDINGUNGEN (TERMS OF SERVICE)
Plattform: Deutsches Lernzentrum (DLZ)

Stand: Juni 2026

Willkommen beim Deutschen Lernzentrum (DLZ). Bitte lesen Sie diese Nutzungsbedingungen sorgfältig durch, bevor Sie unsere Plattform, das Kurs-Management-System, interaktive Lernwerkzeuge oder Quizzes nutzen. Durch den Zugriff auf unsere Dienste erklären Sie sich mit diesen Bedingungen einverstanden.

1. Geltungsbereich und Allgemeine Bestimmungen
Diese Nutzungsbedingungen („AGB“) regeln das Vertragsverhältnis zwischen der Plattform Deutsches Lernzentrum (DLZ) (nachfolgend „DLZ“, „wir“ oder „uns“) und den registrierten Nutzern (nachfolgend „Nutzer“ oder „Sie“), welche die Webseite, die Web-Applikation sowie verbundene digitale Lernwerkzeuge verwenden.
Das DLZ stellt ein modernes Web-Ökosystem zur Verfügung, welches zertifizierte deutsche Sprachschulen, Lehrkräfte und Studierende miteinander verbindet. Zu den angebotenen Funktionalitäten gehören cloudbasierte Curricula, interaktive Quizzes, Fortschrittsanalysen sowie die zielgerichtete Vorbereitung auf anerkannte Sprachprüfungen.

2. Registrierung, Einladungssystem (Invitation-Only) und Benutzerkonto
Zugangsbeschränkung: Der Zugang zu den Kernfunktionen der Plattform ist exklusiv und erfolgt über ein kontrolliertes Einladungssystem. Ein Vertrag zur Nutzung kommt erst durch die erfolgreiche Registrierung und anschließende Freischaltung des Kontos durch das DLZ oder eine angeschlossene Partnerschule zustande.

Sorgfaltspflichten: Der Nutzer verpflichtet sich, im Rahmen der Registrierung wahrheitsgemäße, aktuelle und vollständige Angaben zu machen.

Kontosicherheit: Die Zugangsdaten sind streng geheim zu halten und vor dem unbefugten Zugriff Dritter zu schützen. Eine Weitergabe des persönlichen Benutzerkontos an Dritte ist untersagt.

Sperrung: Das DLZ behält sich das Recht vor, Benutzerkonten bei begründetem Verdacht auf Missbrauch, Verstößen gegen diese Bedingungen oder unbefugter Nutzung temporär oder permanent zu sperren.

3. Leistungsbeschreibung und Plattform-Verfügbarkeit
Dienstleistung: Das DLZ stellt dem Nutzer eine webbasierte Lernplattform zur Verfügung. Der genaue Leistungsumfang bestimmt sich nach dem jeweiligen Kontotyp (z. B. Zugriff auf Videokurse, interaktive Lektionen, automatisierte Quizzes sowie Tools zur Überprüfung des individuellen Lernfortschritts auf den Niveaustufen A1 bis C1).

Verfügbarkeit: Wir bemühen uns um eine kontinuierliche Verfügbarkeit der Plattform (24/7). Notwendige Wartungsarbeiten, Updates oder unvorhergesehene Serverausfälle können jedoch zu kurzzeitigen Unterbrechungen führen. Ein Anspruch auf eine hundertprozentige, ununterbrochene Verfügbarkeit des Cloud-Backends besteht nicht.

4. Geistiges Eigentum und Urheberrechte
Eigentumsschutz: Sämtliche auf der Plattform bereitgestellten Inhalte, einschließlich, aber nicht beschränkt auf Software-Codes (React, TypeScript, tRPC-Strukturen, Datenbankarchitekturen), Benutzeroberflächen (UI-Designs), visuelle Assets, Grafiken, 3D-Karten, interaktive Quiz-Fragen, Markenlogos, Texte und didaktische Lernmaterialien, sind urheberrechtlich geschützt und Eigentum des DLZ oder der jeweiligen Lizenzgeber.

Nutzungslizenz: Dem Nutzer wird ein einfaches, nicht übertragbares, zeitlich auf die Dauer der Kurszuteilung beschränktes Recht eingeräumt, die Inhalte für persönliche, nicht-kommerzielle Bildungszwecke zu nutzen.

Verbote: Jede Form der Vervielfältigung, systematischen Speicherung, Verbreitung, Modifikation oder kommerziellen Verwertung der Materialien ohne explizite, schriftliche Zustimmung des DLZ ist strengstens untersagt.

5. Verhaltensregeln und Pflichten des Nutzers
Bei der Nutzung unserer digitalen Lernumgebung verpflichtet sich der Nutzer zu einem respektvollen und rechtmäßigen Verhalten. Untersagt sind insbesondere:

Das Einstellen, Teilen oder Verbreiten von rechtswidrigen, beleidigenden, rassistischen, diskriminierenden oder die Rechte Dritter verletzenden Inhalten.

Jegliche Versuche, die Sicherheitsmaßnahmen der Web-Applikation zu umgehen, Schadsoftware hochzuladen oder automatisierte Systeme (wie Bots, Scraper oder Crawler) ohne Autorisierung einzusetzen.

Das systematische Kopieren oder Auslesen von urheberrechtlich geschützten Prüfungsfragen und Lektionsinhalten zur externen Verwendung.

6. Haftungsausschluss
Haftung: Das DLZ haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung beruhen. Für sonstige Schäden haftet das DLZ nur bei Vorsatz oder grober Fahrlässigkeit.

Lernerfolg: Wir übernehmen keine rechtliche Garantie für das Erreichen eines bestimmten, individuellen Lernerfolgs oder das Bestehen externer, offizieller Sprachprüfungen (wie z. B. ÖSD- oder Goethe-Zertifikate). Die Plattform stellt die technologischen und didaktischen Werkzeuge bereit; der finale Prüfungserfolg hängt vom eigenverantwortlichen Engagement des Nutzers ab.

7. Datenschutz
Der Schutz Ihrer persönlichen Daten ist uns ein zentrales Anliegen. Die Erhebung, Verarbeitung und Nutzung personenbezogener Daten erfolgt streng im Rahmen der gesetzlichen Bestimmungen der Datenschutz-Grundverordnung (DSGVO). Detaillierte Informationen hierzu sind in unserer separaten Datenschutzerklärung aufgeführt.

8. Vertragslaufzeit und Kündigung
Das Nutzungsverhältnis wird für die Dauer der Registrierung bzw. der aktiven Kurszuteilung geschlossen. Sowohl der Nutzer als auch das DLZ können das Nutzungsverhältnis jederzeit ohne Angabe von Gründen mit einer Frist von 14 Tagen in Textform (z. B. per E-Mail) kündigen. Das Recht zur außerordentlichen Sperrung oder Kündigung aus wichtigem Grund bleibt hiervon unberührt.

9. Änderungen der Nutzungsbedingungen
Das DLZ behält sich das Recht vor, diese Nutzungsbedingungen jederzeit mit Wirkung für die Zukunft zu ändern, sofern dies aus rechtlichen, technischen oder organisatorischen Gründen (z. B. zur Integration neuer Plattform-Features) erforderlich ist. Die geänderten Bedingungen werden dem Nutzer mindestens vier Wochen vor ihrem Inkrafttreten per E-Mail oder über das Plattform-Dashboard mitgeteilt.

10. Schlussbestimmungen
Sollten einzelne Bestimmungen dieser Vereinbarung unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.

Deutsches Lernzentrum (DLZ) — Kompetenz in digitaler Sprachvermittlung.`;

const termsEN = `GENERAL TERMS OF SERVICE
Platform: Deutsches Lernzentrum (DLZ)

Date: June 2026

Welcome to the Deutsches Lernzentrum (DLZ). Please read these Terms of Service carefully before using our platform, course management system, interactive learning tools, or quizzes. By accessing our services, you agree to these terms.

1. Scope and General Provisions
These Terms of Service ("Terms") govern the contractual relationship between the Deutsches Lernzentrum (DLZ) platform ("DLZ", "we", or "us") and registered users ("User" or "You") who use the website, web application, and associated digital learning tools.
DLZ provides a modern web ecosystem connecting certified German language schools, teachers, and students. Offered functionalities include cloud-based curricula, interactive quizzes, progress analytics, and targeted preparation for recognized language examinations.

2. Registration, Invitation-Only System, and User Account
Access Restriction: Access to the platform's core functions is exclusive and occurs through a controlled invitation system. A usage contract is only concluded upon successful registration and subsequent account activation by DLZ or an affiliated partner school.

Duty of Care: The user undertakes to provide truthful, current, and complete information during registration.

Account Security: Access credentials must be kept strictly confidential and protected from unauthorized third-party access. Sharing a personal user account with third parties is prohibited.

Suspension: DLZ reserves the right to temporarily or permanently suspend user accounts upon reasonable suspicion of misuse, violations of these Terms, or unauthorized use.

3. Service Description and Platform Availability
Service: DLZ provides the user with a web-based learning platform. The exact scope of services depends on the respective account type (e.g., access to video courses, interactive lessons, automated quizzes, and tools for reviewing individual learning progress at levels A1 through C1).

Availability: We strive for continuous platform availability (24/7). Necessary maintenance, updates, or unforeseen server outages may cause brief interruptions. There is no entitlement to one hundred percent uninterrupted availability of the cloud backend.

4. Intellectual Property and Copyrights
Ownership Protection: All content provided on the platform, including but not limited to software code (React, TypeScript, tRPC structures, database architectures), user interfaces (UI designs), visual assets, graphics, 3D maps, interactive quiz questions, brand logos, texts, and didactic learning materials, are copyrighted and the property of DLZ or its respective licensors.

Usage License: The user is granted a simple, non-transferable right, limited to the duration of the course assignment, to use the content for personal, non-commercial educational purposes.

Prohibitions: Any form of reproduction, systematic storage, distribution, modification, or commercial exploitation of the materials without the explicit written consent of DLZ is strictly prohibited.

5. Rules of Conduct and User Obligations
When using our digital learning environment, the user undertakes to behave respectfully and lawfully. Specifically prohibited are:

Posting, sharing, or distributing illegal, offensive, racist, discriminatory, or content that violates the rights of third parties.

Any attempts to circumvent the security measures of the web application, upload malware, or use automated systems (such as bots, scrapers, or crawlers) without authorization.

The systematic copying or extraction of copyrighted examination questions and lesson content for external use.

6. Limitation of Liability
Liability: DLZ is fully liable for damages resulting from injury to life, body, or health caused by intentional or negligent breach of duty. For other damages, DLZ is liable only in cases of intent or gross negligence.

Learning Success: We assume no legal guarantee for achieving a specific individual learning success or passing external official language examinations (such as ÖSD or Goethe certificates). The platform provides the technological and didactic tools; the final examination success depends on the user's own responsible efforts.

7. Data Protection
The protection of your personal data is a central concern for us. The collection, processing, and use of personal data occurs strictly within the framework of the legal provisions of the General Data Protection Regulation (GDPR). Detailed information can be found in our separate Privacy Policy.

8. Contract Term and Termination
The usage relationship is concluded for the duration of the registration or active course assignment. Both the user and DLZ may terminate the usage relationship at any time without stating reasons with a notice period of 14 days in text form (e.g., via email). The right to extraordinary suspension or termination for good cause remains unaffected.

9. Changes to Terms of Service
DLZ reserves the right to change these Terms of Service at any time with effect for the future, insofar as this is necessary for legal, technical, or organizational reasons (e.g., for the integration of new platform features). The changed terms will be communicated to the user at least four weeks before they take effect via email or the platform dashboard.

10. Final Provisions
Should individual provisions of this agreement be or become invalid or unenforceable, the validity of the remaining provisions shall remain unaffected. The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods.

Deutsches Lernzentrum (DLZ) — Competence in Digital Language Education.`;

const privacyDE = `DATENSCHUTZERKLÄRUNG (PRIVACY POLICY)
Plattform: Deutsches Lernzentrum (DLZ)

Stand: Juni 2026

1. Einleitung und Überblick
Der Schutz Ihrer persönlichen Daten ist uns ein zentrales Anliegen. Diese Datenschutzerklärung informiert Sie darüber, wie das Deutsches Lernzentrum (DLZ) (nachfolgend „wir“ oder „Plattform“) personenbezogene Daten erhebt, verarbeitet und schützt, wenn Sie unsere Web-Applikation, Kurs-Management-Systeme, Fortschrittsanalysen oder interaktiven Quizzes nutzen.

2. Verantwortliche Stelle
Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

E-Mail-Kontakt: privacy@dlz-lernzentrum.de

3. Erhebung und Verarbeitung personenbezogener Daten
Wir verarbeiten personenbezogene Daten unserer Nutzer nur, soweit dies zur Bereitstellung einer funktionsfähigen Plattform sowie unserer Inhalte und Leistungen erforderlich ist.

Registrierungs- und Kontodaten: Da unsere Plattform über ein Einladungssystem (Invitation-Only) läuft, verarbeiten wir die Daten, die Sie oder Ihre angeschlossene deutsche Sprachschule uns bereitstellen. Dazu gehören: Name, E-Mail-Adresse, Kontotyp (Student/Lehrkraft/Administrator) und Passwort (verschlüsselt).

Lern- und Leistungsdaten: Um Curricula zu verwalten und Fortschrittsberichte zu erstellen, speichern wir Ihre Interaktionen mit der Plattform. Dazu gehören: Abgeschlossene Lektionen, Testergebnisse aus Quizzes, korrigierte Aufgaben, Lernzeiten und angestrebte Sprachniveaus (A1, A2, B1, B2, C1).

Technische Nutzungsdaten (Server-Logfiles): Beim Aufruf der Web-Applikation erfasst unser System automatisch Daten vom Computersystem des aufrufenden Rechners. Dazu gehören: IP-Adresse, Browsertyp/-version, verwendetes Betriebssystem, Datum und Uhrzeit des Zugriffs sowie die aufgerufenen Seiten/API-Endpunkte (z.B. über tRPC-Anfragen).

4. Rechtsgrundlagen der Datenverarbeitung
Die Verarbeitung Ihrer Daten erfolgt auf Basis der folgenden Säulen der DSGVO:

Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO): Die Verarbeitung ist notwendig, um die vertraglich vereinbarten Leistungen der Lernplattform (Kursmanagement, Quiz-Auswertungen) bereitzustellen.

Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO): Zur Optimierung der Plattform-Performance, Gewährleistung der IT-Sicherheit und zur Behebung von Systemfehlern (z.B. Log-Analysen der MySQL-Datenbank).

Einwilligung (Art. 6 Abs. 1 lit. a DSGVO): Sofern Sie explizit in die Zusendung von Benachrichtigungen oder Newslettern eingewilligt haben.

5. Datenweitergabe an Dritte
Ihre personenbezogenen Daten werden nicht an unbefugte Dritte weitergegeben. Eine Übermittlung erfolgt ausschließlich an:

Angeschlossene Partnerschulen & Lehrkräfte: Ihre betreuenden deutschen Sprachschulen und Lehrer haben Zugriff auf Ihre Lernfortschritte und Quiz-Ergebnisse, um Sie gezielt auf Prüfungen (z.B. ÖSD) vorzubereiten.

Technische Dienstleister (Auftragsverarbeiter): Wir nutzen Cloud-Hosting-Anbieter, Datenbank-Dienstleister und E-Mail-Versanddienste, die streng an unsere Weisungen gebunden sind und über Auftragsverarbeitungsverträge (AVV) nach Art. 28 DSGVO verpflichtet wurden.

6. Datensicherheit
Um Ihre Daten vor Manipulation, Verlust oder unbefugtem Zugriff zu schützen, nutzt die DLZ-Plattform modernste Sicherheitsstandards. Sämtliche Datenübertragungen zwischen Ihrem Browser und unserem Backend (React/Vite-Frontend zu tRPC/MySQL-Server) erfolgen über eine sichere SSL/TLS-Verschlüsselung.

7. Speicherdauer
Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der oben genannten Zwecke (z.B. für die Dauer Ihres Sprachkurses) erforderlich ist oder wie es gesetzliche Aufbewahrungsfristen vorschreiben. Nach Löschung Ihres Benutzerkontos werden Ihre Leistungsdaten anonymisiert oder vollständig gelöscht.

8. Ihre Rechte als betroffene Person (Betroffenenrechte)
Nach der DSGVO stehen Ihnen als Nutzer der Plattform folgende Rechte gegenüber dem Verantwortlichen zu:

Auskunftsrecht (Art. 15 DSGVO): Sie können eine Bestätigung darüber verlangen, ob und welche persönlichen Daten wir von Ihnen verarbeiten.

Recht auf Berichtigung (Art. 16 DSGVO): Sie können die unverzügliche Korrektur fehlerhafter Daten verlangen.

Recht auf Löschung („Recht auf Vergessenwerden“ - Art. 17 DSGVO): Sie können die Löschung Ihrer Daten verlangen, sofern kein gesetzlicher Grund zur weiteren Aufbewahrung vorliegt.

Recht auf Datenübertragbarkeit (Art. 20 DSGVO): Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format (z.B. JSON oder CSV) zu erhalten.

Widerspruchsrecht (Art. 21 DSGVO): Sie können der Verarbeitung Ihrer Daten aus Gründen, die sich aus Ihrer besonderen Situation ergeben, widersprechen.

Zur Ausübung dieser Rechte reicht eine formlose E-Mail an unsere oben genannte Datenschutz-Adresse. Zudem steht Ihnen ein Beschwerderecht bei einer zuständigen Datenschutz-Aufsichtsbehörde zu.

9. Änderungen dieser Datenschutzerklärung
Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Plattform-Funktionalitäten (z.B. neue Tracking- oder Analyse-Tools) abzubilden. Die aktuelle Version ist stets auf der Plattform einsehbar.

Deutsches Lernzentrum (DLZ) — Sicher und transparent digital lernen.`;

const privacyEN = `PRIVACY POLICY (DATENSCHUTZERKLÄRUNG)
Platform: Deutsches Lernzentrum (DLZ)

Date: June 2026

1. Introduction and Overview
The protection of your personal data is a central concern for us. This Privacy Policy informs you about how the Deutsches Lernzentrum (DLZ) platform ("we" or "Platform") collects, processes, and protects personal data when you use our web application, course management systems, progress analytics, or interactive quizzes.

2. Responsible Party
The responsible party for data processing within the meaning of the General Data Protection Regulation (GDPR) is:

Email Contact: privacy@dlz-lernzentrum.de

3. Collection and Processing of Personal Data
We process personal data of our users only to the extent necessary to provide a functional platform and our content and services.

Registration and Account Data: Since our platform operates via an invitation-only system, we process the data that you or your affiliated German language school provide to us. This includes: name, email address, account type (Student/Teacher/Administrator), and password (encrypted).

Learning and Performance Data: To manage curricula and generate progress reports, we store your interactions with the platform. This includes: completed lessons, quiz test results, corrected assignments, learning times, and target language levels (A1, A2, B1, B2, C1).

Technical Usage Data (Server Log Files): When accessing the web application, our system automatically collects data from the accessing computer system. This includes: IP address, browser type/version, operating system used, date and time of access, and the pages/API endpoints accessed (e.g., via tRPC requests).

4. Legal Bases for Data Processing
The processing of your data is based on the following pillars of the GDPR:

Contract Performance (Art. 6(1)(b) GDPR): Processing is necessary to provide the contractually agreed services of the learning platform (course management, quiz evaluations).

Legitimate Interest (Art. 6(1)(f) GDPR): For optimizing platform performance, ensuring IT security, and remedying system errors (e.g., log analyses of the MySQL database).

Consent (Art. 6(1)(a) GDPR): If you have explicitly consented to receive notifications or newsletters.

5. Data Disclosure to Third Parties
Your personal data will not be disclosed to unauthorized third parties. Disclosure is made exclusively to:

Affiliated Partner Schools & Teachers: Your supervising German language schools and teachers have access to your learning progress and quiz results in order to prepare you specifically for examinations (e.g., ÖSD).

Technical Service Providers (Processors): We use cloud hosting providers, database service providers, and email dispatch services that are strictly bound by our instructions and have been obligated through data processing agreements (DPA) pursuant to Art. 28 GDPR.

6. Data Security
To protect your data from manipulation, loss, or unauthorized access, the DLZ platform uses state-of-the-art security standards. All data transmissions between your browser and our backend (React/Vite frontend to tRPC/MySQL server) are encrypted via secure SSL/TLS encryption.

7. Storage Duration
We store your personal data only as long as necessary for the fulfillment of the purposes mentioned above (e.g., for the duration of your language course) or as required by statutory retention periods. After deletion of your user account, your performance data will be anonymized or completely deleted.

8. Your Rights as a Data Subject
Under the GDPR, the following rights exist vis-à-vis the controller:

Right of Access (Art. 15 GDPR): You can request confirmation of whether and which personal data we process about you.

Right to Rectification (Art. 16 GDPR): You can request the immediate correction of incorrect data.

Right to Erasure ("Right to be Forgotten" - Art. 17 GDPR): You can request the deletion of your data, provided no legal basis for further retention exists.

Right to Data Portability (Art. 20 GDPR): You have the right to receive your data in a structured, commonly used, and machine-readable format (e.g., JSON or CSV).

Right to Object (Art. 21 GDPR): You may object to the processing of your data for reasons arising from your particular situation.

To exercise these rights, an informal email to our data protection address above is sufficient. You also have the right to lodge a complaint with a competent data protection supervisory authority.

9. Changes to this Privacy Policy
We reserve the right to adapt this Privacy Policy to ensure it always complies with current legal requirements or to reflect changes in our platform functionalities (e.g., new tracking or analysis tools). The current version is always available on the platform.

Deutsches Lernzentrum (DLZ) — Learning securely and transparently digitally.`;

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const isDE = i18n.language?.startsWith("de");
  const terms = isDE ? termsDE : termsEN;
  const privacy = isDE ? privacyDE : privacyEN;

  return (
    <>
      <footer className="bg-[#e8f5e9] pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div>
              <div
                className="inline-flex items-center px-4 h-9 rounded-full bg-[#00695c] text-white font-bold text-sm"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.1)",
                }}
              >
                DLZ
              </div>
              <p className="mt-2 text-[15px] text-[#78909c]">
                {t("footer.tagline")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#78909c] mb-3">
                  {t("footer.platform")}
                </h4>
                <ul className="space-y-2">
                  {[t("footer.browseCenters"), t("footer.howItWorks"), t("footer.pricing"), t("footer.forStudents")].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          to="/"
                          className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#78909c] mb-3">
                  {t("footer.centers")}
                </h4>
                <ul className="space-y-2">
                  {[t("footer.registerCenter"), t("footer.dashboard"), t("footer.quizBuilder"), t("footer.analytics")].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          to="/register-center"
                          className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#78909c] mb-3">
                  {t("footer.support")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <span className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors cursor-pointer">
                      {t("footer.helpCenter")}
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors cursor-pointer">
                      {t("footer.contactUs")}
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={() => setPrivacyOpen(true)}
                      className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors cursor-pointer"
                    >
                      {t("footer.privacyPolicy")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setTermsOpen(true)}
                      className="text-sm text-[#2c3e2d] hover:text-[#00695c] transition-colors cursor-pointer"
                    >
                      {t("footer.termsOfService")}
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#78909c] mb-3">
                  {t("footer.connect")}
                </h4>
                <div className="flex gap-3">
                  {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-9 h-9 rounded-full bg-[#00695c]/8 flex items-center justify-center text-[#00695c] hover:bg-[#00695c] hover:text-white transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#00695c]/10 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-[#78909c]">
            <span>{t("footer.copyright")}</span>
            <span>{t("footer.madeWith")}</span>
          </div>
        </div>
      </footer>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#2c3e2d]">
              {isDE ? "Terms of Service — Allgemeine Nutzungsbedingungen" : "Terms of Service — General Terms of Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-[#2c3e2d] whitespace-pre-line leading-relaxed space-y-2">
            {terms}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#2c3e2d]">
              {isDE ? "Privacy Policy — Datenschutzerklärung" : "Privacy Policy — Privacy Policy"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-[#2c3e2d] whitespace-pre-line leading-relaxed space-y-2">
            {privacy}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
