"use client";

import Link from "next/link";
import { Shield, Database, Share2, Clock, UserCheck, Cookie, Eye, Trash2 } from "lucide-react";

export default function IntegritetPage() {
    const sections = [
        {
            icon: Database,
            title: "1. Insamling av data och rättslig grund",
            content: "Vi behandlar dina personuppgifter för att fullgöra vårt avtal med dig eller baserat på vårt berättigade intresse att tillhandahålla en säker tjänst.",
            subsections: [
                { label: "Kontoinformation", text: "E-post och användarnamn (via Supabase)." },
                { label: "Användarinnehåll", text: "Inlägg, kommentarer, bevakningslistor och portföljdata som du väljer att dela." },
                { label: "Teknisk data", text: "IP-adress, webbläsartyp och enhetsinformation för säkerhetsanalys och spambekämpning." }
            ]
        },
        {
            icon: Eye,
            title: "2. Offentlig data (Paper Trading)",
            highlight: true,
            content: "För att möjliggöra leaderboard och community-funktioner är följande data offentlig som standard:",
            list: [
                "Transaktioner i din pappersportfölj (köp/sälj)",
                "P&L (Profit & Loss) data och avkastning",
                "XP, Level och Win Streak",
                "Ditt användarnamn och track record"
            ],
            footer: "Denna transparens är grundläggande för Tickos vision om verifierbara track records. Om du inte vill att din trading-data ska vara synlig bör du inte använda Paper Trading-funktionen."
        },
        {
            icon: Shield,
            title: "3. Användning av data",
            content: "Din data används för att driva plattformen, möjliggöra social interaktion och tillhandahålla Ticko AI.",
            footer: "Vid användning av Ticko AI skickas endast din specifika fråga till vår underleverantör; vi delar aldrig din personprofil eller e-post med AI-leverantörer utan ditt medgivande."
        },
        {
            icon: Share2,
            title: "4. Delning med tredje part",
            content: "Vi använder underleverantörer för drift:",
            list: [
                "Supabase (Databas & Auth)",
                "Vercel (Hosting)",
                "OpenAI (AI-analys)"
            ],
            footer: "Vid överföring av data utanför EU/EES säkerställer vi skyddet genom lagstadgade standardavtalsklausuler."
        },
        {
            icon: Trash2,
            title: "5. Anonymisering vid radering",
            content: "Om du väljer att radera ditt konto:",
            list: [
                "Alla personuppgifter (e-post, inloggningsdata) raderas permanent.",
                "Inlägg och kommentarer kan komma att behållas i anonymiserad form för att inte förstöra sammanhanget i forumtrådar.",
                "Anonymiserade inlägg visar 'Raderad användare' istället för ditt användarnamn."
            ],
            footer: "Detta säkerställer att diskussioner förblir meningsfulla även efter att en användare lämnat plattformen."
        },
        {
            icon: Clock,
            title: "6. Lagring",
            content: "Vi lagrar dina uppgifter så länge ditt konto är aktivt. Inaktiva konton kan efter 24 månaders inaktivitet raderas automatiskt med förvarning via e-post."
        },
        {
            icon: Cookie,
            title: "7. Cookies och spårning",
            highlight: true,
            content: "Vi använder cookies för följande ändamål:",
            list: [
                "Nödvändiga cookies: För att hålla dig inloggad och säkerställa grundläggande funktionalitet.",
                "Analyscookies: För att förstå hur tävlingen och plattformen används så att vi kan förbättra upplevelsen.",
                "Inga reklamcookies: Vi säljer aldrig din data till annonsörer."
            ],
            footer: "Du kan hantera cookies via din webbläsares inställningar, men detta kan påverka plattformens funktionalitet."
        },
        {
            icon: UserCheck,
            title: "8. Dina rättigheter (GDPR)",
            content: "Du har rätt till:",
            list: [
                "Registerutdrag: Få veta vilken data vi har om dig.",
                "Rättelse: Korrigera felaktig information.",
                "Radering ('Rätten att bli glömd'): Ta bort ditt konto och personuppgifter.",
                "Dataportabilitet: Exportera din data.",
                "Invändning: Motsätta dig viss behandling."
            ],
            contact: "privacy@ticko.se"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E14] via-[#0D1117] to-[#0A0E14]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Integritetspolicy för Ticko</h1>
                    <p className="text-white/40 text-sm">Senast uppdaterad: 19 januari 2026</p>
                </div>

                {/* GDPR Summary Box */}
                <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-emerald-400 mb-3">Sammanfattning</h2>
                    <p className="text-white/60 leading-relaxed">
                        Ticko samlar in e-post, användarnamn och trading-data. Din Paper Trading-data är offentlig för att möjliggöra leaderboarden. Vi säljer aldrig din data. Du kan när som helst radera ditt konto.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`bg-white/[0.02] border rounded-2xl p-6 transition-all hover:bg-white/[0.03] ${section.highlight
                                ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                                : 'border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${section.highlight
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-white/5 border border-white/10'
                                    }`}>
                                    <section.icon className={`w-5 h-5 ${section.highlight ? 'text-emerald-400' : 'text-white/40'}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className={`text-lg font-semibold mb-3 ${section.highlight ? 'text-emerald-400' : 'text-white'}`}>
                                        {section.title}
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
                                                    <span className="text-blue-400 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.footer && (
                                        <p className="mt-4 text-white/50 text-sm italic">{section.footer}</p>
                                    )}

                                    {section.contact && (
                                        <p className="mt-4 text-white/60">
                                            Kontakta oss på{" "}
                                            <a href={`mailto:${section.contact}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                {section.contact}
                                            </a>{" "}
                                            för att utöva dina rättigheter.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-center gap-6 text-sm">
                    <Link
                        href="/villkor"
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        Användarvillkor
                    </Link>
                    <span className="text-white/20">|</span>
                    <Link
                        href="/"
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        ← Tillbaka till Ticko
                    </Link>
                </div>
            </div>
        </div>
    );
}
