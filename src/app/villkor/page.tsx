"use client";

import Link from "next/link";
import { Scale, AlertTriangle, Shield, Users, FileText, Lock, RefreshCw, Gavel, Coins, Timer, Ban, AlertCircle } from "lucide-react";

export default function VillkorPage() {
    const sections = [
        {
            icon: FileText,
            title: "1. Definitioner och Tjänstens omfattning",
            content: "Ticko tillhandahåller en social utbildningsplattform för finansiell diskussion, simulerad aktiehandel ('Paper Trading') och AI-drivna informationsverktyg. Plattformen är avsedd för privat bruk, lärande och informationsutbyte."
        },
        {
            icon: Coins,
            title: "2. Virtuell valuta och poäng",
            highlight: true,
            content: null,
            subsections: [
                { label: "Ticko-kronor", text: "Det virtuella saldo ('100 000 kr') som tillhandahålls vid Paper Trading är simulerade medel utan något som helst monetärt värde." },
                { label: "XP och Levels", text: "Erfarenhetspoäng (XP), Levels, Badges och övriga gamification-element är virtuella poäng för underhållning och engagemang." },
                { label: "Ingen valutaväxling", text: "Virtuella medel, XP och Levels kan aldrig växlas mot riktiga pengar, krediter, varor eller tjänster. Försök att sälja eller överföra virtuella tillgångar är strängt förbjudet." }
            ]
        },
        {
            icon: Timer,
            title: "3. Fair Play och Lock-in-regeln",
            content: "För att säkerställa en rättvis tävling och förhindra 'arbitrage-fusk' på grund av fördröjd marknadsdata gäller följande:",
            list: [
                "Marknadsdata kan vara fördröjd med upp till 15 minuter.",
                "Efter ett köp i Paper Trading är positionen låst i 30 minuter innan försäljning är möjlig.",
                "Denna regel existerar för att motverka utnyttjande av datafördröjning och garantera en rättvis konkurrens."
            ],
            footer: "Ticko förbehåller sig rätten att justera spärrtider och Fair Play-regler för att upprätthålla plattformens integritet."
        },
        {
            icon: AlertTriangle,
            title: "4. Ingen finansiell rådgivning",
            highlight: true,
            content: null,
            subsections: [
                { label: "Generell information", text: "Allt innehåll på Ticko, inklusive men ej begränsat till texter, grafer, sentiment-data och svar genererade av Ticko AI, ska betraktas som allmän information." },
                { label: "Ej rådgivning", text: "Inget innehåll utgör finansiell rådgivning, investeringsrekommendationer, skatterådgivning eller juridisk rådgivning." },
                { label: "AI-begränsningar", text: "Ticko AI bygger på maskininlärningsmodeller som kan generera felaktig, ofullständig eller föråldrad information. Ticko garanterar inte korrektheten i AI-genererade analyser." }
            ]
        },
        {
            icon: Ban,
            title: "5. Marknadsmissbruk och manipulation",
            highlight: true,
            content: "Ticko tolererar inte försök till otillbörlig marknadspåverkan:",
            list: [
                "Haussning/Dishing: Systematiskt försök att manipulera sentimentet kring enskilda aktier för att vilseleda andra användare.",
                "Koordinerade kampanjer: Organiserad spridning av vilseledande information.",
                "Fake wins: Manipulering av egna resultat genom tekniska metoder."
            ],
            footer: "Användare som bryter mot dessa regler kommer att stängas av permanent utan förvarning. Ticko samarbetar med myndigheter vid misstanke om verkligt marknadsmissbruk."
        },
        {
            icon: AlertCircle,
            title: "6. Ansvarsfrihet",
            content: null,
            subsections: [
                { label: "Egna beslut", text: "Ticko ansvarar inte för ekonomiska förluster som uppstår om en användare väljer att kopiera trades från plattformen i verkliga livet hos externa mäklare." },
                { label: "Tredjepartsdata", text: "Marknadsdata hämtas från externa leverantörer. Vi garanterar inte att denna data är korrekt, fullständig eller levereras i realtid." },
                { label: "Tekniska avbrott", text: "Tjänsten tillhandahålls i befintligt skick ('as is'). Ticko ansvarar inte för direkta eller indirekta skador till följd av tekniska fel eller fördröjd data." }
            ],
            footer: "All handel med riktiga pengar sker på användarens egen risk hos externa, licensierade mäklare."
        },
        {
            icon: RefreshCw,
            title: "7. Nollställning och justering",
            content: "Ticko förbehåller sig rätten att:",
            list: [
                "Nollställa portföljer vid misstanke om tekniskt utnyttjande (bugs) eller fusk.",
                "Justera XP och Levels om de erhållits genom otillåtna metoder.",
                "Genomföra säsongsbaserade nollställningar av Paper Trading för att bibehålla tävlingsandan."
            ]
        },
        {
            icon: Users,
            title: "8. Regler för användargenererat innehåll",
            content: "Som användare förbinder du dig att följa svensk lagstiftning. Det är strängt förbjudet att:",
            list: [
                "Sprida vilseledande information i syfte att påverka aktiekurser.",
                "Publicera material som är kränkande, olagligt eller utgör förtal.",
                "Använda automatiska skript (bots) för att extrahera data eller påverka plattformens funktion."
            ],
            footer: "Ticko förbehåller sig rätten att utan förvarning radera innehåll och permanent stänga av konton som bryter mot dessa regler."
        },
        {
            icon: Lock,
            title: "9. Integritet och Dataskydd (GDPR)",
            content: "Genom att använda Tjänsten godkänner du att vi behandlar dina personuppgifter i enlighet med vår Integritetspolicy.",
            link: { href: "/integritet", text: "Läs vår Integritetspolicy" }
        },
        {
            icon: Gavel,
            title: "10. Tillämplig lag och Tvist",
            content: "Dessa villkor ska tolkas i enlighet med svensk lag. Tvister ska i första hand lösas genom förhandling och i andra hand av svensk allmän domstol."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E14] via-[#0D1117] to-[#0A0E14]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <Scale className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Användarvillkor för Ticko</h1>
                    <p className="text-white/40 text-sm">Senast uppdaterad: 19 januari 2026</p>
                </div>

                {/* Intro */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
                    <p className="text-white/70 leading-relaxed">
                        Dessa användarvillkor (&quot;Villkoren&quot;) utgör ett juridiskt bindande avtal mellan dig (&quot;Användaren&quot;) och Ticko gällande användningen av plattformen ticko.se samt tillhörande tjänster. Ticko är en utbildningsplattform med simulerad handel och inte en finansiell tjänst.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`bg-white/[0.02] border rounded-2xl p-6 transition-all hover:bg-white/[0.03] ${section.highlight
                                ? 'border-amber-500/30 bg-amber-500/[0.02]'
                                : 'border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${section.highlight
                                    ? 'bg-amber-500/10 border border-amber-500/20'
                                    : 'bg-white/5 border border-white/10'
                                    }`}>
                                    <section.icon className={`w-5 h-5 ${section.highlight ? 'text-amber-400' : 'text-white/40'}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className={`text-lg font-semibold mb-3 ${section.highlight ? 'text-amber-400' : 'text-white'}`}>
                                        {section.title}
                                        {section.highlight && <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Viktigt!</span>}
                                    </h2>

                                    {section.content && (
                                        <p className="text-white/60 leading-relaxed">{section.content}</p>
                                    )}

                                    {section.subsections && (
                                        <div className="space-y-3 mt-3">
                                            {section.subsections.map((sub, subIndex) => (
                                                <div key={subIndex} className="pl-4 border-l-2 border-white/10">
                                                    <span className="text-white/80 font-medium">{sub.label}:</span>{" "}
                                                    <span className="text-white/60">{sub.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.list && (
                                        <ul className="mt-3 space-y-2">
                                            {section.list.map((item, listIndex) => (
                                                <li key={listIndex} className="flex items-start gap-2 text-white/60">
                                                    <span className="text-red-400 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.footer && (
                                        <p className="mt-4 text-white/60 italic">{section.footer}</p>
                                    )}

                                    {section.link && (
                                        <Link
                                            href={section.link.href}
                                            className="inline-flex items-center gap-1 mt-3 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                                        >
                                            {section.link.text} →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="text-white/40 hover:text-white/60 transition-colors text-sm"
                    >
                        ← Tillbaka till Ticko
                    </Link>
                </div>
            </div>
        </div>
    );
}
