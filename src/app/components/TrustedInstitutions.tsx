import React from 'react';
import { CheckCircle } from 'lucide-react';

const universities = [
    { name: 'University of Dhaka', acronym: 'DU', logoUrl: '/Dhaka University.webp' },
    { name: 'Bangladesh University of Engineering and Technology (BUET)', acronym: 'BUET', logoUrl: '/BUET.webp' },
    { name: 'North South University', acronym: 'NSU', logoUrl: '/North_South_University_Monogram.svg' },
    { name: 'BRAC University', acronym: 'BRACU', logoUrl: '/BRAC_University_monogram.svg.png' },
    { name: 'Independent University, Bangladesh (IUB)', acronym: 'IUB', logoUrl: '/ Independent University.png' },
    { name: 'East West University', acronym: 'EWU', logoUrl: '/east-west-university-logo.png' },
    { name: 'American International University-Bangladesh (AIUB)', acronym: 'AIUB', logoUrl: '/aiub-logo.png' },
    { name: 'Southeast University', acronym: 'SEU', logoUrl: '/Southeast University .jpeg' },
    { name: 'Islamic University of Technology', acronym: 'IUT', logoUrl: '/Islamic_University_of_Technology_(coat_of_arms).png' },
    { name: 'Ahsanullah University of Science and Technology', acronym: 'AUST', logoUrl: '/Ahsanullah_University_of_Science_and_Technology_Logo.svg' },
    { name: 'Daffodil International University', acronym: 'DIU', logoUrl: '/Daffodil_International_University_Monogram.svg.png' },
    { name: 'University of Asia Pacific', acronym: 'UAP', logoUrl: '/University_of_Asia_Pacific_(Bangladesh)_logo.png' },
];

export function TrustedInstitutions() {
    return (
        <div className="py-16 md:py-24 bg-white overflow-hidden border-b border-stone-100">
            <style>{`
        @keyframes endless-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-endless-scroll {
          animation: endless-scroll 40s linear infinite;
        }
        .animate-endless-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-4 md:mb-6">
                        Trusted by Bangladesh's <br className="hidden sm:block" />
                        <span className="text-[#3E2723]">Leading Institutions</span>
                    </h2>
                    <p className="text-stone-500 text-base md:text-xl">
                        Students from these prestigious universities receive expedited support and premium service
                    </p>
                </div>
            </div>

            <div className="relative w-full flex overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 md:before:w-32 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 md:after:w-32 after:bg-gradient-to-l after:from-white after:to-transparent">
                <div className="flex w-max animate-endless-scroll pt-4 pb-8">
                    {/* First Map */}
                    <div className="flex gap-6 pr-6 items-center">
                        {universities.map((uni, idx) => (
                            <div
                                key={`first-${idx}`}
                                className="w-[240px] md:w-[280px] flex-shrink-0 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center justify-center gap-6 hover:shadow-xl hover:border-[#FF7043]/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-24 w-full flex items-center justify-center">
                                    {uni.logoUrl ? (
                                        <img
                                            src={uni.logoUrl}
                                            alt={`${uni.name} Logo`}
                                            className="max-h-full max-w-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextSibling) {
                                                    nextSibling.style.display = 'flex';
                                                    nextSibling.classList.remove('hidden');
                                                }
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback Icon */}
                                    <div
                                        className="size-16 rounded-full bg-stone-50 text-stone-600 border border-stone-200 shadow-inner flex-col items-center justify-center hidden"
                                        style={{ display: uni.logoUrl ? 'none' : 'flex' }}
                                    >
                                        <span className="font-bold text-xl">{uni.acronym}</span>
                                    </div>
                                </div>
                                <h3 className="text-center font-bold text-stone-600 text-[15px] leading-snug">
                                    {uni.name}
                                </h3>
                            </div>
                        ))}
                    </div>

                    {/* Second Map - Identical duplicate for seamless loop */}
                    <div className="flex gap-6 pr-6 items-center">
                        {universities.map((uni, idx) => (
                            <div
                                key={`second-${idx}`}
                                className="w-[240px] md:w-[280px] flex-shrink-0 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center justify-center gap-6 hover:shadow-xl hover:border-[#FF7043]/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-24 w-full flex items-center justify-center">
                                    {uni.logoUrl ? (
                                        <img
                                            src={uni.logoUrl}
                                            alt={`${uni.name} Logo`}
                                            className="max-h-full max-w-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextSibling) {
                                                    nextSibling.style.display = 'flex';
                                                    nextSibling.classList.remove('hidden');
                                                }
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback Icon */}
                                    <div
                                        className="size-16 rounded-full bg-stone-50 text-stone-600 border border-stone-200 shadow-inner flex-col items-center justify-center hidden"
                                        style={{ display: uni.logoUrl ? 'none' : 'flex' }}
                                    >
                                        <span className="font-bold text-xl">{uni.acronym}</span>
                                    </div>
                                </div>
                                <h3 className="text-center font-bold text-stone-600 text-[15px] leading-snug">
                                    {uni.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
                <div className="max-w-3xl mx-auto bg-[#3E2723] border border-[#5D4037] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="bg-white/10 p-2 rounded-full shadow-sm shrink-0 text-amber-400">
                        <CheckCircle className="size-5 md:size-6" strokeWidth={2.5} />
                    </div>
                    <p className="text-white font-medium text-[15px] sm:text-[17px] text-center sm:text-left">
                        Students from these universities receive <span className="text-amber-400 font-bold">priority support</span> and expedited delivery
                    </p>
                </div>
            </div>
        </div>
    );
}
