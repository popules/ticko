"use client";

import Link from "next/link";
import { Scale, AlertTriangle, Shield, Users, FileText, Lock, RefreshCw, Gavel } from "lucide-react";

export default function VillkorPage() {
    const sections = [
        {
            icon: FileText,
            title: "1. Definitioner och Tjänstens omfattning",
            content: "Ticko tillhandahåller en social plattform för finansiell diskussion, marknadsdata och AI-drivna insikter via funktionen \"Ticko AI\". Plattformen är avsedd för privat bruk och informationsutbyte."
        },
        {
            icon: AlertTriangle,
            title: "2. Ingen finansiell rådgivning",
            highlight: true,
            content: null,
            subsections: [
                { label: "Generell information", text: "Allt innehåll på Ticko, inklusive men ej begränsat till texter, grafer, sentiment-data och svar genererade av Ticko AI, ska betraktas som allmän information." },
                { label: "Ej rådgivning", text: "Inget innehåll utgör finansiell rådgivning, investeringsrekommendationer, skatterådgivning eller juridisk rådgivning." },
                { label: "AI-begränsningar", text: "Ticko AI bygger på maskininlärningsmodeller som kan generera felaktig, ofullständig eller föråldrad information. Ticko garanterar inte korrektheten i AI-genererade analyser." },
                { label: "Eget ansvar", text: "Varje investeringsbeslut fattas självständigt av Användaren. Investeringar i finansiella instrument innebär risk för förlust av hela eller delar av det investerade kapitalet." }
            ]
        },
        {
            icon: Shield,
            title: "3. Friskrivning från ansvar för data och tillgänglighet",
            content: null,
            subsections: [
                { label: "Tredjepartsdata", text: "Marknadsdata (kurser, volym, nyckeltal) hämtas från externa leverantörer. Vi garanterar inte att denna data är korrekt, fullständig eller levereras i realtid." },
                { label: "Tekniska avbrott", text: "Tjänsten tillhandahålls i befintligt skick (\"as is\"). Ticko ansvarar inte för direkta eller indirekta skador, inklusive utebliven vinst, till följd av tekniska fel, serveravbrott, fördröjd data eller felaktig information." }
            ]
        },
        {
            icon: Users,
            title: "4. Regler för användargenererat innehåll och Moderering",
            content: "Som användare förbinder du dig att följa svensk lagstiftning, inklusive marknadsmissbruksförordningen (MAR). Det är strängt förbjudet att:",
            list: [
                "Sprida vilseledande information i syfte att påverka aktiekurser (s.k. \"Pump and Dump\").",
                "Publicera material som är kränkande, olagligt eller utgör förtal.",
                "Använda automatiska skript (bots) för att extrahera data eller påverka plattformens funktion."
            ],
            footer: "Ticko förbehåller sig rätten att utan förvarning radera innehåll och permanent stänga av konton som bryter mot dessa regler."
        },
        {
            icon: Scale,
            title: "5. Immateriella rättigheter",
            content: "Användaren äger rättigheterna till sina egna inlägg. Genom att publicera innehåll på Ticko ger Användaren Ticko en global, royaltyfri och evig licens att lagra, visa, distribuera och använda innehållet för att tillhandahålla och marknadsföra tjänsten."
        },
        {
            icon: Lock,
            title: "6. Integritet och Dataskydd (GDPR)",
            content: "Genom att använda Tjänsten godkänner du att vi behandlar dina personuppgifter i enlighet med vår Integritetspolicy. Vi delar aldrig dina personuppgifter med AI-leverantörer för träning av modeller utan ditt medgivande.",
            link: { href: "/integritet", text: "Läs vår Integritetspolicy" }
        },
        {
            icon: RefreshCw,
            title: "7. Ändringar av Villkor och Tjänst",
            content: "Ticko förbehåller sig rätten att när som helst ändra dessa Villkor. Vid väsentliga ändringar kommer användare att meddelas via e-post eller på plattformen. Fortsatt användning utgör acceptans av de nya Villkoren."
        },
        {
            icon: Gavel,
            title: "8. Tillämplig lag och Tvist",
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
                    <p className="text-white/40 text-sm">Senast uppdaterad: 12 januari 2026</p>
                </div>

                {/* Intro */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
                    <p className="text-white/70 leading-relaxed">
                        Dessa användarvillkor (&quot;Villkoren&quot;) utgör ett juridiskt bindande avtal mellan dig (&quot;Användaren&quot;) och Ticko gällande användningen av plattformen ticko.se samt tillhörande tjänster.
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
