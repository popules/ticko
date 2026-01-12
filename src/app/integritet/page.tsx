import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Integritetspolicy - Ticko",
    description: "Läs om hur Ticko hanterar dina personuppgifter i enlighet med GDPR.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tillbaka
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Integritetspolicy</h1>
                    </div>
                    <p className="text-white/40 text-sm">Senast uppdaterad: 12 januari 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-blue max-w-none space-y-8">
                    <p className="text-white/70 text-lg leading-relaxed">
                        Din integritet är viktig för oss. Här beskriver vi hur vi hanterar dina personuppgifter i enlighet med GDPR.
                    </p>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">1. Vilken data samlar vi in?</h2>
                        <ul className="space-y-4 text-white/60">
                            <li>
                                <strong className="text-white">Kontoinformation:</strong> När du skapar ett konto sparar vi din e-postadress och ditt valda användarnamn via vår leverantör Supabase.
                            </li>
                            <li>
                                <strong className="text-white">Användargenererat innehåll:</strong> Inlägg, kommentarer, bevakningslistor (watchlists) och portföljdata som du själv väljer att lägga till.
                            </li>
                            <li>
                                <strong className="text-white">Teknisk data:</strong> IP-adress och enhetsinformation för att förhindra spam och förbättra säkerheten.
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">2. Hur används din data?</h2>
                        <p className="text-white/60 leading-relaxed mb-4">Vi använder din data för att:</p>
                        <ul className="list-disc list-inside text-white/60 space-y-2">
                            <li>Tillhandahålla och personifiera tjänsten</li>
                            <li>Möjliggöra sociala funktioner (t.ex. följa andra användare)</li>
                            <li>Förbättra våra AI-modeller (vi skickar aldrig din personliga profilinformation till OpenAI, endast de finansiella frågor du ställer till Ticko AI)</li>
                        </ul>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">3. Tredjepartstjänster</h2>
                        <p className="text-white/60 leading-relaxed mb-4">Vi använder följande underleverantörer för att driva Ticko:</p>
                        <ul className="space-y-3 text-white/60">
                            <li><strong className="text-white">Supabase:</strong> För autentisering och databas (lagring inom EU/EES eftersträvas).</li>
                            <li><strong className="text-white">OpenAI:</strong> För bearbetning av AI-analyser.</li>
                            <li><strong className="text-white">Vercel:</strong> För hosting av webbplatsen.</li>
                        </ul>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">4. Dina rättigheter</h2>
                        <p className="text-white/60 leading-relaxed mb-4">Enligt GDPR har du rätt att:</p>
                        <ul className="list-disc list-inside text-white/60 space-y-2">
                            <li>Begära utdrag på vilken data vi har om dig</li>
                            <li>Få din data rättad eller raderad ("rätten att bli glömd")</li>
                            <li>Avsluta ditt konto när som helst</li>
                        </ul>
                        <p className="text-white/60 leading-relaxed mt-4">
                            Kontakta oss på <a href="mailto:privacy@ticko.se" className="text-blue-400 hover:underline">privacy@ticko.se</a> för hjälp med detta.
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">5. Cookies</h2>
                        <p className="text-white/60 leading-relaxed">
                            Vi använder nödvändiga cookies för att hålla dig inloggad och för att skydda webbplatsen mot intrång.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-white/30 text-sm">
                        Frågor? Kontakta oss på <a href="mailto:privacy@ticko.se" className="text-blue-400 hover:underline">privacy@ticko.se</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
