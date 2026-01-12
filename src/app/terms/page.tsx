import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
    title: "Användarvillkor - Ticko",
    description: "Läs Tickos användarvillkor och förstå hur vår plattform fungerar.",
};

export default function TermsPage() {
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
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Scale className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Användarvillkor</h1>
                    </div>
                    <p className="text-white/40 text-sm">Senast uppdaterad: 12 januari 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-emerald max-w-none space-y-8">
                    <p className="text-white/70 text-lg leading-relaxed">
                        Välkommen till Ticko. Genom att använda vår plattform godkänner du nedanstående villkor.
                    </p>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">1. Ingen finansiell rådgivning</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            Ticko är en social plattform för informationsutbyte och analys. Allt innehåll på webbplatsen, inklusive men inte begränsat till:
                        </p>
                        <ul className="list-disc list-inside text-white/60 space-y-2 mb-4">
                            <li>AI-genererade analyser från "TickoCopilot"</li>
                            <li>Användares inlägg, grafer och sentiment-data</li>
                            <li>Automatiserade nyckeltal och värderingskort</li>
                        </ul>
                        <p className="text-white/60 leading-relaxed">
                            <strong className="text-amber-400">Ska betraktas som allmän information och utgör inte finansiell rådgivning.</strong> Vi rekommenderar att du alltid gör din egen analys och rådgör med en professionell rådgivare innan du fattar investeringsbeslut. Investeringar i finansiella instrument innebär alltid en risk och du kan förlora hela eller delar av ditt kapital.
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">2. Datakvalitet och ansvar</h2>
                        <p className="text-white/60 leading-relaxed">
                            Ticko hämtar data från tredjepartsleverantörer (t.ex. Yahoo Finance). Vi kan inte garantera att kurser, nyckeltal eller nyheter är korrekta, fullständiga eller visas i realtid. <strong className="text-white">Ticko ansvarar inte för ekonomiska förluster eller andra skador som uppstår till följd av felaktig data eller beslut fattade baserat på innehåll på plattformen.</strong>
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">3. Användarbeteende och moderering</h2>
                        <p className="text-white/60 leading-relaxed mb-4">Som användare förbinder du dig att:</p>
                        <ul className="list-disc list-inside text-white/60 space-y-2 mb-4">
                            <li>Inte sprida falsk eller vilseledande information (t.ex. "pump and dump")</li>
                            <li>Inte använda plattformen för marknadsmissbruk eller otillbörlig marknadspåverkan</li>
                            <li>Inte trakassera andra användare</li>
                        </ul>
                        <p className="text-white/60 leading-relaxed">
                            Ticko förbehåller sig rätten att utan förvarning radera inlägg eller stänga av användare som bryter mot dessa regler eller svenska lagar.
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">4. Immateriella rättigheter</h2>
                        <p className="text-white/60 leading-relaxed">
                            Du behåller äganderätten till det innehåll du postar, men genom att posta på Ticko ger du oss en evig rätt att visa och distribuera innehållet på plattformen.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-white/30 text-sm">
                        Frågor? Kontakta oss på <a href="mailto:legal@ticko.se" className="text-emerald-400 hover:underline">legal@ticko.se</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
